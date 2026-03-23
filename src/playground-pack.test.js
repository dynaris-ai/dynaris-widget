import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

describe('playground mock host', () => {
  it('ships root index, playground assets, and a module that imports the widget entry', () => {
    const html = readFileSync(resolve(repoRoot, 'index.html'), 'utf8');
    expect(html).toContain('src="/playground/main.js"');
    expect(html).toContain('mock-header');

    const main = readFileSync(resolve(repoRoot, 'playground/main.js'), 'utf8');
    expect(main).toContain("from '../src/widget.js'");
    expect(main).toContain('PLAYGROUND_PLACEHOLDER_USER_ID');

    const css = readFileSync(resolve(repoRoot, 'playground/site.css'), 'utf8');
    expect(css).toContain('.mock-main');

    const viteCfg = readFileSync(resolve(repoRoot, 'vite.config.js'), 'utf8');
    expect(viteCfg).toContain('playground');

    const playgroundCfg = readFileSync(resolve(repoRoot, 'vite.playground.config.js'), 'utf8');
    expect(playgroundCfg).toContain('./vite.config.js');
  });
});
