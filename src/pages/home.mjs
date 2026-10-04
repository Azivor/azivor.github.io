import {roleIcon} from "../ui/role-icons.mjs";
import {Button} from "../ui/components.mjs";
import CreationStory, {TimelineHeading} from "./creation-story.mjs";
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
<h1 id="hero-title" aria-label="You can be a designer, a developer, a filmmaker, a writer, a researcher, a animator, a builder, or a creator."><span class="ui-sr-only">You can be a designer, developer, filmmaker, writer, researcher, animator, builder, creator.</span><span class="hero-prefix" aria-hidden="true">You can be a</span><span class="hero-roles" aria-hidden="true">${["designer","developer","filmmaker","writer","researcher","animator","builder","creator"].map((role,index)=>`<span class="hero-role${index===0?' is-current':''}">${`<span class="role-label">${role}<span class="role-symbol">${roleIcon(role)}</span></span>`}</span>`).join('')}</span></h1>
<p class="intro">AI expands what you can create.<br>Azivor helps you make it real.</p>
<div class="hero-actions">${Button({label:"Explore what you can create",href:"#first-content",variant:"primary",className:"descent-link",icon:"down"}).replace("Explore what you can create", '<span class="descent-label-full">Explore what you can create</span><span class="descent-label-short">Explore</span>')}</div>
</div>
<div class="scene-status"><p class="scene-status-text" role="status" aria-live="polite">Preparing Earth…</p><button class="scene-retry" type="button" hidden>Retry Earth</button></div>
<div class="scroll-cue" aria-hidden="true"><span>Scroll to descend</span><span class="cue-line"></span></div>
<div class="landing-wash" aria-hidden="true"></div>
${TimelineHeading()}
</div>
<div class="journey-target" id="possibilities" aria-hidden="true"></div>
</section>
<div class="content-flow">
${study?'<section class="content-section" aria-labelledby="study-title"><p class="eyebrow">Scene study</p><h2 id="study-title">Inspect the descent.</h2><p>This reference uses the homepage scene and content to inspect its scroll transitions in context. Scroll from orbit through the atmosphere to the landing reveal. It is not a separate learning activity. Reduced motion keeps the scene still. If WebGL is unavailable, a gradient background and usable page content remain available; graphics performance has not been established across devices.</p><a class="text-link" href="/builds/earth-descent/">Return to the Earth descent case study</a> · <a class="text-link" href="/">View the public homepage</a></section>':''}
${CreationStory()}
</div>
</main>${footer()}
</div>
<script src="/script.js" defer></script><script type="module" src="/sky-scene.js"></script><script src="/hero-roles.js" defer></script><script src="/creation-story.js" defer></script>
</body></html>`; }
