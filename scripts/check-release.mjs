import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('../', import.meta.url)));
const releaseDirectory = resolve(projectRoot, 'dist/release');
const errors = [];

const siteFiles = [
  'index.html',
  'styles.css',
  'app.js',
  'showcase.html',
  'showcase.css',
  'showcase.js',
  'showcase-data.js',
];

const assetFiles = [
  'logo-white.png',
  'logo.png',
  'pic1.jpg',
  'track-rd.jpg',
  '“提质增效 AI赋能”创新应用大赛报名表二维码.png',
  'AI创新应用大赛交流群.png',
];

for (const file of [...siteFiles, ...assetFiles.map((asset) => `assets/${asset}`), 'demo/demo.html', 'README.md']) {
  if (!existsSync(resolve(releaseDirectory, file))) errors.push(`发布包缺少文件: ${file}`);
}

for (const file of ['index.html', 'showcase.html']) {
  const html = readFileSync(resolve(releaseDirectory, file), 'utf8');
  for (const asset of html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)) {
    if (!existsSync(resolve(releaseDirectory, asset[1]))) errors.push(`${file} 引用了不存在的资源: ${asset[1]}`);
  }
}

const releaseIndex = readFileSync(resolve(releaseDirectory, 'index.html'), 'utf8');
if (releaseIndex.includes('mcp.figma.com')) errors.push('发布首页仍包含设计采集脚本');

const showcaseCss = readFileSync(resolve(releaseDirectory, 'showcase.css'), 'utf8');
for (const asset of showcaseCss.matchAll(/url\("(assets\/[^"]+)"\)/g)) {
  if (!existsSync(resolve(releaseDirectory, asset[1]))) errors.push(`showcase.css 引用了不存在的资源: ${asset[1]}`);
}

const demo = readFileSync(resolve(releaseDirectory, 'demo/demo.html'), 'utf8');
if (/<link[^>]+rel="stylesheet"/i.test(demo)) errors.push('离线演示仍依赖外部样式表');
if (/<script[^>]+\bsrc=/i.test(demo)) errors.push('离线演示仍依赖外部脚本');
if (/\b(?:src|href)="(?:assets\/|styles\.css|app\.js|showcase\.)/i.test(demo)) errors.push('离线演示仍依赖发布包中的其他文件');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Release package checks passed: deployment files, local assets, and offline demo are complete.');
