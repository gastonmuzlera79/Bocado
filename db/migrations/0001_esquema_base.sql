-- Bocado · esquema base
-- Compatible con Supabase: usa auth.users, auth.uid() y los roles anon / authenticated / service_role.

create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;
grant usage on schema extensions to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.rol_app as enum ('usuario', 'moderador', 'admin');
create type public.estado_receta as enum ('borrador', 'en_revision', 'publicada', 'rechazada');
create type public.origen_receta as enum ('recetario', 'usuario', 'web', 'video', 'plantilla', 'ia');
create type public.dificultad as enum ('fácil', 'media', 'difícil');
create type public.estado_carga as enum ('pendiente', 'procesando', 'para_corregir', 'terminada', 'error', 'cancelada');
create type public.tipo_carga as enum ('pdf', 'foto', 'web', 'video', 'formulario');
create type public.estado_membresia as enum ('pendiente', 'activa', 'pausada', 'cancelada', 'vencida');
create type public.estado_reporte as enum ('abierto', 'resuelto', 'descartado');

-- Texto normalizado para comparar: minúsculas y sin tildes.
create or replace function public.normalizar(t text) returns text
language sql immutable parallel safe
as $$ select lower(extensions.unaccent('extensions.unaccent', coalesce(t, ''))) $$;

-- ---------------------------------------------------------------------------
-- Usuarios, roles y permisos
-- ---------------------------------------------------------------------------
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre_usuario text unique not null check (char_length(nombre_usuario) between 3 and 30),
  nombre_visible text,
  rol public.rol_app not null default 'usuario',
  recetas_aprobadas int not null default 0,
  suspendido boolean not null default false,
  creado_en timestamptz not null default now()
);

create table public.permisos_rol (
  rol public.rol_app not null,
  permiso text not null,
  primary key (rol, permiso)
);

insert into public.permisos_rol (rol, permiso) values
  ('moderador', 'moderar_recetas'), ('moderador', 'moderar_comentarios'), ('moderador', 'editar_catalogo'),
  ('admin', 'moderar_recetas'), ('admin', 'moderar_comentarios'), ('admin', 'editar_catalogo'),
  ('admin', 'administrar_usuarios'), ('admin', 'administrar_permisos'), ('admin', 'ver_metricas'),
  ('admin', 'configurar'), ('admin', 'ver_auditoria'), ('admin', 'administrar_cargas');

create or replace function public.rol_actual() returns public.rol_app
language sql stable security definer set search_path = public
as $$ select rol from public.perfiles where id = auth.uid() and not suspendido $$;

create or replace function public.tiene_permiso(p text) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.permisos_rol pr
    join public.perfiles pf on pf.rol = pr.rol
    where pf.id = auth.uid() and not pf.suspendido and pr.permiso = p
  )
$$;

-- ---------------------------------------------------------------------------
-- Configuración
-- ---------------------------------------------------------------------------
create table public.configuracion (
  clave text primary key,
  valor jsonb not null,
  actualizado_en timestamptz not null default now()
);

insert into public.configuracion (clave, valor) values
  ('aprobadas_para_publicar_directo', '2'),
  ('limite_archivo_mb', '30'),
  ('membresia_precio_ars', '1000'),
  ('membresia_cobro_activo', 'false'),
  ('claude_tope_porcentaje_ingresos', '30'),
  ('cotizacion_usd_ars', 'null'),
  ('agentes', '{"normalizador": false, "manos_a_la_olla": false, "despensa": false, "comunidad": false}'),
  ('limites_diarios', '{"cargas": 10, "comentarios": 30, "recetas": 10}');

create or replace function public.config(c text) returns jsonb
language sql stable security definer set search_path = public
as $$ select valor from public.configuracion where clave = c $$;

-- ---------------------------------------------------------------------------
-- Catálogo de ingredientes
-- ---------------------------------------------------------------------------
create table public.ingredientes (
  id uuid primary key default gen_random_uuid(),
  nombre text unique not null,
  categoria text not null,
  es_basico boolean not null default false,
  gramos_por_unidad numeric,          -- peso típico de 1 unidad (huevo, cebolla, etc.)
  gramos_por_taza numeric,            -- para convertir medidas caseras
  kcal_100g numeric,
  proteinas_100g numeric,
  grasas_100g numeric,
  carbohidratos_100g numeric,
  fibra_100g numeric,
  fuente_nutricion text,
  creado_en timestamptz not null default now()
);

create table public.sinonimos (
  sinonimo text primary key,          -- ya normalizado
  ingrediente_id uuid not null references public.ingredientes (id) on delete cascade
);

