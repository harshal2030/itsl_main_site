import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, access, readdir } from 'node:fs/promises';
import { parse } from 'parse5';

const html = await readFile(
  new URL('../dist/index.html', import.meta.url),
  'utf8',
);
const robots = await readFile(
  new URL('../dist/robots.txt', import.meta.url),
  'utf8',
);
const sitemap = await readFile(
  new URL('../public/sitemap.xml', import.meta.url),
  'utf8',
);
const tree = parse(html);
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
const nodes = (tag) => all(tree, (node) => node.tagName === tag);
const pageText = text(tree);

test('component colors and CSS breakpoints use the canonical design tokens', async () => {
  const root = new URL('../src/components/', import.meta.url);
  for (const path of await readdir(root, { recursive: true })) {
    if (!path.endsWith('.astro')) continue;
    const source = await readFile(new URL(path, root), 'utf8');
    const css = source.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] || '';
    assert.ok(!/#[\da-f]{3,8}\b/i.test(css), `Raw color in ${path}`);
    assert.ok(
      !/@media[^\{]*\d+(?:px|rem)/.test(css),
      `Duplicated breakpoint in ${path}`,
    );
  }
});

test('only the twenty approved routes are generated', async () => {
  assert.deepEqual(
    (await readdir(new URL('../dist/', import.meta.url), { recursive: true }))
      .filter((name) => name.endsWith('.html'))
      .sort(),
    [
      '404.html',
      'about-us/index.html',
      'blog/index.html',
      'blog/post/index.html',
      'careers/index.html',
      'careers/job/index.html',
      'close-account/index.html',
      'downloads/index.html',
      'index.html',
      'investors/client-relation/index.html',
      'investors/corporate-presentation/index.html',
      'investors/disclosures-under-regulation-46/index.html',
      'investors/financial-reports/index.html',
      'investors/index.html',
      'investors/overview/index.html',
      'investors/shareholder-relation/index.html',
      'mutual-funds/index.html',
      'privacy-policy/index.html',
      'procedure-of-closing-account/index.html',
      'raise-a-ticket/index.html',
    ],
  );
  assert.equal(nodes('main').length, 1);
  assert.equal(nodes('h1').length, 1);
  assert.equal(
    text(nodes('h1')[0]),
    'Tailored Financial Solutions For Your Unique Needs',
  );
  let previous = 0;
  for (const heading of all(tree, (node) =>
    /^h[1-6]$/.test(node.tagName || ''),
  )) {
    const level = Number(heading.tagName[1]);
    assert.ok(
      level <= previous + 1,
      `Heading skipped a level: ${text(heading)}`,
    );
    previous = level;
  }
});

test('the Home-only Investor Alert and compatibility redirects are rendered safely', async () => {
  const dialogs = nodes('dialog');
  assert.equal(dialogs.length, 1);
  assert.equal(attr(dialogs[0], 'data-investor-alert'), '');
  assert.equal(attr(dialogs[0], 'aria-labelledby'), 'investor-alert-title');
  assert.ok(pageText.includes('Investor Alert'));
  assert.ok(
    pageText.includes(
      'We caution all investors to be aware of fraudulent groups on social media',
    ),
  );

  const shareholderHtml = await readFile(
    new URL(
      '../dist/investors/shareholder-relation/index.html',
      import.meta.url,
    ),
    'utf8',
  );
  assert.ok(!shareholderHtml.includes('data-investor-alert'));

  const redirect = await readFile(
    new URL('../dist/investors/index.html', import.meta.url),
    'utf8',
  );
  assert.ok(redirect.includes('0;url=/investors/shareholder-relation/'));
  assert.ok(redirect.includes("const parameter = 'shareholder_type'"));
  assert.ok(redirect.includes('source.searchParams.has(parameter)'));
  assert.ok(
    redirect.includes(
      'window.location.replace(`${target.pathname}${target.search}`)',
    ),
  );
  assert.ok(redirect.includes('noindex, nofollow'));

  const notFoundRedirect = await readFile(
    new URL('../dist/404.html', import.meta.url),
    'utf8',
  );
  assert.ok(notFoundRedirect.includes('0;url=/'));
  assert.ok(notFoundRedirect.includes('window.location.replace(destination)'));
  assert.ok(notFoundRedirect.includes('noindex, nofollow'));
});

test('production SEO is indexable, canonical and machine-readable', () => {
  assert.equal(
    text(nodes('title')[0]),
    'Stock Broking, Trading & Investment Services | IndoThai',
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
  assert.equal(
    content('property', 'og:title'),
    'Stock Broking, Trading & Investment Services | IndoThai',
  );
  assert.equal(content('property', 'og:url'), 'https://indothai.co.in/');
  assert.equal(content('name', 'twitter:card'), 'summary_large_image');
  assert.equal(content('name', 'twitter:site'), '@IndoThaiLtd');
  assert.ok(
    content('property', 'og:image').startsWith('https://indothai.co.in/'),
  );
  assert.equal(
    nodes('link').filter((node) => attr(node, 'rel') === 'canonical').length,
    1,
  );
  assert.equal(
    attr(
      nodes('link').find((node) => attr(node, 'rel') === 'canonical'),
      'href',
    ),
    'https://indothai.co.in/',
  );
  const schemas = nodes('script').filter(
    (node) => attr(node, 'type') === 'application/ld+json',
  );
  assert.equal(schemas.length, 1);
  const graph = JSON.parse(text(schemas[0]))['@graph'];
  assert.deepEqual(
    graph.map((entry) => entry['@type']),
    ['Organization', 'WebSite', 'WebPage'],
  );
  assert.ok(robots.includes('Sitemap: https://indothai.co.in/sitemap.xml'));
});

test('every sitemap URL is a canonical, indexable static page', async () => {
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  assert.equal(urls.length, 16);
  assert.equal(new Set(urls).size, urls.length);

  for (const value of urls) {
    const url = new URL(value);
    assert.equal(url.origin, 'https://indothai.co.in');
    const output =
      url.pathname === '/'
        ? '../dist/index.html'
        : `../dist${url.pathname}index.html`;
    const document = parse(
      await readFile(new URL(output, import.meta.url), 'utf8'),
    );
    const pageNodes = (tag) => all(document, (node) => node.tagName === tag);
    assert.ok(
      attr(
        pageNodes('meta').find((node) => attr(node, 'name') === 'robots'),
        'content',
      ).startsWith('index, follow'),
      value,
    );
    assert.equal(
      attr(
        pageNodes('link').find((node) => attr(node, 'rel') === 'canonical'),
        'href',
      ),
      value,
    );
    assert.equal(
      pageNodes('script').filter(
        (node) => attr(node, 'type') === 'application/ld+json',
      ).length,
      1,
    );
  }
});

test('deployment metadata gives immutable caching only to hashed assets', async () => {
  const headers = await readFile(
    new URL('../dist/_headers', import.meta.url),
    'utf8',
  );
  assert.match(headers, /\/_astro\/\*/);
  assert.match(headers, /max-age=31536000, immutable/);
  assert.ok(!headers.includes('/*.html'));
});

test('all services, final statistics, testimonials and regulatory details are rendered', () => {
  assert.equal(
    all(tree, (node) =>
      (attr(node, 'class') || '').split(' ').includes('service-card'),
    ).length,
    9,
  );
  assert.equal(
    all(tree, (node) => attr(node, 'data-slide') !== undefined).length,
    6,
  );
  for (const expected of [
    '10,000+ cr',
    '15,000+',
    '75+',
    'Kopal Mehta',
    'Gourav Jain',
    'Vivek Hingad',
    'Piyush Khasgiwala',
    'Shraddha Surana',
    'Sanjay Kathed',
    'INZ000194938',
    'INH000024842',
    'Smart ODR',
    'Procedure to lodge grievances complaint',
    'Attention Investors',
  ])
    assert.ok(pageText.includes(expected), expected);
});

test('contact starts disabled until its JavaScript submission guard is ready', () => {
  assert.equal(nodes('form').length, 1);
  assert.equal(attr(nodes('form')[0], 'method'), 'post');
  assert.notEqual(attr(nodes('form')[0], 'novalidate'), undefined);
  assert.equal(attr(nodes('form')[0], 'action'), undefined);
  assert.notEqual(attr(nodes('fieldset')[0], 'disabled'), undefined);
  const fields = [...nodes('input'), ...nodes('textarea')];
  assert.equal(fields.length, 4);
  for (const field of fields) {
    assert.ok(
      ['name', 'contact_no', 'email', 'message'].includes(attr(field, 'name')),
    );
    assert.equal(attr(field, 'form'), undefined);
    assert.ok(
      nodes('label').some((label) => attr(label, 'for') === attr(field, 'id')),
    );
  }
  const submit = nodes('button').find((node) => text(node) === 'Submit');
  assert.equal(attr(submit, 'type'), 'submit');
  assert.notEqual(attr(submit, 'disabled'), undefined);
  assert.ok(nodes('p').some((node) => attr(node, 'role') === 'status'));
});

test('images, fonts, styles and browser scripts load from local build output', async () => {
  for (const img of nodes('img')) {
    assert.notEqual(attr(img, 'alt'), undefined);
    assert.ok(Number(attr(img, 'width')) > 0);
    assert.ok(Number(attr(img, 'height')) > 0);
  }
  const urls = [
    ...nodes('img').map((node) => attr(node, 'src')),
    ...nodes('script')
      .map((node) => attr(node, 'src'))
      .filter(Boolean),
    ...nodes('link')
      .filter((node) => attr(node, 'rel') !== 'canonical')
      .map((node) => attr(node, 'href')),
  ];
  for (const url of urls) {
    assert.ok(url.startsWith('/'), `Remote asset: ${url}`);
    await access(new URL(`../dist${url}`, import.meta.url));
  }
  assert.equal(nodes('astro-island').length, 0);
});

test('migrated routes link locally and remaining pages stay on staging', () => {
  const ids = new Set(
    all(tree, (node) => !!attr(node, 'id')).map((node) => attr(node, 'id')),
  );
  for (const anchor of nodes('a')) {
    const href = attr(anchor, 'href');
    assert.ok(href && href !== '#', 'No placeholder links');
    assert.ok(!href.startsWith('javascript:'));
    if (href.startsWith('/'))
      assert.ok(
        [
          '/',
          '/about-us/',
          '/blog/',
          '/blog/post/',
          '/mutual-funds/',
          '/privacy-policy/',
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
        ].includes(href),
      );
    if (href.startsWith('#')) assert.ok(ids.has(href.slice(1)));
    if (attr(anchor, 'target') === '_blank')
      assert.ok(attr(anchor, 'rel').includes('noopener'));
  }
  assert.ok(nodes('a').some((node) => attr(node, 'href') === '/about-us/'));
  assert.ok(nodes('a').some((node) => attr(node, 'href') === '/mutual-funds/'));
  assert.ok(nodes('a').some((node) => attr(node, 'href') === '/careers/'));
  assert.ok(nodes('a').some((node) => attr(node, 'href') === '/blog/'));
  assert.ok(
    nodes('a').some((node) => attr(node, 'href') === '/investors/overview/'),
  );
  assert.ok(
    nodes('a').some(
      (node) => attr(node, 'href') === '/investors/shareholder-relation/',
    ),
  );
  assert.ok(
    nodes('a').some(
      (node) => attr(node, 'href') === '/investors/financial-reports/',
    ),
  );
  assert.ok(
    nodes('a').some(
      (node) =>
        attr(node, 'href') === '/investors/disclosures-under-regulation-46/',
    ),
  );
  assert.ok(
    nodes('a').some(
      (node) => attr(node, 'href') === '/investors/corporate-presentation/',
    ),
  );
  assert.ok(
    nodes('a').some(
      (node) => attr(node, 'href') === '/investors/client-relation/',
    ),
  );
  assert.ok(
    nodes('a').some((node) => attr(node, 'href') === '/close-account/'),
  );
  assert.ok(
    nodes('a').some(
      (node) => attr(node, 'href') === '/procedure-of-closing-account/',
    ),
  );
  assert.ok(
    nodes('a').some((node) => attr(node, 'href') === '/raise-a-ticket/'),
  );
  assert.ok(
    nodes('a').some((node) => attr(node, 'href') === '/privacy-policy/'),
  );
});

test('source anomalies are preserved rather than silently corrected', () => {
  assert.ok(pageText.includes('ard and Aadhaar card ready'));
  const badge = nodes('a').find((node) =>
    attr(node, 'aria-label')?.startsWith('Get WINVEST'),
  );
  assert.equal(
    attr(badge, 'href'),
    'https://play.google.com/store/apps/details?id=com.wave.indothai',
  );
  assert.ok(pageText.includes('What our clients says'));
  assert.ok(pageText.includes('Copyrights © 2024'));
});
