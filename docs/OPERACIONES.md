# Roodada · Operaciones

El día a día: trabajar en local, publicar, revisar el servidor y qué hacer cuando algo falla. Cómo está hecho todo: [TECNICA.md](TECNICA.md).

Actualizado el 26-11-2026.

Los comandos se lanzan **desde la carpeta del proyecto** (`~/Proyectos/roodada`). En Claude Code se pueden lanzar escribiendo `!` delante (por ejemplo `! sh scripts/vps/estado.sh`): así Claude ve el resultado.

## Índice

1. [Chuleta](#1-chuleta)
2. [Trabajar en local](#2-trabajar-en-local)
3. [Ramas y revisión](#3-ramas-y-revisión)
4. [Publicar](#4-publicar)
5. [Revisar el servidor](#5-revisar-el-servidor)
6. [Tareas habituales](#6-tareas-habituales)
7. [Qué hacer si…](#7-qué-hacer-si)
8. [Tareas periódicas](#8-tareas-periódicas)

---

## 1. Chuleta

| Quiero… | Comando |
| --- | --- |
| Arrancar la web en mi ordenador | `npm run dev -- -p 3001` |
| Comprobar antes de subir | `npm run typecheck && npm run lint && npm test` |
| **Publicar** lo que hay en `main` | `sh scripts/vps/deploy.sh` |
| Ver si la web está bien | `sh scripts/vps/estado.sh` |
| Ver los registros | `sh scripts/vps/logs.sh` (o `logs.sh csp`, `logs.sh error`…) |
| Volver a la versión anterior | `sh scripts/vps/volver.sh` |
| Ver ya los datos nuevos de Edgar | `sh scripts/vps/refrescar.sh` |
| ¿Falta alguna web de fotos? | `npx tsx --env-file=.env.local scripts/comprobar-fotos.mts` |

Los scripts de `scripts/vps/` entran al servidor con la clave `~/.ssh/digitaldementia_vps`. Quien no la tenga en su ordenador no puede lanzarlos.

## 2. Trabajar en local

**Primera vez:**

```bash
git clone https://github.com/IvanMerino515/roodada.git ~/Proyectos/roodada
cd ~/Proyectos/roodada
npm install
cp .env.example .env.local    # y rellenar SUPABASE_URL y SUPABASE_ANON_KEY (pedirlas a Iván)
```

**Cada día:**

```bash
git pull                      # antes de empezar: trae lo que haya subido el otro
npm run dev -- -p 3001        # http://localhost:3001
```

- En el Mac de Iván el puerto 3000 lo usa otro proyecto: usad el 3001.
- No trabajéis con el proyecto dentro de iCloud (Escritorio o Documentos sincronizados): iCloud crea copias «nombre 2» que rompen `git` y la compilación.
- `npm run build` carga el catálogo entero desde Supabase. No lo lancéis por costumbre: el plan gratuito tiene un presupuesto de disco limitado.
- En desarrollo no se envían eventos de medición ni se carga Google Analytics.

## 3. Ramas y revisión

- `main` es lo que se publica. **Subir a GitHub no publica**: publicar es lanzar `deploy.sh`.
- Edgar trabaja en ramas propias (por ejemplo `cambios_edgar_front_…`). Iván (o Claude) las revisa en local y las junta con `main`.
- Cada subida a GitHub pasa las comprobaciones automáticas (tipos, lint, pruebas, dependencias). Si salen en rojo, no se publica hasta arreglarlo.
- Las propuestas de Dependabot de versión grande (TypeScript, ESLint, Node…) se cierran: esas actualizaciones se hacen a mano.

## 4. Publicar

```bash
git checkout main && git pull       # asegúrate de tener lo último
sh scripts/vps/deploy.sh
```

Qué hace, en 5–6 minutos:

1. Sube el código de tu carpeta al servidor (**lo que tengas en tu carpeta, aunque no esté en commit**: haz commit antes).
2. Instala y compila en el servidor (2 procesos para no saturar Supabase).
3. Prepara la versión nueva, guarda la actual como `app.old` y cambia.
4. Comprueba que responde. **Si no responde, vuelve sola a la anterior** y muestra el error.

Tiene que terminar con «✓ Roodada publicada y respondiendo». El aviso `curl: (7) Failed to connect…` que sale justo antes es normal (el primer intento llega antes de que arranque).

**Cuándo hace falta publicar**: cambios de código, textos, estilos, configuración de Next. **Cuándo no**: datos de Supabase (bicis, precios, fotos nuevas de marcas ya permitidas). Esos se ven solos en menos de un día, o al momento con `refrescar.sh`.

## 5. Revisar el servidor

```bash
sh scripts/vps/estado.sh
```

Muestra si el servicio está activo, cuánta memoria usa, si responde, memoria y disco del servidor, las versiones guardadas, los errores de las últimas 24 horas y el último aviso a IndexNow.

```bash
sh scripts/vps/logs.sh              # últimas 100 líneas
sh scripts/vps/logs.sh csp          # avisos de la política de seguridad (últimos 7 días)
sh scripts/vps/logs.sh indexnow     # avisos a Bing
sh scripts/vps/logs.sh error
```

Otros paneles:

- **Cloudflare** → Analytics: visitas, caché, amenazas. AI Crawl Control: qué bots de IA entran.
- **Supabase** → Reports → Disk IO: no debería volver a avisar con las cachés de un día.
- **Search Console** y **Bing Webmaster Tools**: indexación.
- **Google Analytics** (solo quien acepta cookies) y el **registro propio** (vistas `v_*` en Supabase, con Looker Studio o Power BI).

## 6. Tareas habituales

### Añadir una marca nueva

1. Edgar carga los datos en Supabase.
2. Comprobar las fotos:
   ```bash
   npx tsx --env-file=.env.local scripts/comprobar-fotos.mts
   ```
   Si dice que falta una web, añadirla en `src/lib/fotosPermitidas.ts`: `{ host }` si es la web propia de la marca, o solo su ruta en `rutas` si es un dominio compartido (Shopify, Google Cloud…). Luego publicar.
3. Si la marca trae una **disciplina nueva** (como pasó con «plegable»), añadirla en `types`, `format` y `questions` antes de publicar, o fallará la compilación.
4. Si el precio de la marca es especial (solo estimado, en otra moneda, tienda europea…), revisar `src/lib/priceOrigin.ts` y `PRECIO_ESTIMADO` en `src/lib/catalog/build.ts`.
5. `sh scripts/vps/refrescar.sh` para verla ya.

### Activar un enlace de afiliado

Rellenar `offers.affiliate_url` en Supabase con el enlace de la red. La web lo usa sola (las personas salen por él, los bots no) y la ficha muestra el aviso de comisión. No hace falta publicar.

### Cambiar una variable del servidor

Las variables están en `/srv/roodada/.env`. Para cambiar una (por ejemplo la clave de Supabase):

```bash
ssh -i ~/.ssh/digitaldementia_vps root@217.76.133.242
nano /srv/roodada/.env        # cambiar la línea y guardar
exit
sh scripts/vps/deploy.sh      # las que empiezan por NEXT_PUBLIC_ se meten al compilar
```

Para las demás basta con `sh scripts/vps/refrescar.sh` (reinicia la web).

### Cambiar la configuración de Nginx o del servicio

- `setup.sh` es de **una sola vez**. Si se vuelve a lanzar, no toca Nginx (para no perder el HTTPS que añadió certbot), pero sí reinstala el servicio y el cron desde `scripts/vps/`.
- Para cambiar Nginx: editar `/etc/nginx/sites-available/roodada` en el servidor, comprobar con `nginx -t` y aplicar con `systemctl reload nginx`. Copiar el cambio también a `scripts/vps/roodada.nginx` para que quede escrito.
- El VPS lo comparten digitaldementia.es y Office: un error en Nginx afecta a todas. Siempre `nginx -t` antes de recargar.

### Ejecutar SQL en Supabase

Los ficheros de `supabase/sql/` se ejecutan **a mano** en Supabase → SQL Editor, en orden, una vez. Todos se pueden repetir sin romper nada. Pendiente a 26-11-2026: `004_seguridad.sql`.

## 7. Qué hacer si…

**La web no carga**

1. `sh scripts/vps/estado.sh`.
2. Si el servicio no está activo o no responde, y acabáis de publicar: `sh scripts/vps/volver.sh`.
3. Si no se publicó nada: `sh scripts/vps/refrescar.sh` y mirar `sh scripts/vps/logs.sh error`.
4. Si Cloudflare muestra su propia página de error (521, 522…), el problema está en el VPS o en Nginx: mirar el paso 1. Si es un 525 o 526, es el certificado (ver más abajo).

**La compilación falla con «canceling statement due to statement timeout»**

Supabase va cargado (cargas de Edgar o presupuesto de disco agotado). La web publicada sigue funcionando. Esperar unos minutos y volver a lanzar `deploy.sh`. Si se repite, mirar Supabase → Reports → Disk IO.

**Una bici sale sin foto**

`npx tsx --env-file=.env.local scripts/comprobar-fotos.mts`. Si la web de la foto no está en la lista, añadirla (ver «Añadir una marca nueva»). Si sí está, puede que la marca haya cambiado o bloqueado la foto: abrir la dirección de `media.source_url` en el navegador.

**`/ir/` devuelve «429 Too Many Requests»**

Es el límite contra el fraude de clics: más de 20 salidas por minuto desde la misma IP. A una persona normal no le pasa. Se ajusta en Nginx (`limit_req_zone … roodada_ir`).

**El aviso diario a Bing no llega**

`sh scripts/vps/logs.sh indexnow` y `sh scripts/vps/estado.sh` (última línea). Un 401 es que `CRON_SECRET` no coincide; un 503 es que falta en `/srv/roodada/.env`.

**El certificado da error o está a punto de caducar**

certbot lo renueva solo. Para comprobarlo:

```bash
ssh -i ~/.ssh/digitaldementia_vps root@217.76.133.242 'certbot renew --dry-run'
```

En Cloudflare, SSL/TLS debe seguir en **Full (strict)** y «Always Use HTTPS» desactivado.

**En mi ordenador veo una versión antigua o la web vieja**

Tu red puede guardar respuestas DNS antiguas. Prueba con los datos del móvil. Para comprobar sin la caché de tu red: `curl -s "https://dns.google/resolve?name=roodada.com&type=A"`.

**Next falla en local con «Cannot read properties of undefined (reading 'react-rsc')»**

Borrar la carpeta `.next` y volver a arrancar.

**`git` o la compilación fallan con nombres como «index 2», «routes.d 2.ts»**

Son copias de iCloud. Borrarlas (`find .next -name "* 2*" -delete`) y sacar el proyecto de iCloud.

## 8. Tareas periódicas

| Cuándo | Qué |
| --- | --- |
| Cada semana | `sh scripts/vps/estado.sh`. Revisar Search Console y Cloudflare. Revisar las propuestas de Dependabot |
| Hacia el 2-12-2026 | Revisar `logs.sh csp` y, si no hay avisos de recursos propios, pasar la CSP de Report-Only a aplicada en `next.config.ts` |
| Al confirmar el alta en AvantLink | Quitar su script de `src/app/page.tsx` y su mención en `/privacidad` |
| Al aprobar Skimlinks | Envolver en `/ir/` las salidas sin enlace de afiliado propio |
| Cada 3 meses | Copia de los datos de Supabase: el plan gratuito no guarda copias descargables, así que pedídsela a Claude (volcado con el rol de solo lectura) y guardadla fuera del ordenador. Revisar los textos legales |
| Cada año (antes del 25-11) | Renovar `Expires` en `public/.well-known/security.txt` |
| Al añadir un servicio con cookies | Añadirlo a `/cookies`, `/privacidad` y la CSP, y subir `VERSION` en `src/lib/consentimiento.ts` |
