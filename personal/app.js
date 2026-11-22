(() => {
  'use strict';

  // 页面上的日报交互是脱敏示例，规则与正式面板一致：
  // · 三档标题始终存在，顺序固定，0 条也保留；
  // · 当天未处理的 urgent / action 会进入后续报次，info 随最新报次更新；
  // · 已处理只在当前页面状态里，可展开、可恢复；
  // · 点条目 = 标记或恢复，不表示钉钉待办完成。
  const reports = {
    morning: {
      label: '早报',
      subtitle: '11月3日 周二 · 早报 · 更新于 08:02',
      items: [
        { id: 'materials', level: 'urgent', text: '今天 16:00 前提交班级材料', source: '年级组' },
        { id: 'activity', level: 'action', text: '确认周五活动安排', source: '教务通知' },
        { id: 'duty', level: 'info', text: '查看下周值日表', source: '年级组' }
      ]
    },
    noon: {
      label: '午报',
      subtitle: '11月3日 周二 · 午报 · 更新于 12:03',
      items: [
        { id: 'materials', level: 'urgent', text: '今天 16:00 前提交班级材料', source: '年级组' },
        { id: 'activity', level: 'action', text: '确认周五活动安排', source: '教务通知' },
        { id: 'listen', level: 'action', text: '回复教研组听课安排', source: '教研组' },
        { id: 'library', level: 'info', text: '阅览室本周开放时间', source: '教务通知' }
      ]
    },
    evening: {
      label: '晚报',
      subtitle: '11月3日 周二 · 晚报 · 更新于 18:05',
      items: [
        { id: 'materials', level: 'urgent', text: '今天 16:00 前提交班级材料', source: '年级组' },
        { id: 'activity', level: 'action', text: '确认周五活动安排', source: '教务通知' },
        { id: 'listen', level: 'action', text: '回复教研组听课安排', source: '教研组' },
        { id: 'tomorrow', level: 'info', text: '明天晨会 8:20 开始', source: '年级组' }
      ]
    }
  };

  const levels = [
    { key: 'urgent', label: '非常紧急', dot: 'dot-urgent' },
    { key: 'action', label: '需要处理', dot: 'dot-action' },
    { key: 'info', label: '看一下即可', dot: 'dot-info' }
  ];

  const handled = new Set();
  let activePeriod = 'morning';
  let handledExpanded = false;

  const byId = (id) => document.getElementById(id);
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  function itemMarkup(item, isHandled) {
    const action = isHandled ? '恢复' : '标记已处理';
    return `<button class="demo-item${isHandled ? ' is-handled' : ''}" type="button" data-handle="${escapeHtml(item.id)}" aria-pressed="${String(isHandled)}" aria-label="${action}：${escapeHtml(item.text)}">
      <span class="item-text">${escapeHtml(item.text)}</span><span class="source">（${escapeHtml(item.source)}）</span>
    </button>`;
  }

  function render() {
    const body = byId('demo-body');
    const report = reports[activePeriod];
    if (!body || !report) return;

    const subtitle = byId('demo-sub');
    if (subtitle) subtitle.textContent = report.subtitle;

    const activeItems = report.items.filter((item) => !handled.has(item.id));
    const handledItems = report.items.filter((item) => handled.has(item.id));

    const tiers = levels.map((level) => {
      const items = activeItems.filter((item) => item.level === level.key);
      return `<section class="demo-tier" data-level="${level.key}">
        <div class="demo-tier-head"><span class="dot ${level.dot}" aria-hidden="true"></span><span class="demo-tier-label">${level.label}</span><span class="demo-tier-count">${items.length} 条</span></div>
        <div class="demo-items">${items.map((item) => itemMarkup(item, false)).join('')}</div>
      </section>`;
    }).join('');

    const handledBlock = handledItems.length
      ? `<div class="demo-handled">
          <button class="handled-toggle" type="button" data-handled-toggle aria-expanded="${String(handledExpanded)}">已处理（${handledItems.length}）</button>
          <div class="handled-list"${handledExpanded ? '' : ' hidden'}>${handledItems.map((item) => itemMarkup(item, true)).join('')}</div>
        </div>`
      : '';

    body.innerHTML = tiers + handledBlock;
  }

  function selectPeriod(period, button) {
    if (!reports[period]) return;
    activePeriod = period;
    handledExpanded = false;
    document.querySelectorAll('[data-period]').forEach((tab) => {
      tab.setAttribute('aria-pressed', String(tab === button || tab.dataset.period === period));
    });
    render();
  }

  document.querySelectorAll('[data-period]').forEach((button) => {
    button.addEventListener('click', () => selectPeriod(button.dataset.period, button));
  });

  const demoBody = byId('demo-body');
  if (demoBody) {
    demoBody.addEventListener('click', (event) => {
      const target = event.target;
      const toggle = target.closest ? target.closest('[data-handled-toggle]') : null;
      if (toggle) {
        handledExpanded = !handledExpanded;
        render();
        return;
      }
      const item = target.closest ? target.closest('[data-handle]') : null;
      if (!item) return;
      const id = item.dataset.handle;
      if (handled.has(id)) handled.delete(id);
      else handled.add(id);
      render();
    });
  }

  const resetDemo = byId('demo-reset');
  if (resetDemo) {
    resetDemo.addEventListener('click', () => {
      handled.clear();
      handledExpanded = false;
      render();
    });
  }

  const copyButton = document.querySelector('[data-copy-install]');
  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      const command = byId('install-command');
      const status = byId('copy-status');
      if (!command) return;
      try {
        if (typeof navigator === 'undefined' || !navigator.clipboard) throw new Error('clipboard unavailable');
        await navigator.clipboard.writeText(command.value ?? command.textContent);
        if (status) status.textContent = '指令已复制，可以粘贴给 WorkBuddy。';
      } catch (_) {
        if (typeof command.focus === 'function') command.focus();
        if (typeof command.select === 'function') command.select();
        if (status) status.textContent = '自动复制不可用，指令已选中，请手动复制。';
      }
    });
  }

  async function showStableRelease() {
    const status = byId('release-status');
    const direct = byId('direct-download');
    const guide = byId('install-guide-link');
    const backup = byId('backup-install');
    if (!status || !direct || !guide || typeof fetch !== 'function') return;

    try {
      const response = await fetch('https://milaotou001.github.io/xiaomi-desktop-updates/install.json', {
        credentials: 'omit',
        cache: 'no-cache'
      });
      if (!response.ok) throw new Error('Release unavailable');
      const manifest = await response.json();
      const version = manifest.latest_version;
      const pkg = manifest.packages?.['windows-x64'];
      if (manifest.schema_version !== 1 || manifest.product !== '小咪桌宠' || version !== '1.0.5' ||
          (manifest.channel !== undefined && manifest.channel !== 'stable') ||
          pkg?.availability !== 'ready' || pkg.platform !== 'windows' || pkg.arch !== 'x64' ||
          pkg.format !== 'zip' || pkg.app_version !== version || pkg.deployment_version !== version ||
          !Number.isSafeInteger(pkg.size) || pkg.size <= 0 ||
          typeof pkg.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(pkg.sha256)) {
        throw new Error('Release not ready');
      }
      const expected = 'https://huaxiao-xiaomi-updates-001.oss-cn-hangzhou.aliyuncs.com' +
        `/deployment/windows-x64/v${version}/xiaomi-teacher-deploy-windows-x64-v${version}.zip`;
      if (pkg.url !== expected) throw new Error('Unexpected download address');

      direct.href = pkg.url;
      direct.hidden = false;
      guide.hidden = false;
      if (backup) backup.hidden = false;
      if (copyButton) copyButton.disabled = false;
      status.textContent = `Windows x64 · 正式版 ${version} · 免费使用`;
    } catch {
      status.textContent = '暂时无法核对下载包。请稍后刷新，或先看图文教程。';
    }
  }

  showStableRelease();

  const donationLink = byId('donation-link');
  const donationStatus = byId('donation-status');
  const donationUrl = typeof window === 'undefined' ? '' : window.XiaomieSiteConfig?.donationUrl;
  if (donationLink && donationStatus && typeof donationUrl === 'string' &&
      /^https:\/\/afdian\.com\/a\/[a-z0-9_-]+\/?$/i.test(donationUrl)) {
    donationLink.href = donationUrl;
    donationLink.hidden = false;
    donationStatus.hidden = true;
  }

  const menu = byId('menu-toggle');
  const nav = byId('site-nav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const expanded = menu.getAttribute('aria-expanded') === 'true';
      menu.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('is-open', !expanded);
    });
    if (typeof nav.querySelectorAll === 'function') {
      nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          menu.setAttribute('aria-expanded', 'false');
          nav.classList.remove('is-open');
        });
      });
    }
  }

  // 更新日志右侧版本目录：滚到哪一版，目录就高亮哪一版。
  const releaseLinks = Array.from(document.querySelectorAll('[data-release-link]'));
  const releaseSections = releaseLinks
    .map((link) => document.getElementById(link.getAttribute('data-release-link')))
    .filter(Boolean);
  if (releaseLinks.length && releaseSections.length && typeof IntersectionObserver !== 'undefined') {
    const setActive = (id) => {
      releaseLinks.forEach((link) => {
        const current = link.getAttribute('data-release-link') === id;
        if (current) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    };
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActive(visible[0].target.id);
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
    releaseSections.forEach((section) => observer.observe(section));
  }

  render();
})();
