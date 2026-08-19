import { readFileSync } from 'node:fs';

const demo = readFileSync(new URL('../demo.html', import.meta.url), 'utf8');
const errors = [];

if (!demo.startsWith('<!doctype html>')) errors.push('demo.html 不是完整 HTML 文档');
if (!demo.includes('id="showcase"')) errors.push('demo.html 未包含优秀作品展示区域');
if (!demo.includes('href="#showcase"')) errors.push('demo.html 的优秀作品入口未指向单页展示区域');
if (/<link[^>]+rel="stylesheet"/i.test(demo)) errors.push('demo.html 仍依赖外部样式表');
if (/<script[^>]+\bsrc=/i.test(demo)) errors.push('demo.html 仍依赖外部脚本');
if (/\b(?:src|href)="(?:assets\/|styles\.css|app\.js|showcase\.)/i.test(demo)) errors.push('demo.html 仍依赖项目目录中的文件');

const headContent = demo.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? '';
if (/<script\b/i.test(headContent)) errors.push('demo.html 的内联脚本位于正文 DOM 之前');

const embeddedImageCount = (demo.match(/data:image\/(?:jpeg|png|webp);base64,/g) ?? []).length;
if (embeddedImageCount < 6) errors.push(`demo.html 内嵌图片不足，当前仅检测到 ${embeddedImageCount} 个`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Demo checks passed: ${embeddedImageCount} embedded images, no external file dependencies.`);
