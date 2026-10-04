import {Button} from '../ui/components.mjs';

const chapters = [
  {era:'The editing room', title:'A film could take a whole production.', copy:'Specialist skills. Expensive tools. A team to bring it together.', image:'/creative-workshop.jpg', alt:'A Steenbeck film-editing workstation with physical film reels, photographed by Marcel Oosterwijk in 2010.'},
  {era:'The personal computer', title:'Then the studio fit on a desk.', copy:'Computers put more of the process within reach.', image:'/creative-desktop.jpg', alt:'A laptop running DaVinci Resolve beside a keyboard, photographed by TheRegisti in 2021.'},
  {era:'Now', title:'Now one person can take an idea further.', copy:'AI helps you write, design, build, and revise. You decide what it becomes.', image:'/creative-now.jpg', alt:'One person wearing headphones edits video at a desktop computer, photographed by Mark Cruz in 2017.'},
];

// photographyCredits is trusted, author-written attribution markup.
export default function CreationStory({photographyCredits=''}={}) {
  return `<section class="creation-story" id="first-content" tabindex="-1" aria-labelledby="hub-title">
<div class="creation-story-inner">
<div class="creation-timeline">
<div class="creation-visual-stage" aria-hidden="true"><div class="creation-visual-stack">${chapters.map((chapter,index)=>`<img class="creation-stage-image${index===0?' is-active':''}" src="${chapter.image}" alt="" width="1536" height="1024" loading="lazy" decoding="async">`).join('')}<div class="creation-progress">${chapters.map((chapter,index)=>`<span${index===0?' class="is-active"':''}></span>`).join('')}</div></div></div>
${chapters.map((chapter,index)=>`<article class="creation-chapter" data-creation-chapter="${index}"><figure class="creation-chapter-media"><img src="${chapter.image}" alt="${chapter.alt}" width="1536" height="1024" loading="lazy" decoding="async"></figure><div class="creation-chapter-copy"><p class="creation-era">${chapter.era}</p><h2${index===0?' id="hub-title"':''}>${chapter.title}</h2><p class="creation-chapter-description">${chapter.copy}</p></div></article>`).join('')}
</div>
${photographyCredits?`<details class="creation-photo-credits"><summary>Photography credits</summary>${photographyCredits}</details>`:''}
<section class="creation-access" aria-labelledby="creation-access-title">
<div class="creation-access-heading"><h2 id="creation-access-title">Access is only<br>the beginning.</h2><p>Use is not the same as knowing what to make.</p></div>
<figure class="creation-survey"><div class="creation-survey-number"><strong>44%</strong><p>of U.S. adults say they ever use ChatGPT.</p></div><div class="creation-dots" role="img" aria-label="100 dots represent U.S. adults. 44 highlighted dots represent the 44 percent who say they ever use ChatGPT.">${Array.from({length:100},(_,index)=>`<span${index<44?' class="is-use"':''}></span>`).join('')}</div><figcaption><p>Reported use, not skill.</p><a href="https://www.pewresearch.org/chart/majorities-of-adults-under-50-now-use-chatgpt/">Pew Research Center, February 2026</a></figcaption></figure>
</section>
<section class="creation-proof" aria-labelledby="creation-proof-title"><div class="creation-proof-heading"><h2 id="creation-proof-title">You’ve just stepped<br>inside one idea.</h2><a href="/builds/earth-descent/" class="creation-text-link">See how it was made<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a></div><a class="creation-proof-image" href="/builds/earth-descent/" aria-label="Explore the Earth descent build"><img src="/earth-descent-preview.jpg" alt="Azivor’s working Earth descent website, captured in the browser." width="1264" height="712" loading="lazy" decoding="async"></a><p class="creation-proof-note">AI helped explore the direction. Human choices shaped the experience.</p></section>
<section class="creation-invitation" aria-labelledby="creation-invitation-title"><h2 id="creation-invitation-title">What do you<br>want to create?</h2><p>Azivor gives you the tools, workflows, and methods to make your idea real.</p><div class="creation-invitation-actions">${Button({label:'Explore',href:'/explore/',variant:'primary',className:'creation-explore'})}<a class="creation-text-link" href="/explore/#first-experiment">Start with your idea<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a></div></section>
</div>
</section>`;
}
