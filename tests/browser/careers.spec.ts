import { test, expect, type Page, type Request } from '@playwright/test';

const api = 'http://strapi.test/api';
const job = {
  documentId: 'open-job',
  title: 'Software Engineer Intern',
  job_status: 'Open',
  location: 'Vijay Nagar, Indore',
  tags: 'Rust, Golang, Linux',
  description:
    '### Requirements\nJoin our **engineering** team.\n\n### Tech stack\n- Rust\n- Golang',
};
const jobs = [
  job,
  {
    ...job,
    documentId: 'closed-job',
    title: 'Analyst',
    job_status: 'Closed',
    tags: '',
  },
  {
    ...job,
    documentId: 'filled-job',
    title: 'Operations',
    job_status: 'Filled',
  },
];
const pdf = (size = 100, name = 'resume.pdf') => ({
  name,
  mimeType: 'application/pdf',
  buffer: Buffer.concat([
    Buffer.from('%PDF-1.7\n'),
    Buffer.alloc(Math.max(0, size - 9), 32),
  ]),
});

async function mockCareers(page: Page, entries = jobs) {
  const requests: Request[] = [];
  page.on('request', (request) => {
    if (request.url().startsWith(api)) requests.push(request);
  });
  await page.route(`${api}/**`, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/openings')
      return route.fulfill({
        json: {
          data: entries,
          meta: {
            pagination: {
              page: 1,
              pageSize: 100,
              pageCount: 1,
              total: entries.length,
            },
          },
        },
      });
    if (url.pathname.startsWith('/api/openings/')) {
      const entry = entries.find(
        (entry) => entry.documentId === url.pathname.split('/').at(-1),
      );
      return route.fulfill({
        status: entry ? 200 : 404,
        json: { data: entry ?? null },
      });
    }
    if (url.pathname === '/api/private-upload')
      return route.fulfill({ status: 201, json: [{ id: 81 }] });
    if (
      url.pathname === '/api/candidates' &&
      route.request().method() === 'POST'
    )
      return route.fulfill({
        status: 201,
        json: { data: { documentId: 'synthetic-candidate' } },
      });
    return route.abort();
  });
  return requests;
}

async function openApplication(page: Page) {
  await page.goto('/careers/job/?id=open-job');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(job.title);
  await page.getByRole('tab', { name: 'Apply Now' }).click();
  await expect(
    page.getByRole('button', { name: 'Submit application' }),
  ).toBeEnabled();
}
async function fillApplication(page: Page) {
  await page
    .getByLabel('Name (required)', { exact: true })
    .fill('Synthetic applicant');
  await page
    .getByLabel('Email address (required)')
    .fill('candidate@example.invalid');
  await page
    .getByLabel('LinkedIn URL (required)')
    .fill('https://www.linkedin.com/in/synthetic-test');
  await page.getByLabel('Upload your resume').setInputFiles(pdf());
}
const status = (page: Page) => page.locator('[data-application-status]');
const submit = (page: Page) =>
  page.getByRole('button', { name: 'Submit application' });
const companyCheck = (page: Page) =>
  page.getByRole('dialog', { name: 'Before you submit' });
async function confirmCompanyCheck(
  page: Page,
  answer = 'stock broking company',
) {
  await companyCheck(page).getByLabel('Company description').fill(answer);
  await companyCheck(page)
    .getByRole('button', { name: 'Confirm and submit' })
    .click();
}
async function startSubmission(page: Page, answer?: string) {
  await submit(page).click();
  await confirmCompanyCheck(page, answer);
}

test('job detail avoids a poor first-paint layout shift', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const auditWindow = window as typeof window & { __auditCls: number };
    auditWindow.__auditCls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        };
        if (!shift.hadRecentInput) auditWindow.__auditCls += shift.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await mockCareers(page);
  await page.goto('/careers/job/?id=open-job');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(job.title);
  await page.waitForTimeout(250);
  const cls = await page.evaluate(
    () => (window as typeof window & { __auditCls: number }).__auditCls,
  );
  expect(cls).toBeLessThanOrEqual(0.1);
});

