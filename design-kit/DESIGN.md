# Playhead Pulse Design System

This file describes the exact look of the Playhead Pulse shop so that a new page (for example the free-pack landing page) looks identical. **Read this first, then reuse the files in this kit instead of re-creating anything.**

## 0. How to use this kit in a new project

1. Copy the whole `design-kit` folder into the new project.
2. Link `css/theme.css` (it already contains the tokens) and `js/base.js`. Load the fonts (see section 2).
3. Paste `icons/sprite-inline.html` right after `<body>` to get the icons (`<svg><use href="#p-download"/></svg>`).
4. Start from `starter/index.html`: it already uses header, hero, form, trust cards, FAQ and footer in the correct way.
5. Use the class names from section 5. Do not write new CSS for things that already have a class. If something new is needed, build it from the tokens in section 1 and the rules in section 7.

`js/shop-theme.reference.js` is the full shop script (cart, sound players, hero spectrum, bento animations). It is **reference only**: it expects shop markup and calls the Shopify cart. Copy single modules from it if needed (for example the hero spectrum or the count-up), but do not include the whole file.

## 1. Brand

- Name: **Playhead Pulse**. Sells sound effects (SFX) for short-form video editors (Reels, TikTok, YouTube Shorts).
- Look: light, flat, clean and modern. White page, soft grey cards with rounded corners, one violet accent, big tight headings. Premium, not playful.
- Tone of voice: short and plain. Sentence case. No hype words, no exclamation marks, no emoji. Say what it does, e.g. "Trimmed to the frame", "Drop it in and go". Headings are usually 2 to 6 words. UI language is English.
- Logo: `img/logo.webp` (dark text, violet icon, transparent) and `img/logo-light.webp` (white text, for dark backgrounds). Never recolor or redraw it. Minimum height 24px.

## 2. Color

All colors are CSS variables in `css/tokens.css`.

| Token | Value | Use |
|---|---|---|
| `--bg` | #ffffff | page background |
| `--surface` | #f4f4f6 | cards, bands, inputs on white |
| `--surface-2` / `--surface-3` | #ebebef / #e1e1e7 | hover and nested surfaces |
| `--ink` | #0a0a0f | headings, dark buttons, dark cards |
| `--ink-2` | #50505c | body text |
| `--ink-3` | #8d8d99 | captions, labels, placeholders |
| `--ink-4` | #c4c4cd | disabled, dividers made of fill |
| `--accent` | #5b2bf0 | the brand violet: primary buttons, tags, highlights |
| `--accent-2` | #4a1dd6 | accent hover |
| `--accent-soft` | #ece6ff | tinted backgrounds, "best match" rows |
| `--success` | #0f9d58 | positive text only (saving pills, verified) |

Rules: one accent only (violet). Pure black `#000` is used only for the hero and dark feature blocks. **No gradients** anywhere, with one exception: the glowing spectrum inside the black hero (`.hs`).

## 3. Typography

- Sans: **Inter** (Google Fonts, variable). Load: `https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..800&family=Geist+Mono:wght@400;500&display=swap`
- Mono: **Geist Mono**, only for file names (`Whoosh_Fast.wav`), timecodes and tiny labels.
- Headings: weight **600**, letter-spacing about **-0.045em**, line-height **0.95 to 1.05**, `text-wrap: balance`. Classes: `.hero__title` (largest), `.h1`, `.h2`, `.h3`.
- Body: 16px, line-height 1.55, color `--ink-2`. Lead paragraph: class `.lead` (1.05 to 1.25rem).
- Labels: small pills with class `.eyebrow` (grey pill above a heading). Do not use uppercase, letter-spaced labels.
- Prices: class `.price` (Inter 600), old price `.price--was` (struck through, grey), saving `.savings-pill` (green pill).

## 4. Layout and shape

- Content column: `.container` is max **1500px** wide with 16px gutters (28px from 640px, 48px from 1024px). **Every section uses the same column.** Grey bands and cards (`.section--surface`, `.bc`, `.signup`) are exactly container width, not edge to edge.
- Full-bleed exceptions on purpose: the black hero (`.hs`), the footer (`.site-footer`) and the scrolling logo strip (`.marquee`).
- Vertical rhythm is compact: `--section-y` is 28 to 48px between sections. Do not add big empty gaps.
- Corners: cards and bands `--r-lg` (28px), inner tiles `--r` (18px), inputs and small blocks `--r-sm` (12px), buttons and pills fully round (`--r-pill`). The black hero and the footer have square edges.
- **No outlines and no borders.** Separation comes from fill color (grey on white, white on grey) and spacing. Focus rings are the only outline.
- Shadows are rare and soft, used only for floating elements (drawers, floating labels).

