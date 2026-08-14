const groupFilter = document.querySelector('#group-filter');
const scenarioFilter = document.querySelector('#scenario-filter');
const awardFilter = document.querySelector('#award-filter');
const workGrid = document.querySelector('#work-grid');
const resultCount = document.querySelector('#result-count');
const emptyState = document.querySelector('#empty-state');

const accessLabels = {
  public: '公开展示',
  internal: '内部可见',
  restricted: '受限访问',
};

const matchesFilters = (work) => {
  const group = groupFilter.value;
  const scenario = scenarioFilter.value;
  const award = awardFilter.value;
  return (!group || work.category === group)
    && (!scenario || work.scenarios?.includes(scenario))
    && (!award || work.award === award);
};

const createWorkCard = (work) => {
  const article = document.createElement('article');
  article.className = 'work-card';

  const meta = document.createElement('div');
  meta.className = 'work-meta';
  const award = document.createElement('span');
  award.textContent = work.award;
  const access = document.createElement('span');
  access.className = `access access-${work.access}`;
  access.textContent = accessLabels[work.access] ?? '审核中';
  meta.append(award, access);

  const title = document.createElement('h2');
  title.textContent = work.title;
  const summary = document.createElement('p');
  summary.textContent = work.summary;
  const details = document.createElement('dl');
  details.className = 'work-details';
  for (const [label, value] of [['所属部门', work.department], ['核心价值', work.value], ['复用条件', work.reuse], ['更新时间', work.updatedAt]]) {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    term.textContent = label;
    const definition = document.createElement('dd');
    definition.textContent = value;
    row.append(term, definition);
    details.append(row);
  }

  article.append(meta, title, summary, details);
  return article;
};

const renderWorks = () => {
  const visibleWorks = showcaseWorks.filter(matchesFilters);
  workGrid.replaceChildren(...visibleWorks.map(createWorkCard));
  resultCount.textContent = `当前共 ${visibleWorks.length} 项作品`;
  emptyState.hidden = visibleWorks.length > 0;
};

[groupFilter, scenarioFilter, awardFilter].forEach((filter) => filter.addEventListener('change', renderWorks));
renderWorks();
