import { test, expect, type Page } from '@playwright/test';

const api = 'http://strapi.test/api/close-account-requests';
const values = {
  bo_id: 'B',
  ucc: 'SYNTHETIC-UCC',
  email: 'closure-test@example.invalid',
  mobile_no: '+91 0000000000',
};
const created = { data: { documentId: 'synthetic-closure-request' } };
const headers = { 'access-control-allow-origin': '*' };

async function fillRequest(page: Page) {
  await page.getByLabel('BO ID', { exact: true }).fill(values.bo_id);
  await page.getByLabel('UCC', { exact: true }).fill(values.ucc);
  await page
    .getByLabel('Registered email address', { exact: true })
    .fill(values.email);
  await page
    .getByLabel('Mobile number', { exact: true })
    .fill(values.mobile_no);
}

test.describe('Close account request', () => {
  test.beforeEach(async ({ page }) => {
    // Any missed mock fails closed instead of reaching a real CMS.
    await page.route('http://strapi.test/**', (route) => route.abort());
    await page.goto('/close-account/');
  });

  test('posts exactly four fields without credentials and clears only after acknowledgement', async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: 'test-auth',
        value: 'must-not-send',
        domain: 'strapi.test',
        path: '/',
      },
    ]);
    let attempts = 0;
    let release: () => void = () => {};
    const responseGate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(api, async (route) => {
      attempts++;
      const request = route.request();
      expect(request.method()).toBe('POST');
      expect(request.postDataJSON()).toEqual({ data: values });
      const requestHeaders = await request.allHeaders();
      expect(requestHeaders['content-type']).toContain('application/json');
      expect(requestHeaders.authorization).toBeUndefined();
      expect(requestHeaders.cookie).toBeUndefined();
      expect(requestHeaders.referer).toBeUndefined();
      await responseGate;
      await route.fulfill({ status: 201, json: created, headers });
    });

    await fillRequest(page);
    const submit = page.getByRole('button', {
      name: 'Submit request',
      exact: true,
    });
    const before = await submit.boundingBox();
    await submit.click();
    await expect(
      page.getByRole('button', { name: 'Submitting…' }),
    ).toBeDisabled();
    await expect(page.getByRole('status')).toHaveText(
      'Submitting your closure request…',
    );
    const during = await page.locator('button[type=submit]').boundingBox();
    expect(during?.width).toBe(before?.width);
    expect(during?.height).toBe(before?.height);
    await page
      .locator('form')
      .evaluate((form) =>
        form.dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true }),
        ),
      );
    await expect.poll(() => attempts).toBe(1);
    release();

    await expect(page.getByRole('status')).toContainText(
      'submitted for review',
    );
    await expect(page.getByRole('status')).toContainText(
      'does not confirm that your account is closed',
    );
    for (const input of await page.locator('form input').all())
      await expect(input).toHaveValue('');
    expect(
      await page.evaluate(() => ({
        local: localStorage.length,
        session: sessionStorage.length,
      })),
    ).toEqual({ local: 0, session: 0 });
    expect(new URL(page.url()).pathname).toBe('/close-account/');
    expect(new URL(page.url()).search).toBe('');
    await expect(page.locator('body')).not.toContainText(
      'synthetic-closure-request',
    );
  });

  test('validates required fields and email while accepting a one-character BO ID', async ({
    page,
  }) => {
    let attempts = 0;
    await page.route(api, (route) => {
      attempts++;
      return route.fulfill({ status: 201, json: created, headers });
    });

    await page
      .getByRole('button', { name: 'Submit request', exact: true })
      .click();
    await expect(page.getByLabel('BO ID', { exact: true })).toBeFocused();
    await expect(page.locator('#closure-bo-id-error')).toHaveText(
      'Enter your BO ID.',
    );
    await expect(page.getByLabel('BO ID', { exact: true })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await fillRequest(page);
    await page
      .getByLabel('Registered email address', { exact: true })
      .fill('invalid-email');
    await page.keyboard.press('Enter');
    await expect(
      page.getByLabel('Registered email address', { exact: true }),
    ).toBeFocused();
    await expect(page.locator('#closure-email-error')).toContainText(
      'valid email address',
    );
    expect(attempts).toBe(0);

    await page
      .getByLabel('Registered email address', { exact: true })
      .fill(values.email);
    await page
      .getByRole('button', { name: 'Submit request', exact: true })
      .click();
    await expect(page.getByRole('status')).toContainText(
      'submitted for review',
    );
    expect(attempts).toBe(1);
  });

  for (const [code, message] of [
    [400, 'not accepted'],
    [422, 'not accepted'],
    [401, 'currently unavailable'],
    [403, 'currently unavailable'],
    [429, 'Too many'],
    [500, 'could not confirm'],
  ] as const) {
    test(`handles ${code} without exposing server details or clearing values`, async ({
      page,
    }) => {
      await page.route(api, (route) =>
        route.fulfill({
          status: code,
          headers,
          json: { error: { message: 'PRIVATE BACKEND DETAIL' } },
        }),
      );
      await fillRequest(page);
      await page
        .getByRole('button', { name: 'Submit request', exact: true })
        .click();
      await expect(page.getByRole('status')).toContainText(message);
      await expect(page.getByLabel('UCC', { exact: true })).toHaveValue(
        values.ucc,
      );
      await expect(
        page.getByRole('button', { name: 'Submit request', exact: true }),
      ).toBeEnabled();
      await expect(page.locator('body')).not.toContainText(
        'PRIVATE BACKEND DETAIL',
      );
    });
  }

  test('network and malformed responses preserve values without claiming success', async ({
    page,
  }) => {
    await fillRequest(page);
    await page
      .getByRole('button', { name: 'Submit request', exact: true })
      .click();
    await expect(page.getByRole('status')).toContainText('could not confirm');

    await page.route(api, (route) =>
      route.fulfill({
        status: 201,
        headers,
        body: '<html>unexpected</html>',
        contentType: 'text/html',
      }),
    );
    await page
      .getByRole('button', { name: 'Submit request', exact: true })
      .click();
    await expect(page.getByRole('status')).toContainText('could not confirm');
    await expect(page.getByLabel('UCC', { exact: true })).toHaveValue(
      values.ucc,
    );
  });

  test('times out after 20 seconds without retrying or losing input', async ({
    page,
  }) => {
    await page.clock.install();
    let attempts = 0;
    await page.route(api, () => {
      attempts++;
    });
    await fillRequest(page);
    await page
      .getByRole('button', { name: 'Submit request', exact: true })
      .click();
    await expect.poll(() => attempts).toBe(1);
    await page.clock.fastForward(20_001);
    await expect(page.getByRole('status')).toContainText('could not confirm');
    await expect(page.getByLabel('UCC', { exact: true })).toHaveValue(
      values.ucc,
    );
    await page.clock.fastForward(60_000);
    expect(attempts).toBe(1);
  });

  test('missing endpoint keeps the form disabled with contact alternatives', async ({
    page,
  }) => {
    await page.route(page.url(), async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(
        / data-endpoint="[^"]*"/,
        '',
      );
      await route.fulfill({ response, body });
    });
    let attempts = 0;
    page.on('request', (request) => {
      if (request.method() === 'POST') attempts++;
    });
    await page.reload();
    await expect(page.getByLabel('BO ID', { exact: true })).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Submit request', exact: true }),
    ).toBeDisabled();
    await page
      .locator('form')
      .evaluate((form) =>
        form.dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true }),
        ),
      );
    expect(attempts).toBe(0);
    await expect(page.locator('.support a[href^="mailto:"]')).toBeVisible();
    await expect(page.locator('.support a[href^="tel:"]')).toBeVisible();
  });

  test('no-JavaScript fallback stays disabled and keeps contact links usable', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/close-account/');
    await expect(page.getByLabel('BO ID', { exact: true })).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Submit request', exact: true }),
    ).toBeDisabled();
    await expect(page.locator('.support a[href^="mailto:"]')).toBeVisible();
    await context.close();
  });

  test('close-account has no overflow or missing assets in form states', async ({
    page,
  }, testInfo) => {
    await page.route(api, (route) =>
      route.fulfill({ status: 201, json: created, headers }),
    );
    for (const width of [1280, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 926 });
      await page
        .getByRole('button', { name: 'Submit request', exact: true })
        .click();
      await expect(page.getByRole('status')).toContainText(
        'highlighted fields',
      );
      await page.locator('.close-account').screenshot({
        path: testInfo.outputPath(`close-account-error-${width}.png`),
      });
      await fillRequest(page);
      await page
        .getByRole('button', { name: 'Submit request', exact: true })
        .click();
      await expect(page.getByRole('status')).toContainText(
        'submitted for review',
      );
      await page.locator('.close-account').screenshot({
        path: testInfo.outputPath(`close-account-success-${width}.png`),
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  });
});
