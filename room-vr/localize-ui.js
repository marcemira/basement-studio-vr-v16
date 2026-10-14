import { language, t } from './i18n.js';
document.documentElement.lang = language;
// Translate presentation only. IDs, option values, scene names and saved JSON stay stable.
const rendered = new WeakMap();
function translateNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (node.parentElement?.closest('script, style, [data-no-translate]')) return;
    if (rendered.get(node) === node.data) return;
    const next = t(node.data);
    if (next !== node.data) node.data = next;
    rendered.set(node, next);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    if (node.matches('script, style, [data-no-translate]')) return;
    for (const attr of ['aria-label', 'title', 'placeholder']) {
      if (node.hasAttribute(attr)) {
        const value = node.getAttribute(attr), next = t(value);
        if (next !== value) node.setAttribute(attr, next);
      }
    }
    for (const child of node.childNodes) translateNode(child);
  }
}
const observer = new MutationObserver(records => {
  observer.disconnect();
  for (const record of records) {
    if (record.type === 'childList') record.addedNodes.forEach(translateNode);
    else translateNode(record.target);
  }
  observe();
});
function observe() {
  observer.observe(document.documentElement, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['aria-label','title','placeholder']});
}
translateNode(document.documentElement);
observe();
const host = document.querySelector('.control-header') || document.querySelector('#panel') || document.querySelector('aside');
if (host) {
  const label = document.createElement('label');
  label.className = 'language-picker';
  label.dataset.noTranslate = '';
  label.textContent = language === 'es' ? 'Idioma ' : 'Language ';
  const select = document.createElement('select');
  select.setAttribute('aria-label', language === 'es' ? 'Idioma' : 'Language');
  for (const [value, text] of [['es','Español'],['en','English']]) {
    const option = document.createElement('option');
    option.value = value; option.textContent = text; select.append(option);
  }
  select.value = language;
  select.addEventListener('change', () => {
    const url = new URL(location.href); url.searchParams.set('lang', select.value); location.href = url.href;
  });
  label.append(select); host.prepend(label);
}
// Keep the chosen language when opening the lightweight VR test or safe renderer.
for (const link of document.querySelectorAll('a[href]')) {
  const url = new URL(link.href);
  if (url.origin === location.origin && url.pathname.endsWith('.html') || url.origin === location.origin && (url.pathname.endsWith('/') || url.searchParams.has('vrsafe'))) {
    url.searchParams.set('lang', language); link.href = url.href;
  }
}
