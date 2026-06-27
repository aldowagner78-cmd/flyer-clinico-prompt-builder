const { test, expect } = require('@playwright/test');

const BROKEN_TEXT_RE = /[Ãâï�]/;

function watchBrowserErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

async function openCleanApp(page) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/');
  await expect(page.locator('#startAssistantButton')).toBeVisible();
}

async function expectCurrentStep(page, id) {
  await expect(page.locator('.form-section.is-current')).toHaveAttribute('id', id);
}

async function expectNoBrokenVisibleText(page) {
  const visibleText = await page.locator('body').innerText();
  expect(visibleText).not.toMatch(BROKEN_TEXT_RE);
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    bodyOverflow: document.body.scrollWidth - document.body.clientWidth
  }));
  expect(overflow.documentOverflow).toBeLessThanOrEqual(2);
  expect(overflow.bodyOverflow).toBeLessThanOrEqual(2);
}

async function startAssistant(page) {
  await page.locator('#startAssistantButton').click();
  await expectCurrentStep(page, 'clinica');
}

async function openInstitutionFullForm(page) {
  const nameField = page.locator('[data-path="clinic.name"]').first();
  if (await nameField.isVisible().catch(() => false)) return;

  if (await page.locator('#createInstitutionButton').isVisible().catch(() => false)) {
    await page.locator('#createInstitutionButton').click();
  }

  if (await page.locator('[data-institution-mode="full"]').isVisible().catch(() => false)) {
    await page.locator('[data-institution-mode="full"]').click();
  }

  await expect(nameField).toBeVisible();
}

async function fillPath(page, pathName, value) {
  const field = page.locator(`input[data-path="${pathName}"], textarea[data-path="${pathName}"]`).first();
  await expect(field).toBeVisible();
  await field.fill(value);
}

async function selectPath(page, pathName, value) {
  const field = page.locator(`select[data-path="${pathName}"]`).first();
  await expect(field).toBeVisible();
  await field.selectOption(value);
}

async function fillBasicInstitution(page) {
  await openInstitutionFullForm(page);
  await fillPath(page, 'clinic.name', 'Centro QA Final');
  await selectPath(page, 'clinic.institutionType', 'Centro médico');
  await fillPath(page, 'clinic.primaryPhone', '342 555-0199');
}

async function continueFromInstitution(page) {
  const continueButton = page.locator('#continueInstitutionWithoutSavingButton');
  const saveButton = page.locator('#saveInstitutionAndContinueButton');

  if (await continueButton.isVisible().catch(() => false)) {
    await continueButton.click();
  } else if (await saveButton.isVisible().catch(() => false)) {
    await saveButton.click();
  } else {
    await clickCurrentNext(page);
  }

  await expectCurrentStep(page, 'tipo');
}

async function clickCurrentNext(page) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const guidedNext = page.locator('.form-section.is-current [data-content-guided="next"], .form-section.is-current [data-design-guided="next"]').last();
    const stepNext = page.locator('.form-section.is-current [data-wizard-action="next"]').last();

    if (await stepNext.isVisible().catch(() => false)) {
      await stepNext.click();
      return;
    }

    if (await guidedNext.isVisible().catch(() => false)) {
      await guidedNext.click();
      continue;
    }

    break;
  }

  await page.locator('.form-section.is-current [data-wizard-action="next"]').last().click();
}

async function choosePiece(page, pieceType) {
  await expectCurrentStep(page, 'tipo');
  await page.locator(`[data-piece-select="${pieceType}"]`).click();
  await expect(page.locator(`[data-piece-select="${pieceType}"]`)).toHaveClass(/is-selected/);
  await clickCurrentNext(page);
  await expectCurrentStep(page, 'prestaciones');
}

async function goResult(page) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const currentId = await page.locator('.form-section.is-current').getAttribute('id');
    if (currentId === 'resultado') return;

    const guidedNext = page.locator('.form-section.is-current [data-content-guided="next"], .form-section.is-current [data-design-guided="next"]').last();
    if (await guidedNext.isVisible().catch(() => false)) {
      await guidedNext.click();
      continue;
    }

    const nextButton = page.locator('.form-section.is-current [data-wizard-action="next"]').last();
    await expect(nextButton).toBeVisible();
    await nextButton.click();
  }

  await expectCurrentStep(page, 'resultado');
}

async function startWithPiece(page, pieceType) {
  await openCleanApp(page);
  await startAssistant(page);
  await fillBasicInstitution(page);
  await continueFromInstitution(page);
  await choosePiece(page, pieceType);
}