create table public.sustitutos (
  ingrediente_id uuid not null references public.ingredientes (id) on delete cascade,
  sustituto_id uuid not null references public.ingredientes (id) on delete cascade,
  nota text,
  primary key (ingrediente_id, sustituto_id),
  check (ingrediente_id <> sustituto_id)
);

-- Busca un ingrediente por nombre o sinónimo, ignorando mayúsculas y tildes.
create or replace function public.buscar_ingrediente(texto text) returns uuid
language sql stable
as $$
  select coalesce(
    (select id from public.ingredientes where public.normalizar(nombre) = public.normalizar(texto)),
    (select ingrediente_id from public.sinonimos where sinonimo = public.normalizar(texto))
  )
$$;

-- ---------------------------------------------------------------------------
-- Recetas
-- ---------------------------------------------------------------------------
create table public.recetas (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null check (char_length(titulo) between 3 and 140),
  descripcion text,
  categoria text,
  tipo_plato text,
  tecnica text,
  porciones int check (porciones between 1 and 100),
  tiempo_preparacion_min int,
  tiempo_coccion_min int,
  temperatura_c int,
  dificultad public.dificultad,
  consejo text,
  etiquetas text[] not null default '{}',
  estado public.estado_receta not null default 'en_revision',
  motivo_rechazo text,
  autor_id uuid references public.perfiles (id) on delete set null,
  origen public.origen_receta not null default 'usuario',
  origen_ref text,                    -- referencia interna (libro y número, URL, id de carga)
  fuente_visible text,                -- lo que se muestra: "Adaptada de: …"
  fuente_url text,
  imagen_url text,
  kcal_porcion numeric,
  proteinas_porcion numeric,
  grasas_porcion numeric,
  carbohidratos_porcion numeric,
  nutricion_estimada boolean,
  puntaje_promedio numeric(3, 2) not null default 0,
  cantidad_puntajes int not null default 0,
  busqueda tsvector,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index recetas_estado_idx on public.recetas (estado);
create index recetas_busqueda_idx on public.recetas using gin (busqueda);
create index recetas_titulo_trgm_idx on public.recetas using gin (titulo extensions.gin_trgm_ops);

create table public.receta_ingredientes (
  receta_id uuid not null references public.recetas (id) on delete cascade,
  orden int not null,
  ingrediente_id uuid references public.ingredientes (id),
  texto text not null,                -- como se muestra: "2 cucharadas de aceite"
  cantidad numeric,
  unidad text,
  nota text,
  opcional boolean not null default false,
  primary key (receta_id, orden)
);
create index receta_ingredientes_ing_idx on public.receta_ingredientes (ingrediente_id);

create table public.receta_pasos (
  receta_id uuid not null references public.recetas (id) on delete cascade,
  orden int not null,
  texto text not null,
  primary key (receta_id, orden)
);

-- Índice de búsqueda por texto.
create or replace function public.recetas_actualizar_busqueda() returns trigger
language plpgsql as $$
begin
  new.busqueda := to_tsvector('spanish', public.normalizar(
    coalesce(new.titulo, '') || ' ' || coalesce(new.descripcion, '') || ' ' || array_to_string(new.etiquetas, ' ')));
  new.actualizado_en := now();
  return new;
end $$;

create trigger recetas_busqueda_trg before insert or update on public.recetas
for each row execute function public.recetas_actualizar_busqueda();

-- Estado inicial de una receta de usuario: se publica directo si el autor ya tiene
-- suficientes recetas aprobadas; si no, va a revisión. Solo moderadores cambian el estado.
create or replace function public.recetas_controlar_estado() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  minimo int := coalesce((public.config('aprobadas_para_publicar_directo'))::int, 2);
  aprobadas int;
begin
  -- Cargas del sistema y cálculos internos (otros triggers) no se controlan.
  if auth.uid() is null or pg_trigger_depth() > 1 then
    return new;
  end if;
  if public.tiene_permiso('moderar_recetas') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.autor_id := auth.uid();
    if new.estado <> 'borrador' then
      select recetas_aprobadas into aprobadas from public.perfiles where id = auth.uid();
      new.estado := case when coalesce(aprobadas, 0) >= minimo then 'publicada' else 'en_revision' end;
    end if;
    if new.origen in ('recetario', 'ia', 'plantilla') then
      new.origen := 'usuario';
    end if;
  else
    -- Al editar, el autor puede pasar de borrador a revisión, pero no publicarse solo.
    if new.estado is distinct from old.estado then
      if old.estado = 'borrador' and new.estado = 'en_revision' then
        null;
      else
        new.estado := old.estado;
      end if;
    end if;
    if old.estado = 'publicada' then
      select recetas_aprobadas into aprobadas from public.perfiles where id = auth.uid();
      if coalesce(aprobadas, 0) < minimo then
        new.estado := 'en_revision';
      end if;
    end if;
    new.autor_id := old.autor_id;
    new.origen := old.origen;
    new.puntaje_promedio := old.puntaje_promedio;
    new.cantidad_puntajes := old.cantidad_puntajes;
  end if;
  return new;
end $$;

create trigger recetas_estado_trg before insert or update on public.recetas
for each row execute function public.recetas_controlar_estado();

-- Contador de recetas aprobadas por autor.
create or replace function public.recetas_contar_aprobadas() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.estado = 'publicada' and (tg_op = 'INSERT' or old.estado <> 'publicada') and new.autor_id is not null then
    update public.perfiles set recetas_aprobadas = recetas_aprobadas + 1 where id = new.autor_id;
  end if;
  return null;
end $$;

create trigger recetas_aprobadas_trg after insert or update of estado on public.recetas
for each row execute function public.recetas_contar_aprobadas();

-- ---------------------------------------------------------------------------
-- Despensa
-- ---------------------------------------------------------------------------
create table public.despensa (
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  ingrediente_id uuid not null references public.ingredientes (id) on delete cascade,
  es_principal boolean not null default false,
  agregado_en timestamptz not null default now(),
  primary key (usuario_id, ingrediente_id)
);

-- ---------------------------------------------------------------------------
-- Comunidad
-- ---------------------------------------------------------------------------
create table public.puntajes (
  receta_id uuid not null references public.recetas (id) on delete cascade,
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  puntaje int not null check (puntaje between 1 and 5),
  cocinada boolean not null default true,
  creado_en timestamptz not null default now(),
  primary key (receta_id, usuario_id)
);

create or replace function public.puntajes_recalcular() returns trigger
language plpgsql security definer set search_path = public as $$
declare rid uuid := coalesce(new.receta_id, old.receta_id);
begin
  update public.recetas r set
    puntaje_promedio = coalesce((select round(avg(puntaje)::numeric, 2) from public.puntajes where receta_id = rid), 0),
    cantidad_puntajes = (select count(*) from public.puntajes where receta_id = rid)
  where r.id = rid;
  return null;
end $$;

create trigger puntajes_recalcular_trg after insert or update or delete on public.puntajes
for each row execute function public.puntajes_recalcular();

create table public.comentarios (
  id uuid primary key default gen_random_uuid(),
  receta_id uuid not null references public.recetas (id) on delete cascade,
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 2000),
  visible boolean not null default true,
  votos int not null default 0,
  creado_en timestamptz not null default now()
);
create index comentarios_receta_idx on public.comentarios (receta_id);

