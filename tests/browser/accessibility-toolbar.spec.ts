import { expect, investorAlertTest, test } from './fixtures';
import type { Page } from './fixtures';

const trigger = (page: Page) => page.locator('[data-accessibility-trigger]');
const panel = (page: Page) => page.locator('[data-accessibility-panel]');

test('opens as a keyboard-contained non-modal panel and restores focus', async ({
  page,
}) => {
  await page.goto('/about-us/');
  await expect(trigger(page)).toBeVisible();
  await expect(panel(page)).toBeHidden();
  await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');

  await trigger(page).focus();
  await page.keyboard.press('Enter');
  await expect(panel(page)).toBeVisible();
  await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
  const close = panel(page).getByRole('button', {
    name: 'Close accessibility toolbar',
  });
  await expect(close).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(
    page.getByRole('button', { name: 'Reset all settings' }),
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(panel(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();

  await trigger(page).click();
  await page.locator('main h1').click();
  await expect(panel(page)).toBeHidden();
});

test('font, contrast, dyslexic and keyboard settings apply and persist safely', async ({
  page,
}) => {
  await page.goto('/about-us/');
  await trigger(page).click();

  const increase = page.getByRole('button', { name: 'Increase font size' });
  for (let index = 0; index < 5; index += 1) await increase.click();
  await expect(page.locator('[data-font-indicator]')).toHaveText('150%');
  await expect(increase).toBeDisabled();
  await expect(page.locator('html')).toHaveCSS('font-size', '24px');

  const decrease = page.getByRole('button', { name: 'Decrease font size' });
  for (let index = 0; index < 8; index += 1) await decrease.click();
  await expect(page.locator('[data-font-indicator]')).toHaveText('70%');
  await expect(decrease).toBeDisabled();

  await page.getByRole('button', { name: 'Dark Mode' }).click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-a11y-contrast',
    'dark',
  );
  await expect(page.getByRole('button', { name: 'Dark Mode' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page
    .getByRole('button', { name: 'Toggle dyslexia-friendly font' })
    .click();
  await expect(page.locator('html')).toHaveAttribute('data-a11y-dyslexic', '');
  await expect(page.locator('body')).toHaveCSS('font-family', /OpenDyslexic/);
  expect(
    await page.evaluate(() =>
      Object.keys(
        JSON.parse(localStorage.getItem('a11y-plugin-prefs') || '{}'),
      ).sort(),
    ),
  ).toEqual(
    [
      'version',
      'fontSize',
      'contrast',
      'dyslexicFont',
      'ttsRate',
      'altTextAudit',
      'keyboardNav',
    ].sort(),
  );

  await page.reload();
  await expect(page.locator('html')).toHaveCSS('font-size', '11.2px');
  await expect(page.locator('html')).toHaveAttribute(
    'data-a11y-contrast',
    'dark',
  );
  await expect(page.locator('html')).toHaveAttribute('data-a11y-dyslexic', '');
  await trigger(page).click();
  await expect(page.locator('[data-font-indicator]')).toHaveText('70%');
  await expect(
    page.getByRole('button', { name: 'Enhanced keyboard navigation' }),
  ).toHaveAttribute('aria-pressed', 'false');

  await page
    .getByRole('button', { name: 'Enhanced keyboard navigation' })
    .click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-a11y-keyboard-enabled',
    '',
  );
  await page.keyboard.press('Tab');
  await expect(page.locator('html')).toHaveAttribute(
    'data-a11y-keyboard-active',
    '',
  );
  const reset = page.getByRole('button', { name: 'Reset all settings' });
  await expect(reset).toBeFocused();
  await expect(reset).not.toHaveCSS('outline-style', 'none');

  await page.goto('/mutual-funds/');
  await expect(panel(page)).toBeHidden();
  await expect(page.locator('html')).toHaveCSS('font-size', '11.2px');
  await expect(page.locator('html')).toHaveAttribute(
    'data-a11y-contrast',
    'dark',
  );
  await expect(page.locator('html')).toHaveAttribute('data-a11y-dyslexic', '');
  await expect(page.locator('html')).toHaveAttribute(
    'data-a11y-keyboard-enabled',
    '',
  );
});

test('contrast modes match staging, stay exclusive and reset cleanly', async ({
  page,
}) => {
  await page.goto('/about-us/');
  await trigger(page).click();

  await page.getByRole('button', { name: 'High Contrast' }).click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-a11y-contrast',
    'high',
  );
  await expect(page.locator('html')).toHaveCSS('filter', 'contrast(1.5)');
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(0, 0, 0)');
  await expect(page.locator('main a').first()).toHaveCSS(
    'color',
    'rgb(0, 0, 238)',
  );
  await expect(page.locator('main img').first()).toHaveCSS(
    'filter',
    'contrast(1.2)',
  );

  await page.getByRole('button', { name: 'Dark Mode' }).click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-a11y-contrast',
    'dark',
  );
  await expect(page.locator('html')).toHaveCSS(
    'filter',
    'invert(1) hue-rotate(180deg)',
  );
  await expect(page.locator('main img').first()).toHaveCSS(
    'filter',
    'invert(1) hue-rotate(180deg)',
  );
  await expect(page.locator('[data-accessibility-toolbar]')).toHaveCSS(
    'filter',
    'invert(1) hue-rotate(180deg)',
  );

  await page.getByRole('button', { name: 'Inverted Colors' }).click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-a11y-contrast',
    'inverted',
  );
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(0, 0, 0)',
  );
  await expect(page.locator('html')).toHaveCSS(
    'background-color',
    'rgb(0, 0, 0)',
  );
  await expect(page.locator('html')).toHaveCSS('color', 'rgb(255, 255, 0)');
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(255, 255, 0)');
  await expect(page.locator('main h1')).toHaveCSS(
    'color',
    'rgb(255, 255, 255)',
  );
  await expect(page.locator('main a').first()).toHaveCSS(
    'color',
    'rgb(0, 255, 255)',
  );
  await expect(panel(page).locator('h3').first()).toHaveCSS(
    'color',
    'rgb(0, 108, 181)',
  );
  await expect(
    page.locator('[data-contrast][aria-pressed="true"]'),
  ).toHaveCount(1);

  await page.goto('/close-account/');
  await expect(page.locator('#closure-bo-id')).toHaveCSS(
    'background-color',
    'rgb(34, 34, 34)',
  );
  await expect(page.locator('#closure-bo-id')).toHaveCSS(
    'border-color',
    'rgb(255, 255, 0)',
  );
  await expect(page.locator('main button[type="submit"]')).toHaveCSS(
    'background-color',
    'rgb(51, 51, 51)',
  );
  await trigger(page).click();

  await page.getByRole('button', { name: 'Increase font size' }).click();
  await page.getByRole('button', { name: 'Reset all settings' }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-a11y-contrast');
  await expect(page.locator('html')).not.toHaveAttribute('data-a11y-dyslexic');
  await expect(page.locator('[data-font-indicator]')).toHaveText('100%');
  await expect(page.getByRole('button', { name: 'Default' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('html')).not.toHaveAttribute(
    'data-a11y-keyboard-enabled',
  );
  await expect(
    page.getByRole('button', { name: 'Enhanced keyboard navigation' }),
  ).toHaveAttribute('aria-pressed', 'false');
  expect(
    await page.evaluate(() => localStorage.getItem('a11y-plugin-prefs')),
  ).toBeNull();

  await page.evaluate(() =>
    localStorage.setItem(
      'a11y-plugin-prefs',
      JSON.stringify({
        version: 1,
        fontSize: 155,
        contrast: 'unknown',
        dyslexicFont: 'yes',
        ttsRate: 4,
        altTextAudit: 1,
        keyboardNav: 'yes',
      }),
    ),
  );
  await page.reload();
  await expect(panel(page)).toBeHidden();
  await expect(page.locator('html')).toHaveCSS('font-size', '16px');
  await expect(page.locator('html')).not.toHaveAttribute('data-a11y-contrast');
  await expect(page.locator('html')).not.toHaveAttribute('data-a11y-dyslexic');
  await expect(page.locator('html')).not.toHaveAttribute(
    'data-a11y-keyboard-enabled',
  );
  await trigger(page).click();
  await expect(page.locator('[data-speech-rate]')).toHaveValue('1');
  await expect(
    page.getByRole('button', { name: 'Highlight images without alt text' }),
  ).toHaveAttribute('aria-pressed', 'false');
});

test('alt audit detects initial and dynamically inserted missing attributes without wrapping images', async ({
  page,
}) => {
  await page.goto('/about-us/');
  await trigger(page).click();
  await page
    .getByRole('button', { name: 'Highlight images without alt text' })
    .click();

  await page.evaluate(() => {
    const missing = document.createElement('img');
    missing.id = 'missing-alt-test';
    document.querySelector('main')?.append(missing);
    const decorative = document.createElement('img');
    decorative.id = 'decorative-alt-test';
    decorative.alt = '';
    document.querySelector('main')?.append(decorative);
  });
  await expect(page.locator('#missing-alt-test')).toHaveAttribute(
    'data-a11y-alt-missing',
    '',
  );
  await expect(page.locator('#decorative-alt-test')).not.toHaveAttribute(
    'data-a11y-alt-missing',
  );
  await expect(
    page.locator('#missing-alt-test').locator('xpath=..'),
  ).not.toHaveAttribute('data-accessibility-toolbar');

  await page
    .locator('#missing-alt-test')
    .evaluate((image) => image.setAttribute('alt', 'Test image'));
  await expect(page.locator('#missing-alt-test')).not.toHaveAttribute(
    'data-a11y-alt-missing',
  );

  await page.reload();
  await trigger(page).click();
  await expect(
    page.getByRole('button', { name: 'Highlight images without alt text' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => {
    const missing = document.createElement('img');
    missing.id = 'persisted-alt-audit-test';
    document.querySelector('main')?.append(missing);
  });
  await expect(page.locator('#persisted-alt-audit-test')).toHaveAttribute(
    'data-a11y-alt-missing',
    '',
  );
});

test('text to speech reads selected text and supports rate, pause, resume and stop', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const calls = {
      spoken: [] as string[],
      rates: [] as number[],
      voices: [] as string[],
      pause: 0,
      resume: 0,
      cancel: 0,
    };
    class MockUtterance {
      text: string;
      lang = '';
      rate = 1;
      voice: SpeechSynthesisVoice | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }
    const voice = {
      default: true,
      lang: 'en-IN',
      localService: true,
      name: 'Test Voice',
      voiceURI: 'test-voice',
    } as SpeechSynthesisVoice;
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: MockUtterance,
    });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        addEventListener() {},
        cancel() {
          calls.cancel += 1;
        },
        getVoices() {
          return [voice];
        },
        pause() {
          calls.pause += 1;
        },
        resume() {
          calls.resume += 1;
        },
        speak(utterance: MockUtterance) {
          calls.spoken.push(utterance.text);
          calls.rates.push(utterance.rate);
          calls.voices.push(utterance.voice?.name || '');
        },
      },
    });
    Object.defineProperty(window, '__speechCalls', { value: calls });
  });
  await page.goto('/about-us/');
  await trigger(page).click();
  await expect(page.locator('[data-speech-voice]')).toBeEnabled();
  await expect(page.locator('[data-speech-voice]')).toContainText(
    'Test Voice (en-IN)',
  );
  await page.locator('[data-speech-voice]').selectOption('Test Voice');
  await page.locator('[data-speech-rate]').fill('1.5');
  await expect(page.locator('[data-speech-rate-output]')).toHaveText('1.5×');

  await page.evaluate(() => {
    const heading = document.querySelector('main h1');
    if (!heading?.firstChild) return;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(heading);
    selection?.removeAllRanges();
    selection?.addRange(range);
  });
  await page.getByRole('button', { name: 'Read page aloud' }).click();
  expect(
    await page.evaluate(
      () =>
        (
          window as typeof window & {
            __speechCalls: {
              spoken: string[];
              rates: number[];
              voices: string[];
            };
          }
        ).__speechCalls,
    ),
  ).toMatchObject({
    spoken: [expect.stringContaining('About')],
    rates: [1.5],
    voices: ['Test Voice'],
  });

  await page.getByRole('button', { name: 'Pause reading' }).click();
  await page.getByRole('button', { name: 'Resume reading' }).click();
  await page.getByRole('button', { name: 'Stop reading' }).click();
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { __speechCalls: Record<string, number> })
          .__speechCalls,
    ),
  ).toMatchObject({ pause: 1, resume: 1 });
  await expect(
    page.getByRole('button', { name: 'Stop reading' }),
  ).toBeDisabled();

  await page.evaluate(() => window.getSelection()?.removeAllRanges());
  await page.getByRole('button', { name: 'Read page aloud' }).click();
  expect(
    await page.evaluate(() =>
      (
        window as typeof window & {
          __speechCalls: { spoken: string[] };
        }
      ).__speechCalls.spoken.at(-1),
    ),
  ).toContain('About Us');
  const cancelCount = await page.evaluate(
    () =>
      (window as typeof window & { __speechCalls: { cancel: number } })
        .__speechCalls.cancel,
  );
  await page.evaluate(() =>
    window.dispatchEvent(new PageTransitionEvent('pagehide')),
  );
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { __speechCalls: { cancel: number } })
          .__speechCalls.cancel,
    ),
  ).toBeGreaterThan(cancelCount);
  await page.reload();
  await trigger(page).click();
  await expect(page.locator('[data-speech-rate]')).toHaveValue('1.5');
});

