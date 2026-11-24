# Lista de cumplimiento antes de abrir Bocado

Lo que hay que tener resuelto, con la norma que lo pide. Verificado en fuentes oficiales el 24/11/2026, salvo donde se indica.

## Antes de abrir el registro de usuarios

- [ ] **Revisión legal** de términos, privacidad, reclamos y pautas por un abogado o abogada matriculado.
- [ ] **Inscribir al responsable y la base de datos de usuarios** en el Registro Nacional de Bases de Datos Personales de la AAIP. Es por Trámites a Distancia (TAD), gratuito, y primero se inscribe el responsable y después la base.
  - Base: Ley 25.326, art. 21, y Resolución AAIP 132/2018.
  - Nota: el art. 21 menciona las bases "destinadas a dar informes" y la AAIP exceptúa solo las de uso exclusivamente personal. Una app abierta al público no es de uso personal, así que conviene inscribirla. Confirmarlo con el abogado.
- [ ] **Mostrar la información del art. 6 de la Ley 25.326 antes de recolectar datos**, con la leyenda textual de la AAIP. Va en la pantalla de ingreso y en la política de privacidad.
  - Base: Resolución AAIP 14/2018, arts. 2 y 3.
- [ ] **Consentimiento expreso** para el tratamiento y las transferencias internacionales (casilla en el primer ingreso, guardando fecha y versión aceptada).
  - Base: Ley 25.326, arts. 5 y 12.
- [ ] **Acuerdos de tratamiento de datos** con Supabase, Vercel y Anthropic, revisados frente a las cláusulas modelo de la Disposición DNPDP 60/2016.
- [ ] **Datos del titular** en el pie del sitio: nombre, CUIT/CUIL, domicilio y canal de reclamos con el área responsable.
  - Base: Disposición 954/2025, art. 6.

## Antes de activar el cobro de la membresía

- [ ] **Inscripción impositiva** para facturar: alta como monotributista en ARCA (ex AFIP), compatible con la relación de dependencia; o la sociedad que se defina. Elegir categoría y actividad con un contador. Sin esto no se activa `membresia_cobro_activo`.
  - No verificado en fuente oficial en esta revisión; consultar con un contador.
- [ ] **Botón de arrepentimiento** con ese nombre, a simple vista, en lugar destacado y en el primer acceso, sin exigir registración previa.
  - Base: Disposición 954/2025, art. 1; Ley 24.240, art. 34 (10 días corridos); CCyC, art. 1110.
- [ ] **Botón de baja de servicio** con ese nombre, a simple vista, en lugar destacado y en el primer acceso, sin exigir registración previa.
  - Base: Disposición 954/2025, art. 4; Ley 24.240, art. 10 ter.
  - La Disposición 3/2026 permite pedir una verificación de identidad razonable, por medios habituales y solo con ese fin. Ejemplo: un código enviado al mail de la cuenta.
- [ ] **Código de la solicitud dentro de las 24 horas**, por el mismo medio, y baja o devolución efectivas.
  - Base: Disposición 954/2025, art. 5.
- [ ] **Sin cargos por la baja**, sin preaviso ni mes adelantado.
  - Base: Ley 24.240, art. 10 quáter.
- [ ] **Constancia de la baja** al consumidor dentro de las 72 horas.
  - Base: Ley 24.240, art. 10 ter. El código de las 24 horas puede cumplir las dos cosas si es fehaciente; confirmarlo con el abogado.
- [ ] **Atención de consultas y reclamos** al menos 8 horas por día hábil, de lunes a viernes, informando el canal y el área responsable.
  - Base: Disposición 954/2025, art. 6.
- [ ] **Sin cláusulas abusivas**: nada que limite la responsabilidad por daños o restrinja derechos del consumidor.
  - Base: Ley 24.240, art. 37.
- [ ] **Mercado Pago**: suscripciones (preapproval) en modo prueba primero; la baja en Bocado tiene que cancelar la suscripción en Mercado Pago en el mismo momento.

## Contenido

- [ ] Decidir qué hacer con los dos "Ebook Regalo", que tienen autoras y editorial identificadas.
- [ ] Publicar el procedimiento de reclamos por derechos de autor y una casilla de mail para recibirlos.

## Para la web (a programar cuando el texto esté aprobado)

- Páginas `/terminos`, `/privacidad`, `/derechos-de-autor` y `/pautas`, enlazadas desde el pie.
- Botones de arrepentimiento y de baja en el encabezado o el pie de todas las páginas, sin pedir ingreso. Formulario con mail y verificación por código.
- Casilla de aceptación en el primer ingreso, con versión y fecha guardadas en la base.
- Exportar y borrar la cuenta desde el perfil.

## Fuentes consultadas

- [Ley 24.240 de Defensa del Consumidor, texto actualizado (InfoLEG)](https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/638/texact.htm)
- [Ley 25.326 de Protección de los Datos Personales (InfoLEG)](https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/texact.htm)
- [Disposición 954/2025, Subsecretaría de Defensa del Consumidor y Lealtad Comercial (InfoLEG)](https://servicios.infoleg.gob.ar/infolegInternet/anexos/415000-419999/417152/norma.htm). Publicada el 04/09/2025; deroga las resoluciones 316/2018 y 424/2020.
- [Disposición 3/2026, Dirección Nacional de Defensa del Consumidor y Arbitraje del Consumo (InfoLEG)](https://servicios.infoleg.gob.ar/infolegInternet/anexos/420000-424999/423007/norma.htm). Publicada el 06/02/2026.
- [Resolución AAIP 14/2018 (InfoLEG)](https://servicios.infoleg.gob.ar/infolegInternet/anexos/305000-309999/307621/norma.htm)
- [Obligaciones de los responsables de bases de datos personales (AAIP)](https://www.argentina.gob.ar/aaip/datospersonales/responsables/obligaciones)
- [Trámites ante el Registro Nacional de Bases de Datos Personales (AAIP)](https://www.argentina.gob.ar/aaip/datospersonales/tramites)
- Proyectos de reforma de la Ley 25.326 en el Congreso (por ejemplo, 3397-D-2026 y 1751-D-2026): ninguno aprobado a la fecha según fuentes secundarias ([Beccar Varela](https://beccarvarela.com/novedades/nuevo-proyecto-de-ley-de-proteccion-de-datos-personales/), [IAPP](https://iapp.org/news/a/se-impulsa-un-nuevo-proyecto-de-reforma-del-r-gimen-de-protecci-n-de-datos-en-argentina)). Conviene volver a revisarlo antes del lanzamiento.
