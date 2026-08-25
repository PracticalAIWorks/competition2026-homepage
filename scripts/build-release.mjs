import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('../', import.meta.url)));
const siteDirectory = resolve(projectRoot, 'src/site');
// 页面以 src/site 为静态站点根目录，资源与页面保持相对路径，发布时复制到同名 assets/ 目录。
const assetDirectory = resolve(siteDirectory, 'assets');
const releaseDirectory = resolve(projectRoot, 'dist/release');
const scriptPath = resolve(projectRoot, 'scripts/build-demo.mjs');

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

// 此目录是本脚本唯一的生成目标，构建前清理可避免旧资源被误发布。
rmSync(releaseDirectory, { recursive: true, force: true });
mkdirSync(resolve(releaseDirectory, 'assets'), { recursive: true });

for (const file of siteFiles) {
  cpSync(resolve(siteDirectory, file), resolve(releaseDirectory, file));
}

const releaseIndexPath = resolve(releaseDirectory, 'index.html');
const releaseIndex = readFileSync(releaseIndexPath, 'utf8')
  .replace(/\s*<script src="https:\/\/mcp\.figma\.com\/mcp\/html-to-design\/capture\.js" async><\/script>/, '');
writeFileSync(releaseIndexPath, releaseIndex);

for (const file of assetFiles) {
  cpSync(resolve(assetDirectory, file), resolve(releaseDirectory, 'assets', file));
}

const demoPath = resolve(releaseDirectory, 'demo/demo.html');
mkdirSync(dirname(demoPath), { recursive: true });
const demoBuild = spawnSync(process.execPath, [scriptPath, demoPath], {
  cwd: projectRoot,
  stdio: 'inherit',
});
if (demoBuild.status !== 0) process.exit(demoBuild.status ?? 1);

const releaseReadme = `# Release package\n\n- \`index.html\`：网站入口。将本目录的全部内容上传至静态 Web 服务器，并以该文件作为首页。\n- \`demo/demo.html\`：离线演示版。该文件已内嵌页面、图片、样式和脚本，可单独发送或双击打开。\n\n本目录由仓库根目录执行 \`npm run build:release\` 生成，请勿直接编辑。\n`;
writeFileSync(resolve(releaseDirectory, 'README.md'), releaseReadme);

const expectedFiles = [
  ...siteFiles,
  ...assetFiles.map((file) => `assets/${file}`),
  'demo/demo.html',
  'README.md',
];
const missingFiles = expectedFiles.filter((file) => !existsSync(resolve(releaseDirectory, file)));
if (missingFiles.length) throw new Error(`发布包缺少文件: ${missingFiles.join(', ')}`);

console.log(`Generated release package: ${releaseDirectory}`);
