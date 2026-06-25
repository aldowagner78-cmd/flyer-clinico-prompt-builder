const { test, expect } = require('@playwright/test');

const PIECES = {
  professionalFlyer: 'Flyer profesional',
  clinicalInfographic: 'Infografía clínica',
  informativeFlyer: 'Flyer informativo',
  promotionCampaign: 'Promoción / campaña'
};

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

async function startAssistant(page) {
  await page.locator('#startAssistantButton').click();
  await expectCurrentStep(page, 'clinica');
}

async function expectCurrentStep(page, id) {
  await expect(page.locator('.form-section.is-current')).toHaveAttribute('id', id);
}

async function clickCurrentNext(page) {
  await page.locator('.form-section.is-current [data-wizard-action="next"]').last().click();
}

async function clickCurrentPrevious(page) {
  await page.locator('.form-section.is-current [data-wizard-action="previous"]').last().click();
}

async function goResult(page) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const currentId = await page.locator('.form-section.is-current').getAttribute('id');
    if (currentId === 'resultado') return;
    const nextButton = page.locator('.form-section.is-current [data-wizard-action="next"]').last();
    await expect(nextButton).toBeVisible();
    await nextButton.click();
  }
  await expectCurrentStep(page, 'resultado');
}

async function fillPath(page, path, value) {
  const field = page.locator(`[data-path="${path}"]`).first();
  await expect(field).toBeVisible();
  await field.fill(value);
}

async function selectPath(page, path, value) {
  const field = page.locator(`select[data-path="${path}"]`).first();
  await expect(field).toBeVisible();
  await field.selectOption(value);
}

async function getPrompt(page) {
  const prompt = page.locator('#promptOutput');
  await expect(prompt).toBeVisible();
  await expect(prompt).not.toHaveValue('');
  return prompt.inputValue();
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

async function fillBasicInstitution(page) {
  await openInstitutionFullForm(page);
  await fillPath(page, 'clinic.name', 'Centro Médico Rincón');
  await selectPath(page, 'clinic.institutionType', 'Centro médico');
  await fillPath(page, 'clinic.address', 'Av. San Martín 2450, San José del Rincón');
  await fillPath(page, 'clinic.primaryPhone', '342 555-2488');
}

async function continueFromInstitution(page) {
  await expectCurrentStep(page, 'clinica');
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

async function choosePiece(page, pieceType) {
  const currentId = await page.locator('.form-section.is-current').getAttribute('id');
  if (currentId === 'clinica') {
    await continueFromInstitution(page);
  }

  await expectCurrentStep(page, 'tipo');
  await page.locator(`[data-piece-select="${pieceType}"]`).click();
  await expectCurrentStep(page, 'prestaciones');
}

async function startWithPiece(page, pieceType) {
  await startAssistant(page);
  await fillBasicInstitution(page);
  await choosePiece(page, pieceType);
}

async function setOdontology(page) {
  await selectPath(page, 'specialty.primaryProfessionalSpecialty', 'Odontologia');
  await expect(page.locator('#serviceFields')).toContainText(/odontolog|bucal|dental/i);
  await expect(page.locator('#serviceFields')).not.toContainText(/cardiovascular/i);
}

function expectSingleImagePrompt(prompt) {
  expect(prompt).toMatch(/una única|una sola/i);
  expect(prompt).toMatch(/No generar alternativas/i);
  expect(prompt).not.toMatch(/exactamente 2|2 alternativas|dos alternativas|Alternativa 1|Alternativa 2/i);
}

test.describe('Etapa 10T - flujo principal', () => {
  test('la app abre, el asistente inicia en institución y usa solo 5 pasos visibles', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startAssistant(page);

    const visibleSteps = await page.locator('.step-button:not([hidden])').evaluateAll(buttons =>
      buttons.map(button => button.getAttribute('data-step-target'))
    );

    expect(visibleSteps).toEqual(['clinica', 'tipo', 'prestaciones', 'diseno', 'resultado']);
    await expect(page.locator('#pieceHome .piece-card')).toHaveCount(0);
    await expect(page.locator('#clinica .step-header-controls [data-wizard-action="home"]')).toBeVisible();
    await expect(page.locator('#clinica .section-heading [data-wizard-action="next"]')).toHaveCount(0);
    await expect(errors).toEqual([]);
  });

  test('guardar y usar institución funciona desde el flujo intuitivo', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startAssistant(page);
    await fillBasicInstitution(page);
    await fillPath(page, 'clinic.logoFileName', 'logo_rincon.png');

    await page.locator('#saveInstitutionAndContinueButton').click();
    await expect(page.locator('#statusMessage')).toContainText(/Institución guardada/i);
    await expectCurrentStep(page, 'tipo');

    await clickCurrentPrevious(page);
    await expectCurrentStep(page, 'clinica');

    const savedValue = await page.locator('#savedInstitutionSelect option', { hasText: 'Centro Médico Rincón' }).getAttribute('value');
    expect(savedValue).toBeTruthy();

    await page.locator('#savedInstitutionSelect').selectOption(savedValue);
    await expect(page.locator('#savedInstitutionSummary')).toBeVisible();
    await expect(page.locator('#savedInstitutionSummary')).toContainText('logo_rincon.png');
    await expect(page.locator('#loadInstitutionButton')).toBeVisible();

    await page.locator('#loadInstitutionButton').click();
    await expectCurrentStep(page, 'tipo');
    await expect(errors).toEqual([]);
  });

  for (const [pieceType, label] of Object.entries(PIECES)) {
    test(`el flujo de ${label} genera prompt de una sola imagen`, async ({ page }) => {
      const errors = watchBrowserErrors(page);
      await openCleanApp(page);
      await startWithPiece(page, pieceType);
      await goResult(page);

      const prompt = await getPrompt(page);
      expect(prompt).toContain(label.split(' ')[0]);
      expectSingleImagePrompt(prompt);

      if (pieceType !== 'professionalFlyer') {
        expect(prompt).not.toContain('DATOS DEL PROFESIONAL');
        expect(prompt).not.toContain('Matrícula:');
      }

      await expect(errors).toEqual([]);
    });
  }
});