test('lists only open positions with tags and shareable local links', async ({
  page,
}) => {
  const requests = await mockCareers(page);
  await page.goto('/careers/');
  await expect(page.locator('.opening-card h3')).toHaveText([job.title]);
  await expect(page.locator('.opening-card [data-job-status]')).toHaveText([
    'Open',
  ]);
  await expect(
    page.locator('.opening-card').locator('[data-tags] li'),
  ).toHaveText(['Rust', 'Golang', 'Linux']);
  await expect(page.locator('[data-opening-status]')).toHaveText(
    '1 open position.',
  );
  await page
    .getByRole('link', { name: /Software Engineer Intern Open/ })
    .click();
  await expect(page).toHaveURL(/\/careers\/job\/\?id=open-job$/);
  await expect(page).toHaveTitle(`${job.title} - Careers - IndoThai`);
  await expect(page.locator('.primary-nav [aria-current]')).toHaveAttribute(
    'href',
    '/careers/',
  );
  expect(
    requests.every(
      (request) =>
        !request.url().includes('populate') &&
        !request.url().includes('candidates'),
    ),
  ).toBe(true);
  const listRequest = requests.find(
    (request) => new URL(request.url()).pathname === '/api/openings',
  );
  expect(
    new URL(listRequest!.url()).searchParams.get('filters[job_status][$eq]'),
  ).toBe('Open');
});

test('follows listing pagination, excludes non-open results and handles an empty open list', async ({
  page,
}) => {
  await mockCareers(page);
  await page.route(`${api}/openings?**`, (route) => {
    const pageNumber = Number(
      new URL(route.request().url()).searchParams.get('pagination[page]'),
    );
    return route.fulfill({
      json: {
        data: pageNumber === 1 ? [job] : [jobs[1]],
        meta: {
          pagination: { page: pageNumber, pageSize: 1, pageCount: 2, total: 2 },
        },
      },
    });
  });
  await page.goto('/careers/');
  await expect(page.locator('.opening-card h3')).toHaveText([job.title]);
  await page.route(`${api}/openings?**`, (route) =>
    route.fulfill({
      json: { data: [], meta: { pagination: { page: 1, pageCount: 0 } } },
    }),
  );
  await page.reload();
  await expect(page.locator('[data-opening-status]')).toHaveText(
    'No open positions right now.',
  );
  await expect(page.locator('.opening-card')).toHaveCount(0);
});

for (const entry of jobs.slice(1)) {
  test(`${entry.job_status} job keeps details but disables applications`, async ({
    page,
  }) => {
    const requests = await mockCareers(page);
    await page.goto(`/careers/job/?id=${entry.documentId}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      entry.title,
    );
    await expect(page.locator('[data-closed-note]')).toContainText(
      'Applications are no longer accepted',
    );
    await expect(page.getByRole('tab', { name: 'Apply Now' })).toBeDisabled();
    await expect(page.locator('[data-application-form]')).toBeHidden();
    expect(requests.every((request) => request.method() === 'GET')).toBe(true);
  });
}

for (const id of ['', 'unknown-job', '../unsafe']) {
  test(`missing or invalid opening ${id || '(empty)'} has a useful unavailable state`, async ({
    page,
  }) => {
    await mockCareers(page);
    await page.goto(`/careers/job/?id=${encodeURIComponent(id)}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Opening unavailable',
    );
    await expect(page.locator('[data-application-form]')).toBeHidden();
    await expect(
      page.getByRole('link', { name: '← Back to Careers' }),
    ).toHaveAttribute('href', '/careers/');
  });
}

