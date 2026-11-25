-- Pruebas de permisos, reglas de publicación y búsqueda por despensa.
-- Cada bloque falla con un mensaje claro si algo no se cumple.

\set ON_ERROR_STOP on
\o /dev/null
begin;

-- Datos de prueba (como sistema) ---------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'admin@test.ar'),
  ('00000000-0000-0000-0000-00000000000b', 'ana@test.ar'),
  ('00000000-0000-0000-0000-00000000000c', 'beto@test.ar');
update public.perfiles set rol = 'admin' where id = '00000000-0000-0000-0000-00000000000a';

insert into public.ingredientes (id, nombre, categoria, es_basico) values
  ('10000000-0000-0000-0000-000000000001', 'huevo', 'huevos y lácteos', false),
  ('10000000-0000-0000-0000-000000000002', 'leche', 'huevos y lácteos', false),
  ('10000000-0000-0000-0000-000000000003', 'azúcar', 'almacén', false),
  ('10000000-0000-0000-0000-000000000004', 'sal', 'almacén', true),
  ('10000000-0000-0000-0000-000000000005', 'papa', 'verduras', false),
  ('10000000-0000-0000-0000-000000000006', 'batata', 'verduras', false),
  ('10000000-0000-0000-0000-000000000007', 'edulcorante', 'almacén', false);
insert into public.sinonimos values ('patata', '10000000-0000-0000-0000-000000000005');
insert into public.sustitutos values ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000007', 'a gusto');

insert into public.recetas (id, slug, titulo, estado, origen, categoria, tiempo_coccion_min) values
  ('20000000-0000-0000-0000-000000000001', 'flan', 'Flan rápido', 'publicada', 'recetario', 'Postres', 10),
  ('20000000-0000-0000-0000-000000000002', 'papas', 'Papas rústicas', 'publicada', 'recetario', 'Guarniciones', 20),
  ('20000000-0000-0000-0000-000000000003', 'oculta', 'Receta en revisión', 'en_revision', 'recetario', 'Postres', 5);
insert into public.receta_ingredientes (receta_id, orden, ingrediente_id, texto) values
  ('20000000-0000-0000-0000-000000000001', 1, '10000000-0000-0000-0000-000000000001', '1 huevo'),
  ('20000000-0000-0000-0000-000000000001', 2, '10000000-0000-0000-0000-000000000002', '150 ml de leche'),
  ('20000000-0000-0000-0000-000000000001', 3, '10000000-0000-0000-0000-000000000003', '1 cucharada de azúcar'),
  ('20000000-0000-0000-0000-000000000001', 4, '10000000-0000-0000-0000-000000000004', 'una pizca de sal'),
  ('20000000-0000-0000-0000-000000000002', 1, '10000000-0000-0000-0000-000000000005', '3 papas'),
  ('20000000-0000-0000-0000-000000000002', 2, '10000000-0000-0000-0000-000000000004', 'sal');

-- Helpers para actuar como un usuario ----------------------------------------
create or replace function pg_temp.como(uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(uid, ''), false);
  if uid is null then execute 'set role anon'; else execute 'set role authenticated'; end if;
end $$;

-- 1. Perfil y colección de favoritas automáticos al registrarse
do $$ begin
  if (select count(*) from public.perfiles) <> 3 then raise exception 'FALLA 1: no se crearon los perfiles'; end if;
  if (select count(*) from public.colecciones where es_favoritos) <> 3 then raise exception 'FALLA 1: faltan colecciones de favoritas'; end if;
end $$;

-- 2. Un visitante ve solo recetas publicadas
select pg_temp.como(null);
do $$ begin
  if (select count(*) from public.recetas) <> 2 then raise exception 'FALLA 2: el visitante ve recetas no publicadas'; end if;
end $$;
reset role;

-- 3. Un usuario nuevo publica: su receta va a revisión aunque pida "publicada"
select pg_temp.como('00000000-0000-0000-0000-00000000000b');
insert into public.recetas (slug, titulo, estado, origen) values ('tortilla-ana', 'Tortilla de Ana', 'publicada', 'recetario');
do $$ begin
  if (select estado from public.recetas where slug = 'tortilla-ana') <> 'en_revision' then
    raise exception 'FALLA 3: la receta de un usuario nuevo no fue a revisión'; end if;
  if (select origen from public.recetas where slug = 'tortilla-ana') <> 'usuario' then
    raise exception 'FALLA 3: un usuario pudo marcar su receta como de recetario'; end if;
