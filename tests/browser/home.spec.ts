import { test, expect } from './fixtures';

for (const width of [1280, 768, 729, 390, 320]) {
  test(`homepage has no overflow or missing assets at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    for (const section of await page.locator('main > section, footer').all())
      await section.scrollIntoViewIfNeeded();
    for (const image of await page.locator('img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() => image.evaluate((el) => (el as HTMLImageElement).complete))
        .toBe(true);
    }
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() =>
        page
          .locator('img')
          .evaluateAll((images) =>
            images.every(
              (image) =>
                image instanceof HTMLImageElement &&
                image.complete &&
                image.naturalWidth > 0,
            ),
          ),
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
    const sectionSpacing = await page
      .locator('#main-content')
      .evaluate((main) => {
        const sections = Array.from(main.children).filter(
          (child) => child.tagName === 'SECTION',
        );
        return {
          gap: Number.parseFloat(getComputedStyle(main).rowGap),
          footerGap:
            document.querySelector('footer')!.getBoundingClientRect().top -
            sections.at(-1)!.getBoundingClientRect().bottom,
          distances: sections
            .slice(1)
            .map(
              (section, index) =>
                section.getBoundingClientRect().top -
                sections[index].getBoundingClientRect().bottom,
            ),
        };
      });
    const expectedGap = width > 1024 ? 128 : width >= 768 ? 96 : 72;
    expect(sectionSpacing.gap).toBe(expectedGap);
    expect(Math.abs(sectionSpacing.footerGap - expectedGap)).toBeLessThan(1);
    for (const distance of sectionSpacing.distances)
      expect(Math.abs(distance - sectionSpacing.gap)).toBeLessThan(1);
    await expect(page.locator('main h1')).toHaveCSS(
      'font-family',
      'Raleway, Arial, sans-serif',
    );
    await page.screenshot({
      path: testInfo.outputPath(`home-${width}.png`),
      fullPage: true,
    });
  });
}

test('desktop header actions match the staging button height', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1644, height: 926 });
  await page.goto('/');
  for (const button of await page.locator('.header-actions .action').all()) {
    await expect(button).toBeVisible();
    expect((await button.boundingBox())!.height).toBe(40);
    await expect(button).toHaveCSS('line-height', '20px');
  }
});

test('wide desktop header uses the full width with token-owned gutters', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1919, height: 926 });
  await page.goto('/careers/');
  const geometry = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>('.header-inner')!;
    const brand = header.querySelector<HTMLElement>('.brand')!;
    const controls = header.lastElementChild as HTMLElement;
    const headerBox = header.getBoundingClientRect();
    const brandBox = brand.getBoundingClientRect();
    const controlsBox = controls.getBoundingClientRect();
    return {
      clientWidth: document.documentElement.clientWidth,
      headerLeft: headerBox.left,
      headerWidth: headerBox.width,
      brandInset: brandBox.left - headerBox.left,
      controlsInset: headerBox.right - controlsBox.right,
    };
  });
  expect(geometry.headerLeft).toBeLessThan(1);
  expect(Math.abs(geometry.headerWidth - geometry.clientWidth)).toBeLessThan(1);
  expect(geometry.brandInset).toBe(40);
  expect(geometry.controlsInset).toBe(40);
});

for (const width of [729, 390, 320]) {
  test(`statistics and testimonials stay aligned at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 926 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const cards = await page.locator('.stat').evaluateAll((elements) =>
      elements.map((element) => {
        const { x, y, width, height } = element.getBoundingClientRect();
        return { x, y, width, height };
      }),
    );
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      expect(Math.abs(card.width - cards[0].width)).toBeLessThan(1);
      expect(Math.abs(card.height - cards[0].height)).toBeLessThan(1);
    }
    if (width === 729) {
      expect(cards.every((card) => card.y === cards[0].y)).toBe(true);
      expect(cards[1].x).toBeGreaterThan(cards[0].x + cards[0].width);
    } else {
      expect(cards.every((card) => card.x === cards[0].x)).toBe(true);
      expect(cards[1].y).toBeGreaterThan(cards[0].y + cards[0].height);
    }
    const track = page.locator('#testimonial-track');
    await track.scrollIntoViewIfNeeded();
    const slide = await page.locator('[data-slide]').first().boundingBox();
    const trackBox = await track.boundingBox();
    expect(slide!.height).toBeLessThan(360);
    if (width === 729) expect(slide!.width).toBeLessThan(trackBox!.width / 2);
    else expect(slide!.width).toBeCloseTo(trackBox!.width, 0);
    await expect(page.locator('[data-slide] blockquote')).toHaveCount(6);
    const toggle = page.locator('[data-pause]');
    await expect(toggle).toBeDisabled();
    expect(
      await toggle.evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    const before = await toggle.boundingBox();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(toggle).toBeEnabled();
    await toggle.click();
    expect((await toggle.boundingBox())!.width).toBe(before!.width);
  });
}