test.describe('QA final smoke', () => {
  test('carga, mantiene textos limpios y expone Odont. en flyer profesional', async ({ page }) => {
    const errors = watchBrowserErrors(page);

    await openCleanApp(page);
    await expectNoBrokenVisibleText(page);
    await expectNoHorizontalOverflow(page);

    await startAssistant(page);
    await expectNoBrokenVisibleText(page);
    await expect(page.locator('.side-panel')).toBeHidden();

    const homeButton = page.locator('#clinica [data-wizard-action="home"]').first();
    await expect(homeButton).toBeVisible();
    await expect(homeButton).toContainText('Inicio');
    expect(await homeButton.innerText()).not.toMatch(BROKEN_TEXT_RE);

    await fillBasicInstitution(page);
    await continueFromInstitution(page);
    await choosePiece(page, 'professionalFlyer');

    const titleSelect = page.locator('select[data-path="professional.title"]').first();
    await expect(titleSelect).toBeVisible();
    const titleOptions = await titleSelect.locator('option').evaluateAll(options => options.map(option => option.textContent.trim()));
    expect(titleOptions).toContain('Odont.');

    await expectNoBrokenVisibleText(page);
    await expectNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

  test('verifica campaña, video, adjuntos, plataformas y resultado', async ({ page }) => {
    const errors = watchBrowserErrors(page);

    await startWithPiece(page, 'promotionCampaign');
    await expect(page.locator('.side-panel')).toBeHidden();
    await expectNoBrokenVisibleText(page);

    await expect(page.locator('input[type="date"][data-path="promptOptions.campaignStartDate"]').first()).toBeVisible();
    await expect(page.locator('input[type="date"][data-path="promptOptions.campaignEndDate"]').first()).toBeVisible();

    await clickCurrentNext(page);
    await expectCurrentStep(page, 'diseno');

    for (let i = 0; i < 5; i += 1) {
      await page.locator('#designFields [data-design-guided="next"]').click();
    }

    await expect(page.locator('#designFields .design-guided-card')).toHaveAttribute('data-design-guided-key', 'animation');
    await page.locator('[data-path="promptOptions.requestAnimation"]').first().check();

    const videoPanel = page.locator('[data-video-config-panel]');
    await expect(videoPanel).toBeVisible();
    await expect(videoPanel).toContainText('Configuración rápida de video');
    await expect(videoPanel).toContainText('Desde cero');
    await expect(videoPanel).toContainText('Basado en material');
    await expect(videoPanel).toContainText('Híbrido');
    await expect(videoPanel).toContainText('Mensaje final');

    const visibleVideoText = await page.locator('body').innerText();
    expect(visibleVideoText).not.toMatch(/\bCTA\b/);

    await page.locator('[data-path="promptOptions.videoCreationMode"][value="Basado en material"]').check();
    await expect(page.locator('.video-material-panel')).toBeVisible();
    await page.locator('.video-material-panel input[data-multiple-attachment-file="videoBase"]').setInputFiles({
      name: 'qa-video-base.mp4',
      mimeType: 'video/mp4',
      buffer: Buffer.from('qa-video')
    });
    await expect(page.locator('.video-material-panel')).toContainText('qa-video-base.mp4');

    await page.locator('#designFields [data-design-guided="next"]').click();
    await expect(page.locator('#designFields .design-guided-card')).toHaveAttribute('data-design-guided-key', 'images');
    await expect(page.locator('#designFields')).toContainText('Imágenes/videos personalizados para Gemini');

    await expectNoBrokenVisibleText(page);
    await goResult(page);
    await expectCurrentStep(page, 'resultado');

    await expect(page.locator('#copyPromptButton')).toContainText(/Copiar prompt/i);
    for (const platform of ['ChatGPT', 'Gemini', 'CapCut', 'Canva']) {
      await expect(page.locator(`[data-open-platform][data-platform-name="${platform}"]`)).toBeVisible();
    }

    const moreActions = page.locator('#resultado .more-actions summary').first();
    await expect(moreActions).toBeVisible();
    const plusContent = await moreActions.evaluate(node => window.getComputedStyle(node, '::before').content);
    expect(plusContent).toContain('+');

    const prompt = page.locator('#promptOutput');
    await expect(prompt).toBeVisible();
    await expect(prompt).not.toHaveValue('');
    const promptText = await prompt.inputValue();
    expect(promptText).toContain('qa-video-base.mp4');
    expect(promptText).toContain('pedilos por nombre exacto');

    const fixButtons = page.locator('#warnings [data-fix-issue-path]');
    const fixCount = await fixButtons.count();
    if (fixCount > 0) {
      await expect(fixButtons.first()).toContainText('Corregir');
    }

    const resultVisibleText = await page.locator('#resultado').innerText();
    expect(resultVisibleText).not.toMatch(/\bCTA\b/);
    await expectNoBrokenVisibleText(page);
    await expectNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });
});