test('renders Markdown safely and exposes keyboard-operated tabs without hidden tab stops', async ({
  page,
}) => {
  await mockCareers(page, [
    {
      ...job,
      title: '<img src=x onerror=alert(1)>',
      description:
        '# Main\n### Sub\n**Bold** and *emphasis*\n\n- Item\n\n[Safe](https://example.test/) [Bad](javascript:alert(1))\n\n<img src=x onerror=alert(1)><script>alert(1)</script><form><input></form><iframe src="https://evil.invalid"></iframe><style>body{display:none}</style>',
    },
  ]);
  const dialogs: string[] = [];
  page.on('dialog', (dialog) => {
    dialogs.push(dialog.message());
    void dialog.dismiss();
  });
  await page.goto('/careers/job/?id=open-job');
  const overview = page.locator('#overview-panel');
  await expect(overview.locator('strong')).toHaveText('Bold');
  await expect(overview.locator('li')).toHaveText('Item');
  await expect(
    overview.locator('script,img,iframe,form,input,style,h1,h2:not(.sr-only)'),
  ).toHaveCount(0);
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(overview.getByRole('link', { name: 'Safe' })).toHaveAttribute(
    'href',
    'https://example.test/',
  );
  await expect(overview.locator('a[href^="javascript:"]')).toHaveCount(0);
  const overviewTab = page.getByRole('tab', { name: 'Overview' });
  await overviewTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Apply Now' })).toBeFocused();
  await expect(overview).toBeHidden();
  await page.getByLabel('Name (required)', { exact: true }).fill('Preserved');
  await page.getByRole('tab', { name: 'Apply Now' }).focus();
  await page.keyboard.press('Home');
  await expect(overviewTab).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(overview).toBeFocused();
  await overviewTab.focus();
  await page.keyboard.press('End');
  await expect(page.getByLabel('Name (required)', { exact: true })).toHaveValue(
    'Preserved',
  );
  expect(dialogs).toEqual([]);
});

for (const screen of ['list', 'detail']) {
  for (const failure of [403, 429, 500, 'network', 'malformed']) {
    test(`${screen} reports ${failure} as an error and supports manual retry`, async ({
      page,
    }) => {
      await mockCareers(page);
      let fail = true;
      const pattern =
        screen === 'list'
          ? `${api}/openings?**`
          : `${api}/openings/open-job?**`;
      await page.route(pattern, (route) => {
        if (!fail) return route.fallback();
        if (failure === 'network') return route.abort();
        return route.fulfill({
          status: typeof failure === 'number' ? failure : 200,
          json: { unexpected: true },
        });
      });
      await page.goto(
        screen === 'list' ? '/careers/' : '/careers/job/?id=open-job',
      );
      const retry = page.getByRole('button', { name: 'Retry', exact: true });
      await expect(retry).toBeVisible();
      await expect(
        page.locator(
          screen === 'list' ? '[data-opening-status]' : '[data-job-feedback]',
        ),
      ).not.toContainText('No open positions right now');
      fail = false;
      await retry.click();
      await expect(retry).toBeHidden();
      await expect(
        page
          .locator(screen === 'list' ? '.opening-card' : '[data-job-content]')
          .first(),
      ).toBeVisible();
      expect(
        await page.evaluate(() => document.activeElement?.tagName),
      ).not.toBe('BODY');
    });
  }
}

