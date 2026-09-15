import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, access } from 'node:fs/promises';
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

for (const [route, title, robots, canonical] of [
  [
    'careers',
    'Careers & Current Job Openings | IndoThai Securities',
    'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    'https://indothai.co.in/careers/',
  ],
  [
    'careers/job',
    'Job details and application - IndoThai',
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
  test(`${route} has honest static metadata, local assets and Careers navigation`, async () => {
    assert.equal(nodes('h1').length, 1);
    assert.equal(text(nodes('title')[0]), title);
    assert.equal(
      attr(
        nodes('meta').find((node) => attr(node, 'name') === 'robots'),
        'content',
      ),
      robots,
    );
    assert.ok(
      attr(
        nodes('meta').find((node) => attr(node, 'name') === 'description'),
        'content',
      ).length > 50,
    );
    const canonicalLinks = nodes('link').filter(
      (node) => attr(node, 'rel') === 'canonical',
    );
    assert.equal(canonicalLinks.length, canonical ? 1 : 0);
    if (canonical) assert.equal(attr(canonicalLinks[0], 'href'), canonical);
    assert.equal(nodes('header').length, 1);
    assert.equal(nodes('footer').length, 1);
    assert.equal(nodes('astro-island').length, 0);
    assert.ok(text(tree).includes('INZ000194938'));
    const active = nodes('a').filter(
      (node) => attr(node, 'aria-current') === 'page',
    );
    assert.equal(active.length, 2);
    assert.ok(active.every((node) => attr(node, 'href') === '/careers/'));
    for (const scheme of ['tel:', 'mailto:'])
      assert.ok(
        nodes('a').some((node) => attr(node, 'href')?.startsWith(scheme)),
      );
    for (const node of [...nodes('img'), ...nodes('script')]) {
      const src = attr(node, 'src');
      if (src) {
        assert.ok(src.startsWith('/'));
        await access(new URL(`../dist${src}`, import.meta.url));
      }
    }
    const ids = all(tree, (node) => attr(node, 'id')).map((node) =>
      attr(node, 'id'),
    );
    assert.equal(new Set(ids).size, ids.length);
  });
  test(`${route} ships no job records and no active native submission`, () => {
    assert.match(text(tree), /Enable JavaScript|not configured/);
    if (route === 'careers') {
      const list = nodes('ul').find(
        (node) => attr(node, 'data-opening-list') !== undefined,
      );
      assert.equal(list.childNodes.length, 0);
    } else {
      const applicationForm = nodes('form').find(
        (node) => attr(node, 'data-application-form') !== undefined,
      );
      const applicationInputs = all(
        applicationForm,
        (node) => node.tagName === 'input',
      );
      assert.equal(attr(applicationForm, 'method'), 'post');
      assert.notEqual(attr(applicationForm, 'novalidate'), undefined);
      assert.notEqual(
        attr(
          all(applicationForm, (node) => node.tagName === 'fieldset')[0],
          'disabled',
        ),
        undefined,
      );
      assert.notEqual(
        attr(
          all(applicationForm, (node) => node.tagName === 'button').find(
            (node) => attr(node, 'type') === 'submit',
          ),
          'disabled',
        ),
        undefined,
      );
      const file = applicationInputs.find(
        (node) => attr(node, 'type') === 'file',
      );
      assert.equal(attr(file, 'accept'), '.pdf,application/pdf');
      assert.equal(attr(file, 'multiple'), undefined);
      for (const input of applicationInputs)
        assert.ok(
          nodes('label').some(
            (node) => attr(node, 'for') === attr(input, 'id'),
          ),
        );
      assert.deepEqual(
        applicationInputs.map((node) => attr(node, 'name')),
        [
          'name',
          'email',
          'contact_no',
          'resume',
          'linkedin_url',
          'additional_links',
        ],
      );
      assert.ok(text(tree).includes('2,000,000 bytes'));
      const companyDialog = nodes('dialog').find(
        (node) => attr(node, 'data-company-check-dialog') !== undefined,
      );
      assert.equal(
        attr(companyDialog, 'aria-labelledby'),
        'company-check-title',
      );
      assert.ok(text(companyDialog).includes('stock broking company'));
    }
  });
}

test('careers keeps API operations in browser scripts and never reads candidates', async () => {
  for (const name of ['OpeningList', 'JobDetails', 'ApplicationForm']) {
    const source = await readFile(
      new URL(`../src/components/careers/${name}.astro`, import.meta.url),
      'utf8',
    );
    assert.ok(!source.split('---')[1].includes('fetch('));
    assert.ok(
      !source.includes('localStorage') &&
        !source.includes('sessionStorage') &&
        !source.includes('console.'),
    );
  }
  const data = await readFile(
    new URL('../src/data/openings.ts', import.meta.url),
    'utf8',
  );
  assert.ok(!data.includes('populate'));
  assert.ok(!data.includes('candidates'));
  assert.ok(data.includes("query.set('filters[job_status][$eq]', 'Open')"));
  assert.ok(data.includes("opening.job_status === 'Open'"));

  const application = await readFile(
    new URL('../src/components/careers/ApplicationForm.astro', import.meta.url),
    'utf8',
  );
  assert.ok(application.includes('/private-upload'));
  assert.ok(application.includes("body.append('purpose', 'resume')"));
});

test('job detail prevents the enhanced first-paint form collapse', async () => {
  const source = await readFile(
    new URL('../src/components/careers/JobDetails.astro', import.meta.url),
    'utf8',
  );
  assert.ok(source.includes('@media (scripting: enabled)'));
  assert.ok(source.includes("section.dataset.enhanced = ''"));
  assert.ok(source.includes('.job-details:not([data-enhanced]) #apply-panel'));
});
