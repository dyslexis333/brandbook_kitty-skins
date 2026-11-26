export function initBrief(els, state, render, persist) {
  const bind = (el, key) => {
    el.addEventListener('input', () => {
      state[key] = el.value;
      render(); // Вызываем рендер для обновления макетов, НО инпуты не трогаем
      persist();
    });
  };

  bind(els.name, 'name');
  bind(els.slogan, 'slogan');
  bind(els.audience, 'audience');
  bind(els.goal, 'goal');
  bind(els.character, 'character');
}

export function renderBrief(els, state) {
  // Проверяем на пустоту и показываем/скрываем ошибки
  const validateField = (inputEl, errorEl, value) => {
    const valid = Boolean(value && value.trim());
    inputEl.classList.toggle('is-invalid', !valid);
    inputEl.setAttribute('aria-invalid', String(!valid));
    errorEl.hidden = valid;
  };

  validateField(els.name, els.errorName, state.name);
  validateField(els.slogan, els.errorSlogan, state.slogan);
}

// Новая функция, которая вызывается только при старте и сбросе
export function syncBriefInputs(els, state) {
  els.name.value = state.name || '';
  els.slogan.value = state.slogan || '';
  els.audience.value = state.audience || '';
  els.goal.value = state.goal || '';
  els.character.value = state.character || '';
}