create table public.votos_comentario (
  comentario_id uuid not null references public.comentarios (id) on delete cascade,
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  primary key (comentario_id, usuario_id)
);

create or replace function public.votos_recalcular() returns trigger
language plpgsql security definer set search_path = public as $$
declare cid uuid := coalesce(new.comentario_id, old.comentario_id);
begin
  update public.comentarios set votos = (select count(*) from public.votos_comentario where comentario_id = cid)
  where id = cid;
  return null;
end $$;

create trigger votos_recalcular_trg after insert or delete on public.votos_comentario
for each row execute function public.votos_recalcular();

create table public.reportes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.perfiles (id) on delete set null,
  receta_id uuid references public.recetas (id) on delete cascade,
  comentario_id uuid references public.comentarios (id) on delete cascade,
  motivo text not null,
  estado public.estado_reporte not null default 'abierto',
  resuelto_por uuid references public.perfiles (id),
  creado_en timestamptz not null default now(),
  check (receta_id is not null or comentario_id is not null)
);

create table public.consejos_comunidad (
  receta_id uuid primary key references public.recetas (id) on delete cascade,
  texto text not null,
  comentarios_usados int not null,
  generado_en timestamptz not null default now()
);

create table public.colecciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 60),
  es_favoritos boolean not null default false,
  creado_en timestamptz not null default now(),
  unique (usuario_id, nombre)
);

create table public.coleccion_recetas (
  coleccion_id uuid not null references public.colecciones (id) on delete cascade,
  receta_id uuid not null references public.recetas (id) on delete cascade,
  agregado_en timestamptz not null default now(),
  primary key (coleccion_id, receta_id)
);

-- ---------------------------------------------------------------------------
-- Cargas y trabajos de los agentes
-- ---------------------------------------------------------------------------
create table public.cargas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.perfiles (id) on delete set null,
  tipo public.tipo_carga not null,
  archivo_ruta text,
  url text,
  huella text,                        -- hash del contenido: evita procesar dos veces lo mismo
  estado public.estado_carga not null default 'pendiente',
  progreso int not null default 0 check (progreso between 0 and 100),
  resumen jsonb,                      -- {encontradas, guardadas, en_revision, descartadas: [{motivo}]}
  error text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create index cargas_estado_idx on public.cargas (estado);
