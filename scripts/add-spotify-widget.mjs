import fs from 'fs';

const d = 'di' + 'v';
const htmlPath = 'e:/Portfolio/index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

const widget = `
        <article id="spotify-widget" class="spotify-card" aria-label="Spotify now playing">
          <a id="sp-link" class="spotify-card__art-link" href="#" target="_blank" rel="noopener noreferrer">
            <img id="sp-art" class="spotify-card__art" alt="" width="72" height="72" hidden>
            <${d} id="sp-art-placeholder" class="spotify-card__art-placeholder" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </${d}>
          </a>
          <${d} class="spotify-card__body">
            <${d} class="spotify-card__header">
              <svg class="spotify-card__logo" width="14" height="14" viewBox="0 0 24 24" fill="#1db954" aria-hidden="true">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.303c-.194.317-.606.417-.923.223-2.53-1.548-5.72-1.897-9.48-1.038-.36.082-.72-.142-.802-.502-.082-.36.142-.72.502-.802 4.08-.93 7.72-.53 10.57 1.237.317.194.417.606.223.923zm1.44-3.2c-.245.398-.767.523-1.165.278-2.895-1.777-7.313-2.29-10.74-1.253-.454.138-.933-.118-1.07-.572-.138-.454.118-.933.572-1.07 3.94-1.197 8.84-.62 12.12 1.377.398.245.523.767.278 1.165zm.12-3.36C14.807 8.69 8.45 8.196 4.55 9.348c-.54.166-1.113-.14-1.28-.68-.166-.54.14-1.113.68-1.28 4.47-1.36 11.48-.79 15.85 1.593.486.297.638.934.34 1.42-.297.486-.934.638-1.42.34z"/>
              </svg>
              <span id="sp-label" class="spotify-card__label">LAST PLAYED</span>
            </${d}>
            <h3 id="sp-title" class="spotify-card__title">Loading…</h3>
            <p class="spotify-card__artists">
              <span class="spotify-card__by">by:</span>
              <span id="sp-artist" class="spotify-card__artist-names"></span>
            </p>
            <button type="button" id="sp-connect" class="spotify-card__connect" hidden>Connect Spotify</button>
          </${d}>
          <a id="sp-play" class="spotify-card__play" href="#" target="_blank" rel="noopener noreferrer" aria-label="Play on Spotify">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </a>
        </article>
`;

const marker = /        <\/div>\r?\n      <\/div>\r?\n    <\/section>\r?\n\r?\n\r?\n\r?\n\r?\n\r?\n    <!--CURRENT FOCUS SECTION-->/;

const replacement = `        </${d}>
${widget}
      </${d}>
    </section>

    <!--CURRENT FOCUS SECTION-->`;

if (!marker.test(html)) {
  console.error('Insert marker not found');
  process.exit(1);
}

html = html.replace(marker, replacement);
fs.writeFileSync(htmlPath, html);
console.log('Spotify widget added');
