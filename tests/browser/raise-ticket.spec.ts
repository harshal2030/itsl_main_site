import { test, expect, type Page } from '@playwright/test';

const complaintApi = 'http://strapi.test/api/complaints';
const uploadApi = 'http://strapi.test/api/private-upload';
const values = {
  name: 'Synthetic Investor',
  client_id: 'SYNTHETIC-CLIENT',
  email: 'ticket-test@example.invalid',
  mobile_no: '+91 0000000000',
  issue: 'Technical Issue',
  subject: 'Synthetic test ticket',
  description: 'This is synthetic browser-test content.',
};
const created = { data: { documentId: 'synthetic-ticket' } };
const headers = { 'access-control-allow-origin': '*' };

async function fillTicket(page: Page) {
  await page.getByLabel('Name (required)', { exact: true }).fill(values.name);
  await page
    .getByLabel('Client ID (required)', { exact: true })
    .fill(values.client_id);
  await page
    .getByLabel('Email address (required)', { exact: true })
    .fill(values.email);
  await page
    .getByLabel('Mobile number (required)', { exact: true })
    .fill(values.mobile_no);
  await page
    .getByLabel('Issue (required)', { exact: true })
    .selectOption(values.issue);
  await page
    .getByLabel('Subject (required)', { exact: true })
    .fill(values.subject);
  await page
    .getByLabel('Description (required)', { exact: true })
    .fill(values.description);
}

async function chooseFile(page: Page, name = 'evidence.pdf', size = 1200) {
  await page.getByLabel('File attachment (optional)').setInputFiles({
    name,
    mimeType: 'application/octet-stream',
    buffer: Buffer.alloc(size, 1),
  });
}