test('validates fields inline, focuses the first error and never uploads on selection', async ({
  page,
}) => {
  const requests = await mockCareers(page);
  await openApplication(page);
  await submit(page).click();
  await expect(page.locator('#candidate-name')).toBeFocused();
  await expect(page.locator('#candidate-name')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expect(page.locator('#candidate-name-error')).toHaveText(
    'This field is required.',
  );
  await fillApplication(page);
  await page.locator('#candidate-email').fill('not-an-email');
  await page.locator('#candidate-linkedin').fill('javascript:alert(1)');
  await submit(page).click();
  await expect(page.locator('#candidate-email-error')).toContainText(
    'valid email',
  );
  await expect(page.locator('#candidate-linkedin-error')).toContainText(
    'complete LinkedIn URL',
  );
  expect(
    requests.filter((request) => request.method() === 'POST'),
  ).toHaveLength(0);
});

test('requires the company description check before any application request', async ({
  page,
}) => {
  const requests = await mockCareers(page);
  await openApplication(page);
  await fillApplication(page);
  await submit(page).click();
  const dialog = companyCheck(page);
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(
    'IndoThai Securities is a stock broking company',
  );
  await expect(dialog.getByLabel('Company description')).toBeFocused();
  await expect(page.locator('html')).toHaveAttribute(
    'data-company-check-open',
    '',
  );
  await dialog.getByRole('button', { name: 'Confirm and submit' }).focus();
  await page.keyboard.press('Tab');
  await expect(dialog.getByLabel('Company description')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(
    dialog.getByRole('button', { name: 'Confirm and submit' }),
  ).toBeFocused();
  expect(
    requests.filter((request) => request.method() === 'POST'),
  ).toHaveLength(0);

  await confirmCompanyCheck(page, 'a finance company');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('#company-check-error')).toHaveText(
    'Type “stock broking company” exactly as shown.',
  );
  expect(
    requests.filter((request) => request.method() === 'POST'),
  ).toHaveLength(0);

  await confirmCompanyCheck(page, '  Stock   Broking Company  ');
  await expect(dialog).toBeHidden();
  await expect(status(page)).toHaveText(
    'Thank you. Your application has been submitted.',
  );
});

for (const dismissal of ['Cancel', 'Escape', 'backdrop'] as const) {
  test(`${dismissal} closes the company check without sending`, async ({
    page,
  }) => {
    const requests = await mockCareers(page);
    await openApplication(page);
    await fillApplication(page);
    await submit(page).click();
    const dialog = companyCheck(page);
    if (dismissal === 'Cancel')
      await dialog.getByRole('button', { name: 'Cancel' }).click();
    else if (dismissal === 'Escape') await page.keyboard.press('Escape');
    else await page.mouse.click(1, 1);
    await expect(dialog).toBeHidden();
    await expect(submit(page)).toBeFocused();
    expect(
      requests.filter((request) => request.method() === 'POST'),
    ).toHaveLength(0);
  });
}

for (const viewport of [
  { width: 760, height: 926 },
  { width: 320, height: 600 },
]) {
  test(`company check stays within a ${viewport.width}px viewport`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await mockCareers(page);
    await openApplication(page);
    await fillApplication(page);
    await submit(page).click();
    const dialog = companyCheck(page);
    await expect(dialog).toBeVisible();
    const bounds = await dialog.boundingBox();
    expect(bounds?.x).toBeGreaterThanOrEqual(0);
    expect(bounds?.y).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(
      viewport.width,
    );
    expect((bounds?.y ?? 0) + (bounds?.height ?? 0)).toBeLessThanOrEqual(
      viewport.height,
    );
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Confirm and submit' }),
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`company-check-${viewport.width}.png`),
    });
  });
}

