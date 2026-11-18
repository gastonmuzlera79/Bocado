-- Bocado · permisos por fila, límites diarios y búsqueda por despensa

create or replace function public.usuario_activo() returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.perfiles where id = auth.uid() and not suspendido) $$;

-- ---------------------------------------------------------------------------
-- Permisos base: las políticas de cada tabla deciden qué filas se ven y se tocan.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage on all sequences in schema public to authenticated;
revoke insert, update, delete on public.auditoria, public.uso_claude, public.trabajos,
  public.membresias, public.pagos, public.consejos_comunidad from authenticated;

alter table public.perfiles enable row level security;
alter table public.permisos_rol enable row level security;
alter table public.configuracion enable row level security;
alter table public.ingredientes enable row level security;
alter table public.sinonimos enable row level security;
alter table public.sustitutos enable row level security;
alter table public.recetas enable row level security;
alter table public.receta_ingredientes enable row level security;
alter table public.receta_pasos enable row level security;
alter table public.despensa enable row level security;
alter table public.puntajes enable row level security;
alter table public.comentarios enable row level security;
alter table public.votos_comentario enable row level security;
alter table public.reportes enable row level security;
alter table public.consejos_comunidad enable row level security;
alter table public.colecciones enable row level security;
alter table public.coleccion_recetas enable row level security;
alter table public.cargas enable row level security;
alter table public.trabajos enable row level security;
alter table public.membresias enable row level security;
alter table public.pagos enable row level security;
alter table public.eventos enable row level security;
alter table public.uso_claude enable row level security;
alter table public.auditoria enable row level security;

-- Perfiles: públicos para leer; cada uno edita el suyo (rol y suspensión protegidos por trigger).
create policy perfiles_leer on public.perfiles for select using (true);
create policy perfiles_editar on public.perfiles for update
  using (id = auth.uid() or public.tiene_permiso('administrar_usuarios'));

-- Permisos por rol y configuración.
create policy permisos_leer on public.permisos_rol for select using (auth.uid() is not null);
create policy permisos_escribir on public.permisos_rol for all
  using (public.tiene_permiso('administrar_permisos')) with check (public.tiene_permiso('administrar_permisos'));
create policy config_leer on public.configuracion for select using (true);
create policy config_escribir on public.configuracion for all
  using (public.tiene_permiso('configurar')) with check (public.tiene_permiso('configurar'));

-- Catálogo: lectura pública, edición para moderadores y administradores.
create policy ingredientes_leer on public.ingredientes for select using (true);
create policy ingredientes_escribir on public.ingredientes for all
  using (public.tiene_permiso('editar_catalogo')) with check (public.tiene_permiso('editar_catalogo'));
create policy sinonimos_leer on public.sinonimos for select using (true);
create policy sinonimos_escribir on public.sinonimos for all
  using (public.tiene_permiso('editar_catalogo')) with check (public.tiene_permiso('editar_catalogo'));
create policy sustitutos_leer on public.sustitutos for select using (true);
create policy sustitutos_escribir on public.sustitutos for all
  using (public.tiene_permiso('editar_catalogo')) with check (public.tiene_permiso('editar_catalogo'));

-- Recetas: se ven las publicadas, las propias y, para moderadores, todas.
create policy recetas_leer on public.recetas for select
  using (estado = 'publicada' or autor_id = auth.uid() or public.tiene_permiso('moderar_recetas'));
create policy recetas_crear on public.recetas for insert
  with check (public.usuario_activo());
create policy recetas_editar on public.recetas for update
  using (autor_id = auth.uid() or public.tiene_permiso('moderar_recetas'));
create policy recetas_borrar on public.recetas for delete
  using (autor_id = auth.uid() or public.tiene_permiso('moderar_recetas'));

create or replace function public.puede_editar_receta(rid uuid) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.recetas where id = rid and autor_id = auth.uid())
      or public.tiene_permiso('moderar_recetas')
$$;

create policy ri_leer on public.receta_ingredientes for select
  using (exists (select 1 from public.recetas r where r.id = receta_id));
create policy ri_escribir on public.receta_ingredientes for all
  using (public.puede_editar_receta(receta_id)) with check (public.puede_editar_receta(receta_id));
create policy rp_leer on public.receta_pasos for select
  using (exists (select 1 from public.recetas r where r.id = receta_id));
create policy rp_escribir on public.receta_pasos for all
  using (public.puede_editar_receta(receta_id)) with check (public.puede_editar_receta(receta_id));

-- Despensa, colecciones: solo el dueño.
create policy despensa_propia on public.despensa for all
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
create policy colecciones_propias on public.colecciones for all
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid() and public.usuario_activo());
create policy coleccion_recetas_propias on public.coleccion_recetas for all
  using (exists (select 1 from public.colecciones c where c.id = coleccion_id and c.usuario_id = auth.uid()))
  with check (exists (select 1 from public.colecciones c where c.id = coleccion_id and c.usuario_id = auth.uid()));

