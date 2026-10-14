import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { parseSettings } from '../room-vr/settings-file.js';
const root = new URL('../', import.meta.url);
const source = new URL('room-vr/', root);
const output = new URL('dist/', root);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of await readdir(source, { withFileTypes: true })) {
  if ((entry.isFile() && /\.(html|css|js)$/.test(entry.name)) ||
      ['assets', 'vendor', 'plans', 'furniture-settings.json'].includes(entry.name)) {
    await cp(new URL(entry.name, source), new URL(entry.name, output), { recursive: true });
  }
}
// Validate the selected public preset and preserve its original bytes.
const preset = await readFile(new URL('furniture-settings (5).json', source), 'utf8');
parseSettings(preset);
await writeFile(new URL('default-settings.json', output), preset);
// Inject only into the distribution; the local viewer keeps its existing behavior.
const appURL = new URL('app.js', output);
const app = await readFile(appURL, 'utf8');
const bootstrap = `
try {
  const response = await fetch(new URL('./default-settings.json', import.meta.url));
  if (!response.ok) throw new Error('HTTP ' + response.status);
  loadSettings(await response.text());
} catch (error) {
  console.error('Public default settings failed to load', error);
  status.textContent = 'Could not load the public room preset: ' + error.message;
}
`;
await writeFile(appURL, app.replace("document.querySelector('#loading').remove();", bootstrap + "\ndocument.querySelector('#loading').remove();"));
await writeFile(new URL('.nojekyll', output), '');
console.log('Static site built in dist/');
