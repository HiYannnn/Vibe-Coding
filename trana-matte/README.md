# Träna Matte 🚀

[Start Practising](https://trana-matte.vercel.app)

Träna Matte is a space-themed maths practice challenges. I built to help my children practise the basic skills they’re expected to learn at school.

I wanted practice to be easy to access and enjoyable, while helping me understand which skills they’ve mastered and where they need more support.

## Practice activities

- **Multiplication Adventure** — unlock worlds, collect stars, and face a timed Lightning Run.
- **Addition and Subtraction** — practise with two-, three-, or four-digit numbers, with optional timed challenges.
- **Division Galaxy** — separate two- and three-digit tracks with cargo missions, missing-number puzzles, and guardian challenges.
- **Math Crosswords** — complete connected equations at three difficulty levels.
- **Space Kitchen** — identify fractions using ten different food pictures per round.
- **Energy Panel** — colour fractions using wheels, honeycombs, triangles,bars, and crystals.
- **Star Scales** — compare fractions, including equivalent fractions.

Fraction activities have basic and advanced levels, with partitions up to 12 equal parts.

## Progress and rewards

Children earn stars, medals, and lifetime leaderboard points.
Completed rounds are saved to Neon, with a browser queue that retries pending uploads. A sync button can recover completed rounds stored locally.

Players currently have separate identities in each browser, so using the same nickname on another device creates a separate leaderboard entry.

## Languages and devices

The interface defaults to Swedish, with English and Chinese available.
The game runs in a browser on computers, tablets, and phones.

## Planned features

- Shared player identities across devices.
- A private parent dashboard with weekly practice reports.

## Neon cloud saves

Multiplication and crossword results are sent to the Vercel Function at `/api/practice`. The browser queues pending results and retries them after connectivity returns. Database credentials remain server-side.

### Local development

Use Node.js 22 or newer.

```sh
npm install
neon deploy
npm run db:migrate
npm run build
npm start
```

Open http://127.0.0.1:3035. Neon writes connection settings to the ignored `.env.local` file.

### Vercel

Set `DATABASE_URL` in the project's Production environment variables using the pooled connection string from Neon. Keep Root Directory set to `trana-matte`, Framework Preset to Other, and the static Output Directory as `public` (configured in `vercel.json`). Deploy after setting the environment variable.

The SQL migration is in `migrations/001-practice.sql`. Apply migrations explicitly before deploying code that depends on them.

Player identity is currently stored per nickname in each browser.
Cloud records from all devices are stored in Neon, but matching nicknames on different devices have separate player IDs. Shared player links and a private parent report can be added later. Old browser history is not automatically imported.