-- Puntajes y votos: lectura pública, cada uno maneja los suyos.
create policy puntajes_leer on public.puntajes for select using (true);
create policy puntajes_propios on public.puntajes for insert
  with check (usuario_id = auth.uid() and public.usuario_activo());
create policy puntajes_editar on public.puntajes for update using (usuario_id = auth.uid());
create policy puntajes_borrar on public.puntajes for delete using (usuario_id = auth.uid());
create policy votos_leer on public.votos_comentario for select using (true);
create policy votos_propios on public.votos_comentario for insert
  with check (usuario_id = auth.uid() and public.usuario_activo());
create policy votos_borrar on public.votos_comentario for delete using (usuario_id = auth.uid());

-- Comentarios: se ven los visibles; moderadores ven y ocultan todos.
create policy comentarios_leer on public.comentarios for select
  using (visible or usuario_id = auth.uid() or public.tiene_permiso('moderar_comentarios'));
create policy comentarios_crear on public.comentarios for insert
  with check (usuario_id = auth.uid() and public.usuario_activo() and visible);
create policy comentarios_editar on public.comentarios for update
  using (usuario_id = auth.uid() or public.tiene_permiso('moderar_comentarios'));
create policy comentarios_borrar on public.comentarios for delete
  using (usuario_id = auth.uid() or public.tiene_permiso('moderar_comentarios'));

-- Un autor no puede volver a mostrar un comentario que ocultó un moderador.
create or replace function public.comentarios_proteger() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and pg_trigger_depth() = 1 and not public.tiene_permiso('moderar_comentarios') then
    new.visible := old.visible;
    new.votos := old.votos;
    new.usuario_id := old.usuario_id;
    new.receta_id := old.receta_id;
  end if;
  return new;
end $$;
create trigger comentarios_proteger_trg before update on public.comentarios
for each row execute function public.comentarios_proteger();

-- Reportes.
create policy reportes_crear on public.reportes for insert
  with check (usuario_id = auth.uid() and public.usuario_activo());
create policy reportes_leer on public.reportes for select
  using (usuario_id = auth.uid() or public.tiene_permiso('moderar_recetas') or public.tiene_permiso('moderar_comentarios'));
create policy reportes_resolver on public.reportes for update
  using (public.tiene_permiso('moderar_recetas') or public.tiene_permiso('moderar_comentarios'));

create policy consejos_leer on public.consejos_comunidad for select using (true);

-- Cargas y trabajos: el usuario ve las suyas; el worker usa la clave de servicio.
create policy cargas_propias on public.cargas for select
  using (usuario_id = auth.uid() or public.tiene_permiso('administrar_cargas'));
create policy cargas_crear on public.cargas for insert
  with check (usuario_id = auth.uid() and public.usuario_activo() and estado = 'pendiente');
create policy cargas_cancelar on public.cargas for update
  using (usuario_id = auth.uid() or public.tiene_permiso('administrar_cargas'));
create policy trabajos_leer on public.trabajos for select
  using (public.tiene_permiso('administrar_cargas')
         or exists (select 1 from public.cargas c where c.id = carga_id and c.usuario_id = auth.uid()));

-- Membresías y pagos: los escribe solo el servidor (webhook de Mercado Pago).
create policy membresias_leer on public.membresias for select
  using (usuario_id = auth.uid() or public.tiene_permiso('ver_metricas'));
create policy pagos_leer on public.pagos for select
  using (usuario_id = auth.uid() or public.tiene_permiso('ver_metricas'));

-- Métricas y auditoría.
grant insert on public.eventos to anon;
create policy eventos_crear on public.eventos for insert
  with check (usuario_id is null or usuario_id = auth.uid());
create policy eventos_leer on public.eventos for select using (public.tiene_permiso('ver_metricas'));
create policy uso_claude_leer on public.uso_claude for select using (public.tiene_permiso('ver_metricas'));
create policy auditoria_leer on public.auditoria for select using (public.tiene_permiso('ver_auditoria'));

-- ---------------------------------------------------------------------------
-- Límites diarios por usuario (protección contra abuso)
-- ---------------------------------------------------------------------------
create or replace function public.controlar_limite_diario() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  clave text := tg_argv[0];
  columna text := tg_argv[1];
  limite int := coalesce((public.config('limites_diarios') ->> clave)::int, 1000000);
  hechos int;
begin
  if auth.uid() is null or public.tiene_permiso('moderar_recetas') then
    return new;
  end if;
  execute format('select count(*) from %I.%I where %I = $1 and creado_en >= date_trunc(''day'', now())',
                 tg_table_schema, tg_table_name, columna)
    into hechos using auth.uid();
  if hechos >= limite then
    raise exception 'Llegaste al límite diario de % (%). Probá mañana.', clave, limite
      using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger limite_comentarios before insert on public.comentarios