## 5. Components (use these classes)

Buttons
- `.btn .btn--primary` violet, main action. `.btn--dark` black. `.btn--soft` grey (white inside grey cards). `.btn--white` white (on dark). `.btn--glass` translucent (on the hero). Sizes: default 54px high, `.btn--sm` 42px, `.btn--block` full width. Arrow icons use `<svg class="i-move">`.
- Text link with animated underline: `.link` containing `<span>` and an arrow icon.

Header (`.site-header`)
- Logo centered on phones, logo left and nav in the middle on desktop (only if nav exists). Cart and CTA on the right.
- On pages that start with the black hero, the header is transparent with the white logo, and turns white with the dark logo after 40px of scroll (class `.is-scrolled`, set by `js/base.js`). On pages without hero it is white.

Hero
- Black `.hs` block (full width, square) with a moving violet spectrum and a play orb. Reference: `.hs*` in `css/theme.css` and the "Hero spectrum" module in `js/shop-theme.reference.js`. For simpler pages use the light hero from `starter/index.html` (eyebrow, huge heading, lead, form).

Cards and bands
- Grey card `.bc` (bento card), grey band `.section--surface`, trust cards `.trust` (4 across, icon chip + title + one line), feature rows `.ps__list`.
- Dark call-to-action card `.signup` (black, rounded, with waveform bars in the back, heading left, form right). Use it for newsletter or lead capture.

Forms
- `.form` is an input and a button in one row (wraps on phones). `.form--soft` gives a grey input. Inputs are pill-shaped, 56px high, no border.

FAQ
- `.faq` + `.acc` with native `<details><summary>`. Questions sit in two columns on desktop. Plus icon rotates when open.

Other
- `.marquee` scrolling logo strip (always running), `.tag` small violet pill on images, `.toast`, `.drawer`.

## 6. Icons

- Two sets in `icons/sprite-inline.html`, used as `<svg aria-hidden="true"><use href="#ID"/></svg>`.
  - `i-*` simple line icons with rounded ends (bag, menu, close, play, arrow, check, search, star, shield, speaker).
  - `p-*` two-tone feature icons (black plus violet): `p-download`, `p-inbox`, `p-editors`, `p-drop`, `p-once`, `p-lock`. `c-*` are the category icons.
- Style: rounded ends, no sharp corners, black plus violet detail. Do not use stock icon packs or emoji.
- Real app logos (Premiere, Final Cut, DaVinci, CapCut, After Effects, Instagram, TikTok, YouTube) are only used in the logo strip, as the images' own icons.

## 7. Motion

- Easings: `--ease` for hovers, `--ease-out` for entrances. Hover: buttons lift 1px, cards 3px, links underline in.
- Entrances: add class `.reveal` to blocks, `js/base.js` fades them up (24px) when scrolled into view. Stagger with `.reveal-d1`, `.reveal-d2`.
- Hero title lines slide up from a mask. Counters count up. Everything must respect `prefers-reduced-motion` (already handled in the CSS).
- Keep motion calm. No bouncing, no parallax.

## 8. Do and don't

Do
- Reuse `css/theme.css` classes. Keep one violet accent. Keep text short.
- Use white cards inside grey sections and grey cards inside white sections.
- Keep a mobile layout for everything (the shop is mobile-first, test at 375px).

Don't
- No borders or outlines, no sharp corners (except hero and footer), no gradients (except the hero spectrum).
- No second accent color, no extra fonts, no stock photos, no emoji.
- No uppercase mono labels, no all-caps headings, no heavy drop shadows.
- Don't copy fake numbers, fake reviews or fake logos. Use real content.

## 9. Page recipe for a free-pack landing page (suggestion)

1. Light hero: eyebrow "Free download", huge heading ("Get 50 free sound effects."), one lead sentence, email form, small consent line.
2. Trust cards (`.trust`): instant link, every editor, 100% free, no spam.
3. Optional: "What's inside" with 3 to 4 bento cards (`.bc`) or a short list of sample sounds with play buttons (`.sound` + `.play-btn`).
4. FAQ (4 questions).
5. Dark `.signup` card as a second chance to sign up, then the footer with Imprint and Privacy links.
After submit: replace the form with a calm confirmation ("Check your inbox") in the same card.
