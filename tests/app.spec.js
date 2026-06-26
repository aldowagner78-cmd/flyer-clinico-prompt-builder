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

async function clickCurrentPrevious(page) {
  await page.locator('.form-section.is-current [data-wizard-action="previous"]').last().click();
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
  await expect(page.locator('.form-section.is-current [data-wizard-action="next"]').last()).toBeDisabled();
  await page.locator(`[data-piece-select="${pieceType}"]`).click();
  await expectCurrentStep(page, 'tipo');
  await expect(page.locator(`[data-piece-select="${pieceType}"]`)).toHaveClass(/is-selected/);
  await expect(page.locator('#pieceFields')).toContainText(/Tipo seleccionado/i);
  await clickCurrentNext(page);
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
    await selectPath(page, 'clinic.institutionalPhrase', 'Tu salud, cerca de vos');

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
    await expect(page.locator('#savedInstitutionSummary')).toContainText('Tu salud, cerca de vos');
    await expect(page.locator('#savedInstitutionSummary')).not.toContainText('Sin frase institucional');
    await expect(page.locator('#loadInstitutionButton')).toBeVisible();

    await page.locator('#loadInstitutionButton').click();
    await expectCurrentStep(page, 'tipo');
    await expect(errors).toEqual([]);
  });

  test('tipo de pieza se confirma antes de avanzar a contenido', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startAssistant(page);
    await fillBasicInstitution(page);
    await continueFromInstitution(page);

    await expectCurrentStep(page, 'tipo');
    const nextButton = page.locator('.form-section.is-current [data-wizard-action="next"]').last();
    await expect(nextButton).toBeDisabled();
    await expect(page.locator('#pieceFields')).toContainText(/Elegí el tipo de pieza/i);

    await page.locator('[data-piece-select="promotionCampaign"]').click();
    await expectCurrentStep(page, 'tipo');
    await expect(page.locator('[data-piece-select="promotionCampaign"]')).toHaveClass(/is-selected/);
    await expect(page.locator('#pieceFields')).toContainText(/Promoción \/ campaña/i);
    await expect(nextButton).toBeEnabled();

    await nextButton.click();
    await expectCurrentStep(page, 'prestaciones');
    expect(errors).toEqual([]);
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
    await page.locator('#designFields [data-design-guided="next"]').click();
    await page.locator('#designFields [data-design-guided="next"]').click();
    await expect(page.locator('#designFields .design-guided-card')).toHaveAttribute('data-design-guided-key', 'style');

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
    await page.locator('#designFields [data-design-guided="next"]').click();
    await expect(page.locator('#designFields .design-guided-card')).toHaveAttribute('data-design-guided-key', 'colors');

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
    await page.locator('#designFields [data-design-mode="full"]').click();
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

test.describe('Mejora funcional - adjuntos múltiples', () => {
  test('captura varios archivos personalizados y los lista en prompt y checklist', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startWithPiece(page, 'informativeFlyer');

    await clickCurrentNext(page);
    await expectCurrentStep(page, 'diseno');
    await page.locator('#designFields [data-design-mode="full"]').click();

    const multiPicker = page.locator('[data-multiple-attachment-file="thematicImage"]').first();
    await expect(multiPicker).toBeVisible();
    await expect(page.locator('#designFields')).toContainText('Adjuntar archivos');
    await multiPicker.setInputFiles([
      {
        name: 'referencia_frente.png',
        mimeType: 'image/png',
        buffer: Buffer.from('referencia-frente')
      },
      {
        name: 'referencia_color.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('referencia-color')
      }
    ]);

    await expect(page.locator('#designFields')).toContainText('referencia_frente.png');
    await expect(page.locator('#designFields')).toContainText('referencia_color.jpg');
    await expect(page.locator('#designFields')).toContainText('Paleta de colores');
    await expect(page.locator('#designFields')).toContainText('Inspirarse sin copiar');
    await expect(page.locator('[data-attachment-instruction-select]').first()).toBeVisible();
    await expect(page.locator('#designFields .attachment-file-button')).toHaveCount(0);

    const storedAttachmentNames = await page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem('flyerClinicoPromptBuilder.state') || '{}');
      return (stored.attachments?.items || []).map(item => item.fileName);
    });
    expect(storedAttachmentNames).not.toContain('referencia_frente.png');
    expect(storedAttachmentNames).not.toContain('referencia_color.jpg');

    await goResult(page);

    const prompt = await getPrompt(page);
    expect(prompt).toContain('Imagen temática: referencia_frente.png');
    expect(prompt).toContain('Imagen temática: referencia_color.jpg');
    expect(prompt).toMatch(/pedilos por nombre exacto/i);
    expect(prompt).toMatch(/No generes la pieza hasta recibir/i);

    const checklist = page.locator('#attachmentsChecklist');
    await expect(checklist).toContainText('referencia_frente.png');
    await expect(checklist).toContainText('referencia_color.jpg');
    await expect(checklist).toContainText(/pedilo por nombre exacto/i);

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

test.describe('Etapa 11D.2 - contenido guiado', () => {
  const guidedCases = [
    {
      pieceType: 'professionalFlyer',
      card: 'professional',
      expectedText: /Profesional/i,
      fullField: 'professional.fullName'
    },
    {
      pieceType: 'clinicalInfographic',
      card: 'topic',
      expectedText: /Tema de la infografía/i,
      fullField: 'promptOptions.educationalTopic'
    },
    {
      pieceType: 'informativeFlyer',
      card: 'info-type',
      expectedText: /Tipo de información/i,
      fullField: 'promptOptions.contentGoal'
    },
    {
      pieceType: 'promotionCampaign',
      card: 'campaign-type',
      expectedText: /Tipo de campaña/i,
      fullField: 'promptOptions.campaignType'
    }
  ];

  for (const item of guidedCases) {
    test(`${PIECES[item.pieceType]} muestra contenido guiado y respaldo de formulario completo`, async ({ page }) => {
      const errors = watchBrowserErrors(page);
      await openCleanApp(page);
      await startWithPiece(page, item.pieceType);

      const contentCard = page.locator('#serviceFields .content-guided-card');
      await expect(contentCard).toBeVisible();
      await expect(contentCard).toHaveAttribute('data-content-guided-key', item.card);
      await expect(contentCard).toContainText(item.expectedText);
      await expect(page.locator('#serviceFields [data-content-mode="full"]')).toBeVisible();

      await page.locator('#serviceFields [data-content-mode="full"]').click();
      await expect(page.locator('#serviceFields .content-mode-panel')).toBeVisible();
      await expect(page.locator(`[data-path="${item.fullField}"]`).first()).toBeVisible();

      await page.locator('#serviceFields [data-content-mode="guided"]').click();
      await expect(page.locator('#serviceFields .content-guided-card')).toBeVisible();
      await expect(errors).toEqual([]);
    });
  }

  test('las tarjetas guiadas de contenido avanzan sin cambiar de paso principal', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startWithPiece(page, 'professionalFlyer');

    await expectCurrentStep(page, 'prestaciones');
    await expect(page.locator('#serviceFields .content-guided-card')).toHaveAttribute('data-content-guided-key', 'professional');

    await page.locator('#serviceFields [data-content-guided="next"]').click();
    await expectCurrentStep(page, 'prestaciones');
    await expect(page.locator('#serviceFields .content-guided-card')).toHaveAttribute('data-content-guided-key', 'specialty');

    await page.locator('#serviceFields [data-content-guided="next"]').click();
    await expect(page.locator('#serviceFields .content-guided-card')).toHaveAttribute('data-content-guided-key', 'services');
    await expect(page.locator('#serviceFields')).toContainText(/Prestaciones sugeridas/i);

    await expect(errors).toEqual([]);
  });

  test('promoción muestra puntos visibles solo dentro de su tarjeta guiada', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startWithPiece(page, 'promotionCampaign');

    await expectCurrentStep(page, 'prestaciones');
    await expect(page.locator('#serviceFields .content-guided-card')).toHaveAttribute('data-content-guided-key', 'campaign-type');
    await expect(page.locator('[data-visible-services-editor]')).toBeHidden();

    await page.locator('#serviceFields [data-content-guided="next"]').click();
    await expect(page.locator('#serviceFields .content-guided-card')).toHaveAttribute('data-content-guided-key', 'campaign-message');
    await expect(page.locator('[data-visible-services-editor]')).toBeHidden();

    await page.locator('#serviceFields [data-content-guided="next"]').click();
    await expect(page.locator('#serviceFields .content-guided-card')).toHaveAttribute('data-content-guided-key', 'conditions-cta');
    await expect(page.locator('#serviceFields .content-guided-card')).not.toContainText(/Datos visibles elegidos/i);
    await expect(page.locator('[data-visible-services-editor]')).toBeHidden();

    await page.locator('#serviceFields [data-content-guided="next"]').click();
    await expect(page.locator('#serviceFields .content-guided-card')).toHaveAttribute('data-content-guided-key', 'campaign-points');
    await expect(page.locator('#serviceFields .content-guided-card')).toContainText(/Datos visibles elegidos/i);
    await expect(page.locator('[data-visible-services-editor]')).toBeHidden();

    await page.locator('[data-content-new-service]').fill('Consulta de control');
    await page.locator('[data-content-add-service]').click();
    await expect(page.locator('#serviceFields .content-guided-card')).toContainText('Consulta de control');
    await expect(errors).toEqual([]);
  });


  test('permite ordenar prestaciones visibles y el prompt respeta ese orden', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startWithPiece(page, 'professionalFlyer');

    await expectCurrentStep(page, 'prestaciones');
    await page.locator('#serviceFields [data-content-guided="next"]').click();
    await page.locator('#serviceFields [data-content-guided="next"]').click();
    await expect(page.locator('#serviceFields .content-guided-card')).toHaveAttribute('data-content-guided-key', 'services');

    const customItems = ['Primer dato visible', 'Segundo dato visible', 'Tercer dato visible'];
    for (const item of customItems) {
      await page.locator('[data-content-new-service]').fill(item);
      await page.locator('[data-content-add-service]').click();
      await expect(page.locator('#serviceFields .service-order-item', { hasText: item })).toBeVisible();
    }

    const thirdRow = page.locator('#serviceFields .service-order-item', { hasText: 'Tercer dato visible' });
    await thirdRow.getByRole('button', { name: /Subir/i }).click();
    await page.locator('#serviceFields .service-order-item', { hasText: 'Tercer dato visible' }).getByRole('button', { name: /Subir/i }).click();

    const orderedItems = await page.locator('#serviceFields .service-order-text').evaluateAll(items => items.map(item => item.textContent.trim()));
    const customOrder = orderedItems.filter(item => customItems.includes(item));
    expect(customOrder).toEqual(['Tercer dato visible', 'Primer dato visible', 'Segundo dato visible']);

    await goResult(page);
    const prompt = await getPrompt(page);
    const thirdIndex = prompt.indexOf('Tercer dato visible');
    const firstIndex = prompt.indexOf('Primer dato visible');
    const secondIndex = prompt.indexOf('Segundo dato visible');
    expect(thirdIndex).toBeGreaterThanOrEqual(0);
    expect(thirdIndex).toBeLessThan(firstIndex);
    expect(firstIndex).toBeLessThan(secondIndex);
    await expect(errors).toEqual([]);
  });


  test('promoción usa fechas desde y hasta con selectores de fecha', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startWithPiece(page, 'promotionCampaign');

    const contentCard = page.locator('#serviceFields .content-guided-card');
    await expect(contentCard).toHaveAttribute('data-content-guided-key', 'campaign-type');
    await expect(contentCard).not.toContainText(/Fecha o período/i);

    const dateGroup = page.locator('#serviceFields .date-range-group').first();
    await expect(dateGroup).toBeVisible();
    await expect(dateGroup).toContainText(/Período de campaña/i);

    let startDate = page.locator('input[type="date"][data-path="promptOptions.campaignStartDate"]').first();
    let endDate = page.locator('input[type="date"][data-path="promptOptions.campaignEndDate"]').first();
    await expect(startDate).toBeVisible();
    await expect(endDate).toBeVisible();
    await expect(page.locator('#additionalSpecialtiesEditor')).toBeHidden();
    await expect(page.locator('#prestaciones > .step-footer-controls')).toHaveCount(0);

    if (test.info().project.name === 'chromium-desktop') {
      const startBox = await startDate.boundingBox();
      const endBox = await endDate.boundingBox();
      expect(Math.abs(startBox.y - endBox.y)).toBeLessThanOrEqual(8);
      expect(startBox.width).toBeLessThanOrEqual(320);
      expect(endBox.width).toBeLessThanOrEqual(320);
    }

    await page.locator('#serviceFields [data-content-mode="full"]').click();
    const fullDateGroup = page.locator('#serviceFields .date-range-group').first();
    await expect(fullDateGroup).toBeVisible();
    await expect(fullDateGroup).toContainText(/Período de campaña/i);
    startDate = page.locator('input[type="date"][data-path="promptOptions.campaignStartDate"]').first();
    endDate = page.locator('input[type="date"][data-path="promptOptions.campaignEndDate"]').first();
    await expect(startDate).toBeVisible();
    await expect(endDate).toBeVisible();

    if (test.info().project.name === 'chromium-desktop') {
      const startBox = await startDate.boundingBox();
      const endBox = await endDate.boundingBox();
      expect(Math.abs(startBox.y - endBox.y)).toBeLessThanOrEqual(8);
      expect(startBox.width).toBeLessThanOrEqual(320);
      expect(endBox.width).toBeLessThanOrEqual(320);
    }

    await startDate.fill('2026-03-01');
    await endDate.fill('2026-03-15');
    await goResult(page);

    const prompt = await getPrompt(page);
    expect(prompt).toContain('Período de campaña: desde 2026-03-01 hasta 2026-03-15');
    expect(prompt).not.toMatch(/Fecha o período/i);
    await expect(errors).toEqual([]);
  });
});

