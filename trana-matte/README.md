# Träna Matte

I built Träna Matte to help my children practise the basic maths skills they’re expected to learn at school. I wanted them to be able to practise on their own and have a little fun, while giving me a clearer picture of what they’ve mastered and where they could use more practice.

The game includes a multiplication space adventure, timed challenges, and maths crosswords at three difficulty levels. Children can play on a phone, tablet, or computer. Levels, stars, and medals give them something to work towards, and the practice history shows what they worked on, how they did, and how long it took.

For now, practice history is saved in each browser. I’d like to add more arithmetic exercises and a parent report that brings together results from different devices.


## Neon cloud saves

Multiplication and crossword results are sent to the Vercel Function at
`/api/practice`. The browser queues pending results and retries them after
connectivity returns. Database credentials remain server-side.

### Local development

Use Node.js 22 or newer.

```sh
npm install
neon deploy
npm run db:migrate
npm run build
npm start
```

Open http://127.0.0.1:3035. Neon writes connection settings to the ignored
`.env.local` file.

### Vercel

Set `DATABASE_URL` in the project's Production environment variables using
the pooled connection string from Neon. Keep Root Directory set to
`trana-matte`, Framework Preset to Other, and the static Output Directory
at the project root. Deploy after setting the environment variable.

The SQL migration is in `migrations/001-practice.sql`. Apply migrations
explicitly before deploying code that depends on them.

Player identity is currently stored per nickname in each browser.
Cloud records from all devices are stored in Neon, but matching nicknames
on different devices have separate player IDs. Shared player links and a
private parent report can be added later. Old browser history is not
automatically imported.
