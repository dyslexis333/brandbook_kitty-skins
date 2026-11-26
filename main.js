import { initialState, PALETTES, FONTS } from './state.js';
import { saveState, loadState, clearState } from './storage.js';
import { buildTokens, downloadTokens } from './tokens.js';

import { initBrief, renderBrief, syncBriefInputs } from './brief.js';
import { initColor, renderColor, syncColorInputs } from './color.js';
import { initTypography, renderTypography, syncTypographyInputs } from './typography.js';
import { initLayouts, renderLayouts, syncLayoutsInputs } from './layouts.js';

let state = JSON.parse(JSON.stringify(initialState));

// Если этот модуль выполнился — модули загрузились, подсказка про сервер не нужна.
document.getElementById('boot-hint')?.remove();

const els = {
  name: document.getElementById('input-name'),
  slogan: document.getElementById('input-slogan'),
  audience: document.getElementById('input-audience'),
  goal: document.getElementById('input-goal'),
  character: document.getElementById('input-character'),
  errorName: document.getElementById('error-name'),
  errorSlogan: document.getElementById('error-slogan'),
  paletteList: document.getElementById('palette-list'),
  customPanel: document.getElementById('custom-colors-panel'),
  fontSelect: document.getElementById('font-select'),
  fontSizeRange: document.getElementById('font-size-range'),
  fontSizeValue: document.getElementById('font-size-value'),
  fontWeightSelect: document.getElementById('font-weight-select'),
  previewText: document.getElementById('preview-text-input'),
  typoPreview: document.getElementById('typo-preview'),
  bgImageInput: document.getElementById('input-bg-image'),
  poster: document.getElementById('poster'),
  socialCard: document.getElementById('social-card'),
  printModels: document.getElementById('print-models'),
  paletteChips: document.getElementById('palette-chips'),
  contrastList: document.getElementById('contrast-list'),
  storageMsg: document.getElementById('storage-message'),
  saveStatus: document.getElementById('save-status'),
  btnReset: document.getElementById('btn-reset'),
  btnTokens: document.getElementById('btn-tokens'),
  btnPrint: document.getElementById('btn-print'),
  summaryName: document.getElementById('summary-name'),
  summarySlogan: document.getElementById('summary-slogan'),
  summaryAudience: document.getElementById('summary-audience'),
  summaryGoal: document.getElementById('summary-goal'),
  summaryCharacter: document.getElementById('summary-character'),
  summaryPalette: document.getElementById('summary-palette'),
  summaryFont: document.getElementById('summary-font')
};

function init() {
  initBrief(els, state, render, persist);
  initColor(els, state, render, persist);
  initTypography(els, state, render, persist);
  initLayouts(els, state, render, persist);

  const loaded = loadState();
  if (!loaded.ok) {
    showStorageError('Не удалось прочитать сохранённые данные. Работаем без сохранения.');
  } else if (loaded.state && typeof loaded.state === 'object') {
    // ВАЖНО: мутируем существующий объект, а не переприсваиваем `state`,
    // иначе обработчики из init*() останутся с ссылкой на старый объект.
    Object.assign(state, loaded.state);
    sanitizeLoadedState(state);
  }

  els.btnReset.addEventListener('click', () => {
    const confirmed = window.confirm('Сбросить все настройки? Черновик будет удалён без возможности отмены.');
    if (!confirmed) return;

    clearState();
    Object.assign(state, JSON.parse(JSON.stringify(initialState)));
    syncAllInputs();
    render();
    persist();
  });

  els.btnTokens.addEventListener('click', () => {
    if (!currentPalette || !currentFont) return;
    downloadTokens(buildTokens(state, currentPalette, currentFont));
  });

  syncAllInputs();
  render();
}

// Черновик приходит из localStorage — доверять ему нельзя.
function sanitizeLoadedState(target) {
  const colors = {};
  for (const key of Object.keys(initialState.customColors)) {
    const value = target.customColors && target.customColors[key];
    colors[key] = typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
      ? value
      : initialState.customColors[key];
  }
  target.customColors = colors;

  if (!PALETTES[target.paletteId]) target.paletteId = initialState.paletteId;
  if (!FONTS[target.fontId]) target.fontId = initialState.fontId;
}

function syncAllInputs() {
  syncBriefInputs(els, state);
  syncColorInputs(state);
  syncTypographyInputs(els, state);
  syncLayoutsInputs(els, state);
}

let currentPalette = null;
let currentFont = null;

function render() {
  renderBrief(els, state);
  currentPalette = renderColor(els, state);
  currentFont = renderTypography(els, state);
  renderLayouts(els, state, currentPalette, currentFont);
}

let persistTimer = null;
let storageWarned = false;

function persist() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(writeState, 500); // не сохраняем на каждый символ
}

function writeState() {
  clearTimeout(persistTimer);
  persistTimer = null;

  const res = saveState(state);
  if (!res.ok) {
    // Показываем ошибку только 1 раз, чтобы не перекрывать экран при печати
    if (!storageWarned) {
      showStorageError('Сохранение недоступно. Вы можете продолжать работу, но настройки не сохранятся.');
      els.saveStatus.textContent = 'Не сохранено.';
      storageWarned = true;
    }
    return;
  }

  hideStorageError();
  storageWarned = false;
  els.saveStatus.textContent = 'Сохранено.';
}

// Не теряем последние правки, если вкладку закрыли до срабатывания таймера.
function flushPersist() {
  if (persistTimer) writeState();
}

window.addEventListener('pagehide', flushPersist);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushPersist();
});

function showStorageError(msg) {
  els.storageMsg.hidden = false;
  els.storageMsg.textContent = msg;
}

function hideStorageError() {
  els.storageMsg.hidden = true;
}

init();