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

async function next(page) {
  await page.locator('.form-section.is-current [data-wizard-action="next"]').click();
}

async function goResult(page) {
  await page.locator('.form-section.is-current [data-wizard-action="result"]').click();
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

async function fillBasicInstitution(page) {
  await fillPath(page, 'clinic.name', 'Centro Médico Rincón');
  await selectPath(page, 'clinic.institutionType', 'Centro médico');
  await fillPath(page, 'clinic.address', 'Av. San Martín 2450, San José del Rincón');
  await fillPath(page, 'clinic.primaryPhone', '342 555-2488');
}

async function choosePiece(page, pieceType) {
  await next(page);
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
    expect(errors).toEqual([]);
  });

  test('guardar y cargar institución funciona desde el panel compacto', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startAssistant(page);
    await fillBasicInstitution(page);

    await page.locator('#manageInstitutionButton').click();
    await expect(page.locator('#institutionActionsPanel')).toBeVisible();
    await page.locator('#saveInstitutionButton').click();
    await expect(page.locator('#statusMessage')).toContainText(/Institución guardada/i);

    await fillPath(page, 'clinic.name', 'Otra institución temporal');

    const savedValue = await page.locator('#savedInstitutionSelect option', { hasText: 'Centro Médico Rincón' }).getAttribute('value');
    expect(savedValue).toBeTruthy();

    await page.locator('#savedInstitutionSelect').selectOption(savedValue);
    await page.locator('#loadInstitutionButton').click();

    await expect(page.locator('[data-path="clinic.name"]').first()).toHaveValue('Centro Médico Rincón');
    expect(errors).toEqual([]);
  });

  for (const [pieceType, label] of Object.entries(PIECES)) {
    test(`el ejemplo de ${label} genera prompt de una sola imagen`, async ({ page }) => {
      const errors = watchBrowserErrors(page);
      await openCleanApp(page);
      await page.locator(`[data-demo-piece="${pieceType}"]`).click();
      await goResult(page);

      const prompt = await getPrompt(page);
      expect(prompt).toContain(label.split(' ')[0]);
      expectSingleImagePrompt(prompt);

      if (pieceType !== 'professionalFlyer') {
        expect(prompt).not.toContain('DATOS DEL PROFESIONAL');
        expect(prompt).not.toContain('Matrícula:');
      }

      expect(errors).toEqual([]);
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

      expect(errors).toEqual([]);
    });
  }
});

test.describe('Etapa 10T - diseño y resultado', () => {
  test('el estilo Infantil está disponible en diseño', async ({ page }) => {
    const errors = watchBrowserErrors(page);
    await openCleanApp(page);
    await startWithPiece(page, 'clinicalInfographic');
    await setOdontology(page);

    await next(page);
    await expectCurrentStep(page, 'diseno');

    await selectPath(page, 'design.visualStyle', 'infantil');
    await goResult(page);

    const prompt = await getPrompt(page);
    expect(prompt).toMatch(/Estilo visual: infantil/i);
    expectSingleImagePrompt(prompt);
    expect(errors).toEqual([]);
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
    expect(errors).toEqual([]);
  });
});
