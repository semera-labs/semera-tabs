<h1 align="center">Semera Tabs</h1>

<p align="center"><em>A tabs block for the WordPress block editor.</em></p>

[![Version](https://img.shields.io/badge/version-0.1.1-blue.svg)](./semera-tabs.php)
[![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial-orange.svg)](./LICENSE)
[![WordPress](https://img.shields.io/badge/WordPress-6.5%2B-21759b.svg?logo=wordpress)](https://wordpress.org)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-777bb4.svg?logo=php)](https://php.net)
[![Made with React](https://img.shields.io/badge/editor-React%20%2F%20Gutenberg-61dafb.svg?logo=react)](https://developer.wordpress.org/block-editor/)
[![Built with wp-scripts](https://img.shields.io/badge/built%20with-%40wordpress%2Fscripts-3858e9.svg?logo=wordpress)](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/)
[![No jQuery](https://img.shields.io/badge/front%20end-no%20jQuery-brightgreen.svg)](./src/tabs/view.js)

**Semera Tabs** adds a tabs block to the WordPress block editor: icons on the tabs, any blocks inside, an accordion on small screens, accessible, and no jQuery on the front end.
Nothing else: no pro tier, no upsell, no settings page.

## ✨ Features

* **Tabs block** (`semera-tabs/tabs`) with one **Tab block** (`semera-tabs/tab`) per tab

  * Every tab holds any blocks (paragraphs, images, columns, even another Tabs block).
  * **Editing:** the tab list is part of the block. Click a tab to show its content, type into the tab to rename it, `+` adds a tab. The block toolbar adds, moves (earlier / later) and removes the selected tab; the List View reorders by drag and drop.

* **Icons**

  * 44 line icons, chosen per tab in *Selected tab* (the sidebar of the Tabs block, or of the Tab block).
  * Position (before / above / after the title) and size are set once for all tabs.

* **One place for all settings**

  * The settings of the Tabs block apply to every tab.

| Where | What |
| --- | --- |
| Styles | Underline (default), Boxed, Pills |
| Layout | tabs above or beside the content; alignment (start / center / end / fill the width); space between tabs; panel padding |
| Tab buttons | horizontal and vertical padding, corner radius, font size, weight, letter case |
| Icons | position, size |
| Small screens | accordion (default), tabs stacked on top of each other, or tabs unchanged; the breakpoint in px (default 600) |
| Color | block text and background (also gradient), plus tab text, tab background, active tab text, active tab background and an accent color (lines and borders) |
| Typography, Dimensions, Border, Shadow | the block editor's own controls, applied to the whole block |
| Advanced | HTML anchor, extra CSS classes; wide and full alignment |

* **Accessible**

  * `tablist` / `tab` / `tabpanel` roles with `aria-selected`, `aria-controls` and `aria-labelledby`; only the selected tab is in the tab order (roving `tabindex`).
  * **Keyboard:** arrow keys (left/right, or up/down for tabs beside the content; mirrored in right-to-left languages) move and select, `Home` / `End` jump to the first / last tab. The panel itself is focusable.
  * **Accordion on small screens:** the tab list gives way to buttons with `aria-expanded`; the panels become regions. The open item can be closed again.
  * **URL hash:** selecting a tab writes `#<tab id>` to the address (`history.replaceState`, no history entries). A link or reload with that hash opens the tab, also for a link to something *inside* a tab and for nested tabs. The tab id is the *Tab ID* field of the tab, or `tab-<title>`; duplicates get `-2`, `-3`.
  * Without JavaScript (browsers that support `@media (scripting: none)`) the tab list is hidden and every panel shows under its title.

* **Small and fast**

  * The front-end script is about 2.5 KB, has no dependencies and is loaded only on pages with the block.

* **German and English**

  * The German translation is included (`languages/`), for the editor as well.

## 🚧 Roadmap / TODOs

- [x] Tabs and Tab blocks, icons, styles, accordion on small screens
- [x] Keyboard navigation, URL hash, nested tabs
- [x] German translation
- [ ] Test the no-JavaScript fallback in a real browser
- [ ] Test on a real phone
- [ ] Test with a screen reader
- [ ] More icons on request

## 📦 Project Structure

```
semera-tabs/
├── semera-tabs.php           # Plugin header, constants, bootstrap
├── includes/
│   ├── Plugin.php            # Registers the blocks from build/, loads the translation
│   ├── Tabs.php              # Server-side rendering of both blocks
│   └── Icons.php             # Icon set for PHP
├── icons/icons.json          # slug -> inner markup of a 24x24 stroke SVG
├── src/
│   ├── tabs/                 # Tabs block: block.json, edit, sidebar, view.js, style.css
│   └── tab/                  # Tab block
├── build/                    # Build output (not in git)
├── languages/                # .pot, German .po/.mo and the JSON for the editor script
├── bin/                      # i18n.py, sync-to-studio.ps1, build-zip.ps1
├── package.json              # @wordpress/scripts
└── README.md
```

## 🧠 How it works

| Piece | Where |
| --- | --- |
| Both blocks are *dynamic*: the saved content holds only the inner blocks, `render_callback`s build the markup. Markup changes therefore need no block deprecations. | `includes/Tabs.php` |
| A tab renders its panel (and the accordion button); the Tabs block collects what its tabs reported and renders the tab list in front of them. They find each other through the `semera-tabs/uid` block context, added in `render_block_context`. | `includes/Tabs.php` |
| Registers the blocks from `build/`, loads the translation | `includes/Plugin.php` |
| Icon set: slug → inner markup of a 24×24 stroke SVG. PHP renders it, the editor imports the same file. | `icons/icons.json`, `includes/Icons.php` |
| Block definitions and sidebar | `src/tabs/block.json`, `src/tabs/edit.js`, `src/tab/` |
| CSS classes and variables as the editor builds them (twin of `Tabs::classes()` / `Tabs::style()`) | `src/tabs/attributes.js` |
| Front end: about 2.5 KB, no dependencies, loaded only on pages with the block | `src/tabs/view.js` |
| Look: custom properties such as `--semera-tabs-accent`, `--semera-tabs-pad-x`, set on the block; every one has a fallback | `src/tabs/style.css` |

Colors and sizes are validated in PHP before they are written into the `style` attribute.

## ⚙️ Development

Node 18+ and npm. The build (`build/`) and `node_modules/` are not in git, so a checkout has no blocks until it is built.

```bash
npm install
npm run build        # one-off
npm start            # watch
```

With [WordPress Studio](https://developer.wordpress.com/studio/) (its PHP only sees the site folder, so a symlink does not work) build and copy into a site in one step:

```powershell
powershell bin/sync-to-studio.ps1                 # default site: ~/Studio/semera-dev
powershell bin/sync-to-studio.ps1 -Site C:\path\to\site
powershell bin/sync-to-studio.ps1 -SkipBuild      # copy only
```

Translations (no gettext or WP-CLI needed; German is included):

```bash
python bin/i18n.py pot   # refresh languages/semera-tabs.pot (PHP, JS, block.json)
python bin/i18n.py mo    # compile languages/*.po -> .mo and the JSON for the editor script
```

## 🛠️ Build

Release zip for **Plugins → Add New → Upload Plugin** (builds first, one top-level folder, only runtime files, forward-slash entries):

```powershell
powershell bin/build-zip.ps1                      # dist/semera-tabs-<version>.zip
powershell bin/build-zip.ps1 -SkipBuild
```

## 🔒 Notes

* **Requirements:** WordPress 6.5+, PHP 7.4+, a current browser (the CSS uses `color-mix()`).
* **Uninstalling** the plugin leaves the saved content alone; the blocks then show as "unsupported".

## 👤 Author

* **Jan Schulz-Nigmann / Semera**
* Copyright © 2026 Jan Schulz-Nigmann / Semera
* License: [PolyForm Noncommercial 1.0.0](./LICENSE) plus an explicit permission for non-profit organizations. Free for noncommercial use and for non-profits of any kind (associations, clubs, churches, charities, schools). **Commercial use needs a separate license** from Semera.