test('text to speech has an explicit unsupported-browser fallback', async ({
  page,
}) => {
  await page.addInitScript(() => {
    for (const method of ['getItem', 'setItem', 'removeItem'] as const) {
      Object.defineProperty(Storage.prototype, method, {
        configurable: true,
        value() {
          throw new DOMException('Storage is blocked', 'SecurityError');
        },
      });
    }
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: undefined,
    });
  });
  await page.goto('/about-us/');
  await trigger(page).click();
  await expect(
    page.getByText('Text-to-speech is not supported in this browser.'),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Read page aloud' }),
  ).toBeDisabled();
  await expect(page.locator('[data-speech-voice]')).toBeDisabled();
  await expect(page.locator('[data-speech-rate]')).toBeDisabled();
  await page.getByRole('button', { name: 'Dark Mode' }).click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-a11y-contrast',
    'dark',
  );
});

for (const width of [390, 320]) {
  test(`toolbar panel stays inside a ${width}px viewport and respects reduced motion`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 600 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/about-us/');
    await trigger(page).click();
    const bounds = await panel(page).boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(600);
    expect(
      await panel(page).evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    await expect(panel(page)).toHaveCSS('overflow-x', 'hidden');
    await expect(panel(page)).toHaveCSS('overflow-y', 'auto');
    await expect(panel(page)).toHaveCSS('animation-name', 'none');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

test('toolbar and mobile navigation dismiss each other instead of overlapping', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/about-us/');
  const menu = page.getByRole('button', { name: 'Navigation menu' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await trigger(page).click();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(panel(page)).toBeVisible();
  await menu.click();
  await expect(panel(page)).toBeHidden();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
});

investorAlertTest(
  'toolbar remains below the Home Investor Alert dialog',
  async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('dialog', { name: 'Investor Alert' }),
    ).toBeVisible();
    expect(
      await trigger(page).evaluate((element: Element) =>
        Number.parseInt(
          getComputedStyle(element.closest('[data-accessibility-toolbar]')!)
            .zIndex,
        ),
      ),
    ).toBe(40);
    await page.getByRole('button', { name: 'Close investor alert' }).click();
    await trigger(page).click();
    await expect(panel(page)).toBeVisible();
  },
);