test.describe('Etapa 10T - presets inteligentes por tarjeta', () => {
  const cases = [
    {
      pieceType: 'professionalFlyer',
      mustContain: ['DATOS DEL PROFESIONAL', 'Odontologia', 'Consulta odontologica', 'Limpieza dental'],
      mustNotContain: ['Prevencion cardiovascular']
    },
    {
      pieceType: 'clinicalInfographic',
      mustContain: ['CONTENIDO DE LA INFOGRAFÍA', 'Odontologia', 'Salud bucal', 'Control odontologico'],
      mustNotContain: ['DATOS DEL PROFESIONAL', 'Prevencion cardiovascular']
    },
    {
      pieceType: 'informativeFlyer',
      mustContain: ['CONTENIDO DEL FLYER INFORMATIVO', 'Odontologia', 'Consulta odontologica', 'Cuidar tus dientes'],
      mustNotContain: ['DATOS DEL PROFESIONAL', 'Prevencion cardiovascular']
    },
    {
      pieceType: 'promotionCampaign',
      mustContain: ['CONTENIDO DE LA PROMOCIÓN / CAMPAÑA', 'Odontologia', 'Agenda odontologica', 'consulta a tiempo'],
      mustNotContain: ['DATOS DEL PROFESIONAL', 'Prevencion cardiovascular']
    }
  ];

  for (const item of cases) {
    test(`${PIECES[item.pieceType]} actualiza sugerencias al elegir Odontología`, async ({ page }) => {
      const errors = watchBrowserErrors(page);
      await openCleanApp(page);
      await startWithPiece(page, item.pieceType);
      await setOdontology(page);
      await goResult(page);

      const prompt = await getPrompt(page);
      expectSingleImagePrompt(prompt);

      for (const text of item.mustContain) {
        expect(prompt).toContain(text);
      }
      for (const text of item.mustNotContain) {
        expect(prompt).not.toContain(text);
      }

      await expect(errors).toEqual([]);
    });
  }
});

