import {Button, Logo, Navigation, surfaceAttributes} from "../ui/components.mjs";
export default function Home(){ return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#d7e8fc">
<title>Project AGI — A little beyond the ordinary.</title>
<meta name="description" content="A first look at Project AGI. A space for ideas, curiosity, and what comes next.">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2216%22%20fill%3D%22%23e1f1fc%22%2F%3E%3Cg%20transform%3D%22translate%288%208%29%22%20color%3D%22%23265b99%22%3E%3Cpath%20fill%3D%22currentColor%22%20fill-rule%3D%22evenodd%22%20d%3D%22M4%2040%2035%204%2028%2025%2029%2032H17ZM21%2025H28L30%2014Z%22%2F%3E%3Cpath%20fill%3D%22currentColor%22%20opacity%3D%22.72%22%20d%3D%22m35%204%208%2036-14-8-1-7Z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/ui/tokens.css">
<link rel="stylesheet" href="/ui/base.css">
<link rel="stylesheet" href="/ui/components.css">
<link rel="stylesheet" href="/home.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<div class="page" id="top">
<header class="header">
<a class="wordmark" href="#top" aria-label="Project AGI home">${Logo()} project agi<span class="brand-period">.</span></a>
${Navigation({items:[{label:"Home",href:"#top"},{label:"The idea",href:"#possibilities"},{label:"About",href:"#about"}],active:"#top"})}
</header>
<main id="main">
<section class="hero" aria-labelledby="hero-title">

<h1 id="hero-title">A little beyond<br>the ordinary.</h1>
<p class="intro">Big ideas start with a little curiosity.<br>Welcome to the beginning of something new.</p>
<div class="hero-actions">${Button({"label": "Explore", "href": "#possibilities", "variant": "primary", "icon": "\u2193", "className": ""})}${Button({"label": "About", "href": "#about", "variant": "glass", "icon": "", "className": "secondary"})}</div>

<div ${surfaceAttributes({variant:"light",className:"showcase"})} id="possibilities" tabindex="-1" aria-labelledby="showcase-title">
<div class="showcase-copy"><h2 id="showcase-title">What if<br><em>is only the beginning.</em></h2><p>A place for the things we haven’t imagined yet.</p></div>
<div class="showcase-emblem" aria-hidden="true">${Logo()}</div>
</div>
</section>
<section class="about" id="about" tabindex="-1" aria-labelledby="about-title"><h2 id="about-title">A blank page.<br><em>Endless possibilities.</em></h2><p>The rest of the story is still being written.</p>${Button({"label": "Back to top", "href": "#top", "variant": "glass", "icon": "\u2191", "className": ""})}</section>
</main>
<footer><a class="wordmark footer-mark" href="#top" aria-label="Project AGI home">${Logo()}project agi.</a><span>© 2026 Project AGI</span></footer>
</div>
<script src="/script.js" defer></script>
</body></html>`; }
