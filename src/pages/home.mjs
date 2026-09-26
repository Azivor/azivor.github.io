import {Button, Logo, Navigation, surfaceAttributes} from "../ui/components.mjs";

export default function Home(){ return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#081432">
<title>Azivor — A little beyond the ordinary.</title>
<meta name="description" content="A first look at Azivor. A space for ideas, curiosity, and what comes next.">
<link rel="icon" type="image/png" href="/azivor-logo.png">
<link rel="preload" as="image" href="/space-orbit.webp" fetchpriority="high">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/ui/tokens.css"><link rel="stylesheet" href="/ui/base.css"><link rel="stylesheet" href="/ui/components.css"><link rel="stylesheet" href="/home.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<div class="page" id="top">
<header class="header">
<a class="wordmark" href="#top" aria-label="Azivor home">${Logo()} azivor<span class="brand-period">.</span></a>
<button class="nav-toggle" type="button" aria-controls="site-navigation" aria-expanded="false"><span>Menu</span><span class="nav-toggle-icon" aria-hidden="true"></span></button>
${Navigation({items:[{label:"Home",href:"#top"},{label:"The idea",href:"#possibilities"},{label:"About",href:"#about"}],active:"#top"})}
</header>
<main id="main">
<section class="journey" aria-labelledby="hero-title">
<div class="journey-stage">
<canvas id="sky-scene" class="sky-scene" aria-hidden="true"></canvas>
<div class="intro-space" aria-hidden="true"></div>
<div class="scene-vignette" aria-hidden="true"></div>
<div class="hero-content">
<h1 id="hero-title">A little beyond<br>the ordinary.</h1>
<p class="intro">Big ideas start with a little curiosity.<br>Welcome to the beginning of something new.</p>
<div class="hero-actions">${Button({label:"Explore",href:"#possibilities",variant:"primary",icon:"\u2193"})}${Button({label:"About",href:"#about",variant:"glass",className:"secondary"})}</div>
</div>
<div class="scroll-cue" aria-hidden="true"><span>Scroll to descend</span><span class="cue-line"></span></div>
<div class="flight-path" aria-hidden="true"><span class="contrail"></span><span class="flight-mark">${Logo()}</span></div>
<div ${surfaceAttributes({variant:"light",className:"showcase"})} tabindex="-1" aria-labelledby="showcase-title">
<div class="showcase-copy"><h2 id="showcase-title">What if<br><em>is only the beginning.</em></h2><p>A place for the things we haven’t imagined yet.</p></div>
<div class="showcase-emblem" aria-hidden="true">${Logo()}</div>
</div>
</div>
<div class="journey-target" id="possibilities" aria-hidden="true"></div>
</section>
<section class="about" id="about" tabindex="-1" aria-labelledby="about-title"><h2 id="about-title">A blank page.<br><em>Endless possibilities.</em></h2><p>The rest of the story is still being written.</p>${Button({label:"Back to top",href:"#top",variant:"glass",icon:"\u2191"})}</section>
</main>
<footer><a class="wordmark footer-mark" href="#top" aria-label="Azivor home">${Logo()}azivor.</a><span>© 2026 Azivor</span></footer>
</div>
<script src="/script.js" defer></script><script type="module" src="/sky-scene.js"></script>
</body></html>`; }
