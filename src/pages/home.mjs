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
${Button({"label": "Take a look", "href": "#possibilities", "variant": "glass", "icon": "\u2197", "className": "header-cta"})}
</header>
<main id="main">
<section class="hero" aria-labelledby="hero-title">

<h1 id="hero-title">A little beyond<br>the ordinary.</h1>
<p class="intro">Big ideas start with a little curiosity.<br>Welcome to the beginning of something new.</p>
<div class="hero-actions">${Button({"label": "Explore", "href": "#possibilities", "variant": "primary", "icon": "\u2197", "className": ""})}${Button({"label": "Meet Project AGI", "href": "#about", "variant": "glass", "icon": "", "className": "secondary"})}</div>
<p class="hero-note">An idea in motion. More to come.</p>
<div ${surfaceAttributes({variant:"silver",className:"showcase"})} id="possibilities" aria-labelledby="showcase-title">
<div class="showcase-top"><span class="mini-wordmark">${Logo()}project agi.</span><span class="preview-label">A FIRST LOOK</span><span class="sparkle" aria-hidden="true">✳</span></div>
<div ${surfaceAttributes({variant:"dark",className:"showcase-body"})}><div class="showcase-copy"><span class="kicker">ROOM TO WONDER</span><h2 id="showcase-title">What if<br><em>is only the beginning.</em></h2><p>A place for the things we haven’t imagined yet.<br>One thought, one question, one possibility at a time.</p></div><div ${surfaceAttributes({variant:"light",className:"thought-card"})}><div class="thought-top"><span class="thought-symbol" aria-hidden="true">✳</span><span>A small thought</span><span class="card-number">01</span></div><p>Every great idea<br>begins with<br><em>“what if?”</em></p><div class="card-bottom"><span>LET’S FIND OUT</span><span aria-hidden="true">↗</span></div></div></div>
<div class="showcase-bottom"><span>Curiosity comes first.</span><span>Nothing is set in stone.</span></div>
</div>
</section>
<section class="about" id="about" aria-labelledby="about-title"><span class="kicker">JUST THE BEGINNING</span><h2 id="about-title">A blank page.<br><em>Endless possibilities.</em></h2><p>A little room to think differently. A little space to try something new.<br>The rest of the story is still being written.</p>${Button({"label": "Back to the beginning", "href": "#top", "variant": "glass", "icon": "\u2191", "className": ""})}</section>
</main>
<footer><a class="wordmark footer-mark" href="#top" aria-label="Project AGI home">${Logo()}project agi.</a><span>Made for what comes next.</span><span>© 2026 Project AGI</span></footer>
</div>
<script src="/script.js" defer></script>
</body></html>`; }
