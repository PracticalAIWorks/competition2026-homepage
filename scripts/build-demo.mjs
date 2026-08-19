import { readFileSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const readBuffer = (path) => readFileSync(new URL(path, root));

const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const assetPaths = [
  'assets/logo-white.png',
  'assets/logo.png',
  'assets/pic1.jpg',
  'assets/track-rd.jpg',
  'assets/“提质增效 AI赋能”创新应用大赛报名表二维码.png',
  'assets/AI创新应用大赛交流群.png',
];

const assets = new Map(assetPaths.map((path) => {
  const mimeType = mimeTypes[extname(path).toLowerCase()];
  if (!mimeType) throw new Error(`不支持内嵌的资源类型: ${path}`);
  return [path, `data:${mimeType};base64,${readBuffer(path).toString('base64')}`];
}));

const inlineAssets = (content) => [...assets.entries()].reduce(
  (result, [path, dataUri]) => result.split(path).join(dataUri),
  content,
);

const indexHtml = read('index.html');
const showcaseHtml = read('showcase.html');
const styles = read('styles.css');
const showcaseStyles = read('showcase.css');
const appScript = read('app.js');
const showcaseDataScript = read('showcase-data.js');
const showcaseScript = read('showcase.js');

const showcaseMainMatch = showcaseHtml.match(/<main id="main">([\s\S]*?)<\/main>/);
if (!showcaseMainMatch) throw new Error('无法提取优秀作品页面内容');

const showcaseContent = showcaseMainMatch[1]
  .replace('aria-labelledby="intro-title"', 'aria-labelledby="showcase-intro-title"')
  .replace('id="intro-title"', 'id="showcase-intro-title"');

const mergedStyles = `${inlineAssets(styles)}\n\n/* 单页演示中的优秀作品区域 */\n${inlineAssets(showcaseStyles)}`;
const standaloneScripts = `\n    <script>\n${appScript}\n    </script>\n    <script>\n${showcaseDataScript}\n    </script>\n    <script>\n${showcaseScript}\n    </script>`;

let demoHtml = indexHtml
  .replace(/\s*<script src="https:\/\/mcp\.figma\.com[^>]*><\/script>/, '')
  .replace(/\s*<link rel="stylesheet" href="styles\.css" \/>/, `\n    <style>\n${mergedStyles}\n    </style>`)
  .replace(/\s*<script src="app\.js" defer><\/script>/, '')
  .replaceAll('href="showcase.html"', 'href="#showcase"')
  .replace('</main>', `\n      <section class="showcase-page" id="showcase" aria-label="优秀作品展示">${showcaseContent}\n      </section>\n    </main>`)
  .replace('</body>', `${standaloneScripts}\n  </body>`);

demoHtml = inlineAssets(demoHtml).replace(/[ \t]+$/gm, '');

if (/\b(?:src|href)="(?:assets\/|styles\.css|app\.js|showcase\.)/.test(demoHtml)) {
  throw new Error('单页演示仍包含本地文件依赖');
}

writeFileSync(new URL('../demo.html', import.meta.url), demoHtml);
console.log('Generated demo.html with inline styles, scripts, assets, and showcase content.');
