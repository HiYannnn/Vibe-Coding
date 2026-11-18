'use strict';

const languagePicker = document.getElementById('language');
const languageKey = 'kalana-multiplication-language-v1';
let language = 'sv';

try {
  const saved = localStorage.getItem(languageKey);
  if (Object.hasOwn(portalCopy, saved)) language = saved;
} catch {
  // The language can still be changed on this page.
}

function renderLanguage() {
  const copy = { ...translations[language], ...adventureCopy[language], ...portalCopy[language], ...crosswordCopy[language] };
  document.documentElement.lang = language;
  document.title = copy.portalTitle;
  languagePicker.value = language;
  languagePicker.setAttribute('aria-label', copy.language);
  for (const node of document.querySelectorAll('[data-copy]')) node.textContent = copy[node.dataset.copy];
}

languagePicker.addEventListener('change', () => {
  language = languagePicker.value;
  try { localStorage.setItem(languageKey, language); } catch { /* Keep the choice in memory. */ }
  renderLanguage();
});

renderLanguage();
