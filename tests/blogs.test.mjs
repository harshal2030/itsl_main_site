import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { parse } from 'parse5';

const attr = (node, key) =>
  node.attrs?.find((item) => item.name === key)?.value;
const all = (node, predicate) => [
  ...(predicate(node) ? [node] : []),
  ...(node.childNodes || []).flatMap((child) => all(child, predicate)),
];
const text = (node) =>
  node.nodeName === '#text'
    ? node.value
    : (node.childNodes || []).map(text).join('');

for (const [route, title, heading, robots, canonical] of [
  [
    'blog',
    'Investment Insights & Market Updates | IndoThai',
    'Blog',
    'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    'https://indothai.co.in/blog/',
  ],
  [
    'blog/post',
    'Blog post - IndoThai',
    'Blog post',
    'noindex, follow',
    undefined,
  ],
]) {
  const html = await readFile(
    new URL(`../dist/${route}/index.html`, import.meta.url),
    'utf8',
  );
  const tree = parse(html);
  const nodes = (tag) => all(tree, (node) => node.tagName === tag);

  test(`${route} has honest static metadata and shared chrome`, () => {
    assert.equal(nodes('h1').length, 1);
    assert.equal(text(nodes('h1')[0]), heading);
    assert.equal(text(nodes('title')[0]), title);
    assert.equal(
      attr(
        nodes('meta').find((node) => attr(node, 'name') === 'robots'),
        'content',
      ),
      robots,
    );
    const canonicalLinks = nodes('link').filter(
      (node) => attr(node, 'rel') === 'canonical',
    );
    assert.equal(canonicalLinks.length, canonical ? 1 : 0);
    if (canonical) assert.equal(attr(canonicalLinks[0], 'href'), canonical);
    assert.ok(
      attr(
        nodes('meta').find((node) => attr(node, 'name') === 'description'),
        'content',
      ).length > 50,
    );
    assert.equal(nodes('header').length > 0, true);
    assert.equal(nodes('footer').length > 0, true);
    assert.equal(nodes('astro-island').length, 0);
    assert.ok(text(tree).includes('INZ000194938'));
    assert.ok(
      nodes('a').some(
        (node) =>
          attr(node, 'href') === '/blog/' &&
          attr(node, 'aria-current') === 'page',
      ),
    );
  });

  test(`${route} initial HTML contains no CMS record`, () => {
    assert.match(text(tree), /Enable JavaScript|not configured/);
    assert.ok(!html.includes('fetch('));
    assert.ok(!html.includes('sessionStorage'));
    if (route === 'blog') {
      const list = all(
        tree,
        (node) => attr(node, 'data-post-list') !== undefined,
      )[0];
      assert.equal(list.childNodes.length, 0);
    }
  });
}

test('blog reads only the public blogs endpoint and sanitizes rich content', async () => {
  const data = await readFile(
    new URL('../src/data/blogs.ts', import.meta.url),
    'utf8',
  );
  assert.ok(data.includes('`${blogApi}/blogs'));
  assert.ok(data.includes("fields.set('populate[0]', 'banner')"));
  assert.ok(!data.includes('Authorization'));

  for (const component of ['BlogList', 'BlogPost']) {
    const source = await readFile(
      new URL(`../src/components/blog/${component}.astro`, import.meta.url),
      'utf8',
    );
    assert.ok(source.includes("from 'dompurify'"));
    assert.ok(source.includes("from 'marked'"));
    assert.ok(!source.split('---')[1].includes('fetch('));
    assert.ok(!source.includes('console.'));
  }
});