for (const size of [100, 2_000_000]) {
  test(`submits ${size}-byte PDF with exact payload, no credentials and confirmed clearing`, async ({
    page,
    context,
  }) => {
    const requests = await mockCareers(page);
    await context.addCookies([
      { name: 'cms-cookie', value: 'must-not-send', url: 'http://strapi.test' },
    ]);
    await openApplication(page);
    await fillApplication(page);
    await page.locator('#candidate-phone').fill('+91 9876543210');
    await page
      .locator('#candidate-links')
      .fill('https://example.invalid/portfolio');
    await page.locator('#candidate-resume').setInputFiles(pdf(size));
    expect(
      requests.filter((request) => request.method() === 'POST'),
    ).toHaveLength(0);
    await startSubmission(page);
    await expect(status(page)).toHaveText(
      'Thank you. Your application has been submitted.',
    );
    const posts = requests.filter((request) => request.method() === 'POST');
    expect(posts.map((request) => new URL(request.url()).pathname)).toEqual([
      '/api/private-upload',
      '/api/candidates',
    ]);
    expect(
      posts[0]
        .postDataBuffer()
        ?.includes(Buffer.from('name="files"; filename="resume.pdf"')),
    ).toBe(true);
    expect(
      posts[0].postDataBuffer()?.includes(Buffer.from('name="purpose"')),
    ).toBe(true);
    expect(posts[0].postDataBuffer()?.includes(Buffer.from('resume'))).toBe(
      true,
    );
    expect(posts[0].headers()['content-type']).toContain(
      'multipart/form-data; boundary=',
    );
    expect(posts[1].postDataJSON()).toEqual({
      data: {
        name: 'Synthetic applicant',
        email: 'candidate@example.invalid',
        contact_no: '+91 9876543210',
        linkedin_url: 'https://www.linkedin.com/in/synthetic-test',
        additional_links: 'https://example.invalid/portfolio',
        opening: 'open-job',
        resume: 81,
      },
    });
    for (const request of requests) {
      const headers = await request.allHeaders();
      expect(headers.authorization).toBeUndefined();
      expect(headers.cookie).toBeUndefined();
      expect(headers.referer).toBeUndefined();
      expect(request.url()).not.toContain('candidate@example');
    }
    await expect(page).toHaveURL(/\?id=open-job$/);
    await expect(page.locator('#candidate-name')).toHaveValue('');
    await expect(page.locator('[data-selected-file]')).toBeHidden();
    expect(
      await page.evaluate(() => ({
        local: localStorage.length,
        session: sessionStorage.length,
      })),
    ).toEqual({ local: 0, session: 0 });
  });
}

test('accepts blank optional fields and blocks duplicate clicks without changing button dimensions', async ({
  page,
}) => {
  const requests = await mockCareers(page);
  let finishUpload!: () => void;
  const pending = new Promise<void>((resolve) => {
    finishUpload = resolve;
  });
  await page.route(`${api}/private-upload`, async (route) => {
    await pending;
    await route.fulfill({ status: 201, json: [{ id: 81 }] });
  });
  await openApplication(page);
  await fillApplication(page);
  const before = await submit(page).boundingBox();
  await startSubmission(page);
  await expect(status(page)).toHaveText('Uploading resume…');
  const sendingButton = page.locator(
    '[data-application-form] button[type=submit]',
  );
  await expect(sendingButton).toBeDisabled();
  const during = await sendingButton.boundingBox();
  expect(during?.width).toBe(before?.width);
  expect(during?.height).toBe(before?.height);
  await page.locator('[data-application-form]').dispatchEvent('submit');
  expect(
    requests.filter((request) => request.url() === `${api}/private-upload`),
  ).toHaveLength(1);
  finishUpload();
  await expect(status(page)).toContainText('has been submitted');
  expect(
    requests
      .find((request) => request.url() === `${api}/candidates`)
      ?.postDataJSON().data.contact_no,
  ).toBe('');
});