test.describe('Etapa 11D.3 - diseño guiado', () => {
  test('muestra diseño guiado y mantiene Formulario completo como respaldo', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startWithPiece(page, 'professionalFlyer');

    await clickCurrentNext(page);
    await expectCurrentStep(page, 'diseno');

    const designCard = page.locator('#designFields .design-guided-card');
    await expect(designCard).toBeVisible();
    await expect(designCard).toHaveAttribute('data-design-guided-key', 'format');
    await expect(designCard).toContainText(/Formato/i);
    await expect(page.locator('#diseno > .step-footer-controls')).toHaveCount(0);
    await expect(page.locator('select[data-path="design.format"]').first()).toBeVisible();
    await expect(page.locator('#designFields [data-design-mode="full"]')).toBeVisible();

    await page.locator('#designFields [data-design-mode="full"]').click();
    await expect(page.locator('#designFields .design-mode-panel')).toBeVisible();
    await expect(page.locator('select[data-path="design.visualStyle"]').first()).toBeVisible();

    await page.locator('#designFields [data-design-mode="guided"]').click();
    await expect(page.locator('#designFields .design-guided-card')).toBeVisible();
    await expect(errors).toEqual([]);
  });

  test('las tarjetas de diseño cubren formato, colores, estilo, tipografía, densidad, recursos, animación e imágenes', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startWithPiece(page, 'informativeFlyer');

    await clickCurrentNext(page);
    await expectCurrentStep(page, 'diseno');

    const expectedCards = [
      ['format', /Formato/i],
      ['colors', /Colores/i],
      ['style', /Estilo visual/i],
      ['typography-density', /Tipografía y densidad/i],
      ['resources', /Iconos, fondo y recursos/i],
      ['animation', /Modo animado/i],
      ['images', /Imágenes personalizadas/i]
    ];

    for (let index = 0; index < expectedCards.length; index += 1) {
      const [key, text] = expectedCards[index];
      await expect(page.locator('#designFields .design-guided-card')).toHaveAttribute('data-design-guided-key', key);
      await expect(page.locator('#designFields .design-guided-card')).toContainText(text);
      if (index < expectedCards.length - 1) {
        await page.locator('#designFields [data-design-guided="next"]').click();
      }
    }

    await expect(page.locator('#addCustomAttachmentButton')).toBeVisible();
    await page.locator('#addCustomAttachmentButton').click();
    await page.locator('[data-attachment-file]').last().setInputFiles({
      name: 'referencia_diseno.png',
      mimeType: 'image/png',
      buffer: Buffer.from('referencia')
    });

    await goResult(page);
    const prompt = await getPrompt(page);
    expect(prompt).toContain('Imagen temática: referencia_diseno.png');
    await expect(errors).toEqual([]);
  });

  test('modo animado desde diseño guiado actualiza el prompt final', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startWithPiece(page, 'clinicalInfographic');

    await clickCurrentNext(page);
    await expectCurrentStep(page, 'diseno');

    for (let i = 0; i < 5; i += 1) {
      await page.locator('#designFields [data-design-guided="next"]').click();
    }

    await expect(page.locator('#designFields .design-guided-card')).toHaveAttribute('data-design-guided-key', 'animation');
    const animationToggle = page.locator('[data-path="promptOptions.requestAnimation"]').first();
    await expect(animationToggle).toBeVisible();
    await animationToggle.check();

    await goResult(page);
    const prompt = await getPrompt(page);
    expect(prompt).toContain('MODO ANIMADO');
    expect(prompt).toMatch(/pieza animada|video corto|clip animado/i);
    await expect(errors).toEqual([]);
  });
});