test.describe('Raise ticket', () => {
  test.beforeEach(async ({ page }) => {
    // Any missed mock fails closed instead of reaching a real CMS.
    await page.route('http://strapi.test/**', (route) => route.abort());
    await page.goto('/raise-a-ticket/');
  });

  test('raises a ticket without an attachment using the exact safe payload', async ({
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
    let complaints = 0;
    let uploads = 0;
    let release: () => void = () => {};
    const responseGate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(uploadApi, () => uploads++);
    await page.route(complaintApi, async (route) => {
      complaints++;
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

    await fillTicket(page);
    const button = page.getByRole('button', {
      name: 'Raise ticket',
      exact: true,
    });
    const before = await button.boundingBox();
    await button.click();
    await expect(
      page.getByRole('button', { name: 'Raising ticket…' }),
    ).toBeDisabled();
    expect(await page.locator('button[type=submit]').boundingBox()).toEqual(
      before,
    );
    await page
      .locator('form')
      .evaluate((form) =>
        form.dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true }),
        ),
      );
    await expect.poll(() => complaints).toBe(1);
    release();

    await expect(page.getByRole('status')).toContainText('raised for review');
    expect(uploads).toBe(0);
    for (const control of await page
      .locator('form input:not([type=file]), form textarea')
      .all())
      await expect(control).toHaveValue('');
    await expect(
      page.getByLabel('Issue (required)', { exact: true }),
    ).toHaveValue('');
    expect(
      await page.evaluate(() => ({
        local: localStorage.length,
        session: sessionStorage.length,
      })),
    ).toEqual({ local: 0, session: 0 });
    expect(new URL(page.url()).search).toBe('');
    await expect(page.locator('body')).not.toContainText('synthetic-ticket');
  });

  test('uploads one optional file and sends its numeric ID with the complaint', async ({
    page,
  }) => {
    let uploads = 0;
    await page.route(uploadApi, async (route) => {
      uploads++;
      const request = route.request();
      expect(request.method()).toBe('POST');
      expect((await request.allHeaders())['content-type']).toContain(
        'multipart/form-data',
      );
      const body = request.postDataBuffer()?.toString('latin1') ?? '';
      expect(body).toContain('name="files"');
      expect(body).toContain('filename="evidence.pdf"');
      expect(body).toContain('name="purpose"');
      expect(body).toContain('complaint');
      expect((await request.allHeaders()).authorization).toBeUndefined();
      await route.fulfill({ status: 201, json: [{ id: 321 }], headers });
    });
    await page.route(complaintApi, async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        data: { ...values, attachment: 321 },
      });
      await route.fulfill({ status: 201, json: created, headers });
    });

    await fillTicket(page);
    await chooseFile(page);
    await expect(page.locator('[data-file-summary]')).toContainText(
      'evidence.pdf · 1.2 KB',
    );
    await page.getByRole('button', { name: 'Raise ticket' }).click();
    await expect(page.getByRole('status')).toContainText('raised for review');
    expect(uploads).toBe(1);
    await expect(page.getByLabel('File attachment (optional)')).toHaveValue('');
  });

  test('validates required fields, email and native issue selection', async ({
    page,
  }) => {
    let attempts = 0;
    await page.route(complaintApi, (route) => {
      attempts++;
      return route.fulfill({ status: 201, json: created, headers });
    });
    await page.getByRole('button', { name: 'Raise ticket' }).click();
    await expect(
      page.getByLabel('Name (required)', { exact: true }),
    ).toBeFocused();
    await expect(page.locator('#ticket-name-error')).toHaveText(
      'Enter your name.',
    );

    await fillTicket(page);
    await page
      .getByLabel('Email address (required)', { exact: true })
      .fill('invalid');
    await page.getByLabel('Issue (required)', { exact: true }).selectOption('');
    await page.getByRole('button', { name: 'Raise ticket' }).click();
    await expect(
      page.getByLabel('Email address (required)', { exact: true }),
    ).toBeFocused();
    await expect(page.locator('#ticket-email-error')).toContainText(
      'valid email',
    );
    expect(attempts).toBe(0);

    await page
      .getByLabel('Email address (required)', { exact: true })
      .fill(values.email);
    const select = page.getByLabel('Issue (required)', { exact: true });
    await select.focus();
    await expect(select).toBeFocused();
    await select.selectOption('Account Opening');
    await expect(select).toHaveValue('Account Opening');
  });

  test('validates attachment type, emptiness and the exact size boundary', async ({
    page,
  }) => {
    const file = page.getByLabel('File attachment (optional)');
    await chooseFile(page, 'evidence.exe');
    await expect(page.locator('#ticket-attachment-error')).toContainText(
      'Choose a JPG',
    );
    await chooseFile(page, 'empty.pdf', 0);
    await expect(page.locator('#ticket-attachment-error')).toContainText(
      'not empty',
    );
    await chooseFile(page, 'large.pdf', 5_000_001);
    await expect(page.locator('#ticket-attachment-error')).toContainText(
      '5 MB or smaller',
    );
    await chooseFile(page, 'maximum.pdf', 5_000_000);
    await expect(page.locator('#ticket-attachment-error')).toHaveText('');
    await page
      .getByRole('button', { name: 'Remove selected attachment' })
      .click();
    await expect(file).toHaveValue('');
    await expect(page.locator('[data-selected-file]')).toBeHidden();
  });

  for (const [code, message] of [
    [400, 'not accepted'],
    [422, 'not accepted'],
    [401, 'currently unavailable'],
    [403, 'currently unavailable'],
    [429, 'Too many'],
    [500, 'could not confirm'],
  ] as const) {
    test(`handles complaint ${code} without clearing or exposing server details`, async ({
      page,
    }) => {
      await page.route(complaintApi, (route) =>
        route.fulfill({
          status: code,
          json: { error: { message: 'PRIVATE BACKEND DETAIL' } },
          headers,
        }),
      );
      await fillTicket(page);
      await page.getByRole('button', { name: 'Raise ticket' }).click();
      await expect(page.getByRole('status')).toContainText(message);
      await expect(page.getByLabel('Client ID (required)')).toHaveValue(
        values.client_id,
      );
      await expect(page.locator('body')).not.toContainText(
        'PRIVATE BACKEND DETAIL',
      );
    });
  }

  for (const [code, message] of [
    [400, 'not accepted'],
    [403, 'currently unavailable'],
    [413, 'rejected the attachment size'],
    [429, 'Too many'],
    [500, 'could not confirm'],
  ] as const) {
    test(`handles attachment upload ${code} without creating a complaint`, async ({
      page,
    }) => {
      let complaints = 0;
      await page.route(uploadApi, (route) =>
        route.fulfill({ status: code, json: { error: 'private' }, headers }),
      );
      await page.route(complaintApi, () => complaints++);
      await fillTicket(page);
      await chooseFile(page);
      await page.getByRole('button', { name: 'Raise ticket' }).click();
      await expect(page.getByRole('status')).toContainText(message);
      expect(complaints).toBe(0);
      await expect(
        page.getByLabel('File attachment (optional)'),
      ).not.toHaveValue('');
    });
  }

  test('manual retry reuses a confirmed upload for the same selected file', async ({
    page,
  }) => {
    let uploads = 0;
    let complaints = 0;
    await page.route(uploadApi, (route) => {
      uploads++;
      return route.fulfill({ status: 201, json: [{ id: 42 }], headers });
    });
    await page.route(complaintApi, (route) => {
      complaints++;
      expect(route.request().postDataJSON().data.attachment).toBe(42);
      return route.fulfill({
        status: complaints === 1 ? 500 : 201,
        json: complaints === 1 ? { error: 'private' } : created,
        headers,
      });
    });
    await fillTicket(page);
    await chooseFile(page);
    await page.getByRole('button', { name: 'Raise ticket' }).click();
    await expect(page.getByRole('status')).toContainText('could not confirm');
    await page.getByRole('button', { name: 'Raise ticket' }).click();
    await expect(page.getByRole('status')).toContainText('raised for review');
    expect(uploads).toBe(1);
    expect(complaints).toBe(2);
  });

  test('network and malformed responses preserve values without claiming success', async ({
    page,
  }) => {
    await fillTicket(page);
    await page.getByRole('button', { name: 'Raise ticket' }).click();
    await expect(page.getByRole('status')).toContainText('could not confirm');

    await page.route(complaintApi, (route) =>
      route.fulfill({
        status: 201,
        body: '<html>unexpected</html>',
        contentType: 'text/html',
        headers,
      }),
    );
    await page.getByRole('button', { name: 'Raise ticket' }).click();
    await expect(page.getByRole('status')).toContainText('could not confirm');
    await expect(page.getByLabel('Client ID (required)')).toHaveValue(
      values.client_id,
    );
  });

  test('times out after 20 seconds without retrying or losing input', async ({
    page,
  }) => {
    await page.clock.install();
    let attempts = 0;
    await page.route(complaintApi, () => attempts++);
    await fillTicket(page);
    await page.getByRole('button', { name: 'Raise ticket' }).click();
    await expect.poll(() => attempts).toBe(1);
    await page.clock.fastForward(20_001);
    await expect(page.getByRole('status')).toContainText('could not confirm');
    await page.clock.fastForward(60_000);
    expect(attempts).toBe(1);
    await expect(page.getByLabel('Client ID (required)')).toHaveValue(
      values.client_id,
    );
  });

  test('missing configuration and no-JavaScript both keep submission disabled', async ({
    page,
    browser,
  }) => {
    await page.route(page.url(), async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(/ data-api="[^"]*"/, '');
      await route.fulfill({ response, body });
    });
    await page.reload();
    await expect(
      page.getByLabel('Name (required)', { exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Raise ticket' }),
    ).toBeDisabled();
    await expect(page.locator('.support a[href^="mailto:"]')).toBeVisible();

    const context = await browser.newContext({ javaScriptEnabled: false });
    const noScriptPage = await context.newPage();
    await noScriptPage.goto('/raise-a-ticket/');
    await expect(
      noScriptPage.getByLabel('Name (required)', { exact: true }),
    ).toBeDisabled();
    await expect(
      noScriptPage.getByRole('button', { name: 'Raise ticket' }),
    ).toBeDisabled();
    await expect(
      noScriptPage.locator('.support a[href^="mailto:"]'),
    ).toBeVisible();
    await context.close();
  });

  test('raise-a-ticket has no overflow or missing assets in responsive states', async ({
    page,
  }, testInfo) => {
    await page.route(complaintApi, (route) =>
      route.fulfill({ status: 201, json: created, headers }),
    );
    for (const width of [1280, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 926 });
      await page.reload();
      await page.getByRole('button', { name: 'Raise ticket' }).click();
      await expect(page.getByRole('status')).toContainText(
        'highlighted fields',
      );
      await fillTicket(page);
      await chooseFile(page, `synthetic-supporting-document-${width}.pdf`);
      await page.locator('.raise-ticket').screenshot({
        path: testInfo.outputPath(`raise-ticket-${width}.png`),
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page
        .getByRole('button', { name: 'Remove selected attachment' })
        .click();
    }
  });
});