for each row execute function public.controlar_limite_diario('comentarios', 'usuario_id');
create trigger limite_cargas before insert on public.cargas
for each row execute function public.controlar_limite_diario('cargas', 'usuario_id');
create trigger limite_recetas before insert on public.recetas
for each row execute function public.controlar_limite_diario('recetas', 'autor_id');

-- ---------------------------------------------------------------------------
-- "¿Qué cocino?": recetas publicadas ordenadas por cuánto tenés de lo necesario.
-- No usa IA. Los básicos (sal, aceite, agua…) y los opcionales no cuentan como faltantes.
-- Solo aparecen recetas donde tenés al menos un ingrediente de los necesarios.
-- Sin lista de ingredientes, usa la despensa del usuario.
-- ---------------------------------------------------------------------------
create or replace function public.que_cocino(
  p_ingredientes uuid[] default null,
  p_principal uuid default null,
  p_max_minutos int default null,
  p_dificultad public.dificultad default null,
  p_categoria text default null,
  p_tecnica text default null,
  p_limite int default 30,
  p_desde int default 0
)
returns table (
  receta_id uuid,
  slug text,
  titulo text,
  imagen_url text,
  categoria text,
  minutos int,
  coincidencia int,
  tengo int,
  necesito int,
  faltantes jsonb,
  tiene_principal boolean,
  puntaje numeric
)
language sql stable
as $$
  with mios as (
    select unnest(coalesce(p_ingredientes,
      (select array_agg(ingrediente_id) from public.despensa where usuario_id = auth.uid()))) as id
  ),
  candidatas as (
    select r.* from public.recetas r
    where r.estado = 'publicada'
      and (p_categoria is null or r.categoria = p_categoria)
      and (p_tecnica is null or r.tecnica = p_tecnica)
      and (p_dificultad is null or r.dificultad = p_dificultad)
      and (p_max_minutos is null
           or coalesce(r.tiempo_preparacion_min, 0) + coalesce(r.tiempo_coccion_min, 0) <= p_max_minutos)
  ),
  requeridos as (
    select ri.receta_id, ri.ingrediente_id, ri.texto,
           exists (select 1 from mios m where m.id = ri.ingrediente_id) as lo_tengo
    from public.receta_ingredientes ri
    join candidatas c on c.id = ri.receta_id
    join public.ingredientes i on i.id = ri.ingrediente_id
    where not ri.opcional and not i.es_basico
  ),
  resumen as (
    select q.receta_id,
           count(*) filter (where q.lo_tengo)::int as tengo,
           count(*)::int as necesito,
           coalesce(jsonb_agg(jsonb_build_object(
             'ingrediente', q.texto,
             'reemplazos', (select coalesce(jsonb_agg(i2.nombre), '[]'::jsonb)
                            from public.sustitutos s
                            join public.ingredientes i2 on i2.id = s.sustituto_id
                            where s.ingrediente_id = q.ingrediente_id
                              and exists (select 1 from mios m where m.id = s.sustituto_id))
           )) filter (where not q.lo_tengo), '[]'::jsonb) as faltantes,
           bool_or(q.ingrediente_id = p_principal) as tiene_principal
    from requeridos q
    group by q.receta_id
  )
  select c.id, c.slug, c.titulo, c.imagen_url, c.categoria,
         (coalesce(c.tiempo_preparacion_min, 0) + coalesce(c.tiempo_coccion_min, 0))::int,
         case when coalesce(s.necesito, 0) = 0 then 100 else round(100.0 * s.tengo / s.necesito)::int end,
         coalesce(s.tengo, 0), coalesce(s.necesito, 0), coalesce(s.faltantes, '[]'::jsonb),
         coalesce(s.tiene_principal, false), c.puntaje_promedio
  from candidatas c
  left join resumen s on s.receta_id = c.id
  where coalesce(s.tengo, 0) > 0
  order by (p_principal is not null and coalesce(s.tiene_principal, false)) desc,
           case when coalesce(s.necesito, 0) = 0 then 1.0 else s.tengo::numeric / s.necesito end desc,
           c.puntaje_promedio desc, c.creado_en desc
  limit least(p_limite, 100) offset greatest(p_desde, 0)
$$;

grant execute on function public.que_cocino to anon, authenticated;

-- Búsqueda por nombre en el recetario.
create or replace function public.buscar_recetas(p_texto text, p_limite int default 30, p_desde int default 0)
returns setof public.recetas
language sql stable
as $$
  select r.* from public.recetas r
  where r.estado = 'publicada'
    and (r.busqueda @@ plainto_tsquery('spanish', public.normalizar(p_texto))
         or public.normalizar(r.titulo) like '%' || public.normalizar(p_texto) || '%')
  order by ts_rank(r.busqueda, plainto_tsquery('spanish', public.normalizar(p_texto))) desc,
           r.puntaje_promedio desc
  limit least(p_limite, 100) offset greatest(p_desde, 0)
$$;

grant execute on function public.buscar_recetas to anon, authenticated;