test.describe('Etapa 10T - diseño y resultado', () => {
  test('el estilo Infantil está disponible en diseño', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startWithPiece(page, 'clinicalInfographic');
    await setOdontology(page);

    await clickCurrentNext(page);
    await expectCurrentStep(page, 'diseno');

    await selectPath(page, 'design.visualStyle', 'infantil');
    await goResult(page);

    const prompt = await getPrompt(page);
    expect(prompt).toMatch(/Estilo visual: infantil/i);
    expectSingleImagePrompt(prompt);
    await expect(errors).toEqual([]);
  });

  test('el prompt no contiene restos explícitos de la lógica vieja de alternativas', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startWithPiece(page, 'informativeFlyer');
    await setOdontology(page);
    await goResult(page);

    const prompt = await getPrompt(page);
    expect(prompt).not.toMatch(/Entregar 2 alternativas|exactamente 2|primera alternativa|segunda alternativa|comparativa/i);
    expect(prompt).not.toMatch(/panel dividido|mockup con varias opciones/i);
    expectSingleImagePrompt(prompt);
    await expect(errors).toEqual([]);
  });

  test('usar colores institucionales oculta los campos de color manual', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startWithPiece(page, 'promotionCampaign');

    await clickCurrentNext(page);
    await expectCurrentStep(page, 'diseno');

    const institutionalToggle = page.locator('[data-path="design.useInstitutionalColors"]').first();
    const primaryColor = page.locator('[data-path="design.primaryColor"]').first();
    const secondaryColor = page.locator('[data-path="design.secondaryColor"]').first();

    await expect(institutionalToggle).toBeVisible();

    if (await institutionalToggle.isChecked()) {
      await expect(primaryColor).toBeHidden();
      await expect(secondaryColor).toBeHidden();

      await institutionalToggle.uncheck();
      await expect(primaryColor).toBeVisible();
      await expect(secondaryColor).toBeVisible();
    } else {
      await expect(primaryColor).toBeVisible();
      await expect(secondaryColor).toBeVisible();
    }

    await institutionalToggle.check();
    await expect(primaryColor).toBeHidden();
    await expect(secondaryColor).toBeHidden();

    await institutionalToggle.uncheck();
    await expect(primaryColor).toBeVisible();
    await expect(secondaryColor).toBeVisible();

    await expect(errors).toEqual([]);
  });
});

test.describe('Etapa 11A - adjuntos por selector local', () => {
  test('completa nombres de logo, foto profesional e imagen personalizada sin subir archivos', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startAssistant(page);
    await openInstitutionFullForm(page);

    await page.locator('[data-file-target="clinic.logoFileName"]').setInputFiles({
      name: 'logo_rincon.png',
      mimeType: 'image/png',
      buffer: Buffer.from('logo')
    });
    await expect(page.locator('[data-path="clinic.logoFileName"]').first()).toHaveValue('logo_rincon.png');

    await choosePiece(page, 'professionalFlyer');
    const showPhotoToggle = page.locator('[data-path="professional.showPhoto"]').first();
    if (!(await showPhotoToggle.isChecked())) await showPhotoToggle.check();
    await expect(page.locator('[data-file-target="professional.photoFileName"]')).toBeVisible();
    await page.locator('[data-file-target="professional.photoFileName"]').setInputFiles({
      name: 'foto_profesional.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('foto')
    });
    await expect(page.locator('[data-path="professional.photoFileName"]').first()).toHaveValue('foto_profesional.jpg');

    await clickCurrentNext(page);
    await expectCurrentStep(page, 'diseno');
    await page.locator('#addCustomAttachmentButton').click();
    await page.locator('[data-attachment-file]').last().setInputFiles({
      name: 'referencia_visual.webp',
      mimeType: 'image/webp',
      buffer: Buffer.from('referencia')
    });

    await goResult(page);
    const prompt = await getPrompt(page);
    expect(prompt).toContain('Logo de clínica: logo_rincon.png');
    expect(prompt).toContain('Foto profesional: foto_profesional.jpg');
    expect(prompt).toContain('Imagen temática: referencia_visual.webp');
    await expect(errors).toEqual([]);
  });
});

