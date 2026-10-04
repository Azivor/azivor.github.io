import {Button, Logo, surfaceAttributes} from "../ui/components.mjs";
import {footer, header, head} from "./site-shell.mjs";

export default function Home({study=false}={}){ return `<!doctype html>
<html lang="en">
${head({title:study?"Earth descent study — Azivor":"Azivor — Build with what AI can do now.",description:study?"Developer visual reference for Azivor’s scroll-driven Earth scene, with viewing instructions and a link to its build case study.":"Discover what modern AI makes possible, understand what it means for you, and turn it into work you can explain and own.",path:study?"/scene-test/":"/",noindex:study})}
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
<h1 id="hero-title">Build with what<br>AI can do now.</h1>
<p class="intro">Explore what AI makes possible. Make something you can understand and own.</p>
<div class="hero-actions">${Button({label:"Explore",href:"#first-content",variant:"primary",className:"descent-link",icon:"down"})}</div>
</div>
<div class="scene-status"><p class="scene-status-text" role="status" aria-live="polite">Preparing Earth…</p><button class="scene-retry" type="button" hidden>Retry Earth</button></div>
<div class="scroll-cue" aria-hidden="true"><span>Scroll to descend</span><span class="cue-line"></span></div>
<div class="landing-wash" aria-hidden="true"></div>
<div ${surfaceAttributes({variant:"light",className:"showcase"})} tabindex="-1" aria-labelledby="showcase-title">
<div class="showcase-copy"><h2 id="showcase-title">Make something.<br><span>See what holds up.</span></h2><p>Discover the possibility. Understand it. Try your own version.</p></div>
<div class="showcase-emblem" aria-hidden="true">${Logo()}</div>
</div>
</div>
<div class="journey-target" id="possibilities" aria-hidden="true"></div>
</section>
<div class="content-flow">
${study?'<section class="content-section" aria-labelledby="study-title"><p class="eyebrow">Scene study</p><h2 id="study-title">Inspect the descent.</h2><p>This reference uses the homepage scene and content to inspect its scroll transitions in context. Scroll from orbit through the atmosphere to the landing reveal. It is not a separate learning activity. Reduced motion keeps the scene still. If WebGL is unavailable, a gradient background and usable page content remain available; graphics performance has not been established across devices.</p><a class="text-link" href="/builds/#earth-descent">Return to the Earth descent case study</a> · <a class="text-link" href="/">View the public homepage</a></section>':''}
<section class="home-hub" id="first-content" tabindex="-1" aria-labelledby="hub-title"><div class="hub-heading"><h2 id="hub-title">Ideas worth<br>trying.</h2><p>A build to explore. A small idea to make your own.</p></div><div class="hub-layout"><a class="hub-project" href="/builds/earth-descent/"><div class="hub-project-image"><img src="/earth-descent-preview.jpg" alt="Azivor’s opening Earth scene, captured from the live homepage." width="1264" height="712" loading="lazy"></div><div class="hub-project-caption"><h3>From orbit to sky.</h3><span>Open the project<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span></div></a><div class="hub-paths"><a href="/explore/#first-experiment"><h3>Make one<br>good revision.</h3><p>Use AI as a critic. You choose what changes.</p><span>Try the exercise</span></a><a href="/explore/#workflows"><h3>Keep the<br>thinking yours.</h3><p>A workflow for results you can explain and check.</p><span>Explore the Human Loop</span></a></div></div><div class="hub-footnote"><p>Test it first. Write about it second.</p><a href="/about/">Why Azivor exists</a><a href="/explore/#new-capabilities">Test a new tool</a></div></section>
</div>
</main>${footer()}
</div>
<script src="/script.js" defer></script><script type="module" src="/sky-scene.js"></script>
</body></html>`; }
