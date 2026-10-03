import {Button, Logo, surfaceAttributes} from "../ui/components.mjs";
import {BuildFeature} from "./editorial.mjs";
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
<p class="intro">Azivor helps students discover what modern AI makes possible—and turn it into something they can make, understand, and own.</p>
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
<section class="content-section lanes-section" id="first-content" tabindex="-1" aria-labelledby="lanes-title"><div class="section-intro"><p class="eyebrow">What we explore</p><h2 id="lanes-title">Three ways in.</h2><p>Discover what is possible, understand what it means for your own work, then choose something to try.</p><a class="information-action" href="/explore/#first-experiment">Try the first exercise<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a></div><div class="category-card-gallery home-category-gallery">
<a class="category-card category-card--feature" href="/explore/#build"><span class="category-card-copy"><h3>Build</h3><p>See an idea become a site, tool, or visual.</p></span><img class="category-card-mark" src="/azivor-logo.png" alt="" aria-hidden="true" width="512" height="408" loading="lazy"></a>
<a class="category-card category-card--editorial" href="/explore/#workflows"><span class="category-card-copy"><h3>Human Loop</h3><p>Think, inspect, and verify—with your judgment in the loop.</p></span></a>
<a class="category-card category-card--compact" href="/explore/#new-capabilities"><span class="category-card-copy"><h3>New capabilities</h3><p>Find out what changes in practice when the tools change.</p></span></a>
</div></section>
<section class="content-section latest-section editorial-split" aria-labelledby="latest-title"><div class="section-intro"><p class="eyebrow">Latest</p><h2 id="latest-title">From the workbench.</h2></div><div class="section-body">${BuildFeature({description:"A scroll-driven scene built with a globe, cloud layers, and a small WebGL shader. See the design choices and limits."})}</div></section>
<section class="content-section method-section editorial-split" aria-labelledby="method-title"><div class="section-intro"><p class="eyebrow">How we work</p><h2 id="method-title">Test it first. Write about it second.</h2></div><div class="section-body prose"><p>We start with work we can try or inspect, then share the useful part and its limits. The goal is a result you can explain, verify, and make your own.</p><a class="text-link" href="/explore/#workflows">Try a workflow that keeps you thinking</a></div></section>
</div>
</main>${footer()}
</div>
<script src="/script.js" defer></script><script type="module" src="/sky-scene.js"></script>
</body></html>`; }
