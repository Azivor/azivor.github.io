import {Button, Logo, surfaceAttributes} from "../ui/components.mjs";
import {footer, header, head} from "./site-shell.mjs";

export default function Home({study=false}={}){ return `<!doctype html>
<html lang="en">
${head({title:study?"Earth descent study — Azivor":"Azivor — What do you want to create?",description:study?"Developer visual reference for Azivor’s scroll-driven Earth scene, with viewing instructions and a link to its build case study.":"AI has changed what one person can create. Discover what’s possible, then find the tools and workflows to make your idea real.",path:study?"/scene-test/":"/",noindex:study})}
<body${study?' class="descent-study"':''}>
<a class="skip-link" href="#main">Skip to content</a>
<div class="page" id="top">
${header("/")}
<main id="main">
<section class="journey" aria-labelledby="hero-title">
<div class="journey-stage">
<canvas id="sky-scene" class="sky-scene" aria-hidden="true"></canvas>
<div class="shooting-stars" aria-hidden="true"><span class="shooting-star"></span></div>
<div class="scene-vignette" aria-hidden="true"></div>
<div class="hero-content">
${study?'<p class="study-label">Developer visual reference · Earth descent study</p>':''}
<h1 id="hero-title" aria-label="You can be a designer, a developer, a filmmaker, a writer, a researcher, a animator, a builder, or a creator."><span class="ui-sr-only">You can be a designer, developer, filmmaker, writer, researcher, animator, builder, creator.</span><span class="hero-prefix" aria-hidden="true">You can be a</span><span class="hero-roles" aria-hidden="true">${["designer","developer","filmmaker","writer","researcher","animator","builder","creator"].map((role,index)=>`<span class="hero-role${index===0?' is-current':''}">${role}</span>`).join('')}</span></h1>
<p class="intro">AI expands what you can create.<br>Azivor helps you make it real.</p>
<div class="hero-actions">${Button({label:"Explore what you can create",href:"#first-content",variant:"primary",className:"descent-link",icon:"down"}).replace("Explore what you can create", '<span class="descent-label-full">Explore what you can create</span><span class="descent-label-short">Explore</span>')}</div>
</div>
<div class="scene-status"><p class="scene-status-text" role="status" aria-live="polite">Preparing Earth…</p><button class="scene-retry" type="button" hidden>Retry Earth</button></div>
<div class="scroll-cue" aria-hidden="true"><span>Scroll to descend</span><span class="cue-line"></span></div>
<div class="landing-wash" aria-hidden="true"></div>
<div ${surfaceAttributes({variant:"light",className:"showcase"})} tabindex="-1" aria-labelledby="showcase-title">
<div class="showcase-copy"><h2 id="showcase-title">An idea is closer<br><span>to something real.</span></h2><p>AI can help you turn a sketch into a scene, a draft into a story, an idea into a working website. You decide what it becomes.</p></div>
<div class="showcase-emblem" aria-hidden="true">${Logo()}</div>
</div>
</div>
<div class="journey-target" id="possibilities" aria-hidden="true"></div>
</section>
<div class="content-flow">
${study?'<section class="content-section" aria-labelledby="study-title"><p class="eyebrow">Scene study</p><h2 id="study-title">Inspect the descent.</h2><p>This reference uses the homepage scene and content to inspect its scroll transitions in context. Scroll from orbit through the atmosphere to the landing reveal. It is not a separate learning activity. Reduced motion keeps the scene still. If WebGL is unavailable, a gradient background and usable page content remain available; graphics performance has not been established across devices.</p><a class="text-link" href="/builds/earth-descent/">Return to the Earth descent case study</a> · <a class="text-link" href="/">View the public homepage</a></section>':''}
<section class="home-hub" id="first-content" tabindex="-1" aria-labelledby="hub-title">
<div class="hub-heading"><h2 id="hub-title">An idea.<br>A world you can enter.</h2><p>The scene you just travelled through started with an idea.</p></div>
<div class="hub-layout"><a class="hub-project" href="/builds/earth-descent/"><div class="hub-project-image"><img src="/earth-descent-preview.jpg" alt="Azivor’s textured Earth and blue atmosphere, captured from the working website during development." width="1264" height="712" loading="lazy"></div><div class="hub-project-caption"><h3>A cinematic website.</h3><span>See how it was made<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span></div></a>
<div class="hub-evidence"><h3>From a visual idea<br>to a working experience.</h3><p>A textured Earth. Layered clouds. A journey from orbit to sky, rendered in your browser.</p><p>AI helped explore the visual direction. Human choices shaped the pace, the design, and the revisions. Open the build to see the process and what still needs work.</p><a class="text-link" href="/builds/earth-descent/">Explore the project</a></div></div>
<section class="creator-next" aria-labelledby="create-title"><div class="creator-heading"><h2 id="create-title">What do you<br>want to create?</h2><p>A website, a story, a space you imagined.<br>Start with something you want to bring to life.</p></div><div class="creator-methods"><p class="creator-description">Azivor connects that ambition to practical tools, workflows, and methods. Try a first step, inspect what you make, and take it further.</p><div class="hub-paths"><a href="/explore/#first-experiment"><h3>Start with<br>your own idea.</h3><p>Bring a draft or design. Use AI to help make one thoughtful revision.</p><span>Try the first step</span></a><a href="/explore/#workflows"><h3>Find your<br>way to make it.</h3><p>A workflow for directing AI, checking the result, and keeping the choices yours.</p><span>Explore the workflow</span></a></div></div></section>
<div class="hub-footnote"><p>Test it first. Write about it second.</p><a href="/about/">Why Azivor exists</a><a href="/explore/#new-capabilities">Explore tools in practice</a></div></section>
</div>
</main>${footer()}
</div>
<script src="/script.js" defer></script><script type="module" src="/sky-scene.js"></script><script src="/hero-roles.js" defer></script>
</body></html>`; }
