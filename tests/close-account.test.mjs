import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { parse } from 'parse5';

const html = await readFile(
  new URL('../dist/close-account/index.html', import.meta.url),
  'utf8',
);
const source = await readFile(
  new URL(
    '../src/components/close-account/CloseAccountForm.astro',
    import.meta.url,
  ),
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

test('close-account has unique production metadata and shared chrome', () => {
  assert.equal(text(nodes('title')[0]), 'Close Account - IndoThai');
  assert.equal(nodes('h1').length, 1);
  assert.equal(
    text(nodes('h1')[0]).replace(/\s+/g, ' ').trim(),
    'Close Account / Close Nil Holding Account',
  );
  const metadata = nodes('meta');
  const content = (key, value) =>
    attr(
      metadata.find((node) => attr(node, key) === value),
      'content',
    );
  assert.equal(
    content('name', 'robots'),
    'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  );
  assert.ok(content('name', 'description').length > 50);
  assert.equal(content('property', 'og:title'), 'Close Account - IndoThai');
  assert.ok(text(tree).includes('INZ000194938'));
});

test('close-account starts disabled with exactly the four Strapi fields', () => {
  assert.equal(nodes('form').length, 1);
  const form = nodes('form')[0];
  assert.equal(attr(form, 'method'), 'post');
  assert.equal(attr(form, 'action'), undefined);
  assert.notEqual(attr(form, 'novalidate'), undefined);

  const formNodes = (tag) => all(form, (node) => node.tagName === tag);
  const fieldset = formNodes('fieldset')[0];
  assert.notEqual(attr(fieldset, 'disabled'), undefined);
  const inputs = formNodes('input');
  assert.deepEqual(
    inputs.map((input) => attr(input, 'name')),
    ['bo_id', 'ucc', 'email', 'mobile_no'],
  );
  for (const input of inputs) {
    assert.notEqual(attr(input, 'required'), undefined);
    assert.equal(attr(input, 'form'), undefined);
    assert.ok(
      formNodes('label').some(
        (label) => attr(label, 'for') === attr(input, 'id'),
      ),
    );
  }
  assert.equal(attr(inputs[0], 'minlength'), undefined);
  assert.equal(attr(inputs[0], 'maxlength'), undefined);
  assert.equal(attr(inputs[0], 'pattern'), undefined);

  const submit = nodes('button').find(
    (button) => text(button).trim() === 'Submit request',
  );
  assert.equal(attr(submit, 'type'), 'submit');
  assert.notEqual(attr(submit, 'disabled'), undefined);
  assert.ok(nodes('p').some((node) => attr(node, 'role') === 'status'));
});

test('close-account uses the local navigation destination and safe client contract', () => {
  const current = nodes('a').filter(
    (node) => attr(node, 'aria-current') === 'page',
  );
  assert.equal(current.length, 1);
  assert.equal(attr(current[0], 'href'), '/close-account/');
  assert.ok(source.includes('/api/close-account-requests'));
  assert.ok(source.includes("credentials: 'omit'"));
  assert.ok(source.includes("referrerPolicy: 'no-referrer'"));
  assert.ok(source.includes('20_000'));
  assert.ok(!source.includes('Authorization'));
  assert.ok(!source.includes('localStorage'));
  assert.ok(!source.includes('sessionStorage'));
  assert.ok(
    nodes('a').some(
      (node) => attr(node, 'href') === 'mailto:compliance@indothai.co.in',
    ),
  );
  assert.ok(nodes('a').some((node) => attr(node, 'href')?.startsWith('tel:')));
  assert.ok(
    nodes('a').some(
      (node) => attr(node, 'href') === '/procedure-of-closing-account/',
    ),
  );
});
