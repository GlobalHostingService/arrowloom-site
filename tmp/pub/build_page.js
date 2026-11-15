// Builds an app page for globalhostingservice.com/apps/<slug>/ from the Homeprint page as the template.
// Run inside a logged-in WHM tab (see the project doc ghs-website/APPS-GAMES.md): it needs
//   get(dir, file) -> text            (Fileman get_file_content)
//   P    = one entry of pages.json     (this folder)
//   all  = the whole pages.json object (for the "More apps" cards)
//   live = true once the app is on Google Play (adds the store button and install links)
// Returns the complete HTML of the page as a string. Never write "free" in these pages.
window.__buildAppPage = async (get, P, all, live) => {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const tpl = await get('/home/globalho/public_html/apps/homeprint', 'index.html');
  const doc = new DOMParser().parseFromString(tpl, 'text/html');
  const play = 'https://play.google.com/store/apps/details?id=' + P.pkg;
  const url = 'https://globalhostingservice.com/apps/' + P.slug + '/';
  const icon = 'https://globalhostingservice.com/assets/apps/' + P.slug + '-icon.png';
  const shots = [1, 2, 3].map(i => 'https://globalhostingservice.com/assets/apps/' + P.slug + '-shot' + i + '.webp');
  // ---- head
  doc.querySelector('title').textContent = P.title;
  const set = (sel, attr, val) => { const e = doc.head.querySelector(sel); if (!e) throw new Error('missing ' + sel); e.setAttribute(attr, val); };
  set('meta[name="description"]', 'content', P.desc); set('meta[name="keywords"]', 'content', P.keywords);
  set('link[rel="canonical"]', 'href', url);
  set('meta[property="og:title"]', 'content', P.title); set('meta[property="og:description"]', 'content', P.desc);
  set('meta[property="og:url"]', 'content', url); set('meta[property="og:image"]', 'content', icon);
  const org = { '@type': 'Organization', name: 'Global Hosting Service', url: 'https://globalhostingservice.com/' };
  const app = { '@context': 'https://schema.org', '@type': 'MobileApplication', name: P.h1, alternateName: P.short, description: P.desc, url, image: icon, screenshot: shots, operatingSystem: 'ANDROID', applicationCategory: P.cat };
  if (live) { app.installUrl = play; app.downloadUrl = play; }
  app.author = org; app.publisher = org;
  const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: P.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', 'https://globalhostingservice.com/'], ['Apps', 'https://globalhostingservice.com/apps/'], [P.short, url]].map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) };
  const olds = [...doc.querySelectorAll('script[type="application/ld+json"]')]; if (olds.length !== 3) throw new Error('template changed: ld+json count ' + olds.length);
  [app, faq, crumbs].forEach((j, i) => { olds[i].textContent = JSON.stringify(j); });
  // ---- body
  const c = doc.body.children;
  if (!(c[1].classList.contains('ag-hero') && c[2].id === 'features' && c[3].id === 'screens' && c[4].id === 'faq' && c[5].id === 'more')) throw new Error('template changed: sections');
  const cta = live ? `<a class="btn" href="${play}" rel="noopener">Get it on Google Play</a>` : `<span class="btn" style="opacity:.8;cursor:default">Coming soon on Google Play</span>`;
  const hero = `<section class="sub-hero ag-hero"><div class="wrap">
<div class="ag-crumb"><a href="/">Home</a> › <a href="/apps/">Apps</a> › ${esc(P.short)}</div>
<div class="ag-head"><img src="/assets/apps/${P.slug}-icon.png" alt="${esc(P.short)} app icon" width="112" height="112">
<div><div class="eyebrow">${esc(P.eyebrow)}</div>
<h1>${esc(P.h1)}</h1></div></div>
<p>${esc(P.intro)}</p>
<div class="cta">${cta}<a class="btn ghost" href="#features">See features</a></div>
</div></section>`;
  const features = `<section id="features"><div class="wrap">
<div class="sec-head"><div class="eyebrow">Features</div><h2>${esc(P.featH2)}</h2></div>
<div class="grid3">${P.tiles.map(([h, p]) => `<div class="tile"><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div>
</div></section>`;
  const screens = `<section id="screens"><div class="wrap">
<div class="sec-head"><div class="eyebrow">Screenshots</div><h2>${esc(P.short)} on Android</h2></div>
<div class="ag-shots">${[1, 2, 3].map(i => `<img src="/assets/apps/${P.slug}-shot${i}.webp" alt="${esc(P.short)} screenshot ${i}" loading="lazy">`).join('')}</div>
</div></section>`;
  const faqHtml = `<section id="faq"><div class="wrap">
<div class="sec-head"><div class="eyebrow">FAQ</div><h2>${esc(P.short)} questions</h2></div>
<div class="faq">${P.faq.map(([q, a], i) => `<details${i ? '' : ' open=""'}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
<p class="ag-note">Developer: Global Hosting Service · ${live ? `<a href="${play}" rel="noopener">Google Play</a> · ` : ''}<a href="/apps/${P.slug}/privacy.html">Privacy policy</a> · <a href="mailto:info@globalhostingservice.com">info@globalhostingservice.com</a></p>
</div></section>`;
  const fixed = [
    `<a class="ag-card" href="/apps/marqoom/"><img src="/assets/apps/marqoom-icon.png?v=2" alt="Marqoom icon" width="72" height="72" loading="lazy"><span><b>Marqoom</b><small>Finance · Android</small><em>Digital khata for shops and small businesses</em></span></a>`,
    `<a class="ag-card" href="/apps/homeprint/"><img src="/assets/apps/homeprint-icon.png" alt="Homeprint icon" width="72" height="72" loading="lazy"><span><b>Homeprint</b><small>House &amp; Home · Android</small><em>Your home's manual, ready to hand over</em></span></a>`,
  ];
  const others = Object.values(all).filter(o => o.slug !== P.slug).map(o => `<a class="ag-card" href="/apps/${o.slug}/"><img src="/assets/apps/${o.slug}-icon.png" alt="${esc(o.short)} icon" width="72" height="72" loading="lazy"><span><b>${esc(o.short)}</b><small>${esc(o.small)}</small><em>${esc(o.em)}</em></span></a>`);
  const more = `<section id="more"><div class="wrap">
<div class="sec-head"><div class="eyebrow">More from us</div><h2>More apps by Global Hosting Service</h2></div>
<div class="ag-grid">${fixed.concat(others).join('')}</div>
<nav class="ag-tabs" aria-label="Apps and games"><a href="/games/">Games</a><a href="/apps/" aria-current="page">Apps</a></nav>
</div></section>`;
  c[1].outerHTML = hero; doc.body.children[2].outerHTML = features; doc.body.children[3].outerHTML = screens; doc.body.children[4].outerHTML = faqHtml; doc.body.children[5].outerHTML = more;
  const html = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML + '\n';
  if (/omeprint/.test(html.replace(/\/apps\/homeprint\/|homeprint-icon\.png|Homeprint icon|<b>Homeprint<\/b>/g, ''))) throw new Error('template text left in page');
  return html;
};
