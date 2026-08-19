import { existsSync, readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const showcaseHtml = readFileSync(new URL('../showcase.html', import.meta.url), 'utf8');
const showcaseCss = readFileSync(new URL('../showcase.css', import.meta.url), 'utf8');
const showcaseJs = readFileSync(new URL('../showcase.js', import.meta.url), 'utf8');
const showcaseData = readFileSync(new URL('../showcase-data.js', import.meta.url), 'utf8');
const errors = [];
const migratedAssets = ['logo.png', 'logo-white.png', 'pic1.jpg', 'AI创新应用大赛交流群.png', '“提质增效 AI赋能”创新应用大赛报名表二维码.png'];

for (const file of [html, css, js, showcaseHtml, showcaseCss, showcaseJs, showcaseData]) {
  if (file.includes('—') || file.includes('–')) errors.push('页面文件中包含禁用的长破折号');
}

for (const file of ['showcase.html', 'showcase.css', 'showcase.js', 'showcase-data.js']) {
  if (!existsSync(new URL(`../${file}`, import.meta.url))) errors.push(`缺少优秀作品展示文件: ${file}`);
}

for (const asset of migratedAssets) {
  if (!existsSync(new URL(`../assets/${asset}`, import.meta.url))) errors.push(`缺少迁移后的静态资源: assets/${asset}`);
}

for (const content of [html, css, showcaseHtml, showcaseCss]) {
  if (content.includes('素材/')) errors.push('页面仍引用已迁移的素材目录');
}

for (const required of ['showcase.html', 'showcase-data.js', '优秀作品展示', '团队授权、部门审核、数据脱敏']) {
  if (!(html + showcaseHtml + showcaseJs + showcaseData).includes(required)) errors.push(`优秀作品展示缺少必要实现: ${required}`);
}

for (const id of ['overview', 'schedule', 'tracks', 'awards', 'support', 'notices', 'faq', 'apply']) {
  if (!html.includes(`id="${id}"`)) errors.push(`缺少页面区域: ${id}`);
}

for (const required of ['styles.css', 'app.js', 'meta name="viewport"', 'prefers-reduced-motion']) {
  if (!(html + css + js).includes(required)) errors.push(`缺少必要实现: ${required}`);
}

for (const required of ['高德红外第十九届劳动和技能竞赛', '提示词设计', '解决方案设计', '智能体搭建', '业务场景分析', '工具调用机制', '功能完成度', '19700', '19,700', '2,000 元', '1,500 元', '2026.06-09', '扫描填写智能表格收集表', '“提质增效 AI赋能”创新应用大赛报名表二维码.png', 'AI创新应用大赛交流群.png', '欢迎扫码加入交流群']) {
  if (!html.includes(required)) errors.push(`缺少通知公告中的关键信息: ${required}`);
}

const awardSettings = {
  '提示词设计': ['1 个 / 400 元', '3 个 / 300 元', '5 个 / 200 元'],
  '解决方案设计': ['1 个 / 1,000 元', '3 个 / 800 元', '5 个 / 500 元'],
  '智能体搭建': ['1 个 / 2,000 元', '3 个 / 1,500 元', '5 个 / 1,000 元'],
};

for (const [project, prizes] of Object.entries(awardSettings)) {
  const awardCard = html.match(new RegExp(`<article class="award-card reveal"><span>${project}</span>([\\s\\S]*?)</article>`));
  if (!awardCard || prizes.some((prize) => !awardCard[1].includes(prize))) {
    errors.push(`${project}的奖金设置不正确`);
  }
}

for (const prohibited of ['六大赛道', '已报名项目', '报名截止时间：2026 年 9 月 30 日', '2026.08.12', '具体报名方式将在开班导学课程中公布', '欢迎大家扫码加入交流群', '填写对应报名表', '请提交至信息化部', '将报名表按“参赛项目＋部门＋姓名”的格式命名']) {
  if (html.includes(prohibited)) errors.push(`仍存在与通知公告不一致的文案: ${prohibited}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Portal checks passed: structure, responsive viewport, reduced motion, and copy punctuation.');
