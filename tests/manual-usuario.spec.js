const { test, expect } = require('@playwright/test');

function watchBrowserErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test.describe('Manual de usuario interactivo', () => {
  test('se abre desde la app en nueva pestaña y permite navegar secciones', async ({ page, context }) => {
    const errors = watchBrowserErrors(page);

    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('fcpb-ui-theme-color', 'green');
      localStorage.setItem('fcpb-ui-theme-mode', 'light');
    });
    const manualLink = page.locator('a[href="docs/manual-usuario.html"]').first();
    await expect(manualLink).toBeVisible();
    await expect(manualLink).toHaveAttribute('target', '_blank');

    const [manualPage] = await Promise.all([
      context.waitForEvent('page'),
      manualLink.click()
    ]);

    const manualErrors = watchBrowserErrors(manualPage);
    await manualPage.waitForLoadState('domcontentloaded');

    await expect(manualPage).toHaveTitle(/Manual de usuario/i);
    await expect(manualPage.locator('h1')).toContainText(/Usá la app/i);
    await expect.poll(async () => manualPage.locator('html').evaluate(element => getComputedStyle(element).getPropertyValue('--accent').trim())).toBe('#16a34a');
    await expect(manualPage.locator('nav[aria-label="Secciones del manual"]')).toContainText(/Instalar como app/i);
    await expect(manualPage.locator('#video')).toContainText(/Video o animación/i);
    await expect(manualPage.locator('#resultado')).toContainText(/ChatGPT/i);
    await expect(manualPage.locator('#resultado')).toContainText(/Gemini/i);
    await expect(manualPage.locator('#resultado')).toContainText(/CapCut/i);
    await expect(manualPage.locator('#resultado')).toContainText(/Canva/i);

    await manualPage.locator('a[href="#adjuntos"]').click();
    await expect(manualPage.locator('#adjuntos')).toBeVisible();

    const bodyText = await manualPage.locator('body').innerText();
    expect(bodyText).not.toMatch(/[ÃÂ�]/);
    expect(errors).toEqual([]);
    expect(manualErrors).toEqual([]);
  });
});
