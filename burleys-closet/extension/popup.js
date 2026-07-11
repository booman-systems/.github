/* Burley's Closet — Poshmark Bridge popup.
 * Pulls the listing queue and open delist jobs from the app's bridge API,
 * and messages the content script to fill Poshmark's create-listing form.
 */

const $ = (id) => document.getElementById(id);
const status = (msg) => {
  $('status').textContent = msg;
};

async function getConfig() {
  const stored = await chrome.storage.sync.get(['appUrl', 'secret']);
  return { appUrl: stored.appUrl ?? '', secret: stored.secret ?? '' };
}

async function api(pathOrAction, opts = {}) {
  const { appUrl, secret } = await getConfig();
  if (!appUrl || !secret) throw new Error('Configure app URL + secret first');
  const url = `${appUrl.replace(/\/$/, '')}/api/bridge${pathOrAction}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
      ...(opts.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function refresh() {
  try {
    status('Loading…');
    const [{ queue }, { jobs }] = await Promise.all([
      api('?action=queue'),
      api('?action=delist-queue'),
    ]);

    // Delist jobs — the urgent list.
    const delistSection = $('delistSection');
    const delistList = $('delistList');
    delistList.innerHTML = '';
    if (jobs.length) {
      delistSection.style.display = 'block';
      for (const job of jobs) {
        const div = document.createElement('div');
        div.className = 'alert';
        div.innerHTML = `<div class="title">${escapeHtml(job.title)}</div>
          <div class="muted">SKU ${job.sku} — mark "Not for Sale" on Poshmark, then confirm.</div>`;
        const open = document.createElement('button');
        open.textContent = 'Open closet';
        open.onclick = () =>
          chrome.tabs.create({ url: job.url ?? 'https://poshmark.com/closet' });
        const confirm = document.createElement('button');
        confirm.className = 'secondary';
        confirm.textContent = '✓ Delisted';
        confirm.onclick = async () => {
          await api('', {
            method: 'POST',
            body: JSON.stringify({ action: 'confirm-delist', sku: job.sku }),
          });
          refresh();
        };
        div.append(open, confirm);
        delistList.append(div);
      }
    } else {
      delistSection.style.display = 'none';
    }

    // Create-listing queue.
    const queueSection = $('queueSection');
    const queueList = $('queueList');
    queueList.innerHTML = '';
    queueSection.style.display = 'block';
    if (!queue.length) {
      queueList.innerHTML = '<div class="muted">Queue is empty.</div>';
    }
    for (const entry of queue) {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `<div class="title">${escapeHtml(entry.title)}</div>
        <div class="muted">SKU ${entry.sku} · $${entry.price} · ${entry.photoUrls.length} photos</div>`;
      const fill = document.createElement('button');
      fill.textContent = 'Fill current tab';
      fill.onclick = () => fillTab(entry);
      const done = document.createElement('button');
      done.className = 'secondary';
      done.textContent = '✓ Published';
      done.onclick = async () => {
        const tab = await activeTab();
        await api('', {
          method: 'POST',
          body: JSON.stringify({
            action: 'mark-listed',
            sku: entry.sku,
            url: tab?.url?.includes('poshmark.com/listing') ? tab.url : undefined,
          }),
        });
        refresh();
      };
      div.append(fill, done);
      queueList.append(div);
    }
    status(`Queue: ${queue.length} · Delists: ${jobs.length}`);
  } catch (e) {
    status(String(e.message ?? e));
  }
}

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function fillTab(entry) {
  const tab = await activeTab();
  if (!tab?.url?.includes('poshmark.com')) {
    status('Open poshmark.com/create-listing first');
    chrome.tabs.create({ url: 'https://poshmark.com/create-listing' });
    return;
  }
  status('Filling…');
  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'FILL_LISTING',
      data: entry,
    });
    status(response?.ok ? 'Filled — pick category/size, then Publish.' : `Fill issue: ${response?.error ?? 'unknown'}`);
  } catch (e) {
    status(`Could not reach page (reload the tab): ${e.message}`);
  }
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s ?? '';
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', async () => {
  const { appUrl, secret } = await getConfig();
  $('appUrl').value = appUrl;
  $('secret').value = secret;
  $('save').onclick = async () => {
    await chrome.storage.sync.set({
      appUrl: $('appUrl').value.trim(),
      secret: $('secret').value.trim(),
    });
    refresh();
  };
  if (appUrl && secret) refresh();
});