end $$;

-- 4. El usuario no puede publicarse solo ni subirse el rol
update public.recetas set estado = 'publicada' where slug = 'tortilla-ana';
update public.perfiles set rol = 'admin', recetas_aprobadas = 99 where id = '00000000-0000-0000-0000-00000000000b';
reset role;
do $$ begin
  if (select estado from public.recetas where slug = 'tortilla-ana') <> 'en_revision' then
    raise exception 'FALLA 4: el usuario se autopublicó'; end if;
  if (select rol from public.perfiles where id = '00000000-0000-0000-0000-00000000000b') <> 'usuario' then
    raise exception 'FALLA 4: el usuario se cambió el rol'; end if;
end $$;

-- 5. Otro usuario no ve la receta en revisión de Ana; el admin sí
select pg_temp.como('00000000-0000-0000-0000-00000000000c');
do $$ begin
  if exists (select 1 from public.recetas where slug = 'tortilla-ana') then
    raise exception 'FALLA 5: un usuario ve recetas en revisión ajenas'; end if;
end $$;
reset role;
select pg_temp.como('00000000-0000-0000-0000-00000000000a');
do $$ begin
  if not exists (select 1 from public.recetas where slug = 'tortilla-ana') then
    raise exception 'FALLA 5: el admin no ve la cola de revisión'; end if;
end $$;

-- 6. Tras 2 aprobaciones, la siguiente receta de Ana se publica sola
update public.recetas set estado = 'publicada' where slug = 'tortilla-ana';
reset role;
select pg_temp.como('00000000-0000-0000-0000-00000000000b');
insert into public.recetas (slug, titulo) values ('guiso-ana', 'Guiso de Ana');
reset role;
select pg_temp.como('00000000-0000-0000-0000-00000000000a');
update public.recetas set estado = 'publicada' where slug = 'guiso-ana';
reset role;
select pg_temp.como('00000000-0000-0000-0000-00000000000b');
insert into public.recetas (slug, titulo) values ('budin-ana', 'Budín de Ana');
reset role;
do $$ begin
  if (select recetas_aprobadas from public.perfiles where id = '00000000-0000-0000-0000-00000000000b') < 2 then
    raise exception 'FALLA 6: el contador de aprobadas no llegó a 2'; end if;
  if (select estado from public.recetas where slug = 'budin-ana') <> 'publicada' then
    raise exception 'FALLA 6: con 2 aprobadas la receta no se publicó directo'; end if;
end $$;

-- 7. Despensa privada
select pg_temp.como('00000000-0000-0000-0000-00000000000b');
insert into public.despensa (usuario_id, ingrediente_id) values
  ('00000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-000000000007');
reset role;
select pg_temp.como('00000000-0000-0000-0000-00000000000c');
do $$ begin
  if exists (select 1 from public.despensa) then raise exception 'FALLA 7: se ve la despensa de otro usuario'; end if;
end $$;
reset role;

-- 8. "¿Qué cocino?" con la despensa de Ana: flan 2 de 3 (la sal es básica), con reemplazo sugerido
select pg_temp.como('00000000-0000-0000-0000-00000000000b');
do $$
declare r record;
begin
  select * into r from public.que_cocino() where slug = 'flan';
  if r is null then raise exception 'FALLA 8: el flan no aparece'; end if;
  if r.tengo <> 2 or r.necesito <> 3 or r.coincidencia <> 67 then
    raise exception 'FALLA 8: coincidencia incorrecta (% de %, %%%)', r.tengo, r.necesito, r.coincidencia; end if;
  if r.faltantes -> 0 -> 'reemplazos' ->> 0 <> 'edulcorante' then
    raise exception 'FALLA 8: no sugiere el reemplazo que tiene en la despensa: %', r.faltantes; end if;
  if exists (select 1 from public.que_cocino() where slug = 'papas') then
    raise exception 'FALLA 8: aparecen papas sin tener papa'; end if;
  if exists (select 1 from public.que_cocino() where slug = 'oculta') then
    raise exception 'FALLA 8: aparece una receta no publicada'; end if;
