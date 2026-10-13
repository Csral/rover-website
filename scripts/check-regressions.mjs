import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = new URL('../', import.meta.url);
const require = createRequire(new URL('package.json', root));

async function loadSource(relative, overrides = {}) {
  const source = await fs.readFile(new URL(relative, root), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  });
  const resolved = outputText.replace(/from (['"])([^'"]+)\1/g, (_, _quote, name) => {
    const url = overrides[name] || pathToFileURL(require.resolve(name)).href;
    return `from ${JSON.stringify(url)}`;
  });
  return import(`data:text/javascript;base64,${Buffer.from(resolved).toString('base64')}`);
}

const markdown = await loadSource('src/utils/frontmatter.ts');
const table = () => ({ type: 'element', tagName: 'table', properties: {}, children: [] });
const tree = {
  type: 'root',
  children: [table(), table(), { type: 'element', tagName: 'blockquote', properties: {}, children: [table()] }],
};
markdown.responsiveTablesRehypePlugin()(tree);
for (const parent of [tree.children[0], tree.children[1], tree.children[2].children[0]]) {
  assert.equal(parent.tagName, 'div', 'Adjacent and nested tables must all scroll horizontally');
  assert.equal(parent.children[0].tagName, 'table');
}

const images = {
  type: 'root',
  children: [
    { type: 'element', tagName: 'img', properties: {}, children: [] },
    { type: 'element', tagName: 'img', properties: { loading: 'eager' }, children: [] },
  ],
};
markdown.lazyImagesRehypePlugin()(images);
assert.equal(images.children[0].properties.loading, 'lazy');
assert.equal(images.children[1].properties.loading, 'eager', 'An explicit eager image must stay eager');

const article = {
  type: 'root',
  children: [{ type: 'heading', depth: 1, children: [{ type: 'text', value: 'Mission' }] }],
};
markdown.readingTimeRemarkPlugin()(article, {
  path: '/site/src/data/post/irc.md',
  data: { astro: { frontmatter: {} } },
});
assert.equal(article.children[0].depth, 2, 'The article title owns h1; Markdown sections begin at h2');

const getImageFixture = `export async function getImage({width, height}) {
  return {src: '/generated/' + width + '.webp', attributes: {width, height}};
}`;
const imageUtils = await loadSource('src/utils/images-optimization.ts', {
  'astro:assets': `data:text/javascript;base64,${Buffer.from(getImageFixture).toString('base64')}`,
});
const metadata = { src: '/original.png', width: 600, height: 300, format: 'png' };
let requestedWidths;
const transform = async (_, widths) => {
  requestedWidths = widths;
  return widths.map((width) => ({ src: `/optimized/${width}.webp`, width }));
};
const numeric = await imageUtils.getImagesOptimized(metadata, { width: '300', alt: 'Rover' }, transform);
assert.equal(numeric.attributes.height, 150, 'String widths must preserve the source aspect ratio');
assert.equal(numeric.src, '/optimized/300.webp', 'The fallback src must use an optimized file');
assert(
  requestedWidths.every((width) => width <= 600 && width > 0),
  'Variants must not upscale the source'
);
assert.equal(new Set(requestedWidths).size, requestedWidths.length, 'Do not generate duplicate variants');

const square = await imageUtils.getImagesOptimized(
  metadata,
  { width: 320, aspectRatio: '1:1', alt: 'Rover' },
  transform
);
assert.equal(square.attributes.height, 320, 'Explicit crop ratios must override the source ratio');
assert(
  requestedWidths.every((width) => width <= 300),
  'Square crops must also respect source height'
);
const invalid = await imageUtils.getImagesOptimized(
  metadata,
  { width: 300, aspectRatio: '-1:2', alt: 'Rover' },
  transform
);
assert.equal(invalid.attributes.height, 150, 'Invalid crop ratios must fall back to intrinsic dimensions');
const crop = await imageUtils.astroAssetsOptimizer(metadata, [300], 300, 200);
assert.equal(crop[0].height, 200, 'Requested crops must reach the image service');

const yaml = require('js-yaml');
const cms = yaml.load(await fs.readFile(new URL('public/decapcms/config.yml', root), 'utf8'));
assert.equal(cms.collections[0].folder, 'src/data/post', 'CMS posts must go into the rendered content collection');
assert.equal(cms.media_folder, 'public/uploads');
assert.equal(cms.public_folder, '/uploads');
await fs.access(fileURLToPath(new URL(cms.collections[0].folder, root)));

console.log('Markdown, image sizing, crop, optimized fallback, and CMS regressions passed.');
