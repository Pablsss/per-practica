# PER · Cuaderno de exámenes
Practica preguntas de navegación, guarda un intento y revisa las respuestas con explicaciones. Esta edición incluye cuatro preguntas originales. Puedes añadir material propio en `data/exams.json`.
    
Con Node 22.13 o posterior y la versión de pnpm indicada en `package.json`, ejecuta:
    
```sh
pnpm install --frozen-lockfile
pnpm build
pnpm exec wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_mature_mastermind.sql
pnpm dev
```
    
Abre la dirección que muestre el servidor. La vista local usa una identidad de prueba. Para un alojamiento compartido, el servidor de autenticación debe validar la identidad y controlar las cabeceras de usuario. Ejecuta `node scripts/verify-exams.mjs` para comprobar la corrección y el historial.
