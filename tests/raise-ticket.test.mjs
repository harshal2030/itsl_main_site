import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { parse } from 'parse5';

const html = await readFile(
  new URL('../dist/raise-a-ticket/index.html', import.meta.url),
  'utf8',
);
const source = await readFile(
  new URL(
    '../src/components/raise-ticket/RaiseTicketForm.astro',
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

test('raise-a-ticket has unique production metadata and shared chrome', () => {
  assert.equal(text(nodes('title')[0]), 'Raise a Ticket - IndoThai');
  assert.equal(nodes('h1').length, 1);
  assert.equal(text(nodes('h1')[0]).trim(), 'Raise a Ticket');
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
  assert.equal(content('property', 'og:title'), 'Raise a Ticket - IndoThai');
  assert.ok(text(tree).includes('INZ000194938'));
});

test('raise-a-ticket starts disabled with the exact complaint fields', () => {
  assert.equal(nodes('form').length, 1);
  const form = nodes('form')[0];
  assert.equal(attr(form, 'method'), 'post');
  assert.equal(attr(form, 'action'), undefined);
  assert.notEqual(attr(form, 'novalidate'), undefined);
  assert.notEqual(
    attr(all(form, (node) => node.tagName === 'fieldset')[0], 'disabled'),
    undefined,
  );

  const controls = all(form, (node) =>
    ['input', 'select', 'textarea'].includes(node.tagName),
  );
  assert.deepEqual(
    controls.map((control) => attr(control, 'name')),
    [
      'name',
      'client_id',
      'email',
      'mobile_no',
      'issue',
      'subject',
      'description',
      'attachment',
    ],
  );
  for (const control of controls.slice(0, 7))
    assert.notEqual(attr(control, 'required'), undefined);
  assert.equal(attr(controls[7], 'required'), undefined);
  for (const control of controls)
    assert.ok(
      all(form, (node) => node.tagName === 'label').some(
        (label) => attr(label, 'for') === attr(control, 'id'),
      ),
    );

  const options = all(form, (node) => node.tagName === 'option').map((option) =>
    attr(option, 'value'),
  );
  assert.deepEqual(options, [
    '',
    'Account Opening',
    'Trade Related Query',
    'Technical Issue',
    'Fund Related',
    'Demat Related',
    'Others',
  ]);
  const submit = nodes('button').find(
    (button) => text(button).trim() === 'Raise ticket',
  );
  assert.equal(attr(submit, 'type'), 'submit');
  assert.notEqual(attr(submit, 'disabled'), undefined);
  assert.ok(nodes('p').some((node) => attr(node, 'role') === 'status'));
});

test('raise-a-ticket uses local navigation and a safe client contract', () => {
  const current = nodes('a').filter(
    (node) => attr(node, 'aria-current') === 'page',
  );
  assert.equal(current.length, 1);
  assert.equal(attr(current[0], 'href'), '/raise-a-ticket/');
  assert.ok(source.includes('/api/private-upload'));
  assert.ok(source.includes('/api/complaints'));
  assert.ok(source.includes('5_000_000'));
  assert.ok(source.includes("body.append('files', file)"));
  assert.ok(source.includes("body.append('purpose', 'complaint')"));
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
  for (const href of [
    'https://scores.sebi.gov.in/',
    'https://smartodr.in/login',
  ])
    assert.ok(nodes('a').some((node) => attr(node, 'href') === href));
});
