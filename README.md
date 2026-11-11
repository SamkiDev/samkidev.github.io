# samkidev.github.io

Personal portfolio of Samalani Maluwa (SamkiDev). Plain HTML, CSS and JavaScript: no build step, no dependencies.

## Run locally

```bash
python -m http.server 8790
```

Then open http://localhost:8790.

## Where to change things

| What | Where |
|---|---|
| Projects (add one object per project) | `js/projects.js` |
| Emails, LinkedIn, form endpoint, live status line, profile photo | `js/config.js` |
| Colours (palette as CSS variables) | top of `css/styles.css` |
| About text, achievements | `index.html` |
| Social preview image | `tools/og-image.html`, rendered to `assets/og-image.png` by `tools/make-og.js` |

**Profile photo:** save it as `assets/profile.jpg` (portrait, about 960×1200), then set `profilePhoto: "assets/profile.jpg"` in `js/config.js`.

**Contact form:** with `formEndpoint` empty, the form opens the visitor's email app (mailto, using the first address in `emails`). Paste a Formspree endpoint into `formEndpoint` to send messages directly.

## Tests

`tools/test.js` checks 390px and 1440px in both themes: console errors, horizontal scroll, menu, project modals (Esc, close button, backdrop), filters, form validation, links, SEO files, the photo spot, and axe accessibility rules. Playwright is not a dependency of the site; point `NODE_PATH` at an existing install while the site runs locally:

```bash
NODE_PATH=../evans-photography/node_modules node tools/test.js
```

## Publish (GitHub Pages)

The repository must be named `samkidev.github.io` and be public. Pages serves the `main` branch root at https://samkidev.github.io.
