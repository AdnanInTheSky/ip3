'use strict';
// A deliberately bounded Markdown renderer: raw HTML and remote images are never executed.
// Stores ordinary portable Markdown; supports the editing features documented in the owner guide.
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const unescape = value => value.replace(/\\([\\`*_{}\[\]()#+.!|>~\-])/g, '$1');
const safeLink = href => /^(?:https:\/\/[^\s<>]+|mailto:[^\s<>]+|\/(?!\/)[a-zA-Z0-9/_?=&#.%+~-]*|#[a-zA-Z0-9_-]+)$/.test(href) && !/[\\\u0000-\u0020]/.test(href);
function inline(text, links = [], depth = 0) {
  if (depth > 8) return esc(text);
  const token = /\\([\\`*_{}\[\]()#+.!|>~\-])|`([^`\n]+)`|\[([^\]\n]+)\]\(([^\s()]+)\)|\*\*([^*\n]+)\*\*|__([^_\n]+)__|~~([^~\n]+)~~|\*([^*\n]+)\*|_([^_\n]+)_/g;
  let html = '', offset = 0;
  for (const match of text.matchAll(token)) {
    html += esc(text.slice(offset, match.index)); offset = match.index + match[0].length;
    if (match[1]) html += esc(match[1]);
    else if (match[2]) html += `<code>${esc(match[2])}</code>`;
    else if (match[3]) { links.push(match[4]); html += safeLink(match[4]) ? `<a href="${esc(match[4])}">${inline(match[3], links, depth + 1)}</a>` : esc(match[0]); }
    else {
      const value = match[5] || match[6] || match[7] || match[8] || match[9];
      const tag = match[5] || match[6] ? 'strong' : match[7] ? 'del' : 'em';
      html += `<${tag}>${inline(value, links, depth + 1)}</${tag}>`;
    }
  }
  return html + esc(text.slice(offset));
}
function parseMarkdown(markdown) {
  const nodes = [], errors = [], links = [];
  if (typeof markdown !== 'string') return { nodes, errors: ['body must be Markdown text'], links };
  if (markdown.length > 200000) errors.push('body exceeds 200000 characters');
  if (/<\/?[a-z][^>]*>|<!--|\/wp-(?:content|includes)\//i.test(markdown)) errors.push('raw HTML and WordPress references are not allowed');
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    let m;
    if (/^```/.test(line)) {
      const body = []; while (++i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i]);
      if (i === lines.length) errors.push('unclosed code fence');
      nodes.push({ kind: 'code', text: body.join('\n') });
    } else if ((m = line.match(/^!\[((?:\\.|[^\]])*)\]\(([^\s()]+)(?:\s+"((?:\\.|[^"\\])*)")?\)\s*$/))) {
      nodes.push({ kind: 'image', image: m[2], alt: unescape(m[1]), caption: unescape(m[3] || '') });
    } else if (/!\[/.test(line.replace(/\\./g, ''))) {
      errors.push('insert images on their own paragraph or use the Infographics fields');
    } else if ((m = line.match(/^(#{1,6})\s+(.+)$/))) nodes.push({ kind: 'heading', level: Math.max(2, m[1].length), text: m[2] });
    else if ((m = line.match(/^\s*[-*+]\s+(.+)$/))) nodes.push({ kind: 'list-item', text: m[1] });
    else if ((m = line.match(/^\s*\d+\.\s+(.+)$/))) nodes.push({ kind: 'ordered-item', text: m[1] });
    else if ((m = line.match(/^>\s?(.*)$/))) nodes.push({ kind: 'quote', text: m[1] });
    else if (/^(?:---+|\*\*\*+)\s*$/.test(line)) nodes.push({ kind: 'rule' });
    else if (line.startsWith('|') && /^\|?\s*:?-{3,}/.test(lines[i + 1] || '')) {
      const cells = value => value.replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(c => c.trim());
      const rows = [cells(line)]; i++;
      while ((lines[i + 1] || '').startsWith('|')) rows.push(cells(lines[++i]));
      nodes.push({ kind: 'table', rows });
    } else {
      const body = [line];
      while (i + 1 < lines.length && lines[i + 1].trim() && !/^(?:#{1,6}\s|[-*+]\s|\d+\.\s|>|```|!\[|\|)/.test(lines[i + 1])) body.push(lines[++i]);
      nodes.push({ kind: 'paragraph', text: body.join('\n') });
    }
  }
  for (const node of nodes) {
    if (node.text && node.kind !== 'code') inline(node.text, links);
    if (node.rows) node.rows.flat().forEach(cell => inline(cell, links));
  }
  if (links.some(href => !safeLink(href))) errors.push('link destination must be HTTPS, mailto, a local path or a fragment');
  if (/^\s*\[[^\]]+\]:/m.test(markdown)) errors.push('reference-style links are unsupported; use the editor link button');
  return { nodes, errors, links };
}
function figure(image) {
  return `<figure class="article-figure"><img src="${esc(image.image)}" alt="${esc(image.alt)}" loading="lazy" decoding="async">${image.caption ? `<figcaption>${esc(image.caption)}</figcaption>` : ''}</figure>`;
}
function renderMarkdown(markdown) {
  const { nodes, errors } = parseMarkdown(markdown);
  if (errors.length) throw new Error(errors.join('; '));
  let html = '', list = null;
  const close = () => { if (list) html += `</${list}>`; list = null; };
  for (const node of nodes) {
    const group = node.kind === 'list-item' ? 'ul' : node.kind === 'ordered-item' ? 'ol' : null;
    if (group !== list) { close(); if (group) html += `<${group}>`; list = group; }
    if (group) html += `<li>${inline(node.text)}</li>`;
    else if (node.kind === 'image') html += figure(node);
    else if (node.kind === 'heading') html += `<h${node.level}>${inline(node.text)}</h${node.level}>`;
    else if (node.kind === 'quote') html += `<blockquote><p>${inline(node.text)}</p></blockquote>`;
    else if (node.kind === 'code') html += `<pre><code>${esc(node.text)}</code></pre>`;
    else if (node.kind === 'rule') html += '<hr>';
    else if (node.kind === 'table') html += '<div class="article-table"><table><thead><tr>' + node.rows[0].map(c => `<th scope="col">${inline(c)}</th>`).join('') + '</tr></thead><tbody>' + node.rows.slice(1).map(row => '<tr>' + row.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>';
    else html += `<p>${inline(node.text)}</p>`;
  }
  close(); return html;
}
const escapeMarkdown = text => text.replace(/([\\`*_{}\[\]()#+.!|>~\-])/g, '\\$1');
function blocksToMarkdown(blocks) {
  return blocks.map(block => (block.kind === 'heading' ? '## ' : block.kind === 'list-item' ? '- ' : '') + escapeMarkdown(block.text)).join('\n\n');
}
module.exports = { parseMarkdown, renderMarkdown, figure, blocksToMarkdown, safeLink, esc, unescape };
