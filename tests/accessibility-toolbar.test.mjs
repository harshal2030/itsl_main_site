import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { parse } from 'parse5';

const interactiveOutputs = [
  'index.html',
  'about-us/index.html',
  'blog/index.html',
  'blog/post/index.html',
  'careers/index.html',
  'careers/job/index.html',
  'close-account/index.html',
  'downloads/index.html',
  'investors/client-relation/index.html',
  'investors/corporate-presentation/index.html',
  'investors/disclosures-under-regulation-46/index.html',
  'investors/financial-reports/index.html',
  'investors/overview/index.html',
  'investors/shareholder-relation/index.html',
  'mutual-funds/index.html',
  'procedure-of-closing-account/index.html',
  'raise-a-ticket/index.html',
];

const all = (node, predicate) => [
  ...(predicate(node) ? [node] : []),
  ...(node.childNodes || []).flatMap((child) => all(child, predicate)),
];
const attr = (node, key) =>
  node.attrs?.find((item) => item.name === key)?.value;

test('the shared accessibility toolbar is emitted only on interactive routes', async () => {
  for (const output of interactiveOutputs) {
    const document = parse(
      await readFile(new URL(`../dist/${output}`, import.meta.url), 'utf8'),
    );
    const toolbar = all(
      document,
      (node) => attr(node, 'data-accessibility-toolbar') !== undefined,
    );
    const trigger = all(
      document,
      (node) => attr(node, 'data-accessibility-trigger') !== undefined,
    );
    const panel = all(
      document,
      (node) => attr(node, 'data-accessibility-panel') !== undefined,
    );
    assert.equal(toolbar.length, 1, output);
    assert.equal(trigger.length, 1, output);
    assert.equal(attr(trigger[0], 'aria-expanded'), 'false', output);
    assert.equal(panel.length, 1, output);
    assert.equal(attr(panel[0], 'role'), 'dialog', output);
    assert.equal(attr(panel[0], 'aria-modal'), 'false', output);
    assert.equal(attr(panel[0], 'hidden'), '', output);
  }

  for (const output of ['404.html', 'investors/index.html']) {
    const source = await readFile(
      new URL(`../dist/${output}`, import.meta.url),
      'utf8',
    );
    assert.ok(!source.includes('data-accessibility-toolbar'), output);
  }
});

test('the dyslexia-friendly font is local and licensed', async () => {
  const css = await readFile(
    new URL('../src/styles/global.css', import.meta.url),
    'utf8',
  );
  assert.ok(css.includes("url('/fonts/open-dyslexic-regular.woff')"));
  assert.ok(!css.includes('cdn.jsdelivr.net'));
  await readFile(
    new URL('../public/fonts/open-dyslexic-regular.woff', import.meta.url),
  );
  const license = await readFile(
    new URL('../public/fonts/open-dyslexic-OFL.txt', import.meta.url),
    'utf8',
  );
  assert.match(license, /SIL OPEN FONT LICENSE/i);
});
