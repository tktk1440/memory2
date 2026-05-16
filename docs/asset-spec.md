# Memoryscape — Modernized Asset Spec v1

Style brief: the "OSRS 2D Modernized" mockup — hand-painted detail, warmer
shadows, cleaner silhouettes, OSRS-faithful palette. Each asset listed
below maps to a file that already exists in the repo and that we can
hot-swap by overwriting in place, then re-running `cd engine &&
BUILD_VERIFY=false bun run build`.

## Hard constraints (read before generating anything)

| Constraint | Why |
|---|---|
| **PNG only**, 8-bit indexed or 32-bit RGBA. No JPEG. | Engine reads PNGs via `@jimp/js-png`; lossy formats wreck the palette. |
| **Exact dimensions** — no rescaling. Each asset has a fixed slot. | Sprite sheets use `.opt` metadata files that hardcode sub-rect offsets in pixels. A 1-pixel resize misaligns every icon. |
| **Transparent background** where the original has alpha. | UI sprites composite over the chat / inventory chrome. |
| **Color depth ≤ 256 colors** preferred. | The engine has a fast-path for indexed PNGs; full 32-bit works but is heavier on the title screen. |

## What can be swapped (and what cannot)

| Mockup feature | Engine reality | Swappable? |
|---|---|---|
| Modernized inventory item icons | Rendered live from each item's 3D `.ob2` model using `2dxof/2dyof/2dzoom/2dyan/2dxan` in the `.obj` config. No PNG exists per item. | **No.** Would require replacing 3,000+ 3D item models. |
| 2D character sprites (idle/walk frames) | 3D skeletal animation, baked into `content/models/*.base` and `*.frame` files. | **No.** Engine rewrite. |
| Hand-painted ground tiles (grass/path/water/dirt) | Ground is per-vertex tinted geometry. Colors live in `content/scripts/floors/{underlay,overlay}.flo` as hex codes like `colour=0x35720A`. **No texture is used for ground.** | **Palette-only.** You can shift the `.flo` colors to warmer earth tones to match the mockup, but you cannot paint detail onto a 2D tile that the engine will display. |
| Modernized skill icons | Real PNGs in a sprite sheet. | **Yes.** See "Skill icons" below. |
| Modernized UI chrome (chat/inv/map panels) | Real PNGs. | **Yes.** See "UI panels" below. |
| 3D wall/floor textures (planks, bricks, roofs, water, lava…) | Real PNGs at 128×128 or 64×64 tiling, mapped onto 3D surfaces. | **Yes.** 50 files in `content/textures/`. |
| Title screen (logo, login box, button, runes) | Real PNGs. | **Yes.** See "Title screen" below. |

## The swappable asset list

### 1. Title screen — `content/title/`

| File | Dimensions | What |
|---|---|---|
| `logo.png` | **444 × 142** | Game wordmark above the login box. Has alpha. Currently reads "RuneScape" stylized — replace with a "Memoryscape" wordmark in the same painterly style. |
| `titlebox.png` | **360 × 200** | Background panel behind the login form. |
| `titlebutton.png` | **147 × 41** | Button bg ("New User" / "Existing User"). Two states would be ideal — provide one PNG, the engine reuses it. |
| `runes.png` | **384 × 288** | Animated runes border behind the login box. Looks like a tiled rune motif; modernize as a painterly arcane border. |

### 2. UI panels — `content/sprites/`

These are standalone PNGs, no sheet/.opt metadata. Dimensions are non-negotiable.

| File | Dimensions | What |
|---|---|---|
| `chatback.png` | **479 × 96** | Chat window background (the parchment tile from the mockup). |
| `mapback.png` | **172 × 156** | Minimap circular background. |
| `invback.png` | **190 × 261** | Inventory panel background. |
| `compass.png` | **51 × 51** | The N-pointing compass on the minimap. |
| `tradebacking.png` | (check before regen) | Trade window bg. |
| `scrollbar.png` | **32 × 16** | Scrollbar arrows. |
| `invback.png`, `magicon.png` (200×100), `prayeron.png` (120×120) | as listed | Tab panel backgrounds. |

### 3. Skill icons — sprite sheet at `content/sprites/staticons.png` + `staticons2.png`

| File | Sheet size | Cell size | Layout | What |
|---|---|---|---|---|
| `staticons.png` | **150 × 75** | 25 × 25 | 6 cols × 3 rows = 18 cells | Skill icons (page 1) |
| `staticons2.png` | **150 × 75** | 25 × 25 | 6 cols × 3 rows = 18 cells | Skill icons (page 2) |

