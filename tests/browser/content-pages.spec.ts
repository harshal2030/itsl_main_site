import { test, expect } from './fixtures';

test('Mutual Funds flight is a static, non-interactive overlay across the heading and cards', async ({
  page,
}, testInfo) => {
  await page.goto('/mutual-funds/');
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1920, 1679, 1327, 1081, 768, 729, 390, 320]) {
    await page.setViewportSize({ width, height: 926 });
    const artwork = page.locator('.nri-flight-plane');
    await artwork.scrollIntoViewIfNeeded();
    await artwork.evaluate((img) => (img as HTMLImageElement).decode());
    const layout = await page.locator('.nri-support').evaluate((section) => {
      const title = section.querySelector('h2')!.getBoundingClientRect();
      const image = section.querySelector('img')!.getBoundingClientRect();
      const overlay = section.querySelector('.nri-flight')!;
      const track = overlay.getBoundingClientRect();
      const cardList = section.querySelector('.nri-cards')!;
      const cards = cardList.getBoundingClientRect();
      return {
        cardsGap: cards.top - title.bottom,
        imageHeight: image.height,
        imageWidth: image.width,
        overlapsHeading: track.top < title.bottom && track.bottom > title.top,
        overlapsCards: track.top < cards.bottom && track.bottom > cards.top,
        isAboveContent:
          Number(getComputedStyle(overlay).zIndex) >
          Number(getComputedStyle(cardList).zIndex),
        pointerEvents: getComputedStyle(overlay).pointerEvents,
        animations: section.getAnimations({ subtree: true }).length,
        planeContained:
          image.top >= track.top &&
          image.bottom <= track.bottom &&
          image.left >= track.left &&
          image.right <= track.right,
        hasOverflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(layout.cardsGap, `Heading/card spacing at ${width}px`).toBe(60);
    expect(layout.overlapsHeading).toBe(true);
    expect(layout.overlapsCards).toBe(true);
    expect(layout.isAboveContent).toBe(true);
    expect(layout.pointerEvents).toBe('none');
    expect(layout.animations).toBe(0);
    expect(layout.imageWidth).toBe(64);
    expect(layout.imageHeight).toBe(64);
    expect(layout.planeContained).toBe(true);
    await expect(page.locator('.nri-flight')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(page.locator('.nri-flight-path path')).toHaveAttribute(
      'vector-effect',
      'non-scaling-stroke',
    );
    expect(layout.hasOverflow).toBe(false);
    await page.locator('.nri-support').screenshot({
      path: testInfo.outputPath(`nri-flight-${width}.png`),
    });
  }
});

test('About Us has a full-viewport photo and a translucent header background only', async ({
  page,
}, testInfo) => {
  for (const width of [1327, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 926 });
    await page.goto('/about-us/');
    await page.evaluate(() => document.fonts.ready);
    await page
      .locator('.hero-photo')
      .evaluate((img) => (img as HTMLImageElement).decode());
    const layout = await page.locator('.about-hero').evaluate((hero) => {
      const rect = hero.getBoundingClientRect();
      const photo = hero.querySelector('img')!.getBoundingClientRect();
      return {
        top: rect.top,
        height: rect.height,
        viewport: innerHeight,
        photoWidth: photo.width,
        width: rect.width,
        photoHeight: photo.height,
      };
    });
    expect(layout.top).toBe(0);
    expect(layout.height).toBe(layout.viewport);
    expect(layout.photoWidth).toBe(layout.width);
    expect(layout.photoHeight).toBe(layout.height);
    await expect(page.locator('.hero-photo')).toHaveCSS('object-fit', 'cover');
    await expect(page.locator('.site-header')).toHaveCSS(
      'background-color',
      'rgba(255, 255, 255, 0.5)',
    );
    await expect(page.locator('.site-header')).toHaveCSS('opacity', '1');
    await page.screenshot({
      path: testInfo.outputPath(`about-fullscreen-${width}.png`),
    });
    await page.evaluate(() => scrollTo(0, 400));
    await expect
      .poll(() =>
        page
          .locator('.site-header')
          .evaluate((header) => header.getBoundingClientRect().top),
      )
      .toBe(0);
    await page.getByRole('button', { name: 'Navigation menu' }).click();
    await expect(page.locator('.menu-panel')).toHaveCSS(
      'background-color',
      'rgb(255, 255, 255)',
    );
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('button', { name: 'Navigation menu' }),
    ).toBeFocused();
  }
  for (const route of ['/', '/mutual-funds/']) {
    await page.goto(route);
    await expect(page.locator('.site-header')).toHaveCSS(
      'background-color',
      'rgb(255, 255, 255)',
    );
    await expect(page.locator('.site-header')).not.toHaveClass(
      /site-header--about/,
    );
  }
});

