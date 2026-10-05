import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
let checked = 0;
for (const locale of ['', 'fr/', 'zh-cn/']) {
  for (const page of ['index', 'systems', 'papers', 'about']) {
    const file = `${locale}${page}.html`;
    const html = fs.readFileSync(file, 'utf8');
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, `${file}: duplicate id`);
    assert(!/SYNTHETIC DRIFT|my favourite teacher|clinical\.css|experience\.css|viper-mesh/.test(html), `${file}: superseded content`);
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = new URL(match[1], `https://local.test/${file}`);
      if (url.origin !== 'https://local.test') continue;
      const destination = decodeURIComponent(url.pathname.slice(1));
      assert(fs.existsSync(destination), `${file}: missing ${destination}`);
      if (url.hash && destination.endsWith('.html')) {
        assert(fs.readFileSync(destination, 'utf8').includes(`id="${url.hash.slice(1)}"`), `${file}: missing anchor ${url.hash}`);
      }
      checked++;
    }
    assert(!/[↗↑]/.test(html), `${file}: old arrow glyph`);
    if (page === 'systems') assert(!html.includes('id="aether-l3"'), `${file}: removed project`);
    assert(!html.includes('control-field.js'), `${file}: removed cursor follower`);
    if (page === 'about') {
      assert(!/serpent-symbol|vapor-serpent|toxin-viper.jpg/.test(html), `${file}: removed standalone illustration`);
      assert(!/Clair Obscur|Cyberpunk/.test(html), `${file}: removed personal paragraph`);
    }
    if (page === 'index') {
      assert.deepEqual([...html.matchAll(/<article[^>]*id="([^"]+)"/g)].map(m => m[1]), ['cipher-cli', 'to-fall'], `${file}: featured selection`);
      assert(!/class="(?:descend|fine-rule|featured-essay)"/.test(html), `${file}: removed decorations or essay`);
      assert(!html.includes('Andrew V W.S.') && !html.includes('<small>'), `${file}: attribution`);
    }
  }
}
console.log(`Passed: 12 pages, ${checked} local links/assets, scene placement, and superseded-copy checks.`);
