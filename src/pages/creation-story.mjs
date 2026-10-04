import {Button} from '../ui/components.mjs';

const chapters = [
  {era:'1661–1662 · Before industrialization', title:'A craft took years to master.', copy:'Making something meant learning its tools, techniques, and trade.', image:'/creation-craft.jpg', tone:'craft', color:'#39352b', alt:'The Tailor’s Workshop, painted by Quiringh van Brekelenkam in 1661–1662, shows tailors sewing by hand.'},
  {era:'1913 · Industrialization', title:'Machines multiplied output.', copy:'Mechanization and assembly lines brought speed and scale to production.', image:'/creation-industry.jpg', tone:'industry', color:'#343c40', alt:'Workers assemble automotive parts on Ford’s moving assembly line in 1913.'},
  {era:'1984 · Personal computing', title:'Many tools. One computer.', copy:'Writing, designing, calculating, and building became possible on the same machine.', image:'/creation-computer.jpg', tone:'computer', color:'#573a36', alt:'An original Macintosh displaying a graphics application, photographed by Bernard Gotfryd in January 1984.'},
  {era:'2025 · AI', title:'Now your ideas can go further.', copy:'AI helps you cross disciplines, explore, and make. You choose the direction.', image:'/creation-ai.jpg', tone:'ai', color:'#233c3f', alt:'An actual ChatGPT interface on a laptop, photographed by Aerps.com in 2025.'},
];

export default function CreationStory() {
  return `<section class="creation-story" id="first-content" tabindex="-1" aria-labelledby="creation-timeline-title">
<div class="creation-story-inner">
<div class="creation-timeline">
<div class="creation-atmosphere" aria-hidden="true"></div>
<header class="creation-timeline-heading"><p class="creation-era">The history of possibility</p><h2 id="creation-timeline-title">How technology expanded what one person can create.</h2></header>
<div class="creation-visual-stage" aria-hidden="true"><div class="creation-visual-stack">${chapters.map((chapter,index)=>`<img class="creation-stage-image creation-tone-${chapter.tone}${index===0?' is-active':''}" src="${chapter.image}" alt="" width="1536" height="1024" loading="lazy" decoding="async">`).join('')}<div class="creation-progress">${chapters.map((chapter,index)=>`<span${index===0?' class="is-active"':''}></span>`).join('')}</div></div></div>
${chapters.map((chapter,index)=>`<article class="creation-chapter creation-tone-${chapter.tone}" data-creation-chapter="${index}" data-chapter-color="${chapter.color}" style="--chapter-bg:${chapter.color}"><figure class="creation-chapter-media"><img src="${chapter.image}" alt="${chapter.alt}" width="1536" height="1024" loading="lazy" decoding="async"></figure><div class="creation-chapter-copy"><p class="creation-era">${chapter.era}</p><h3${index===0?' id="hub-title"':''}>${chapter.title}</h3><p class="creation-chapter-description">${chapter.copy}</p></div></article>`).join('')}
</div>
<section class="creation-access" aria-labelledby="creation-access-title">
<div class="creation-access-heading"><h2 id="creation-access-title">Access is only<br>the beginning.</h2><p>Use is not the same as knowing what to make.</p></div>
<figure class="creation-survey"><div class="creation-survey-number"><strong>44%</strong><p>of U.S. adults say they ever use ChatGPT.</p></div><div class="creation-dots" role="img" aria-label="100 dots represent U.S. adults. 44 highlighted dots represent the 44 percent who say they ever use ChatGPT.">${Array.from({length:100},(_,index)=>`<span${index<44?' class="is-use"':''}></span>`).join('')}</div><figcaption><p>Reported use, not skill.</p><a href="https://www.pewresearch.org/chart/majorities-of-adults-under-50-now-use-chatgpt/">Pew Research Center, February 2026</a></figcaption></figure>
</section>
<section class="creation-proof" aria-labelledby="creation-proof-title"><div class="creation-proof-heading"><h2 id="creation-proof-title">You’ve just stepped<br>inside one idea.</h2><a href="/builds/earth-descent/" class="creation-text-link">See how it was made<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a></div><a class="creation-proof-image" href="/builds/earth-descent/" aria-label="Explore the Earth descent build"><img src="/earth-descent-preview.jpg" alt="Azivor’s working Earth descent website, captured in the browser." width="1264" height="712" loading="lazy" decoding="async"></a><p class="creation-proof-note">AI helped explore the direction. Human choices shaped the experience.</p></section>
<section class="creation-invitation" aria-labelledby="creation-invitation-title"><h2 id="creation-invitation-title">What do you<br>want to create?</h2><p>Azivor gives you the tools, workflows, and methods to make your idea real.</p><div class="creation-invitation-actions">${Button({label:'Explore',href:'/explore/',variant:'primary',className:'creation-explore'})}<a class="creation-text-link" href="/explore/#first-experiment">Start with your idea<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a></div></section>
</div>
</section>`;
}
