import { readFile, access } from 'node:fs/promises';
import { transform } from 'esbuild';
const htmlFiles = ['index.html','multiplikation.html','korsord.html'];
for (const filename of htmlFiles) {
  const html = await readFile(filename,'utf8');
  for (const [, path] of html.matchAll(/(?:src|href)="([^"#]+)(?:#[^"]*)?"/g)) {
    if (path !== './') await access(path);
  }
}
for (const filename of ['game.js','crossword.js','portal.js','cloud.js','translations.js','api/practice.mjs','lib/database.mjs']) {
  await transform(await readFile(filename,'utf8'), { loader:'js' });
}
console.log('Build passed: 3 pages, assets, game scripts and database API.');
