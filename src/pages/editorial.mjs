import {escapeHTML} from '../ui/components.mjs';

export function Contents(items, label='On this page') {
  return `<nav class="page-contents" aria-label="${escapeHTML(label)}"><p class="contents-label">${escapeHTML(label)}</p><ol>${items.map(([id,title],i)=>`<li><a href="#${escapeHTML(id)}"><span class="contents-number" aria-hidden="true">0${i+1}</span><span>${escapeHTML(title)}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a></li>`).join('')}</ol></nav>`;
}

export function BuildFeature({description='A real scene, with its shader, imagery, scroll behavior, and design tradeoffs.'}={}) {
  return `<a class="project-feature" href="/builds/#earth-descent"><div class="project-feature-image"><img src="/earth-descent-preview.jpg" alt="" width="1264" height="712" loading="lazy"></div><div class="project-feature-copy"><span class="feature-kicker">Build · Tested 26 September 2026</span><h3>An Earth descent for the Azivor homepage</h3><p>${escapeHTML(description)}</p><span class="project-feature-action">Inspect the build <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span></div></a>`;
}

export function Steps(items, label) {
  return `<ol class="process-list" role="list" aria-label="${escapeHTML(label)}">${items.map(([title,body],i)=>`<li><span class="step-number" aria-hidden="true">0${i+1}</span><div><h3>${title}</h3>${body}</div></li>`).join('')}</ol>`;
}