test.describe('Etapa 11D.4 - resultado asistido', () => {
  test('resultado muestra revisión final y botón de copiar más destacado', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startWithPiece(page, 'professionalFlyer');
    await goResult(page);

    await expect(page.locator('#finalReview')).toBeVisible();
    await expect(page.locator('#finalReview')).toContainText(/Revisión final/i);
    await expect(page.locator('#finalReviewSteps')).toContainText(/Datos mínimos/i);
    await expect(page.locator('#finalReviewSteps')).toContainText(/Copiar y generar/i);

    const resultCopyButton = page.locator('#resultado [data-copy-prompt-action]');
    await expect(resultCopyButton).toBeVisible();
    await expect(resultCopyButton).toHaveClass(/copy-prompt-result-button/);
    await expect(resultCopyButton).toContainText(/Copiar prompt revisado/i);

    await expect(page.locator('#copyPromptButton')).toHaveClass(/copy-prompt-primary/);
    await expect(page.locator('#copyPromptButton')).toContainText(/revisado/i);

    await resultCopyButton.click();
    await expect(page.locator('#statusMessage')).toContainText(/Prompt revisado copiado/i);

    await expect(errors).toEqual([]);
  });

  test('checklist de adjuntos queda visible y enumera archivos antes de enviar', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startAssistant(page);
    await fillBasicInstitution(page);

    await page.locator('[data-file-target="clinic.logoFileName"]').setInputFiles({
      name: 'logo_revision_final.png',
      mimeType: 'image/png',
      buffer: Buffer.from('logo')
    });

    await choosePiece(page, 'professionalFlyer');

    const showPhotoToggle = page.locator('[data-path="professional.showPhoto"]').first();
    if (!(await showPhotoToggle.isChecked())) await showPhotoToggle.check();

    await page.locator('[data-file-target="professional.photoFileName"]').setInputFiles({
      name: 'foto_revision_final.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('foto')
    });

    await goResult(page);

    const attachmentsCard = page.locator('.result-attachments-card');
    await expect(attachmentsCard).toBeVisible();
    await expect(attachmentsCard).toHaveClass(/is-highlighted/);
    await expect(attachmentsCard).toContainText(/Adjuntá manualmente/i);
    await expect(attachmentsCard).toContainText('logo_revision_final.png');
    await expect(attachmentsCard).toContainText('foto_revision_final.jpg');
    await expect(page.locator('#finalReviewSteps')).toContainText(/archivo/i);
    await expect(page.locator('.prompt-helper')).toContainText(/Si hay adjuntos/i);

    await expect(errors).toEqual([]);
  });

  test('advertencias finales quedan agrupadas antes de copiar', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startWithPiece(page, 'professionalFlyer');
    await goResult(page);

    await expect(page.locator('#finalReviewTitle')).toContainText(/Revisá antes de copiar/i);
    await expect(page.locator('.result-warning-card')).toBeVisible();
    await expect(page.locator('.result-warning-card')).toContainText(/Advertencias y sugerencias/i);
    await expect(page.locator('#warnings')).toContainText(/Falta o conviene completar/i);
    await expect(page.locator('#finalReviewSummary')).toContainText(/advertencia/i);

    await expect(errors).toEqual([]);
  });
});
