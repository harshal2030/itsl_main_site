import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { parse } from 'parse5';

const html = await readFile(
  new URL('../dist/privacy-policy/index.html', import.meta.url),
  'utf8',
);
const tree = parse(html);
const attr = (node, key) =>
  node?.attrs?.find((item) => item.name === key)?.value;
const all = (node, predicate) => [
  ...(predicate(node) ? [node] : []),
  ...(node.childNodes || []).flatMap((child) => all(child, predicate)),
];
const text = (node) =>
  node.nodeName === '#text'
    ? node.value
    : (node.childNodes || []).map(text).join('');
const nodes = (tag) => all(tree, (node) => node.tagName === tag);
const pageText = text(tree).replace(/\s+/g, ' ');

test('Privacy Policy has unique metadata, one H1 and the supplied copy', () => {
  assert.equal(text(nodes('title')[0]), 'Privacy Policy - IndoThai');
  assert.equal(nodes('h1').length, 1);
  assert.equal(text(nodes('h1')[0]), 'Privacy Policy');
  assert.equal(
    attr(
      nodes('link').find((node) => attr(node, 'rel') === 'canonical'),
      'href',
    ),
    'https://indothai.co.in/privacy-policy/',
  );
  assert.equal(
    attr(
      nodes('meta').find((node) => attr(node, 'name') === 'robots'),
      'content',
    ),
    'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  );
  for (const value of [
    'Respecting the Privacy and choices of our online Customers and Visitors',
    'Register with and also while executing Customer Agreement with us',
    'The personal data of customers and web site visitors is stored indefinitely',
    'We encourage you to review our Privacy Policy whenever you visit our Web site.',
  ])
    assert.ok(pageText.includes(value));
});

test('Privacy Policy keeps the supplied website destination safe and local navigation complete', () => {
  const website = nodes('a').find(
    (node) => attr(node, 'href') === 'http://www.indothai.co.in',
  );
  assert.ok(website);
  assert.equal(attr(website, 'target'), '_blank');
  assert.equal(attr(website, 'rel'), 'noopener noreferrer');
  assert.ok(text(website).includes('(opens in new window)'));
  assert.ok(!html.includes('data-investor-alert'));
  assert.ok(
    nodes('a').some((node) => attr(node, 'href') === '/privacy-policy/'),
  );
});
