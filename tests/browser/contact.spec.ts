import { test, expect, type Page } from './fixtures';

const api = 'http://strapi.test/api/contact-forms';
const values = {
  name: 'Synthetic Website Test',
  contact_no: '+91 0000000000',
  email: 'website-test@example.invalid',
  message: 'Synthetic test enquiry, not a real customer.',
};
const created = { data: { documentId: 'synthetic-record', ...values } };
const headers = { 'access-control-allow-origin': '*' };

async function fillContact(page: Page, message = values.message) {
  await page.getByLabel('Name', { exact: true }).fill(values.name);
  await page.getByLabel('Contact no.', { exact: true }).fill(values.contact_no);
  await page.getByLabel('Email address', { exact: true }).fill(values.email);
  await page.getByLabel('Message', { exact: true }).fill(message);
}

for (const path of ['/', '/mutual-funds/']) {
  test.describe(`Contact ${path}`, () => {
    // Any missed mock fails closed instead of reaching a real CMS.
    test.beforeEach(async ({ page }) => {
      await page.route('http://strapi.test/**', (route) => route.abort());
      await page.goto(path);
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
      await fillContact(page);
      const submit = page.getByRole('button', { name: 'Submit', exact: true });
      const before = await submit.boundingBox();
      await submit.click();
      await expect(
        page.getByRole('button', { name: 'Sending…' }),
      ).toBeDisabled();
      await expect(page.getByRole('status')).toHaveText(
        'Sending your message…',
      );
      await expect(page.getByLabel('Name', { exact: true })).toHaveValue(
        values.name,
      );
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
      await expect.poll(() => attempts).toBe(1);
      release();
      await expect(page.getByRole('status')).toHaveText(
        'Thank you. Your message has been submitted.',
      );
      for (const field of await page.locator('form input, form textarea').all())
        await expect(field).toHaveValue('');
      expect(
        await page.evaluate(() => ({
          local: localStorage.length,
          session: sessionStorage.length,
        })),
      ).toEqual({ local: 0, session: 0 });
      expect(new URL(page.url()).pathname).toBe(path);
      expect(new URL(page.url()).search).toBe('');
      await expect(page.locator('body')).not.toContainText('synthetic-record');
    });

    test('validates required fields and email with keyboard-accessible errors', async ({
      page,
    }) => {
      let attempts = 0;
      await page.route(api, async (route) => {
        attempts++;
        await route.abort();
      });
      await page.getByLabel('Name', { exact: true }).fill('   ');
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(page.getByLabel('Name', { exact: true })).toBeFocused();
      await expect(page.locator('#contact-name-error')).toHaveText(
        'Enter your name.',
      );
      await expect(page.getByLabel('Name', { exact: true })).toHaveAttribute(
        'aria-invalid',
        'true',
      );
      await expect(page.getByLabel('Name', { exact: true })).toHaveAttribute(
        'aria-describedby',
        'contact-name-error',
      );
      await fillContact(page);
      await page
        .getByLabel('Email address', { exact: true })
        .fill('invalid-email');
      await page.keyboard.press('Enter');
      await expect(
        page.getByLabel('Email address', { exact: true }),
      ).toBeFocused();
      await expect(page.locator('#contact-email-error')).toContainText(
        'valid email address',
      );
      expect(attempts).toBe(0);
      await page.locator('label[for=contact-phone]').click();
      await expect(
        page.getByLabel('Contact no.', { exact: true }),
      ).toBeFocused();
    });

    test('optional message and international-format contact number are accepted', async ({
      page,
    }) => {
      await page.route(api, async (route) => {
        expect(route.request().postDataJSON()).toEqual({
          data: { ...values, message: '' },
        });
        await route.fulfill({ status: 201, json: created, headers });
      });
      await fillContact(page, '');
      await page.getByLabel('Email address', { exact: true }).press('Enter');
      await expect(page.getByRole('status')).toContainText(
        'has been submitted',
      );
    });

    test('composition does not submit until text entry is complete', async ({
      page,
    }) => {
      let attempts = 0;
      await page.route(api, (route) => {
        attempts++;
        return route.fulfill({ status: 201, headers, json: created });
      });
      await fillContact(page);
      const name = page.getByLabel('Name', { exact: true });
      await name.dispatchEvent('compositionstart');
      await page
        .locator('form')
        .evaluate((form) =>
          form.dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true }),
          ),
        );
      expect(attempts).toBe(0);
      await name.dispatchEvent('compositionend');
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(page.getByRole('status')).toContainText(
        'has been submitted',
      );
      expect(attempts).toBe(1);
    });

    for (const [code, message] of [
      [400, 'not accepted'],
      [422, 'not accepted'],
      [401, 'unavailable'],
      [403, 'unavailable'],
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
            json: {
              error: {
                message: 'PRIVATE BACKEND DETAIL',
                details: {
                  errors: [
                    { path: ['email'], message: 'PRIVATE BACKEND DETAIL' },
                  ],
                },
              },
            },
          }),
        );
        await fillContact(page);
        await page.getByRole('button', { name: 'Submit', exact: true }).click();
        await expect(page.getByRole('status')).toContainText(message);
        await expect(page.getByLabel('Message', { exact: true })).toHaveValue(
          values.message,
        );
        await expect(
          page.getByRole('button', { name: 'Submit', exact: true }),
        ).toBeEnabled();
        await expect(page.locator('body')).not.toContainText(
          'PRIVATE BACKEND DETAIL',
        );
      });
    }

    test('missing endpoint keeps submission disabled with phone/email alternatives', async ({
      page,
    }) => {
      // Exercise the disabled client fallback without a second build/server.
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
      await expect(page.getByLabel('Name', { exact: true })).toBeDisabled();
      await expect(
        page.getByRole('button', { name: 'Submit', exact: true }),
      ).toBeDisabled();
      await page
        .locator('form')
        .evaluate((form) =>
          form.dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true }),
          ),
        );
      expect(attempts).toBe(0);
      expect(new URL(page.url()).pathname).toBe(path);
      expect(new URL(page.url()).search).toBe('');
      await expect(
        page.locator('.contact-details a[href^="tel:"]'),
      ).toHaveCount(2);
      await expect(
        page.locator('.contact-details a[href^="mailto:"]'),
      ).toHaveCount(2);
    });

    test('network failure and a malformed creation response never show success', async ({
      page,
    }) => {
      await fillContact(page);
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(page.getByRole('status')).toContainText('could not confirm');
      await page.route(api, (route) =>
        route.fulfill({
          status: 201,
          headers,
          body: '<html>unexpected</html>',
          contentType: 'text/html',
        }),
      );
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(
        page.getByRole('button', { name: 'Submit', exact: true }),
      ).toBeEnabled();
      await expect(page.getByRole('status')).toContainText('could not confirm');
      await expect(page.getByLabel('Name', { exact: true })).toHaveValue(
        values.name,
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
      await fillContact(page);
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect.poll(() => attempts).toBe(1);
      await page.clock.fastForward(20_001);
      await expect(page.getByRole('status')).toContainText('could not confirm');
      await expect(
        page.getByRole('button', { name: 'Submit', exact: true }),
      ).toBeEnabled();
      await expect(page.getByLabel('Name', { exact: true })).toHaveValue(
        values.name,
      );
      await page.clock.fastForward(60_000);
      expect(attempts).toBe(1);
    });

    test('a corrected submission can succeed after a rejected one', async ({
      page,
    }) => {
      let attempts = 0;
      await page.route(api, (route) => {
        attempts++;
        return route.fulfill({
          status: attempts === 1 ? 400 : 201,
          headers,
          json: attempts === 1 ? { error: {} } : created,
        });
      });
      await fillContact(page);
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(page.getByRole('status')).toContainText('not accepted');
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(page.getByRole('status')).toContainText(
        'has been submitted',
      );
      expect(attempts).toBe(2);
    });

    test('form states fit desktop and narrow phone layouts', async ({
      page,
    }, testInfo) => {
      await page.route(api, (route) =>
        route.fulfill({ status: 201, headers, json: created }),
      );
      for (const width of [1280, 390, 320]) {
        await page.setViewportSize({ width, height: 926 });
        await page.getByRole('button', { name: 'Submit', exact: true }).click();
        await expect(page.getByRole('status')).toContainText(
          'highlighted fields',
        );
        await page.locator('.contact').screenshot({
          path: testInfo.outputPath(`contact-error-${width}.png`),
        });
        await fillContact(page);
        await page.getByRole('button', { name: 'Submit', exact: true }).click();
        await expect(page.getByRole('status')).toContainText(
          'has been submitted',
        );
        await page.locator('.contact').screenshot({
          path: testInfo.outputPath(`contact-success-${width}.png`),
        });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
    });
  });
}
