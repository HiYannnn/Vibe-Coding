import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import handler from '../api/practice.mjs';
import leaderboard from '../api/leaderboard.mjs';

const root = process.cwd();
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.jpg':'image/jpeg' };
const server = http.createServer(async (req,res) => {
  res.status = code => { res.statusCode = code; return res; };
  res.json = value => { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(value)); };
  const url = new URL(req.url,'http://localhost');
  if (url.pathname === '/api/leaderboard') return leaderboard(req,res);
  if (url.pathname === '/api/practice') {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 16384) return res.status(413).end();
    }
    try { req.body = body ? JSON.parse(body) : {}; } catch { return res.status(400).json({error:'Invalid JSON'}); }
    return handler(req,res);
  }
  const relative = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  if (!/^[a-zA-Z0-9_-]+\.(html|js|css|jpg)$/.test(relative)) return res.status(404).end();
  try {
    const file = await readFile(path.join(root,relative));
    res.setHeader('Content-Type', types[path.extname(relative)]);
    res.end(file);
  } catch { res.status(404).end(); }
});
server.listen(3035,'127.0.0.1',()=>console.log('Träna Matte running at http://127.0.0.1:3035'));
