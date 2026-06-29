const { test, expect } = require('@playwright/test');
const fs = require('fs/promises');
const path = require('path');

const PROMPT_PATH = path.resolve(__dirname, '..', 'test-results', 'prompt-video-gemini-demo.txt');

async function pauseVisual(page) {
  await page.waitForTimeout(300);
}

async function openCleanApp(page) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/');
  await expect(page.locator('#startAssistantButton')).toBeVisible();
  await pauseVisual(page);
}

async function expectCurrentStep(page, id) {
  await expect(page.locator('.form-section.is-current')).toHaveAttribute('id', id);
}

async function clickCurrentNext(page) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const guidedNext = page.locator('.form-section.is-current [data-content-guided="next"], .form-section.is-current [data-design-guided="next"]').last();
    const stepNext = page.locator('.form-section.is-current [data-wizard-action="next"]').last();

    if (await stepNext.isVisible().catch(() => false)) {
      await stepNext.click();
      await pauseVisual(page);
      return;
    }

    if (await guidedNext.isVisible().catch(() => false)) {
      await guidedNext.click();
      await pauseVisual(page);
      continue;
    }

    break;
  }

  await page.locator('.form-section.is-current [data-wizard-action="next"]').last().click();
  await pauseVisual(page);
}

async function goResult(page) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const currentId = await page.locator('.form-section.is-current').getAttribute('id');
    if (currentId === 'resultado') return;

    const guidedNext = page.locator('.form-section.is-current [data-content-guided="next"], .form-section.is-current [data-design-guided="next"]').last();
    if (await guidedNext.isVisible().catch(() => false)) {
      await guidedNext.click();
      await pauseVisual(page);
      continue;
    }

    const nextButton = page.locator('.form-section.is-current [data-wizard-action="next"]').last();
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    await pauseVisual(page);
  }

  await expectCurrentStep(page, 'resultado');
}

async function fillPath(page, pathName, value) {
  const field = page.locator(`input[data-path="${pathName}"], textarea[data-path="${pathName}"]`).first();
  await expect(field).toBeVisible();
  await field.fill(value);
  await pauseVisual(page);
}

async function selectPath(page, pathName, value) {
  const field = page.locator(`select[data-path="${pathName}"]`).first();
  await expect(field).toBeVisible();
  await field.selectOption(value);
  await pauseVisual(page);
}

async function selectCustomPath(page, pathName, value) {
  const select = page.locator(`select[data-path="${pathName}"]`).first();
  await expect(select).toBeVisible();

  const values = await select.locator('option').evaluateAll(options => options.map(option => option.value));
  if (values.includes(value)) {
    await select.selectOption(value);
    await pauseVisual(page);
    return;
  }

  await select.selectOption('Otro / Personalizar');
  const customInput = page.locator(`input[data-path="${pathName}"]`).first();
  await expect(customInput).toBeVisible();
  await customInput.fill(value);
  await pauseVisual(page);
}

async function openInstitutionFullForm(page) {
  const nameField = page.locator('[data-path="clinic.name"]').first();
  if (await nameField.isVisible().catch(() => false)) return;

  if (await page.locator('#createInstitutionButton').isVisible().catch(() => false)) {
    await page.locator('#createInstitutionButton').click();
    await pauseVisual(page);
  }

  if (await page.locator('[data-institution-mode="full"]').isVisible().catch(() => false)) {
    await page.locator('[data-institution-mode="full"]').click();
    await pauseVisual(page);
  }

  await expect(nameField).toBeVisible();
}

async function createDemoInstitution(page, expectedStep = 'tipo') {
  await openInstitutionFullForm(page);
  await fillPath(page, 'clinic.name', 'Centro Demo Metabolico');
  await selectCustomPath(page, 'clinic.institutionType', 'Centro médico');
  await fillPath(page, 'clinic.address', 'Av. Salud 1234, Ciudad Demo');
  await fillPath(page, 'clinic.primaryPhone', '+54 9 342 555-0101');

  const saveButton = page.locator('#saveInstitutionAndContinueButton');
  const continueButton = page.locator('#continueInstitutionWithoutSavingButton');
  if (await saveButton.isVisible().catch(() => false)) {
    await saveButton.click();
  } else {
    await continueButton.click();
  }
  await pauseVisual(page);
  await expectCurrentStep(page, expectedStep);
}

async function choosePromotionCampaign(page) {
  await expectCurrentStep(page, 'tipo');
  await page.locator('[data-piece-select="promotionCampaign"]').click();
  await pauseVisual(page);
  await expect(page.locator('[data-piece-select="promotionCampaign"]')).toHaveClass(/is-selected/);
  await clickCurrentNext(page);
  await expectCurrentStep(page, 'prestaciones');
}

async function addVisiblePoint(page, text) {
  await page.locator('[data-content-new-service]').fill(text);
  await pauseVisual(page);
  await page.locator('[data-content-add-service]').click();
  await expect(page.locator('#serviceFields .service-order-item', { hasText: text })).toBeVisible();
  await pauseVisual(page);
}

