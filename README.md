# Roodada

Guía para elegir bicicleta con datos reales: guía de preguntas que recomienda bicis, comparador, fichas, páginas por tipo, precio y marca, y calculadora de talla. En producción en **https://roodada.com**.

## Documentación

| Documento | Para qué |
| --- | --- |
| [docs/TECNICA.md](docs/TECNICA.md) | Cómo está hecha: piezas, datos, servidor, medición, seguridad |
| [docs/OPERACIONES.md](docs/OPERACIONES.md) | Día a día: trabajar en local, publicar, revisar el servidor, qué hacer si algo falla |
| [docs/RECOMENDADOR.md](docs/RECOMENDADOR.md) | Cómo decide el recomendador y la nota calidad-precio |
| [CLAUDE.md](CLAUDE.md) | Decisiones y avisos al día para trabajar con Claude Code |

## Empezar

```bash
npm install
cp .env.example .env.local   # rellenar SUPABASE_URL y SUPABASE_ANON_KEY
npm run dev -- -p 3001       # http://localhost:3001
```

Comprobar antes de subir: `npm run typecheck && npm run lint && npm test`.

Publicar (subir a GitHub **no** publica): `sh scripts/vps/deploy.sh`. Ver [OPERACIONES.md](docs/OPERACIONES.md).
