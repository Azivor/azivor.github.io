import {logoPaths} from './logo.mjs';
export const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function choice(value, allowed, name) { if (!allowed.includes(value)) throw new TypeError(`Invalid ${name}: ${value}`); return value; }
function url(value) { const s=String(value); if (!/^(#[^\s]*|\/(?!\/)[^\s\\]*|https?:\/\/[^\s]+|mailto:[^\s]+)$/.test(s)) throw new TypeError('Use a local path, fragment, HTTPS/HTTP URL, or mailto link'); return escapeHTML(s); }
export function Logo() {return `<svg class="brand-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">${logoPaths}</svg>`;}
export function Brand({href='/',label='project agi.',className=''}={}) {return `<a class="wordmark ${escapeHTML(className)}" href="${url(href)}" aria-label="${escapeHTML(label)} home">${Logo()}${escapeHTML(label)}</a>`;}
export function Button({label,href,variant='primary',size='default',icon='',className='',disabled=false,type='button'}={}) {
 choice(variant,['primary','glass','ghost'],'button variant');choice(size,['small','default','large'],'button size');choice(type,['button','submit','reset'],'button type');
 if (!label) throw new TypeError('Button label is required');
 if (href && disabled) throw new TypeError('Disabled links are not supported; use a button or remove the link');
 const classes=`button ${variant} button--${size} ${className}`;
 const body=escapeHTML(label)+(icon?` <span class="arrow" aria-hidden="true">${escapeHTML(icon)}</span>`:'');
 return href?`<a class="${escapeHTML(classes)}" href="${url(href)}">${body}</a>`:`<button class="${escapeHTML(classes)}" type="${type}"${disabled?' disabled':''}>${body}</button>`;
}
export function Navigation({items=[],active='',label='Main navigation'}={}) {return `<nav class="nav" aria-label="${escapeHTML(label)}">${items.map(i=>`<a href="${url(i.href)}"${i.href===active?' class="selected" aria-current="location"':''}>${escapeHTML(i.label)}</a>`).join('')}</nav>`;}
export function surfaceAttributes({variant='light',className=''}={}) {choice(variant,['light','dark','solid'],'surface variant');return `class="ui-surface ui-surface--${variant} ${escapeHTML(className)}"`;}
// children is trusted, author-written HTML, never untrusted user content.
export function Card({variant='light',className='',children=''}={}) {return `<div ${surfaceAttributes({variant,className})}>${children}</div>`;}
export function Badge({label}={}) {return `<span class="ui-badge">${escapeHTML(label)}</span>`;}
export function Section({id,title,eyebrow='',children=''}={}) {if(!id||!title)throw new TypeError('Section id and title are required');return `<section class="ui-section ui-stack" id="${escapeHTML(id)}" aria-labelledby="${escapeHTML(id)}-title">${eyebrow?`<p class="ui-eyebrow">${escapeHTML(eyebrow)}</p>`:''}<h2 class="ui-title" id="${escapeHTML(id)}-title">${escapeHTML(title)}</h2>${children}</section>`;}
export function Field({id,label,type='text',placeholder='',value='',help='',error='',required=false,disabled=false}={}) {
 if(!id||!label)throw new TypeError('Field id and label are required');choice(type,['text','email','password','number','search','url'],'input type');
 const note=error||help; return `<div class="ui-field"><label for="${escapeHTML(id)}">${escapeHTML(label)}</label><input class="ui-input" id="${escapeHTML(id)}" name="${escapeHTML(id)}" type="${type}" value="${escapeHTML(value)}" placeholder="${escapeHTML(placeholder)}"${required?' required':''}${disabled?' disabled':''}${error?' aria-invalid="true"':''}${note?` aria-describedby="${escapeHTML(id)}-help"`:''}>${note?`<p id="${escapeHTML(id)}-help" class="ui-help ${error?'ui-error':''}">${escapeHTML(note)}</p>`:''}</div>`;
}
export function Disclosure({title,children='',open=false}={}) {return `<details class="ui-disclosure"${open?' open':''}><summary>${escapeHTML(title)}</summary>${children}</details>`;}
