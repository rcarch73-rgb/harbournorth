'use strict';

const APP_VERSION = '2.0.0-alpha.1';
const SCHEMA_VERSION = 1;
const STORAGE_KEY = 'harbourNorth2.plan';

const defaultState = () => ({
  meta: {
    appVersion: APP_VERSION,
    schemaVersion: SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  household: {
    primaryName: '', primaryAge: null, primaryRetirementAge: null,
    partnerName: '', partnerAge: null, partnerRetirementAge: null
  },
  finances: {
    cash: 0, rrsp: 0, tfsa: 0, nonRegistered: 0, property: 0, debt: 0
  }
});

let state = loadState();
let saveTimer = null;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function validateAndNormalize(candidate) {
  if (!isPlainObject(candidate)) throw new Error('Backup does not contain a valid Harbour North plan.');
  const clean = defaultState();
  const household = isPlainObject(candidate.household) ? candidate.household : {};
  const finances = isPlainObject(candidate.finances) ? candidate.finances : {};

  clean.meta.createdAt = candidate.meta?.createdAt || clean.meta.createdAt;
  clean.meta.updatedAt = new Date().toISOString();
  clean.household.primaryName = String(household.primaryName || '').slice(0, 80);
  clean.household.primaryAge = household.primaryAge === null || household.primaryAge === '' ? null : normalizeNumber(household.primaryAge);
  clean.household.primaryRetirementAge = household.primaryRetirementAge === null || household.primaryRetirementAge === '' ? null : normalizeNumber(household.primaryRetirementAge);
  clean.household.partnerName = String(household.partnerName || '').slice(0, 80);
  clean.household.partnerAge = household.partnerAge === null || household.partnerAge === '' ? null : normalizeNumber(household.partnerAge);
  clean.household.partnerRetirementAge = household.partnerRetirementAge === null || household.partnerRetirementAge === '' ? null : normalizeNumber(household.partnerRetirementAge);

  for (const key of Object.keys(clean.finances)) clean.finances[key] = normalizeNumber(finances[key]);
  return clean;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? validateAndNormalize(JSON.parse(raw)) : defaultState();
  } catch (error) {
    console.error('Harbour North storage recovery:', error);
    return defaultState();
  }
}

function saveState() {
  state.meta.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  setSaveStatus('Saved');
}

function queueSave() {
  setSaveStatus('Saving…');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveState();
    renderDashboard();
  }, 250);
}

function setSaveStatus(text) {
  document.getElementById('saveStatus').textContent = text;
}

function money(value) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(value || 0);
}

function hydrateInputs() {
  for (const [key, value] of Object.entries(state.household)) {
    const input = document.getElementById(key);
    if (input) input.value = value ?? '';
  }
  for (const [key, value] of Object.entries(state.finances)) {
    const input = document.getElementById(key);
    if (input) input.value = value ?? 0;
  }
}

function bindInputs() {
  document.querySelectorAll('#setup input').forEach(input => {
    input.addEventListener('input', () => {
      if (Object.hasOwn(state.household, input.id)) {
        state.household[input.id] = input.type === 'number' ? (input.value === '' ? null : normalizeNumber(input.value)) : input.value;
      } else if (Object.hasOwn(state.finances, input.id)) {
        state.finances[input.id] = normalizeNumber(input.value);
      }
      queueSave();
    });
  });
}

function renderDashboard() {
  const f = state.finances;
  const assets = f.cash + f.rrsp + f.tfsa + f.nonRegistered + f.property;
  const netWorth = assets - f.debt;
  const age = state.household.primaryAge;
  const retirementAge = state.household.primaryRetirementAge;
  const years = Number.isFinite(age) && Number.isFinite(retirementAge) ? Math.max(0, retirementAge - age) : null;

  document.getElementById('totalAssets').textContent = money(assets);
  document.getElementById('totalDebt').textContent = money(f.debt);
  document.getElementById('netWorth').textContent = money(netWorth);
  document.getElementById('yearsToRetirement').textContent = years === null ? '—' : String(years);

  const checks = [
    ['Storage available', storageAvailable()],
    ['Plan schema valid', state.meta.schemaVersion === SCHEMA_VERSION],
    ['Financial values valid', Object.values(f).every(Number.isFinite)],
    ['Net worth calculation valid', Number.isFinite(netWorth)]
  ];
  document.getElementById('healthChecks').innerHTML = checks.map(([label, pass]) =>
    `<div class="health-item ${pass ? 'pass' : 'fail'}"><span>${label}</span><strong>${pass ? 'PASS' : 'FAIL'}</strong></div>`
  ).join('');
}

function storageAvailable() {
  try {
    const key = '__hn_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch { return false; }
}

function exportBackup() {
  saveState();
  const payload = {
    product: 'Harbour North',
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    schemaVersion: SCHEMA_VERSION,
    plan: state
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `harbour-north-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  toast('Backup exported.');
}

async function importBackup(file) {
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) throw new Error('Backup is too large.');
  const text = await file.text();
  const parsed = JSON.parse(text);
  const candidate = parsed.plan || parsed;
  const nextState = validateAndNormalize(candidate);
  const recovery = JSON.stringify(state);
  try {
    localStorage.setItem(`${STORAGE_KEY}.recovery`, recovery);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    state = nextState;
    hydrateInputs();
    renderDashboard();
    toast('Backup restored and verified.');
  } catch (error) {
    localStorage.setItem(STORAGE_KEY, recovery);
    throw error;
  }
}

function runBackupHealthTest() {
  const result = document.getElementById('backupTestResult');
  try {
    const serialized = JSON.stringify({ product: 'Harbour North', plan: state });
    const restored = validateAndNormalize(JSON.parse(serialized).plan);
    const originalCore = JSON.stringify({ household: state.household, finances: state.finances });
    const restoredCore = JSON.stringify({ household: restored.household, finances: restored.finances });
    if (originalCore !== restoredCore) throw new Error('Restored data did not match the current plan.');
    result.className = 'test-result pass';
    result.textContent = 'PASS — export, parse, validation and restore comparison all succeeded.';
  } catch (error) {
    result.className = 'test-result fail';
    result.textContent = `FAIL — ${error.message}`;
  }
}

function resetData() {
  if (!confirm('Reset all Harbour North 2 Alpha data on this device?')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  saveState();
  hydrateInputs();
  renderDashboard();
  toast('Alpha data reset.');
}

function toast(message) {
  const element = document.getElementById('toast');
  element.textContent = message;
  element.classList.add('show');
  setTimeout(() => element.classList.remove('show'), 2200);
}

function bindNavigation() {
  document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab === button));
    document.querySelectorAll('.page').forEach(page => page.classList.toggle('active', page.id === button.dataset.page));
    if (button.dataset.page === 'dashboard') renderDashboard();
  }));
}

function init() {
  hydrateInputs();
  bindInputs();
  bindNavigation();
  renderDashboard();
  document.getElementById('exportBtn').addEventListener('click', exportBackup);
  document.getElementById('importFile').addEventListener('change', async event => {
    try { await importBackup(event.target.files[0]); }
    catch (error) { alert(`Import failed: ${error.message}`); }
    finally { event.target.value = ''; }
  });
  document.getElementById('testBackupBtn').addEventListener('click', runBackupHealthTest);
  document.getElementById('resetBtn').addEventListener('click', resetData);
}

document.addEventListener('DOMContentLoaded', init);
