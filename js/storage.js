const KEY = 'brandbook-draft';

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e };
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ok: true, state: null };
    return { ok: true, state: JSON.parse(raw) };
  } catch (e) {
    return { ok: false, error: e, state: null };
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e };
  }
}