async function completeCampaignContent(page) {
  await expect(page.locator('#serviceFields .content-guided-card')).toHaveAttribute('data-content-guided-key', 'campaign-type');
  await selectPath(page, 'specialty.primaryProfessionalSpecialty', 'Diabetologia');
  await selectCustomPath(page, 'promptOptions.campaignType', 'Semana de control metabólico');
  await fillPath(page, 'promptOptions.campaignStartDate', '2026-07-06');
  await fillPath(page, 'promptOptions.campaignEndDate', '2026-07-12');

  await page.locator('#serviceFields [data-content-guided="next"]').click();
  await pauseVisual(page);
  await expect(page.locator('#serviceFields .content-guided-card')).toHaveAttribute('data-content-guided-key', 'campaign-message');
  await selectCustomPath(page, 'promptOptions.targetAudience', 'Pacientes con diabetes');
  await selectCustomPath(page, 'promptOptions.mainMessage', 'El control periódico ayuda a cuidar la salud y prevenir complicaciones.');

  await page.locator('#serviceFields [data-content-guided="next"]').click();
  await pauseVisual(page);
  await expect(page.locator('#serviceFields .content-guided-card')).toHaveAttribute('data-content-guided-key', 'conditions-cta');
  await fillPath(page, 'promptOptions.campaignConditions', 'Atención con turno previo. Cupos demo limitados.');
  await selectCustomPath(page, 'promptOptions.campaignCallToAction', 'Consultanos por WhatsApp');

  await page.locator('#serviceFields [data-content-guided="next"]').click();
  await pauseVisual(page);
  await expect(page.locator('#serviceFields .content-guided-card')).toHaveAttribute('data-content-guided-key', 'campaign-points');
  await addVisiblePoint(page, 'Controles de glucemia');
  await addVisiblePoint(page, 'Evaluación clínica breve');
  await addVisiblePoint(page, 'Orientación para seguimiento');

  await clickCurrentNext(page);
  await expectCurrentStep(page, 'diseno');
}

async function completeVideoDesign(page) {
  await expectCurrentStep(page, 'diseno');
  if (!(await page.locator('[data-video-config-panel]').isVisible().catch(() => false))) {
    for (let i = 0; i < 5; i += 1) {
      await page.locator('#designFields [data-design-guided="next"]').click();
      await pauseVisual(page);
    }

    await expect(page.locator('#designFields .design-guided-card')).toHaveAttribute('data-design-guided-key', 'animation');
    await page.locator('[data-path="promptOptions.requestAnimation"]').first().check();
    await pauseVisual(page);
  }

  await expect(page.locator('[data-video-config-panel]')).toBeVisible();

  await page.locator('[data-path="promptOptions.videoCreationMode"][value="Desde cero"]').check();
  await pauseVisual(page);
  await selectCustomPath(page, 'promptOptions.videoDestination', 'Instagram / WhatsApp vertical 9:16');
  await selectPath(page, 'promptOptions.videoDuration', '15 segundos');
  await selectPath(page, 'promptOptions.videoMotionStyle', 'Suave profesional');
  await selectCustomPath(page, 'promptOptions.videoMusic', 'Instrumental suave');
  await selectCustomPath(page, 'promptOptions.videoStructure', 'Beneficio → Servicio → Mensaje final');
  await selectCustomPath(page, 'promptOptions.videoFinalMessage', 'Consultanos por WhatsApp');
}

async function getPrompt(page) {
  const prompt = page.locator('#promptOutput');
  await expect(prompt).toBeVisible();
  await expect(prompt).not.toHaveValue('');
  return prompt.inputValue();
}

test.describe('Demo visual - prompt Gemini video desde cero', () => {
  test.setTimeout(90_000);

  test('genera y guarda un prompt de video para Gemini', async ({ page }) => {
    await openCleanApp(page);

    await page.locator('[data-media-start="video"]').click();
    await pauseVisual(page);
    await expectCurrentStep(page, 'clinica');

    await createDemoInstitution(page, 'diseno');
    await completeVideoDesign(page);
    await goResult(page);

    const prompt = await getPrompt(page);
    expect(prompt).toContain('MODO ANIMADO / VIDEO');
    expect(prompt).toContain('Duración total');
    expect(prompt).toContain('Instagram / WhatsApp vertical 9:16');
    expect(prompt).toContain('Mensaje final');
    expect(prompt).not.toContain('CTA');
    expect(prompt).toMatch(/Escenas temporizadas|Escena 1/i);

    const copyButton = page.locator('#resultado [data-copy-prompt-action]').first();
    if (await copyButton.isVisible().catch(() => false)) {
      await copyButton.click();
      await pauseVisual(page);
    }

    await fs.mkdir(path.dirname(PROMPT_PATH), { recursive: true });
    await fs.writeFile(PROMPT_PATH, prompt, 'utf8');
    console.log(`Prompt Gemini demo guardado en: ${PROMPT_PATH}`);
  });
});
