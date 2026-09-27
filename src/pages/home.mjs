import {Button, Logo, surfaceAttributes} from "../ui/components.mjs";
import {footer, header, head} from "./site-shell.mjs";

export default function Home(){ return `<!doctype html>
<html lang="en">
${head({title:"Azivor — Build with what AI can do now.",description:"A student-led project testing how today's AI can help students make useful creative and technical work.",style:"home.css"})}
<body>
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
<h1 id="hero-title">Build with what<br>AI can do now.</h1>
<p class="intro">Azivor is a student-led project testing how rapidly improving AI can help students make useful creative and technical work.</p>
<div class="hero-actions">${Button({label:"Explore",href:"#first-content",variant:"primary",className:"descent-link",icon:"down"})}</div>
</div>
<div class="scroll-cue" aria-hidden="true"><span>Scroll to descend</span><span class="cue-line"></span></div>
<div class="landing-wash" aria-hidden="true"></div>
<div ${surfaceAttributes({variant:"light",className:"showcase"})} tabindex="-1" aria-labelledby="showcase-title">
<div class="showcase-copy"><h2 id="showcase-title">Make something.<br><span>See what holds up.</span></h2><p>Ideas become more useful when we put them to work.</p></div>
<div class="showcase-emblem" aria-hidden="true">${Logo()}</div>
</div>
</div>
<div class="journey-target" id="possibilities" aria-hidden="true"></div>
</section>
<div class="content-flow">
<section class="content-section lanes-section" id="first-content" tabindex="-1" aria-labelledby="lanes-title"><div class="section-intro"><p class="eyebrow">What we explore</p><h2 id="lanes-title">Three ways in.</h2><p>Each starts with a concrete question: what can a student make, improve, or understand with the tools available now?</p></div><div class="category-card-gallery home-category-gallery">
<a class="category-card category-card--feature" href="/explore/#build"><span class="category-card-copy"><h3>Build</h3><p>See an idea become a site, tool, or visual.</p></span><img class="category-card-mark" src="/azivor-logo.png" alt="" aria-hidden="true" width="512" height="408" loading="lazy"></a>
<a class="category-card category-card--editorial" href="/explore/#workflows"><span class="category-card-copy"><h3>Workflows</h3><p>See how scattered steps become one useful way of working.</p></span></a>
<a class="category-card category-card--compact" href="/explore/#new-capabilities"><span class="category-card-copy"><h3>New capabilities</h3><p>Find out what changes in practice when the tools change.</p></span></a>
</div></section>
<section class="content-section latest-section" aria-labelledby="latest-title"><div class="section-intro"><p class="eyebrow">Latest</p><h2 id="latest-title">From the workbench.</h2></div><a class="feature-link" href="/builds/#earth-descent"><span class="feature-kicker">Build · Tested 26 September 2026</span><strong>An Earth descent for the Azivor homepage</strong><span class="feature-description">A scroll-driven scene built with a globe, cloud layers, and a small WebGL shader. See the design choices and limits.</span></a></section>
<section class="content-section method-section" aria-labelledby="method-title"><p class="eyebrow">How we work</p><h2 id="method-title">Test it first. Write about it second.</h2><p>We start with something we can try or inspect. Then we explain the useful part, the human decisions, and what still needs work.</p></section>
</div>
</main>${footer()}
</div>
<script src="/script.js" defer></script><script type="module" src="/sky-scene.js"></script>
</body></html>`; }
