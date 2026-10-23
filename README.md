# Semera Tabs

A tabs block for the WordPress block editor. Nothing else: no pro tier, no upsell, no settings page, no jQuery.

## What it does

- **Tabs block** (`semera-tabs/tabs`) with one **Tab block** (`semera-tabs/tab`) per tab. Every tab holds any blocks (paragraphs, images, columns, even another Tabs block).
- **Editing:** the tab list is part of the block. Click a tab to show its content, type into the tab to rename it, `+` adds a tab. The block toolbar adds, moves (earlier / later) and removes the selected tab; the List View reorders by drag and drop.
- **Icons:** 44 line icons, chosen per tab in *Selected tab* (the sidebar of the Tabs block, or of the Tab block). Position (before / above / after the title) and size are set once for all tabs.
- **One place for all settings:** the settings of the Tabs block apply to every tab.

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

### Accessible

- `tablist` / `tab` / `tabpanel` roles with `aria-selected`, `aria-controls` and `aria-labelledby`; only the selected tab is in the tab order (roving `tabindex`).
- **Keyboard:** arrow keys (left/right, or up/down for tabs beside the content; mirrored in right-to-left languages) move and select, `Home` / `End` jump to the first / last tab. The panel itself is focusable.
- **Accordion on small screens:** the tab list gives way to buttons with `aria-expanded`; the panels become regions. The open item can be closed again.
- **URL hash:** selecting a tab writes `#<tab id>` to the address (`history.replaceState`, no history entries). A link or reload with that hash opens the tab, also for a link to something *inside* a tab and for nested tabs. The tab id is the *Tab ID* field of the tab, or `tab-<title>`; duplicates get `-2`, `-3`.
- Without JavaScript (browsers that support `@media (scripting: none)`) the tab list is hidden and every panel shows under its title.

## How it works

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

## Requirements

WordPress 6.5+, PHP 7.4+, a current browser (the CSS uses `color-mix()`).

## Development

Node 18+ and npm. The build (`build/`) and `node_modules/` are not in git.

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

Release zip for Plugins > Add New > Upload Plugin (builds first, one top-level folder, only runtime files, forward-slash entries):

```powershell
powershell bin/build-zip.ps1                      # dist/semera-tabs-<version>.zip
powershell bin/build-zip.ps1 -SkipBuild
```

Uninstalling the plugin leaves the saved content alone; the blocks then show as "unsupported".
