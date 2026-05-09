/**
 * Self-contained playground HTML for `/`. No external assets, no build —
 * inline CSS + vanilla JS so it works identically on Edge and locally.
 *
 * The form mirrors the query parameters accepted by /api/stats. Unchecked
 * color overrides are simply omitted from the URL so the preset bleeds
 * through.
 */

export const playgroundHtml = /* html */ `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>github-readme-card playground</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root {
    --bg: #0b0f1a;
    --panel: #11172a;
    --text: #c8d4e6;
    --muted: #6b7a8f;
    --border: #1d2738;
    --accent: #7dd3fc;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter','SF Pro Text','Helvetica Neue','Segoe UI',system-ui,-apple-system,sans-serif;
    padding: 24px;
    line-height: 1.5;
  }
  main { max-width: 880px; margin: 0 auto; }
  h1 { font-size: 11px; letter-spacing: 1.6px; text-transform: uppercase; color: var(--muted); margin: 0 0 12px; font-weight: 600; }
  .preview {
    background: #06090f;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }
  .preview img { max-width: 100%; height: auto; display: block; }
  .controls {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px 24px;
  }
  .controls .full { grid-column: 1 / -1; }
  label { display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
  select, input[type=range] {
    width: 100%;
    padding: 8px 10px;
    background: #0a0e1c;
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 6px;
    font: inherit;
    font-size: 13px;
    text-transform: none;
    letter-spacing: normal;
  }
  .color-row {
    display: grid;
    grid-template-columns: auto auto 1fr auto;
    align-items: center;
    gap: 10px;
  }
  .color-row input[type=checkbox] { width: 16px; height: 16px; accent-color: var(--accent); }
  .color-row input[type=color] {
    width: 36px; height: 28px; padding: 0; border: 1px solid var(--border); background: transparent; border-radius: 4px;
    opacity: 0.4;
    transition: opacity 0.15s;
  }
  .color-row input[type=checkbox]:checked ~ input[type=color],
  .color-row.on input[type=color] { opacity: 1; }
  .color-row .name {
    font-family: 'JetBrains Mono','SF Mono','Menlo','Consolas',monospace;
    font-size: 12px;
    color: var(--text);
    opacity: 0.6;
  }
  .color-row.on .name { opacity: 1; }
  .color-row .hex {
    font-family: 'JetBrains Mono','SF Mono','Menlo','Consolas',monospace;
    font-size: 11px;
    color: var(--muted);
  }
  .check-row { display: flex; align-items: center; gap: 8px; padding-top: 22px; }
  .check-row input { width: 16px; height: 16px; accent-color: var(--accent); }
  .check-row label { padding: 0; text-transform: none; letter-spacing: normal; font-size: 13px; color: var(--text); font-weight: 400; }
  .url-box {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    margin-top: 16px;
  }
  .url-box .label { color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px; display: block; font-weight: 600; }
  .url-box code {
    display: block;
    padding: 12px;
    background: #060a14;
    border-radius: 6px;
    color: var(--text);
    font-family: 'JetBrains Mono','SF Mono','Menlo','Consolas',monospace;
    font-size: 12px;
    word-break: break-all;
    margin-bottom: 10px;
  }
  .url-box .row { display: flex; gap: 8px; }
  button {
    background: var(--accent);
    color: #0a0e1c;
    border: 0;
    padding: 8px 14px;
    border-radius: 6px;
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
  button:active { transform: translateY(1px); }
  button.secondary { background: transparent; color: var(--text); border: 1px solid var(--border); }
</style>
</head>
<body>
<main>
  <h1>github-readme-card · playground</h1>

  <div class="preview">
    <img id="preview" alt="card preview">
  </div>

  <div class="controls">
    <label>
      Theme
      <select id="theme">
        <optgroup label="Dark">
          <option value="">midnight (default)</option>
          <option value="obsidian">obsidian</option>
          <option value="aurora">aurora</option>
          <option value="mono">mono</option>
          <option value="plum">plum</option>
          <option value="espresso">espresso</option>
          <option value="sage">sage</option>
          <option value="rose">rose</option>
        </optgroup>
        <optgroup label="Light">
          <option value="snow">snow</option>
          <option value="paper">paper</option>
          <option value="mist">mist</option>
        </optgroup>
      </select>
    </label>

    <label>
      Locale
      <select id="locale">
        <option value="">en (default)</option>
        <option value="ja">ja</option>
      </select>
    </label>

    <div class="color-row full" data-color="bg_color">
      <input type="checkbox"><input type="color" value="#0b0f1a"><span class="name">bg_color</span><span class="hex"></span>
    </div>
    <div class="color-row full" data-color="title_color">
      <input type="checkbox"><input type="color" value="#e6edf3"><span class="name">title_color</span><span class="hex"></span>
    </div>
    <div class="color-row full" data-color="text_color">
      <input type="checkbox"><input type="color" value="#8b949e"><span class="name">text_color</span><span class="hex"></span>
    </div>
    <div class="color-row full" data-color="accent_color">
      <input type="checkbox"><input type="color" value="#7dd3fc"><span class="name">accent_color</span><span class="hex"></span>
    </div>
    <div class="color-row full" data-color="border_color">
      <input type="checkbox"><input type="color" value="#1b2333"><span class="name">border_color</span><span class="hex"></span>
    </div>

    <label>
      border_radius (<span id="radiusLabel">16</span>)
      <input type="range" id="radius" min="0" max="32" value="16">
    </label>

    <div class="check-row">
      <input type="checkbox" id="hideBorder">
      <label for="hideBorder">hide_border</label>
    </div>
  </div>

  <div class="url-box">
    <span class="label">URL</span>
    <code id="url"></code>
    <div class="row">
      <button id="copyUrl">Copy URL</button>
      <button class="secondary" id="copyMarkdown">Copy Markdown</button>
    </div>
  </div>
</main>

<script>
  const $ = (id) => document.getElementById(id);
  const preview = $('preview');
  const urlBox = $('url');
  const themeSel = $('theme');
  const localeSel = $('locale');
  const radius = $('radius');
  const radiusLabel = $('radiusLabel');
  const hideBorder = $('hideBorder');
  const colorRows = document.querySelectorAll('.color-row');

  function build() {
    const params = new URLSearchParams();
    if (themeSel.value) params.set('theme', themeSel.value);
    colorRows.forEach((row) => {
      const check = row.querySelector('input[type=checkbox]');
      const color = row.querySelector('input[type=color]');
      const hex = row.querySelector('.hex');
      hex.textContent = color.value;
      row.classList.toggle('on', check.checked);
      if (check.checked) {
        params.set(row.dataset.color, color.value.slice(1));
      }
    });
    if (radius.value !== '16') params.set('border_radius', radius.value);
    if (hideBorder.checked) params.set('hide_border', 'true');
    if (localeSel.value) params.set('locale', localeSel.value);
    const qs = params.toString();
    const path = '/api/stats' + (qs ? '?' + qs : '');
    preview.src = path;
    urlBox.textContent = location.origin + path;
    radiusLabel.textContent = radius.value;
  }

  document.addEventListener('input', build);
  document.addEventListener('change', build);
  build();

  $('copyUrl').onclick = () => navigator.clipboard.writeText(urlBox.textContent);
  $('copyMarkdown').onclick = () => navigator.clipboard.writeText('![](' + urlBox.textContent + ')');
</script>
</body>
</html>`;