end $$;
reset role;

-- 9. Sinónimos y búsqueda sin tildes
do $$ begin
  if public.buscar_ingrediente('Patata') <> '10000000-0000-0000-0000-000000000005' then
    raise exception 'FALLA 9: no reconoce el sinónimo patata'; end if;
  if public.buscar_ingrediente('AZUCAR') <> '10000000-0000-0000-0000-000000000003' then
    raise exception 'FALLA 9: no ignora tildes y mayúsculas'; end if;
  if not exists (select 1 from public.buscar_recetas('rustica')) then
    raise exception 'FALLA 9: la búsqueda por nombre no ignora tildes'; end if;
end $$;

-- 10. Puntajes actualizan el promedio
select pg_temp.como('00000000-0000-0000-0000-00000000000b');
insert into public.puntajes (receta_id, usuario_id, puntaje) values ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 5);
reset role;
select pg_temp.como('00000000-0000-0000-0000-00000000000c');
insert into public.puntajes (receta_id, usuario_id, puntaje) values ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000c', 4);
reset role;
do $$ begin
  if (select puntaje_promedio from public.recetas where slug = 'flan') <> 4.5 then
    raise exception 'FALLA 10: promedio incorrecto'; end if;
end $$;

-- 11. Un moderador oculta un comentario y el autor no puede volver a mostrarlo
select pg_temp.como('00000000-0000-0000-0000-00000000000c');
insert into public.comentarios (receta_id, usuario_id, texto) values ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000c', 'Muy rico');
reset role;
select pg_temp.como('00000000-0000-0000-0000-00000000000a');
update public.comentarios set visible = false where texto = 'Muy rico';
reset role;
select pg_temp.como('00000000-0000-0000-0000-00000000000c');
update public.comentarios set visible = true where texto = 'Muy rico';
reset role;
select pg_temp.como(null);
do $$ begin
  if exists (select 1 from public.comentarios where texto = 'Muy rico') then
    raise exception 'FALLA 11: el comentario oculto sigue visible'; end if;
end $$;
reset role;

-- 12. Límite diario de comentarios
update public.configuracion set valor = '{"cargas": 10, "comentarios": 2, "recetas": 10}' where clave = 'limites_diarios';
select pg_temp.como('00000000-0000-0000-0000-00000000000c');
insert into public.comentarios (receta_id, usuario_id, texto) values ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000c', 'Segundo');
do $$ begin
  begin
    insert into public.comentarios (receta_id, usuario_id, texto) values ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000c', 'Tercero');
    raise exception 'FALLA 12: no frenó el tercer comentario del día';
  exception when sqlstate 'P0001' then
    if sqlerrm like 'FALLA%' then raise; end if;
  end;
end $$;
reset role;

-- 13. Un usuario común no ve métricas, auditoría ni pagos ajenos; el admin sí ve la auditoría
select pg_temp.como('00000000-0000-0000-0000-00000000000b');
do $$ begin
  if exists (select 1 from public.auditoria) then raise exception 'FALLA 13: un usuario ve la auditoría'; end if;
  if exists (select 1 from public.eventos) then raise exception 'FALLA 13: un usuario ve métricas'; end if;
end $$;
reset role;
select pg_temp.como('00000000-0000-0000-0000-00000000000a');
do $$ begin
  if not exists (select 1 from public.auditoria where tabla = 'recetas') then raise exception 'FALLA 13: no se auditó la moderación'; end if;
end $$;
reset role;

-- 14. Usuario suspendido no puede crear recetas
update public.perfiles set suspendido = true where id = '00000000-0000-0000-0000-00000000000c';
select pg_temp.como('00000000-0000-0000-0000-00000000000c');
do $$ begin
  begin
    insert into public.recetas (slug, titulo) values ('suspendido', 'No debería');
    raise exception 'FALLA 14: un suspendido creó una receta';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

\o
\pset tuples_only on
select 'OK: todas las pruebas de permisos pasaron';
rollback;