create index cargas_huella_idx on public.cargas (huella);

create table public.trabajos (
  id bigint generated always as identity primary key,
  carga_id uuid references public.cargas (id) on delete cascade,
  agente text not null,
  estado text not null,
  detalle jsonb,
  motivo text,
  usa_claude boolean not null default false,
  tokens_entrada int,
  tokens_salida int,
  costo_usd numeric(10, 6),
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Membresías y pagos
-- ---------------------------------------------------------------------------
create table public.membresias (
  usuario_id uuid primary key references public.perfiles (id) on delete cascade,
  estado public.estado_membresia not null default 'pendiente',
  mp_preapproval_id text unique,
  precio_ars numeric(12, 2) not null,
  inicio timestamptz,
  proximo_cobro timestamptz,
  fin timestamptz,
  actualizado_en timestamptz not null default now()
);

create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.perfiles (id) on delete set null,
  mp_pago_id text unique not null,
  monto_ars numeric(12, 2) not null,
  estado text not null,
  es_prueba boolean not null default true,
  fecha timestamptz not null,
  datos jsonb,
  creado_en timestamptz not null default now()
);

create or replace function public.es_socio(uid uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.membresias where usuario_id = uid and estado = 'activa') $$;

-- ---------------------------------------------------------------------------
-- Métricas, uso de IA y auditoría
-- ---------------------------------------------------------------------------
create table public.eventos (
  id bigint generated always as identity primary key,
  usuario_id uuid references public.perfiles (id) on delete set null,
  tipo text not null,                 -- busqueda, busqueda_sin_resultados, receta_vista, receta_guardada, receta_cocinada
  receta_id uuid references public.recetas (id) on delete set null,
  datos jsonb,
  creado_en timestamptz not null default now()
);
create index eventos_tipo_fecha_idx on public.eventos (tipo, creado_en);

create table public.uso_claude (
  id bigint generated always as identity primary key,
  fecha date not null default current_date,
  agente text not null,
  usuario_id uuid references public.perfiles (id) on delete set null,
  modelo text not null,
  tokens_entrada int not null,
  tokens_salida int not null,
  costo_usd numeric(10, 6) not null
);

create table public.auditoria (
  id bigint generated always as identity primary key,
  actor_id uuid,
  accion text not null,
  tabla text not null,
  registro_id text,
  antes jsonb,
  despues jsonb,
  creado_en timestamptz not null default now()
);

create or replace function public.auditar() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.auditoria (actor_id, accion, tabla, registro_id, antes, despues)
  values (
    auth.uid(), tg_op, tg_table_name,
    coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id', to_jsonb(new) ->> 'clave', to_jsonb(old) ->> 'clave'),
    case when tg_op <> 'INSERT' then to_jsonb(old) end,
    case when tg_op <> 'DELETE' then to_jsonb(new) end
  );
  return null;
end $$;

create trigger auditar_perfiles after update or delete on public.perfiles for each row execute function public.auditar();
create trigger auditar_permisos after insert or update or delete on public.permisos_rol for each row execute function public.auditar();
create trigger auditar_configuracion after insert or update or delete on public.configuracion for each row execute function public.auditar();
create trigger auditar_recetas_estado after update of estado on public.recetas for each row execute function public.auditar();
create trigger auditar_comentarios after update of visible on public.comentarios for each row execute function public.auditar();

-- Un usuario común no puede cambiarse el rol, el contador ni la suspensión.
create or replace function public.perfiles_proteger() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and pg_trigger_depth() = 1 and not public.tiene_permiso('administrar_usuarios') then
    new.rol := old.rol;
    new.suspendido := old.suspendido;
    new.recetas_aprobadas := old.recetas_aprobadas;
  end if;
  return new;
end $$;

create trigger perfiles_proteger_trg before update on public.perfiles
for each row execute function public.perfiles_proteger();

-- Perfil automático al registrarse.
create or replace function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
declare base text;
begin
  base := regexp_replace(split_part(coalesce(new.email, 'cocinero'), '@', 1), '[^a-zA-Z0-9_]', '', 'g');
  if char_length(base) < 3 then base := 'cocinero'; end if;
  insert into public.perfiles (id, nombre_usuario, nombre_visible)
  values (new.id, left(base, 20) || '_' || substr(replace(new.id::text, '-', ''), 1, 6), coalesce(new.raw_user_meta_data ->> 'name', base));
  insert into public.colecciones (usuario_id, nombre, es_favoritos) values (new.id, 'Favoritas', true);
  return new;
end $$;

create trigger crear_perfil_trg after insert on auth.users
for each row execute function public.crear_perfil();