test.describe('Etapa 11C - UX de institución y navegación', () => {
  test('formulario completo muestra redes sociales antes de los botones finales', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startAssistant(page);
    await openInstitutionFullForm(page);

    const inlineSocial = page.locator('#clinicSocialLinksEditor');
    const finalActions = page.locator('.institution-final-actions');
    await expect(inlineSocial).toBeVisible();
    await expect(finalActions).toBeVisible();
    await expect(inlineSocial).toContainText('Redes sociales');

    const socialBeforeActions = await page.evaluate(() => {
      const social = document.querySelector('#clinicSocialLinksEditor');
      const actions = document.querySelector('.institution-final-actions');
      return Boolean(social && actions && (social.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING));
    });

    expect(socialBeforeActions).toBe(true);
    await expect(errors).toEqual([]);
  });

  test('tarjeta guiada de redes muestra el editor directo sin bloque explicativo redundante', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startAssistant(page);
    await page.locator('#createInstitutionButton').click();
    await page.locator('[data-institution-mode="guided"]').click();

    for (let i = 0; i < 5; i += 1) {
      await page.locator('[data-institution-guided="next"]').click();
    }

    await expect(page.locator('.guided-card[data-guided-key="social"]')).toBeVisible();
    await expect(page.locator('#clinicSocialLinksEditor')).toBeVisible();
    await expect(page.locator('#clinicSocialLinksEditor')).toContainText('Redes sociales');
    await expect(page.locator('#clinicSocialLinksEditor')).toContainText('Agregar red');
    await expect(page.locator('.guided-card[data-guided-key="social"]')).not.toContainText('Editor de redes sociales');
    await expect(errors).toEqual([]);
  });

  test('frase institucional tiene opciones predefinidas y opción personalizada', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startAssistant(page);
    await openInstitutionFullForm(page);

    const phraseSelect = page.locator('select[data-path="clinic.institutionalPhrase"]').first();
    await expect(phraseSelect).toBeVisible();

    const options = await phraseSelect.locator('option').evaluateAll(items => items.map(item => item.textContent.trim()));
    expect(options).toContain('Cuidamos tu salud, acompañamos tu vida');
    expect(options).toContain('Atención humana, profesional y cercana');
    expect(options).toContain('Otro / Personalizar');
    expect(options.length).toBeGreaterThanOrEqual(11);

    await phraseSelect.selectOption('Otro / Personalizar');
    const customInput = page.locator('input[data-path="clinic.institutionalPhrase"]').first();
    await expect(customInput).toBeVisible();
    await customInput.fill('Frase personalizada de prueba');
    await expect(customInput).toHaveValue('Frase personalizada de prueba');
    await expect(errors).toEqual([]);
  });

  test('logo institucional solo muestra selector de archivo y no instrucción interna', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startAssistant(page);
    await openInstitutionFullForm(page);

    await expect(page.locator('[data-file-target="clinic.logoFileName"]')).toBeVisible();
    await expect(page.locator('[data-path="clinic.logoInstruction"]')).toHaveCount(0);
    await expect(errors).toEqual([]);
  });

  test('crear nueva institución queda visualmente destacado', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startAssistant(page);

    const createButton = page.locator('#createInstitutionButton');
    await expect(createButton).toBeVisible();
    await expect(createButton).toHaveClass(/institution-create-button/);

    const styles = await createButton.evaluate(button => {
      const computed = window.getComputedStyle(button);
      return {
        background: computed.backgroundImage || computed.backgroundColor,
        color: computed.color
      };
    });

    expect(styles.background).not.toBe('none');
    expect(errors).toEqual([]);
  });
});