for (const [label, file, error] of [
  ['oversize', pdf(2_000_001), '2 MB or smaller'],
  [
    'empty',
    { name: 'empty.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(0) },
    'empty',
  ],
  [
    'word',
    {
      name: 'resume.doc',
      mimeType: 'application/msword',
      buffer: Buffer.from('document'),
    },
    'Choose a PDF',
  ],
  [
    'renamed',
    {
      name: 'resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('not a PDF'),
    },
    'does not appear to be a PDF',
  ],
] as const) {
  test(`rejects ${label} resume before requests`, async ({ page }) => {
    const requests = await mockCareers(page);
    await openApplication(page);
    await fillApplication(page);
    await page.locator('#candidate-resume').setInputFiles(file);
    if (label === 'renamed') await startSubmission(page);
    else await submit(page).click();
    await expect(page.locator('#candidate-resume-error')).toContainText(error);
    await expect(page.locator('#candidate-resume')).toBeFocused();
    expect(
      requests.filter((request) => request.method() === 'POST'),
    ).toHaveLength(0);
  });
}

test('removes and replaces files and rechecks closed jobs before uploading', async ({
  page,
}) => {
  const entries = jobs.map((entry) => ({ ...entry }));
  const requests = await mockCareers(page, entries);
  await openApplication(page);
  await fillApplication(page);
  await page.getByRole('button', { name: 'Remove selected resume' }).click();
  await expect(page.locator('[data-selected-file]')).toBeHidden();
  await expect(page.locator('#candidate-resume')).toBeFocused();
  await page
    .locator('#candidate-resume')
    .setInputFiles(pdf(100, 'replacement.pdf'));
  await expect(page.locator('[data-file-summary]')).toContainText(
    'replacement.pdf',
  );
  entries[0].job_status = 'Closed';
  await startSubmission(page);
  await expect(status(page)).toContainText('no longer accepting applications');
  await expect(submit(page)).toBeDisabled();
  expect(
    requests.filter((request) => request.method() === 'POST'),
  ).toHaveLength(0);
});

for (const phase of ['upload', 'candidates']) {
  for (const failure of [400, 403, 413, 429, 500, 'network', 'malformed']) {
    test(`${phase} ${failure} preserves input and never shows false success`, async ({
      page,
    }) => {
      const requests = await mockCareers(page);
      const endpoint = phase === 'upload' ? 'private-upload' : phase;
      await page.route(`${api}/${endpoint}`, (route) =>
        failure === 'network'
          ? route.abort()
          : route.fulfill({
              status: typeof failure === 'number' ? failure : 201,
              json: { unexpected: true },
            }),
      );
      await openApplication(page);
      await fillApplication(page);
      await startSubmission(page);
      await expect(page.locator('[data-application-form]')).toHaveAttribute(
        'data-state',
        'error',
      );
      await expect(status(page)).not.toContainText('Thank you');
      await expect(page.locator('#candidate-name')).toHaveValue(
        'Synthetic applicant',
      );
      await expect(page.locator('[data-selected-file]')).toBeVisible();
      if (phase === 'upload')
        expect(
          requests.some((request) => request.url() === `${api}/candidates`),
        ).toBe(false);
      if (failure === 500 || failure === 'network' || failure === 'malformed')
        await expect(status(page)).toContainText('could not confirm');
    });
  }
}

test('manual retry reuses only the same confirmed upload and replacement uploads anew', async ({
  page,
}) => {
  const requests = await mockCareers(page);
  let attempts = 0;
  await page.route(`${api}/candidates`, (route) =>
    route.fulfill({
      status: ++attempts < 3 ? 400 : 201,
      json: { data: { documentId: 'synthetic-candidate' } },
    }),
  );
  await openApplication(page);
  await fillApplication(page);
  await startSubmission(page);
  await expect(status(page)).toContainText('not accepted');
  await startSubmission(page);
  await expect.poll(() => attempts).toBe(2);
  await expect(submit(page)).toBeEnabled();
  expect(
    requests.filter((request) => request.url() === `${api}/private-upload`),
  ).toHaveLength(1);
  await page
    .locator('#candidate-resume')
    .setInputFiles(pdf(200, 'new-resume.pdf'));
  await startSubmission(page);
  await expect(status(page)).toContainText('has been submitted');
  expect(
    requests.filter((request) => request.url() === `${api}/private-upload`),
  ).toHaveLength(2);
});

for (const stage of ['list', 'detail', 'upload', 'candidates']) {
  test(`${stage} times out after 20 seconds without automatic retry`, async ({
    page,
  }) => {
    const requests = await mockCareers(page);
    const pattern =
      stage === 'list'
        ? `${api}/openings?**`
        : stage === 'detail'
          ? `${api}/openings/open-job?**`
          : `${api}/${stage === 'upload' ? 'private-upload' : stage}`;
    await page.route(pattern, () => {});
    // AbortSignal.timeout uses the browser's active-time clock, not setTimeout mocks.
    test.setTimeout(30_000);
    if (stage === 'list' || stage === 'detail') {
      await page.goto(
        stage === 'list' ? '/careers/' : '/careers/job/?id=open-job',
      );
      await expect(
        page.getByRole('button', { name: 'Retry', exact: true }),
      ).toBeVisible({ timeout: 23_000 });
      await expect(
        page.locator(
          stage === 'list' ? '[data-opening-status]' : '[data-job-feedback]',
        ),
      ).toContainText('too long');
    } else {
      await openApplication(page);
      await fillApplication(page);
      await startSubmission(page);
      await expect(status(page)).toContainText('could not confirm', {
        timeout: 23_000,
      });
    }
    expect(
      requests.filter((request) =>
        stage === 'list'
          ? new URL(request.url()).pathname === '/api/openings'
          : stage === 'detail'
            ? new URL(request.url()).pathname === '/api/openings/open-job'
            : request.url() ===
              `${api}/${stage === 'upload' ? 'private-upload' : stage}`,
      ),
    ).toHaveLength(1);
  });
}

for (const path of ['/careers/', '/careers/job/?id=open-job']) {
  test(`${path} has a safe no-JavaScript fallback`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    const requests = await mockCareers(page);
    await page.goto(`http://127.0.0.1:4325${path}`);
    await expect(page.locator('main')).toContainText('Enable JavaScript');
    await expect(page.locator('main a[href^="tel:"]')).toBeVisible();
    if (path.includes('/job/')) {
      await expect(submit(page)).toBeDisabled();
      await expect(page.locator('#candidate-name')).toBeDisabled();
    }
    expect(requests).toHaveLength(0);
    await context.close();
  });
  test(`${path} without configuration never contacts Strapi`, async ({
    page,
  }) => {
    const requests = await mockCareers(page);
    await page.route(`**${path}`, async (route) => {
      const response = await route.fetch();
      await route.fulfill({
        response,
        body: (await response.text()).replaceAll(
          'data-api="http://strapi.test/api"',
          'data-api=""',
        ),
      });
    });
    await page.goto(path);
    await expect(page.locator('main')).toContainText('Enable JavaScript');
    expect(requests).toHaveLength(0);
  });
  for (const width of [1280, 768, 390, 320]) {
    test(`${path} has no overflow or missing assets at ${width}px`, async ({
      page,
    }, testInfo) => {
      const longJob = {
        ...job,
        title: 'Software Engineer — Distributed Systems and Infrastructure',
        tags: 'Rust, Golang, Distributed systems, Infrastructure',
      };
      await mockCareers(page, [longJob, jobs[1], jobs[2]]);
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 926 });
      await page.goto(path);
      await expect(
        page
          .locator(
            path.includes('/job/') ? '[data-job-content]' : '.opening-card',
          )
          .first(),
      ).toBeVisible();
      const overflow = () =>
        page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      expect(await overflow()).toBe(false);
      if (path.includes('/job/')) {
        await page.getByRole('tab', { name: 'Apply Now' }).click();
        await page
          .locator('#candidate-resume')
          .setInputFiles(pdf(100, `${'Long-resume-name-'.repeat(20)}.pdf`));
        await submit(page).click();
        expect(await overflow()).toBe(false);
      }
      for (const image of await page.locator('main img, header img').all())
        expect(
          await image.evaluate(
            (element: HTMLImageElement) =>
              element.complete && element.naturalWidth > 0,
          ),
        ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(
          `careers-${path.includes('/job/') ? 'application' : 'list'}-${width}.png`,
        ),
        fullPage: true,
      });
      expect(errors).toEqual([]);
    });
  }
}
