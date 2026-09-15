import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, access } from 'node:fs/promises';
import { parse } from 'parse5';

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
const hasClass = (node, value) =>
  (attr(node, 'class') || '').split(' ').includes(value);
const routes = [
  '/',
  '/about-us/',
  '/blog/',
  '/blog/post/',
  '/mutual-funds/',
  '/downloads/',
  '/careers/',
  '/investors/overview/',
  '/investors/shareholder-relation/',
  '/investors/financial-reports/',
  '/investors/disclosures-under-regulation-46/',
  '/investors/client-relation/',
  '/investors/corporate-presentation/',
  '/close-account/',
  '/procedure-of-closing-account/',
  '/raise-a-ticket/',
];

for (const [route, title, heading] of [
  ['/about-us/', 'About Us - IndoThai', 'About Us'],
  [
    '/mutual-funds/',
    'Mutual Funds - IndoThai',
    'Master your Mutual Funds with IndoThai',
  ],
]) {
  const html = await readFile(
    new URL(`../dist${route}index.html`, import.meta.url),
    'utf8',
  );
  const tree = parse(html);
  const nodes = (tag) => all(tree, (node) => node.tagName === tag);
  const pageText = text(tree).replace(/\s+/g, ' ');
  const main = nodes('main')[0];

  test(`${route} has semantic, unique production metadata and headings`, () => {
    assert.equal(nodes('main').length, 1);
    assert.equal(nodes('h1').length, 1);
    assert.equal(text(nodes('h1')[0]).replace(/\s+/g, ' ').trim(), heading);
    assert.equal(text(nodes('title')[0]), title);
    const meta = (key) =>
      attr(
        nodes('meta').find(
          (node) =>
            attr(node, 'name') === key || attr(node, 'property') === key,
        ),
        'content',
      );
    assert.equal(
      meta('robots'),
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    );
    assert.ok(meta('description').length > 50);
    assert.equal(meta('og:title'), title);
    assert.equal(meta('twitter:title'), title);
    assert.equal(meta('og:description'), meta('description'));
    assert.equal(meta('og:url'), `https://indothai.co.in${route}`);
    assert.equal(
      nodes('link').filter((node) => attr(node, 'rel') === 'canonical').length,
      1,
    );
    assert.equal(
      attr(
        nodes('link').find((node) => attr(node, 'rel') === 'canonical'),
        'href',
      ),
      `https://indothai.co.in${route}`,
    );
    let previous = 0;
    for (const node of all(tree, (node) =>
      /^h[1-6]$/.test(node.tagName || ''),
    )) {
      const level = Number(node.tagName[1]);
      assert.ok(level <= previous + 1, `Skipped heading: ${text(node)}`);
      previous = level;
    }
    const ids = all(tree, (node) => attr(node, 'id') !== undefined).map(
      (node) => attr(node, 'id'),
    );
    assert.equal(new Set(ids).size, ids.length, 'IDs must be unique');
  });

  test(`${route} uses local assets with dimensions and no framework islands`, async () => {
    const assets = [];
    for (const node of [
      ...nodes('img'),
      ...nodes('script'),
      ...nodes('link'),
      ...nodes('source'),
    ]) {
      for (const key of ['src', 'href'])
        if (attr(node, key)) assets.push(attr(node, key));
      if (attr(node, 'srcset'))
        assets.push(
          ...attr(node, 'srcset')
            .split(',')
            .map((item) => item.trim().split(/\s+/)[0]),
        );
      if (node.tagName === 'img') {
        assert.notEqual(attr(node, 'alt'), undefined);
        assert.ok(
          Number(attr(node, 'width')) > 0 && Number(attr(node, 'height')) > 0,
        );
      }
    }
    for (const url of new Set(assets)) {
      if (url.startsWith('https://indothai.co.in/')) continue;
      assert.ok(url.startsWith('/'), `Remote runtime asset ${url}`);
      await access(new URL(`../dist${url}`, import.meta.url));
    }
    assert.equal(nodes('astro-island').length, 0);
    assert.ok(!html.includes('elementor-invisible'));
  });

  test(`${route} has complete navigation, active state and regulatory footer`, async () => {
    const ids = new Set(
      all(tree, (node) => attr(node, 'id')).map((node) => attr(node, 'id')),
    );
    for (const link of nodes('a')) {
      const href = attr(link, 'href');
      assert.ok(href && href !== '#' && !href.startsWith('javascript:'));
      if (href.startsWith('/')) {
        assert.ok(routes.includes(href), `Unbuilt route ${href}`);
        await access(new URL(`../dist${href}index.html`, import.meta.url));
      }
      if (href.startsWith('#')) assert.ok(ids.has(href.slice(1)));
      if (attr(link, 'target') === '_blank')
        assert.ok(attr(link, 'rel')?.includes('noopener'));
    }
    const active = nodes('a').filter(
      (node) => attr(node, 'aria-current') === 'page',
    );
    assert.equal(active.length, 2, 'Desktop and mobile current-page links');
    assert.ok(active.every((node) => attr(node, 'href') === route));
    for (const value of [
      'INZ000194938',
      'INH000024842',
      'Smart ODR',
      'Attention Investors',
    ])
      assert.ok(pageText.includes(value));
  });

  test(`${route} keeps the approved content groups in order`, () => {
    const sections = main.childNodes.filter(
      (node) => node.tagName === 'section',
    );
    const sectionTitles = sections.map((section) =>
      text(all(section, (node) => /^h[12]$/.test(node.tagName || ''))[0])
        .replace(/\s+/g, ' ')
        .trim(),
    );
    if (route === '/about-us/') {
      assert.deepEqual(sectionTitles, [
        'About Us',
        'Our Company',
        'Board of Director',
        'Milestone',
        'Vision',
        'Values',
        'Business Profile',
        'Group of Companies',
        'Gallery',
      ]);
      for (const name of [
        'Parasmal Doshi',
        'Dhanpal Doshi',
        'Rajendra Bandi',
        'Dharmendra Jain',
        'Amber Chourasia',
        'Sweta Sharma Pastaria',
      ])
        assert.ok(pageText.includes(name));
      assert.equal(
        all(tree, (node) => hasClass(node, 'directors-grid')).flatMap((node) =>
          all(node, (item) => item.tagName === 'li'),
        ).length,
        6,
      );
      const timeline = nodes('figcaption')[0];
      assert.equal(all(timeline, (node) => node.tagName === 'li').length, 22);
      const transcripts = all(timeline, (node) => node.tagName === 'ol');
      assert.equal(transcripts.length, 2);
      for (const transcript of transcripts)
        assert.equal(
          all(transcript, (node) => node.tagName === 'li').length,
          11,
        );
      assert.ok(text(transcripts[1]).includes('Raised 160cr for growth'));
      assert.ok(!text(transcripts[1]).includes('2008'));
      for (const event of [
        '1995',
        '2004',
        'Took Clearing membership.',
        '2011',
        'Listed on NSE/BSE',
        '2024',
        'Raised 155cr for growth',
      ])
        assert.ok(text(timeline).includes(event));
      const gallery = all(tree, (node) => hasClass(node, 'gallery-grid'))[0];
      assert.equal(all(gallery, (node) => node.tagName === 'img').length, 5);
      for (const value of [
        'Honesty and Transparency',
        'Trust and Openness',
        'Teamwork and Innovation',
        'A Strong Foundation of Trust',
        'Services that Adapt to Your Needs',
        'Our Commitment to You',
      ])
        assert.ok(pageText.includes(value));
      for (const url of [
        'https://www.skyspaceoffices.com/',
        'https://femtogreenhydrogen.com/',
        'https://www.kishadiamonds.com/',
        'https://remigos.com/',
      ])
        assert.ok(
          nodes('a').some((node) => attr(node, 'href') === url),
          url,
        );
      assert.equal(
        all(tree, (node) => attr(node, 'data-contact-form') !== undefined)
          .length,
        0,
        'About Us does not add a contact form',
      );
    } else {
      assert.deepEqual(sectionTitles, [
        'Master your Mutual Funds with IndoThai',
        'What are Mutual Funds ?',
        'How To Start In Mutual Funds?',
        'Why Mutual Funds From IndoThai ?',
        'From Where I can Start Mutual Funds ?',
        'Why Indothai is the Premier Partner for NRI to Invest in Mutual Fund',
        'Get in touch',
      ]);
      for (const [name, count] of [
        ['investment-steps', 5],
        ['benefit-cards', 6],
        ['nri-cards', 6],
      ]) {
        const group = all(tree, (node) => hasClass(node, name))[0];
        assert.ok(group, name);
        assert.equal(all(group, (node) => node.tagName === 'li').length, count);
      }
      assert.ok(pageText.includes('Creating wealth for you everday'));
      assert.ok(
        pageText.includes('Fund selection to help you achive your goal'),
      );
      assert.ok(
        nodes('a').some(
          (node) =>
            attr(node, 'href') ===
            'https://indothai.investwell.app/app/#/login',
        ),
      );
      const invest = nodes('a').filter((node) =>
        text(node).startsWith('Start Investing'),
      );
      assert.equal(invest.length, 2);
      assert.ok(
        invest.every(
          (node) =>
            attr(node, 'href') ===
            'https://play.google.com/store/search?q=Winvest&c=apps&pli=1',
        ),
      );
      const badge = nodes('a').find((node) =>
        attr(node, 'aria-label')?.startsWith('Get WINVEST'),
      );
      assert.equal(
        attr(badge, 'href'),
        'https://play.google.com/store/apps/details?id=com.wave.indothai',
      );
    }
  });

  test(`${route} keeps contact disabled until the client handler is ready`, () => {
    assert.equal(nodes('form').length, route === '/mutual-funds/' ? 1 : 0);
    const form = nodes('form')[0];
    const fields = form
      ? all(form, (node) => ['input', 'textarea'].includes(node.tagName))
      : [];
    assert.equal(fields.length, route === '/mutual-funds/' ? 4 : 0);
    for (const field of fields) {
      assert.ok(
        ['name', 'contact_no', 'email', 'message'].includes(
          attr(field, 'name'),
        ),
      );
      assert.equal(attr(field, 'form'), undefined);
      assert.ok(
        all(form, (node) => node.tagName === 'label').some(
          (label) => attr(label, 'for') === attr(field, 'id'),
        ),
      );
    }
    if (fields.length) {
      const submit = nodes('button').find((node) => text(node) === 'Submit');
      assert.equal(attr(submit, 'type'), 'submit');
      assert.notEqual(attr(submit, 'disabled'), undefined);
      assert.notEqual(
        attr(all(form, (node) => node.tagName === 'fieldset')[0], 'disabled'),
        undefined,
      );
      assert.equal(attr(form, 'method'), 'post');
      assert.notEqual(attr(form, 'novalidate'), undefined);
    }
  });
}
