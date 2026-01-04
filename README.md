[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration) ![Maintenance](https://img.shields.io/maintenance/yes/2026.svg?style=plasticr) [![release](https://img.shields.io/github/v/release/jimz011/hki-header-card.svg)](https://github.com/jimz011/hki-header-card/releases) [![downloads](https://img.shields.io/github/downloads/jimz011/hki-header-card/total)](https://github.com/jimz011/hki-header-card/releases)

# HKI Header Card
Full-width customizable header for Home Assistant with automatic kiosk mode detection, Jinja2 template support, and advanced badge positioning.

<img src="https://github.com/jimz011/hki-header-card/blob/main/screenshots/header-with-badges.png?raw=true" width="600" alt="HKI Header Card Example">

***You can find more screenshots at the bottom of this page***

## Features
- 🎨 Full-width fixed header with customizable background (images, gradients, colors)
- 📱 Automatic kiosk mode detection - adjusts position when HA header is hidden
- 🔤 Jinja2 template support for dynamic title and subtitle
- 🎯 Precise positioning controls for title, subtitle, and badges
- 🏷️ Advanced badge positioning (pinned or scrolling with adjustable offsets)
- 🎭 Gradient overlay with customizable blend
- 📐 Responsive design with adjustable heights

## Installation

### HACS (Recommended)
1. Open HACS in your Home Assistant instance
2. Go to "Frontend"
3. Click the menu in the top right and select "Custom repositories"
4. Add `https://github.com/jimz011/hki-header-card` as a Lovelace repository
5. Click "Download" on the HKI Header Card
6. Restart Home Assistant

### Manual Installation
1. Download `hki-header-card.js` from the [latest release](https://github.com/jimz011/hki-header-card/releases)
2. Copy it to `<config>/www/` (create the folder if it doesn't exist)
3. Add the resource in your Lovelace configuration:
```yaml
   resources:
     - url: /local/hki-header-card.js
       type: module
```
4. Restart Home Assistant

## Configuration

### Placement Options

#### Option 1: Header Section (Recommended!)
Place the card in the header slot of your view to enable badge positioning features.

1. Click on "Add Title" in the header section of your dashboard.
2. Do not change anything yet but click on "Show Code Editor"
3. Remove everything
4. Type the following: `type: custom:hki-header-card`
5. Click on "Show Visual Editor" to edit the card as normal
6. Done! The card is now in the header section

![Badge Setup Recommended](https://github.com/user-attachments/assets/b1685685-0b4b-4ff5-9271-b919e072cd62)


#### Option 2: Header Section copied from default section
Place the card in the header slot of your view to enable badge positioning features.

1. Click on any section and add the HKI-Header-Card
2. Edit the card and click "Show Code Editor"
3. Copy the code
4. Click "Add title" (the yellow pencil icon in the header area)
5. Click "Show Code Editor", select all, and paste the copied code
6. Done! The card is now in the header section

![Badge Setup](https://github.com/user-attachments/assets/49195061-ecd7-44d5-9a8e-78d7355037d5)

#### Option 3: Regular Section (NOT recommended!)
Create a new full-width section at the top of your dashboard. Badge positioning features will not be available.

> **⚠️ Important:** Badge positioning features ONLY work when the card is placed in the header section!

### Configurable Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **Content** |
| `title` | string | `"Header"` | Title text. Supports Jinja2 templates with access to `user` and `config` variables |
| `subtitle` | string | `""` | Subtitle text. Supports Jinja2 templates with access to `user` and `config` variables |
| `text_align` | string | `"left"` | Text alignment: `left`, `center`, or `right`. To align text in the center, you **MUST** set the header layout to `centered` and the card layout to `center` *See badges section below. Most changes only reflect well on mobile phones! Use `left` or `center` for the best results |
| **Title Position** |
| `title_offset_x` | number | `5` | Horizontal offset in pixels from left (or right if right-aligned) |
| `title_offset_y` | number | `32` | Vertical offset in pixels from top |
| **Subtitle Position** |
| `subtitle_offset_x` | number | `5` | Horizontal offset in pixels (relative to title position) |
| `subtitle_offset_y` | number | `32` | Vertical offset in pixels (relative to title position) |
| **Background** |
| `background` | string | *(GitHub image)* | CSS background value. Accepts colors, gradients, or image paths. Paths are automatically wrapped in `url()` - just enter `/local/image.jpg` |
| `background_position` | string | `"center"` | Background position: `top`, `center`, `bottom`, `left`, or `right` |
| `background_repeat` | string | `"no-repeat"` | Background repeat: `no-repeat`, `repeat`, `repeat-x`, or `repeat-y` |
| `background_size` | string | `"cover"` | Background size: `cover`, `contain`, or `auto` |
| **Header Size** |
| `min_height` | number | `180` | Minimum header height in pixels |
| `max_height` | number | `220` | Maximum header height in pixels |
| **Blend Overlay** |
| `blend_color` | string | `"var(--primary-background-color)"` | CSS color for gradient overlay at bottom of header |
| `blend_stop` | number | `95` | Percentage (0-100) where blend gradient starts |
| **Typography** |
| `font_family` | string | `"inherit"` | Font family: `inherit`, `system`, `roboto`, `inter`, `arial`, `georgia`, `mono`, or `custom` |
| `font_family_custom` | string | `""` | Custom font-family CSS value (only when `font_family` is `custom`) |
| `font_style` | string | `"normal"` | Font style: `normal` or `italic` |
| `title_size_px` | number | `36` | Title font size in pixels |
| `subtitle_size_px` | number | `15` | Subtitle font size in pixels |
| `title_weight` | string | `"bold"` | Title font weight: `light`, `regular`, `medium`, `semibold`, `bold`, or `black` |
| `subtitle_weight` | string | `"medium"` | Subtitle font weight: `light`, `regular`, `medium`, `semibold`, `bold`, or `black` |
| **Fixed Header** |
| `fixed` | boolean | `true` | Keep header fixed to top of viewport |
| `fixed_top` | number | `0` | Top offset in pixels when header is fixed (only visible when `fixed` is `true`) |
| **Badge Positioning** *(Header section only)* |
| `badges_fixed` | boolean | `false` | Pin badges in place (content scrolls beneath) |
| `badges_offset_pinned` | number | `48` | Vertical offset in pixels when badges are pinned (only visible when `badges_fixed` is `true`) |
| `badges_offset_unpinned` | number | `100` | Vertical offset in pixels when badges are unpinned (only visible when `badges_fixed` is `false`) |
| `badges_gap` | number | `0` | Gap in pixels under badges. Auto-adjusts: -48px when pinned, +48px in kiosk mode |

### Example Configuration
```yaml
type: custom:hki-header-card
title: >-
  {% if is_state('sun.sun','above_horizon') %}Good day, {{ user }}{% else %}Good
  evening, {{ user }}{% endif %}
subtitle: "{{ now().strftime('%A %H:%M') }}"
text_align: left
background: /local/your-image.jpg
background_position: center
background_repeat: no-repeat
background_size: cover
min_height: 180
max_height: 220
```

> **⚠️ Important:** Currently Title/Subtitle alignment settings **ONLY** works correct on a phone screen!

## Jinja2 Templates

The title and subtitle support Jinja2 templates with access to:
- `user` - The current user's name
- `config` - The card's configuration object

### Template Examples

**Time-based greeting:**
```jinja2
{% if is_state('sun.sun','above_horizon') %}
  Good day, {{ user }}
{% else %}
  Good evening, {{ user }}
{% endif %}
```

**Current date and time:**
```jinja2
{{ now().strftime('%A, %B %d') }}
```

**Weather-based message:**
```jinja2
{% if states('sensor.outside_temperature')|float < 0 %}
  It's freezing outside! ❄️
{% elif states('sensor.outside_temperature')|float < 10 %}
  It's cold outside 🧥
{% else %}
  Nice weather today! ☀️
{% endif %}
```

## Kiosk Mode

The card automatically detects kiosk mode and adjusts its position:
- **Normal mode** (HA header visible): Positioned 48px from top to avoid overlap
- **Kiosk mode** (HA header hidden): Positioned at top of viewport (0px)

Compatible with:
- [kiosk-mode](https://github.com/NemesisRE/kiosk-mode) integration
- URL parameter: `?kiosk=true`
- Any method that hides the HA header element

## Badges

Add badges through Home Assistant's native badge interface when the header section is selected. The card provides advanced positioning controls:

- **Pin badges in place**: Fixes badges while content scrolls beneath
- **Vertical offset**: Pull badges into the header (negative values) or push them down (positive values)
- **Gap under badges**: Add spacing between badges and content (auto-adjusts for kiosk mode)

### Badge Setup Instructions

1. Place the card in the header section (see Configuration → Placement Options above)
2. Click on the header area to select it
3. Add badges using the "+ Add badge" button
4. Configure badge positioning in the HKI Header Card settings

### Badges Alignment
It is recommended **NOT** to use `badges_position: top` 
To align badges in the center, you **MUST** set the header layout to `centered`

<img width="597" height="670" alt="image" src="https://github.com/user-attachments/assets/24dbcbd1-d1fc-4a54-9469-4f87b0d12693" />

## Tips & Tricks

### Background Images
You can use local images or external URLs:
```yaml
background: /local/my-image.jpg           # Local file
background: https://example.com/image.jpg # External URL
background: linear-gradient(...)          # CSS gradient
background: var(--primary-color)          # CSS variable
```

The card automatically wraps image paths in `url()`, so you don't need to!

### Multiple Lines in Title/Subtitle
Use `\n` or multiline YAML for line breaks:
```yaml
title: |
  First Line
  Second Line
```

### Adjusting for Different Screen Sizes
The header uses viewport height (35vh by default) with min/max constraints:
- Phones: Uses `min_height` (180px)
- Tablets/Desktops: Scales between min and max
- Large screens: Limited by `max_height` (220px)

## Troubleshooting

**Badges not positioning correctly**
- Ensure the card is placed in the header section, not a regular section
- Check that you're editing the header placement, not a section

**Header overlaps with HA header**
- The card should automatically detect this. If not, manually adjust `fixed_top` offset
- Verify kiosk mode detection is working (check browser console for logs)

**Templates not updating**
- Verify your Jinja2 syntax
- Check that referenced entities exist
- Templates update when their referenced entities change

**Background image not showing**
- Verify the image path is correct
- Check browser console for 404 errors
- Ensure image is accessible (not blocked by authentication)

## Support

Found a bug or have a feature request?
- [Open an issue](https://github.com/jimz011/hki-header-card/issues)
- [Discussions](https://github.com/jimz011/hki-header-card/discussions)

## Credits

Created by [jimz011](https://github.com/jimz011) with aid of ChatGPT and ClaudeAI.

## License

MIT License - see LICENSE file for details

## More Screenshots
<img src="https://github.com/jimz011/hki-header-card/blob/main/screenshots/header-no-badges.png?raw=true" width="600" alt="HKI Header Card Example 2"><br>
<img src="https://github.com/jimz011/hki-header-card/blob/main/screenshots/header-with-centered-badges.png?raw=true" width="600" alt="HKI Header Card Example 3"><br>
<img src="https://github.com/jimz011/hki-header-card/blob/main/screenshots/header-in-full-view.png?raw=true" width="600" alt="HKI Header Card Example 4"><br>
<img src="https://github.com/jimz011/hki-header-card/blob/main/screenshots/header-wide-with-badges.png?raw=true" width="600" alt="HKI Header Card Example 5"><br>
