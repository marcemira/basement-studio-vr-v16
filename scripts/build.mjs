import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
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
await writeFile(new URL('.nojekyll', output), '');
console.log('Static site built in dist/');