The matching `.opt` files (`content/sprites/meta/staticons.opt`,
`staticons2.opt`) declare per-icon sub-rects. **First line of each `.opt`
is `25x25` — this is the cell stride. The remaining lines are
per-icon `x,y,w,h` trim rects.** Generate icons centered in their 25×25
cells with transparent padding; leave the `.opt` files alone.

### 4. Tab / sidebar icons — `content/sprites/sideicons.png`

| File | Sheet size | Cell size | Layout |
|---|---|---|---|
| `sideicons.png` | **390 × 30** | 30 × 30 | 13 cells in one row |

Maps to the 13 tab icons across the bottom of the right-hand UI panel
(combat, stats, quests, inventory, equipment, prayer, magic, friends,
ignore, options, controls, music, logout).

### 5. Minimap function icons — `content/sprites/mapfunction.png`

| File | Cell size | What |
|---|---|---|
| `mapfunction.png` | **15 × 15** | Map functions (skull, anvil, bank, dungeon icons that appear on the minimap). |

`mapfunction.opt` lists how many cells. Match the original count.

### 6. World textures — `content/textures/` (50 files)

All at **128 × 128** except `chainmail.png` and `damage.png` which are
**64 × 64**. These tile across 3D surfaces (walls, roofs, floors of
buildings, water, lava). Listing the high-impact ones to prioritize:

| File | Where you see it in-game |
|---|---|
| `planks.png`, `wood2.png`, `darkwood.png` | Most building floors and doors |
| `thatched.png`, `roof.png`, `roof2.png` | Building roofs |
| `wall.png`, `mossy.png`, `mossybricks.png`, `rockwall.png` | Walls and dungeons |
| `water.png`, `water_animated.png`, `gungywater.png`, `lava.png` | Water and lava surfaces |
| `bark.png`, `mapletree.png`, `yewtree.png`, `willowtex3.png`, `leafytree.png` | Tree trunks and canopies |
| `marble.png`, `pebblefloor.png`, `fountain.png` | Decorative floors |
| `bamboo.png`, `canvas.png`, `cargonet.png`, `chainmail.png` | Cloth / metal patterns |

Full list: `ls content/textures/*.png` (50 files). All must tile
seamlessly at their original dimensions.

### 7. Palette swap — `content/scripts/floors/*.flo`

Ground "tiles" in the engine are flat-colored polygons. To match the
mockup's warmer earth tones, edit hex codes in:

- `content/scripts/floors/underlay.flo` (grass, mud, swamp, sand, snow base colors)
- `content/scripts/floors/overlay.flo` (cliffs, paths, decorative overlays)

This is a text edit, not an asset generation task — but it's the only
way to shift the world's overall tint without replacing every model.

## Generation workflow

For each asset:

1. Open the existing PNG to anchor on dimensions and layout.
2. Generate a replacement at the **exact same pixel dimensions**.
3. For sprite sheets, generate each cell separately at the cell size,
   then composite into the sheet grid (no scaling, no resampling).
4. Save as PNG with alpha where the original has alpha. Check with
   `file content/sprites/whatever.png` after — the dimensions in
   the output should match the spec table exactly.
5. Overwrite the file in place. Re-run:

   ```sh
   cd engine && BUILD_VERIFY=false bun run build
   ```

6. Restart the server (`bun start`) and reload `http://localhost:8888/rs2.cgi`.

## Suggested generation prompt seed

> A painterly, hand-painted [ASSET TYPE] in the style of modernized
> Old School RuneScape: warm earth-tone palette, soft directional
> lighting from upper-left, cleaner silhouette than 2004-era pixel art
> but unmistakably nostalgic, transparent background, [DIMENSIONS]
> pixels. No text. No watermark. No JPEG artifacts.

Append per-asset specifics (e.g. "a brass compass with N/S/E/W
markings, top-down view" for `compass.png`).

## Out of scope (don't bother)

- Item icons (3D-rendered, no PNG to replace)
- Character sprites (3D animated, no PNG to replace)
- Ground tiles as detailed textures (engine doesn't sample textures for ground)
- Animations (frame data is in binary `.frame` / `.base` files)
- The 2D isometric world view from the mockup — that's an engine
  rewrite, tracked separately if we ever take it on.
