import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
assert(fs.existsSync(dist), 'Run npm run build before checking output');
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => (entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]));
const files = walk(dist);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const origin = 'https://teamodyssey.space';
const errors = [];
let checked = 0;
const parsed = new Map();

function getElements(file) {
  if (!parsed.has(file)) {
    const elements = [];
    function visit(node) {
      if (node.tagName) elements.push(node);
      (node.childNodes || []).forEach(visit);
      if (node.content) visit(node.content);
    }
    visit(parse(fs.readFileSync(file, 'utf8')));
    parsed.set(file, elements);
  }
  return parsed.get(file);
}

function resolveFile(url) {
  const relative = decodeURIComponent(url.pathname).replace(/^\//, '');
  const base = path.join(dist, relative);
  return [base, path.join(base, 'index.html'), `${base}.html`].find(
    (file) => fs.existsSync(file) && fs.statSync(file).isFile()
  );
}

function checkReference(value, base, source) {
  if (!value || /^(?:data:|mailto:|tel:|javascript:)/i.test(value)) return;
  const url = new URL(value.replaceAll('&amp;', '&'), base);
  if (url.origin !== origin) return;
  checked++;
  const target = resolveFile(url);
  if (!target) {
    errors.push(`${source}: missing ${value}`);
    return;
  }
  if (url.hash && target.endsWith('.html')) {
    const id = decodeURIComponent(url.hash.slice(1));
    const ids = getElements(target).flatMap((node) =>
      node.attrs.filter((attr) => attr.name === 'id').map((attr) => attr.value)
    );
    if (!ids.includes(id)) errors.push(`${source}: missing anchor ${value}`);
  }
}

for (const file of htmlFiles) {
  const relative = path.relative(dist, file).replaceAll('\\', '/');
  const base = new URL(relative.replace(/index\.html$/, ''), `${origin}/`);
  const elements = getElements(file);
  elements.forEach((node) =>
    node.attrs.forEach((attr) => {
      if (['href', 'src', 'poster'].includes(attr.name)) checkReference(attr.value, base, relative);
    })
  );
  if (!relative.startsWith('decapcms/')) {
    assert.equal(elements.filter((node) => node.tagName === 'h1').length, 1, `${relative} must have one page title`);
  }
}
for (const file of files.filter((file) => file.endsWith('.css'))) {
  const relative = path.relative(dist, file).replaceAll('\\', '/');
  const base = new URL(relative, `${origin}/`);
  for (const match of fs.readFileSync(file, 'utf8').matchAll(/url\((?:['"])?([^)'"\s]+)(?:['"])?\)/g)) {
    checkReference(match[1], base, relative);
  }
}

const getProfiles = (file) => {
  const html = fs.readFileSync(path.join(dist, file, 'index.html'), 'utf8');
  return JSON.parse(html.match(/<script\b[^>]*id="team-profiles"[^>]*>([\s\S]*?)<\/script>/)[1]);
};
assert.deepEqual(getProfiles('team'), getProfiles('teams'), 'The legacy team URL must preserve every profile');
assert.equal(Object.keys(getProfiles('teams')).length, 50, 'Keep all team profiles');
assert.equal(errors.length, 0, errors.join('\n'));
console.log(`Checked ${htmlFiles.length} HTML files, ${checked} local references, headings, and 50 team profiles.`);