for (const route of ['about-us', 'mutual-funds']) {
  for (const width of [1280, 768, 729, 390, 320]) {
    test(`${route} has no overflow or missing assets at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('response', (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`);
      });
      await page.goto(`/${route}/`);
      await page.evaluate(() => document.fonts.ready);
      for (const img of await page.locator('main img, footer img').all()) {
        await img.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            img.evaluate(
              (image) =>
                (image as HTMLImageElement).complete &&
                (image as HTMLImageElement).naturalWidth > 0,
            ),
          )
          .toBe(true);
      }
      expect(errors).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(page.locator('main h1')).toHaveCSS(
        'font-family',
        'Raleway, Arial, sans-serif',
      );
      const heroSize =
        route === 'about-us'
          ? width >= 1024
            ? 80
            : width >= 768
              ? 60
              : 40
          : width >= 1024
            ? 80
            : width >= 768
              ? 60
              : 44;
      await expect(page.locator('main h1')).toHaveCSS(
        'font-size',
        `${heroSize}px`,
      );
      const spacing = await page.locator('main').evaluate((main) => {
        const sections = Array.from(main.children).filter(
          (node) => node.tagName === 'SECTION',
        );
        return {
          gap: Number.parseFloat(getComputedStyle(main).rowGap),
          footerGap:
            document.querySelector('footer')!.getBoundingClientRect().top -
            sections.at(-1)!.getBoundingClientRect().bottom,
          distances: sections
            .slice(1)
            .map(
              (node, i) =>
                node.getBoundingClientRect().top -
                sections[i].getBoundingClientRect().bottom,
            ),
        };
      });
      const expectedGap = width > 1024 ? 128 : width >= 768 ? 96 : 72;
      expect(spacing.gap).toBe(expectedGap);
      expect(Math.abs(spacing.footerGap - expectedGap)).toBeLessThan(1);
      for (const distance of spacing.distances)
        expect(Math.abs(distance - spacing.gap)).toBeLessThan(1);
      if (route === 'about-us') {
        await expect(page.locator('.director-card')).toHaveCount(6);
        await expect(page.locator('.gallery-grid img')).toHaveCount(5);
        const source = await page
          .locator('[aria-labelledby="milestones-title"] img')
          .evaluate((img) => (img as HTMLImageElement).currentSrc);
        expect(source).toContain(width < 768 ? 'milestone-mob' : 'milestone.');
        const transcript = page.locator(
          width < 768 ? '.mobile-transcript' : '.desktop-transcript',
        );
        const otherTranscript = page.locator(
          width < 768 ? '.desktop-transcript' : '.mobile-transcript',
        );
        await expect(transcript).toHaveCSS('display', 'block');
        await expect(otherTranscript).toHaveCSS('display', 'none');
        await expect(transcript.locator('li')).toHaveCount(11);
      } else {
        await expect(page.locator('.investment-steps li')).toHaveCount(5);
        await expect(page.locator('.benefit-cards li')).toHaveCount(6);
        await expect(page.locator('.nri-cards li')).toHaveCount(6);
        if (width === 1280) {
          for (const action of await page
            .locator('.content-blue .action-outline')
            .all()) {
            const normalColor = await action.evaluate(
              (el) => getComputedStyle(el).color,
            );
            await action.hover();
            await expect(action).toHaveCSS('background-color', normalColor);
            expect(
              await action.evaluate((el) => getComputedStyle(el).color),
            ).not.toBe(normalColor);
          }
        }
        const source = await page
          .locator('.investment-art img')
          .evaluate((img) => (img as HTMLImageElement).currentSrc);
        expect(source).toContain(width < 768 ? 'mutual-funds-mob' : 'fund.');
      }
      await page.screenshot({
        path: testInfo.outputPath(`${route}-${width}.png`),
        fullPage: true,
      });
    });
  }

  test(`${route} supports local navigation, current-page state and keyboard dismissal`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${route}/`);
    const toggle = page.getByRole('button', { name: 'Navigation menu' });
    await toggle.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('navigation', { name: 'More navigation' });
    await expect(menu.locator('[aria-current="page"]')).toHaveAttribute(
      'href',
      `/${route}/`,
    );
    const nested = menu.getByRole('button', { name: 'Modify Account' });
    await nested.focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('Tab');
    await expect(
      menu.getByRole('link', { name: 'Close/Freeze an Account' }),
    ).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(nested).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Tab');
    expect(
      await page.evaluate(
        () => document.activeElement?.closest('.menu-panel') === null,
      ),
    ).toBe(true);
    await toggle.click();
    const headerBounds = await page.locator('.header-inner').boundingBox();
    await page.mouse.click(
      headerBounds!.x + headerBounds!.width / 2,
      headerBounds!.y + headerBounds!.height / 2,
    );
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await menu.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL('/');
    await toggle.click();
    await menu
      .getByRole('link', {
        name: route === 'about-us' ? 'About Us' : 'Mutual Funds',
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(`/${route}/`);
  });

  test(`${route} remains readable without JavaScript and with reduced motion`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      reducedMotion: 'reduce',
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto(`${baseURL}/${route}/`);
    for (const section of await page.locator('main > section').all()) {
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();
      await expect(section.locator('h1, h2').first()).toBeVisible();
      await expect(section).toHaveCSS('opacity', '1');
    }
    await page.getByRole('button', { name: 'Navigation menu' }).click();
    await expect(
      page.getByRole('navigation', { name: 'More navigation' }),
    ).toBeVisible();
    await expect(page.locator('form')).toHaveCount(
      route === 'mutual-funds' ? 1 : 0,
    );
    if (route === 'mutual-funds')
      await expect(
        page.getByRole('button', { name: 'Submit', exact: true }),
      ).toBeDisabled();
    else await expect(page.locator('.mobile-transcript li')).toHaveCount(11);
    await context.close();
  });
}

test('Privacy Policy preserves its legal copy and responsive reading layout', async ({
  page,
}, testInfo) => {
  for (const width of [1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/privacy-policy/');
    await page.evaluate(() => document.fonts.ready);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Privacy Policy',
    );
    await expect(page.locator('.privacy-copy p')).toHaveCount(8);
    await expect(
      page.getByText(
        'The personal data of customers and web site visitors is stored indefinitely',
        { exact: false },
      ),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /http:\/\/www\.indothai\.co\.in/ }),
    ).toHaveAttribute('target', '_blank');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      await page
        .locator('.privacy-copy')
        .evaluate((copy) => copy.getBoundingClientRect().width <= innerWidth),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`privacy-policy-${width}.png`),
      fullPage: true,
    });
  }
});
