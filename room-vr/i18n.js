import spanish from './translations-es.js';
export const language = typeof location !== 'undefined' && new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'es';
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const phrases = Object.keys(spanish).sort((a, b) => b.length - a.length);
const pattern = new RegExp('(?<![\\p{L}\\p{N}_])(?:' + phrases.map(escape).join('|') + ')(?![\\p{L}\\p{N}_])', 'gu');
export function t(value) {
  const text = String(value);
  return language === 'en' ? text : text.replace(pattern, match => spanish[match]);
}