test('keyboard disclosures restore focus and hide closed menu links', async ({
  page,
}) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Navigation menu' });
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle.locator('.menu-close')).toBeVisible();
  await expect(toggle.locator('.menu-lines')).toBeHidden();
  const nested = page.getByRole('button', { name: 'Modify Account' });
  await nested.focus();
  await page.keyboard.press('Space');
  await expect(nested).toHaveAttribute('aria-expanded', 'true');
  await expect(nested.locator('.disclosure-chevron')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Close/Freeze an Account' }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(nested).toBeFocused();
  await expect(nested).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle.locator('.menu-lines')).toBeVisible();
  await expect(toggle.locator('.menu-close')).toBeHidden();
  await page.keyboard.press('Tab');
  expect(
    await page.evaluate(
      () => document.activeElement?.closest('.menu-panel') === null,
    ),
  ).toBe(true);
  await toggle.click();
  await page.locator('h1').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('mobile menu keeps primary navigation and account actions available', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Navigation menu' });
  await toggle.click();
  const menu = page.getByRole('navigation', { name: 'More navigation' });
  const header = page.locator('.site-header');
  await expect(menu).toHaveCSS('position', 'fixed');
  await expect(page.locator('html')).toHaveAttribute(
    'data-mobile-menu-open',
    '',
  );
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  const headerBox = await header.boundingBox();
  const menuBox = await menu.boundingBox();
  expect(menuBox!.x).toBe(0);
  expect(menuBox!.width).toBe(390);
  expect(
    Math.abs(menuBox!.y - (headerBox!.y + headerBox!.height)),
  ).toBeLessThan(1);
  expect(Math.abs(menuBox!.y + menuBox!.height - 844)).toBeLessThan(1);
  await expect(
    menu.getByRole('link', { name: 'About Us', exact: true }),
  ).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Apply IPO' })).toBeVisible();
  await menu.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(toggle).toBeVisible();
  await menu.getByRole('button', { name: 'Modify Account' }).click();
  await expect(
    menu.getByRole('link', { name: 'Closing/ Modifications/ Reactivation' }),
  ).toBeVisible();
  await toggle.click();
  await expect(page.locator('html')).not.toHaveAttribute(
    'data-mobile-menu-open',
    '',
  );
});

test('carousel reaches all six quotes, pauses on interaction and resumes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const track = page.locator('#testimonial-track');
  await track.scrollIntoViewIfNeeded();
  await expect(page.locator('[data-slide]')).toHaveCount(6);
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Next testimonial' }).click();
    await expect
      .poll(() => track.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(i * 300);
    await expect(page.locator('[data-status]')).toContainText(
      `testimonials ${i + 2}`,
    );
    await expect(page.locator('[data-position]')).toHaveText(String(i + 2));
  }
  await expect(
    page.getByRole('button', { name: 'Resume autoplay' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Previous testimonial' }).click();
  await expect(page.locator('[data-status]')).toContainText('testimonials 5');
  await page.getByRole('button', { name: 'Resume autoplay' }).click();
  await expect(
    page.getByRole('button', { name: 'Pause autoplay' }),
  ).toBeVisible();
});

test('autoplay advances after five seconds and honors manual pause', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto('/');
  const track = page.locator('#testimonial-track');
  await track.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.clock.runFor(4900);
  expect(await track.evaluate((el) => el.scrollLeft)).toBe(0);
  await page.clock.runFor(900);
  await expect
    .poll(() => track.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Pause autoplay' }).click();
  await expect(
    page.getByRole('button', { name: 'Resume autoplay' }),
  ).toBeVisible();
  // Browser-native smooth scrolling uses wall time, not the mocked JS timer.
  const firstStep = await page
    .locator('[data-slide]')
    .evaluateAll(
      (slides) =>
        (slides[1] as HTMLElement).offsetLeft -
        (slides[0] as HTMLElement).offsetLeft,
    );
  await expect
    .poll(() => track.evaluate((el) => Math.round(el.scrollLeft)))
    .toBe(firstStep);
  const stoppedAt = await track.evaluate((el) => el.scrollLeft);
  await page.clock.runFor(11000);
  expect(await track.evaluate((el) => el.scrollLeft)).toBe(stoppedAt);
});

test('reduced motion disables autoplay and keeps manual controls usable', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/');
  const track = page.locator('#testimonial-track');
  await track.scrollIntoViewIfNeeded();
  await expect(
    page.getByRole('button', { name: 'Autoplay off: reduced motion' }),
  ).toBeDisabled();
  await page.clock.runFor(11000);
  expect(await track.evaluate((el) => el.scrollLeft)).toBe(0);
  await page.getByRole('button', { name: 'Next testimonial' }).click();
  expect(await track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
});

test('no-JavaScript content, disclosures and contact safety still work', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4325/');
  await expect(page.locator('.service-card')).toHaveCount(9);
  await expect(page.locator('[data-slide]')).toHaveCount(6);
  await expect(page.locator('.carousel-controls')).toBeHidden();
  await page.getByRole('button', { name: 'Navigation menu' }).click();
  await expect(
    page.getByRole('navigation', { name: 'More navigation' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Submit', exact: true }),
  ).toBeDisabled();
  await expect(page.locator('form')).toHaveCount(1);
  await expect(page.getByLabel('Name', { exact: true })).toBeDisabled();
  await context.close();
});
