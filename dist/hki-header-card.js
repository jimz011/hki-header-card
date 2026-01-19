// HKI Header Card

import { LitElement, html, css } from "https://unpkg.com/lit@2.8.0/index.js?module";

const CARD_NAME = "hki-header-card";

console.info(
  '%c HKI-HEADER-CARD %c v1.3.4 ',
  'color: white; background: #17a2b8; font-weight: bold;',
  'color: #17a2b8; background: white; font-weight: bold;'
);

const clamp = (n, min, max) => (Number.isFinite(n) ? Math.min(Math.max(n, min), max) : min);
const toNum = (v, fallback) => { const n = +v; return Number.isFinite(n) ? n : fallback; };

const WEIGHT_MAP = Object.freeze({
  light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, black: 900,
});

const BG_SIZE_PRESETS = Object.freeze(["cover", "contain", "auto"]);

const FONT_FAMILY_MAP = Object.freeze({
  inherit: "inherit",
  system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  roboto: "Roboto, system-ui, sans-serif",
  inter: "Inter, system-ui, sans-serif",
  arial: "Arial, Helvetica, sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
});

const WEATHER_ICON_MAP = Object.freeze({
  "clear-night": "mdi:weather-night",
  cloudy: "mdi:weather-cloudy",
  fog: "mdi:weather-fog",
  hail: "mdi:weather-hail",
  lightning: "mdi:weather-lightning",
  "lightning-rainy": "mdi:weather-lightning-rainy",
  partlycloudy: "mdi:weather-partly-cloudy",
  pouring: "mdi:weather-pouring",
  rainy: "mdi:weather-rainy",
  snowy: "mdi:weather-snowy",
  "snowy-rainy": "mdi:weather-snowy-rainy",
  sunny: "mdi:weather-sunny",
  windy: "mdi:weather-windy",
  "windy-variant": "mdi:weather-windy-variant",
  exceptional: "mdi:alert-circle-outline",
});

const WEATHER_COLOR_MAP = Object.freeze({
  sunny: "var(--hki-weather-color-sunny, #fdd835)",
  "clear-night": "var(--hki-weather-color-clear-night, #90caf9)",
  partlycloudy: "var(--hki-weather-color-partlycloudy, #ffe082)",
  cloudy: "var(--hki-weather-color-cloudy, #b0bec5)",
  fog: "var(--hki-weather-color-fog, #cfd8dc)",
  rainy: "var(--hki-weather-color-rainy, #4fc3f7)",
  pouring: "var(--hki-weather-color-pouring, #0288d1)",
  lightning: "var(--hki-weather-color-lightning, #ffca28)",
  "lightning-rainy": "var(--hki-weather-color-lightning-rainy, #ffb300)",
  snowy: "var(--hki-weather-color-snowy, #e1f5fe)",
  "snowy-rainy": "var(--hki-weather-color-snowy-rainy, #81d4fa)",
  windy: "var(--hki-weather-color-windy, #a5d6a7)",
  "windy-variant": "var(--hki-weather-color-windy-variant, #81c784)",
  hail: "var(--hki-weather-color-hail, #80deea)",
  exceptional: "var(--hki-weather-color-exceptional, #ef9a9a)",
});

// Shared defaults - single source of truth
const DEFAULTS = Object.freeze({
  title: "Header",
  subtitle: "",
  text_align: "left",
  title_color: "",
  subtitle_color: "",
  background: "https://github.com/jimz011/hki-header-card/blob/main/wallpapers/livingroom.jpg?raw=true",
  background_color: "", // Background blend color for blending
  background_position: "center",
  background_repeat: "no-repeat",
  background_size: "cover",
  background_blend_mode: "normal",
  height_vh: 35,
  min_height: 180,
  max_height: 220,
  blend_color: "var(--primary-background-color)",
  blend_stop: 95,
  blend_enabled: true,
  // Header styling
  card_border_radius: "",
  card_box_shadow: "",
  card_border_style: "none",
  card_border_width: 0,
  card_border_color: "",
  fixed: true,
  fixed_top: 0,
  title_offset_x: 5,
  title_offset_y: 32,
  subtitle_offset_x: 5,
  subtitle_offset_y: 32,
  badges_offset_pinned: 48,
  badges_offset_unpinned: 100,
  badges_gap: 0,
  badges_fixed: false,
  font_family: "inherit",
  font_family_custom: "",
  font_style: "normal",
  title_size_px: 36,
  subtitle_size_px: 15,
  title_weight: "bold",
  subtitle_weight: "medium",
  mobile_breakpoint: 768,

  // Top Bar Layout
  top_bar_enabled: true,
  top_bar_offset_y: 10,
  top_bar_padding_x: 5,
  
  // Slot types: "none", "spacer", "weather", "datetime", "custom", "button"
  top_bar_left: "none",
  top_bar_center: "none",
  top_bar_right: "none",
  
  // Default custom cards for slots
  top_bar_left_card: { type: "custom:hki-notification-card" },
  top_bar_center_card: { type: "custom:hki-notification-card" },
  top_bar_right_card: { type: "custom:hki-notification-card" },

  // Global Info Styling (defaults for all slots)
  info_size_px: 12,
  info_weight: "medium",
  info_color: "",
  info_pill: false,
  info_pill_background: "rgba(0,0,0,0.25)",
  info_pill_padding_x: 10,
  info_pill_padding_y: 6,
  info_pill_radius: 999,
  info_pill_blur: 0,
  info_pill_border_style: "none",
  info_pill_border_width: 0,
  info_pill_border_color: "rgba(255,255,255,0.1)",

  // Defaults fallback if per-slot is missing
  weather_entity: "",
  weather_show_icon: true,
  weather_show_condition: true,
  weather_show_temperature: true,
  weather_show_humidity: false,
  weather_show_wind: false,
  weather_show_pressure: false,
  weather_colored_icons: true,
  weather_icon_color_mode: "state",
  weather_animate_icon: "none",
  weather_icon_pack_path: "",
  datetime_show_time: true,
  datetime_show_date: true,
  datetime_show_day: true,
  datetime_time_format: "HH:mm",
  datetime_date_format: "D MMM",
  datetime_separator: " • ",
});

function normalizeWeightKey(input, fallbackKey) {
  if (typeof input === "string" && WEIGHT_MAP[input]) return input;
  if (typeof input === "number" && Number.isFinite(input)) {
    let best = fallbackKey, bestDist = Infinity;
    for (const [k, v] of Object.entries(WEIGHT_MAP)) {
      const d = Math.abs(v - input);
      if (d < bestDist) { best = k; bestDist = d; }
    }
    return best;
  }
  return fallbackKey;
}

// Simplified hash - djb2
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16);
}

function cacheKey(raw, vars) {
  return `hkiTpl:${hashStr(raw + (vars ? JSON.stringify(vars) : ""))}`;
}

// Date formatting helper - uses locale for proper translations
function formatDateTime(date, format, locale = 'en') {
  const pad = (n) => String(n).padStart(2, '0');
  
  // Get localized day names
  const getDayName = (d, style) => {
    try {
      return new Intl.DateTimeFormat(locale, { weekday: style }).format(d);
    } catch (_) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return style === 'long' ? days[d.getDay()] : daysShort[d.getDay()];
    }
  };
  
  // Get localized month names
  const getMonthName = (d, style) => {
    try {
      return new Intl.DateTimeFormat(locale, { month: style }).format(d);
    } catch (_) {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return style === 'long' ? months[d.getMonth()] : monthsShort[d.getMonth()];
    }
  };

  const h24 = date.getHours();
  const h12 = h24 % 12 || 12;
  const ampm = h24 < 12 ? 'AM' : 'PM';

  const tokens = {
    'YYYY': date.getFullYear(),
    'YY': String(date.getFullYear()).slice(-2),
    'MMMM': getMonthName(date, 'long'),
    'MMM': getMonthName(date, 'short'),
    'MM': pad(date.getMonth() + 1),
    'DDDD': getDayName(date, 'long'),
    'DDD': getDayName(date, 'short'),
    'DD': pad(date.getDate()),
    'HH': pad(h24),
    'hh': pad(h12),
    'mm': pad(date.getMinutes()),
    'ss': pad(date.getSeconds()),
    'M': date.getMonth() + 1,
    'D': date.getDate(),
    'H': h24,
    'h': h12,
    'm': date.getMinutes(),
    's': date.getSeconds(),
    'A': ampm,
    'a': ampm.toLowerCase(),
  };

  // Single-pass replacement using regex with all tokens (longest first via alternation order)
  const tokenPattern = /YYYY|MMMM|DDDD|YY|MMM|DDD|MM|DD|HH|hh|mm|ss|M|D|H|h|m|s|A|a/g;
  return format.replace(tokenPattern, match => tokens[match]);
}

class HkiHeaderCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: { attribute: false },
      _offsetLeft: { type: Number },
      _viewportWidth: { type: Number },
      _contentWidth: { type: Number },
      _inPreview: { type: Boolean },
      _headerHeight: { type: Number },
      _kioskMode: { type: Boolean },
      _editMode: { type: Boolean },
      _renderedTitle: { type: String },
      _renderedSubtitle: { type: String },
      _currentTime: { type: Number },
      _customCards: { attribute: false }, // Store elements for left/center/right
    };
  }

  constructor() {
    super();
    this._config = {};
    this._offsetLeft = 0;
    this._viewportWidth = 0;
    this._contentWidth = 0;
    this._inPreview = false;
    this._headerHeight = 0;
    this._kioskMode = false;
    this._editMode = false;
    this._renderedTitle = "";
    this._renderedSubtitle = "";
    this._currentTime = Date.now();
    this._customCards = { left: null, center: null, right: null };

    // Handlers & observers
    this._resizeHandler = null;
    this._ro = null;
    this._rafMeasure = 0;
    this._rafBadges = 0;
    this._kioskCheckInterval = null;
    this._kioskMutationObserver = null;
    this._urlChangeHandler = null;
    this._cachedHeader = null;
    this._visibilityHandler = null;
    this._focusHandler = null;
    this._editModeInterval = null;
    this._timeInterval = null;

    this._tpl = {
      timer: 0,
      title: { raw: "", sig: "", seq: 0, unsub: null },
      subtitle: { raw: "", sig: "", seq: 0, unsub: null },
    };

    this._hassReady = false;
    this._badgesEl = null;
    
    // Performance: Style caches
    this._slotStyleCache = new Map();
    this._lastConfigHash = null;
  }

  static get styles() {
    return css`
      :host { display: block; }

      .header-fixed {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        z-index: 1;
        overflow: hidden !important; /* Respect border-radius and box-shadow of child - !important to override Bubble Card */
        isolation: isolate; /* Create strong stacking context for proper overflow clipping */
      }

      ha-card.header {
        position: relative;
        width: 100vw;
        height: 35vh;
        min-height: 180px;
        max-height: 340px;
        margin: 0;
        border-radius: 0; /* Overridden by inline style */
        overflow: visible; /* Allow box-shadow to show when fixed */
        box-sizing: border-box;
        color: var(--hki-header-text-color, #fff);
        /* border and box-shadow controlled via inline styles */
      }

      .overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .content {
        position: relative;
        z-index: 1;
        height: 100%;
        box-sizing: border-box;
      }

      .title-block {
        position: absolute;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding-right: 16px;
      }

      .title {
        line-height: 1.1;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
        white-space: pre-wrap;
      }

      .subtitle {
        opacity: 0.9;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
        white-space: pre-wrap;
      }

      .header-spacer {
        width: 100%;
        display: block;
      }

      /* INFO ITEM (Flex Child for Top Bar) */
      .info-item {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--hki-header-text-color, #fff);
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
        flex-shrink: 0;
        flex-grow: 0;
      }

      .info-clickable {
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .info-clickable:hover { opacity: 0.8; }

      .info-icon {
        --mdc-icon-size: var(--info-icon-size, 32px);
        width: var(--info-icon-size, 32px);
        height: var(--info-icon-size, 32px);
        color: var(--hki-header-text-color, #fff);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
      }

      img.info-icon {
        object-fit: contain;
        display: block;
      }

      .info-text { text-transform: capitalize; }
      .info-temperature { font-weight: 500; }

      .info-pill {
        background: var(--hki-info-pill-background, rgba(0, 0, 0, 0.25));
        border-radius: var(--hki-info-pill-radius, 999px);
        padding: var(--hki-info-pill-padding-y, 6px) var(--hki-info-pill-padding-x, 10px);
        backdrop-filter: blur(var(--hki-info-pill-blur, 0px));
        -webkit-backdrop-filter: blur(var(--hki-info-pill-blur, 0px));
        border-style: var(--hki-info-pill-border-style, none);
        border-width: var(--hki-info-pill-border-width, 0);
        border-color: var(--hki-info-pill-border-color, rgba(255,255,255,0.1));
        box-sizing: border-box;
      }

      /* TOP BAR LAYOUT */
      .top-bar-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 3;
        box-sizing: border-box;
      }

      .slot {
        display: flex;
        align-items: center;
        min-height: 20px;
        flex: 1 1 0%;
        min-width: 0;
        overflow: hidden;
      }

      .slot-visible {
        overflow: visible !important;
      }

      .slot-left {
        justify-content: flex-start;
        text-align: left;
      }
      .slot-center {
        justify-content: center;
        text-align: center;
      }
      .slot-right {
        justify-content: flex-end;
        text-align: right;
      }
      
      /* Empty slots collapse to allow more space for occupied slots */
      .slot.slot-empty {
        flex: 0 0 auto;
        overflow: visible;
      }
      
      /* Spacer is invisible but takes up layout space */
      .slot-spacer {
        display: block;
        width: 1px;
        height: 1px;
        visibility: hidden;
      }

      .animate-float { animation: hki-float 3s ease-in-out infinite; }
      .animate-pulse { animation: hki-pulse 1.8s ease-in-out infinite; }
      .animate-spin { animation: hki-spin 2.8s linear infinite; }

      @keyframes hki-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      @keyframes hki-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.08); opacity: 0.85; }
      }
      @keyframes hki-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._detectKioskMode();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this._resizeHandler) {
      window.removeEventListener("resize", this._resizeHandler);
      this._resizeHandler = null;
    }
    if (this._ro) {
      this._ro.disconnect();
      this._ro = null;
    }
    if (this._rafMeasure) cancelAnimationFrame(this._rafMeasure);
    if (this._rafBadges) cancelAnimationFrame(this._rafBadges);
    if (this._tpl.timer) clearTimeout(this._tpl.timer);
    if (this._kioskCheckInterval) clearInterval(this._kioskCheckInterval);
    if (this._kioskMutationObserver) this._kioskMutationObserver.disconnect();
    if (this._urlChangeHandler) {
      window.removeEventListener("popstate", this._urlChangeHandler);
      window.removeEventListener("hashchange", this._urlChangeHandler);
    }
    if (this._visibilityHandler) document.removeEventListener("visibilitychange", this._visibilityHandler);
    if (this._focusHandler) window.removeEventListener("focus", this._focusHandler);
    if (this._editModeInterval) clearInterval(this._editModeInterval);
    if (this._timeInterval) clearInterval(this._timeInterval);

    this._unsubscribeTemplate("title");
    this._unsubscribeTemplate("subtitle");
    this._resetBadgesZIndex();
  }

  firstUpdated() {
    this._detectPreview();
    this._detectKioskMode();
    this._detectEditMode();

    // Consolidated resize handling
    this._resizeHandler = () => {
      this._debouncedMeasure(true);
      this._debouncedBadgesZIndex();
      this.requestUpdate(); // Force update for responsive mobile offsets
    };
    window.addEventListener("resize", this._resizeHandler, { passive: true });

    this._ro = new ResizeObserver(this._resizeHandler);
    this._ro.observe(this);

    // Mutation observer for kiosk mode
    this._kioskMutationObserver = new MutationObserver(() => this._detectKioskMode());
    this._kioskMutationObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    this._kioskMutationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // URL change handler
    this._urlChangeHandler = () => {
      this._detectKioskMode();
      this._detectEditMode();
    };
    window.addEventListener("popstate", this._urlChangeHandler);
    window.addEventListener("hashchange", this._urlChangeHandler);

    // Visibility & focus handlers
    this._visibilityHandler = () => {
      if (!document.hidden) {
        this._cachedHeader = null;
        this._detectKioskMode();
        setTimeout(() => this._detectKioskMode(), 200);
      }
    };
    document.addEventListener("visibilitychange", this._visibilityHandler);

    this._focusHandler = () => {
      this._cachedHeader = null;
      this._detectKioskMode();
    };
    window.addEventListener("focus", this._focusHandler);

    // Reduced polling: edit mode every 2s instead of 1s
    this._editModeInterval = setInterval(() => this._detectEditMode(), 2000);

    // Time update interval for datetime display
    this._timeInterval = setInterval(() => {
      if (this._config?.top_bar_enabled) {
        this._currentTime = Date.now();
        this.requestUpdate();
      }
    }, 1000);

    // Reduced initial checks
    [100, 500, 1500].forEach(delay => {
      setTimeout(() => {
        this._cachedHeader = null;
        this._detectKioskMode();
      }, delay);
    });

    // Reduced kiosk polling: 10s instead of 5s
    this._kioskCheckInterval = setInterval(() => this._detectKioskMode(), 10000);

    requestAnimationFrame(() => this._measure(true));
    this._scheduleTemplateSetup(0);
    this._debouncedBadgesZIndex();

    this._updateCustomCards();
  }

  updated(changed) {
    if (changed.has("_config")) {
      this._slotStyleCache.clear(); // Clear cached styles on config change
      this._detectPreview();
      this._debouncedMeasure(true);
      this._scheduleTemplateSetup(80);
      this._debouncedBadgesZIndex();
      this._updateCustomCards();
      return;
    }

    if (changed.has("hass")) {
      this._detectPreview();
      this._detectEditMode();
      this._debouncedMeasure(true);

      const nowReady = !!this.hass?.connection && typeof this.hass?.callWS === "function";
      if (nowReady && !this._hassReady) {
        this._hassReady = true;
        this._scheduleTemplateSetup(0);
        this._cachedHeader = null;
        this._detectKioskMode();
      }
      this._debouncedBadgesZIndex();

      // Pass hass to custom cards
      Object.values(this._customCards).forEach(el => {
        if (el) el.hass = this.hass;
      });
    }

    if (changed.has("_kioskMode")) {
      this._debouncedMeasure(true);
      this._debouncedBadgesZIndex();
    }
  }

  _detectKioskMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlKiosk = urlParams.get("kiosk") === "true" || window.location.search.includes("kiosk");
    
    const bodyKiosk = document.body.classList.contains("kiosk-mode") || 
                      document.documentElement.classList.contains("kiosk-mode");
    
    if (urlKiosk || bodyKiosk) {
      if (!this._kioskMode) {
        this._kioskMode = true;
        this.requestUpdate();
      }
      return;
    }
    
    let headerHidden = false;
    try {
      if (!this._cachedHeader || !document.contains(this._cachedHeader)) {
        const findHeader = (root, depth = 0) => {
          if (depth > 10) return null;
          
          const selectors = [
            "app-header",
            "mwc-top-app-bar-fixed", 
            ".toolbar",
            "[slot='header']",
            "ha-app-layout app-header",
            "ha-tabs"
          ];
          
          for (const selector of selectors) {
            const header = root.querySelector?.(selector);
            if (header) return header;
          }
          
          const elements = root.querySelectorAll?.("*") || [];
          for (const el of elements) {
            if (el.shadowRoot) {
              const found = findHeader(el.shadowRoot, depth + 1);
              if (found) return found;
            }
          }
          return null;
        };
        
        const ha = document.querySelector("home-assistant");
        if (ha?.shadowRoot) {
          this._cachedHeader = findHeader(ha.shadowRoot);
        }
        
        if (!this._cachedHeader) {
          this._cachedHeader = findHeader(document);
        }
      }
      
      if (this._cachedHeader) {
        const rect = this._cachedHeader.getBoundingClientRect();
        const style = window.getComputedStyle(this._cachedHeader);
        
        headerHidden = 
          rect.height === 0 || 
          this._cachedHeader.offsetHeight === 0 || 
          this._cachedHeader.clientHeight === 0 ||
          rect.top < -100 ||
          style.display === "none" || 
          style.visibility === "hidden" || 
          style.opacity === "0";
      }
    } catch (e) {
      // Silent fail
    }
    
    const newKioskMode = headerHidden;
    
    if (newKioskMode !== this._kioskMode) {
      this._kioskMode = newKioskMode;
      this.requestUpdate();
    }
  }

  _debouncedMeasure(readCard = false) {
    if (this._rafMeasure) return;
    this._rafMeasure = requestAnimationFrame(() => {
      this._rafMeasure = 0;
      this._measure(readCard);
    });
  }

  _measure(readCard = false) {
    const rect = this.getBoundingClientRect?.();
    if (!rect) return;

    const vw = window.innerWidth || document.documentElement.clientWidth || rect.width;

    if (vw !== this._viewportWidth || rect.left !== this._offsetLeft || rect.width !== this._contentWidth) {
      this._viewportWidth = vw;
      this._offsetLeft = rect.left;
      this._contentWidth = rect.width;
      this.requestUpdate();
    }

    if (readCard) {
      const card = this.renderRoot?.querySelector?.("ha-card.header");
      const cr = card?.getBoundingClientRect?.();
      if (cr?.height) this._headerHeight = Math.round(cr.height);
    }
  }

  _detectPreview() {
    let node = this;
    while (node) {
      const root = node.getRootNode?.();
      if (!root || root === document) break;
      const host = root.host;
      if (!host) break;

      const tag = (host.tagName || "").toLowerCase();
      if (tag === "hui-card-preview" || tag === "hui-dialog-edit-card" || tag === "ha-dialog" || tag === "ha-dialog-scroller") {
        this._inPreview = true;
        return;
      }
      node = host;
    }
    this._inPreview = false;
  }

  _detectEditMode() {
    if (this._inPreview) {
      if (!this._editMode) {
        this._editMode = true;
        this.requestUpdate();
      }
      return;
    }

    let edit = false;
    try {
      const huiRoot = document.querySelector("hui-root") ||
                      document.querySelector("home-assistant")?.shadowRoot?.querySelector("hui-root");
      edit = !!(huiRoot?.lovelace?.editMode || huiRoot?.editMode);
    } catch (_) {}

    if (!edit) {
      try {
        edit = document.body?.classList?.contains("edit-mode") ||
               !!document.querySelector("hui-dialog-edit-card");
      } catch (_) {}
    }

    if (edit !== this._editMode) {
      this._editMode = edit;
      this.requestUpdate();
    }
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");

    const m = { ...DEFAULTS, ...config };

    // Numeric clamping
    m.height_vh = clamp(+m.height_vh, 10, 100);
    m.min_height = clamp(+m.min_height, 60, 2000);
    m.max_height = clamp(+m.max_height, m.min_height, 4000);
    m.blend_stop = clamp(+m.blend_stop, 0, 100);
    m.fixed = !!m.fixed;
    m.fixed_top = toNum(m.fixed_top, 0);
    m.title_offset_x = toNum(m.title_offset_x, 5);
    m.title_offset_y = toNum(m.title_offset_y, 32);
    m.subtitle_offset_x = toNum(m.subtitle_offset_x, 5);
    m.subtitle_offset_y = toNum(m.subtitle_offset_y, 32);
    m.badges_offset_pinned = toNum(m.badges_offset_pinned, 48);
    m.badges_offset_unpinned = toNum(m.badges_offset_unpinned, 100);
    m.badges_gap = toNum(m.badges_gap, 0);
    m.mobile_breakpoint = toNum(m.mobile_breakpoint, 768);

    // Background extra options
    m.background_blend_mode = m.background_blend_mode || "normal";
    // Allow custom sizing, default to cover if missing
    m.background_size = m.background_size || "cover";
    m.background_color = m.background_color || "";
    m.blend_enabled = m.blend_enabled !== false;
    
    // Header styling options
    m.card_border_radius = m.card_border_radius || "";
    m.card_box_shadow = m.card_box_shadow || "";
    m.card_border_style = m.card_border_style || "none";
    m.card_border_width = toNum(m.card_border_width, 0);
    m.card_border_color = m.card_border_color || "";

    // Top Bar Settings
    m.top_bar_enabled = m.top_bar_enabled !== false;
    m.top_bar_offset_y = toNum(m.top_bar_offset_y, 10);
    m.top_bar_padding_x = toNum(m.top_bar_padding_x, 5);
    
    const validSlotTypes = ["none", "spacer", "weather", "datetime", "custom", "button"];
    m.top_bar_left = validSlotTypes.includes(m.top_bar_left) ? m.top_bar_left : "none";
    m.top_bar_center = validSlotTypes.includes(m.top_bar_center) ? m.top_bar_center : "none";
    m.top_bar_right = validSlotTypes.includes(m.top_bar_right) ? m.top_bar_right : "none";
    
    // Per-slot config processing for each slot
    ["left", "center", "right"].forEach(slot => {
      const prefix = `top_bar_${slot}_`;
      m[prefix + "use_global"] = m[prefix + "use_global"] !== false;
      m[prefix + "icon"] = m[prefix + "icon"] || "";
      m[prefix + "label"] = m[prefix + "label"] || "";
      m[prefix + "tap_action"] = m[prefix + "tap_action"] || { action: "none" };
      m[prefix + "size_px"] = m[prefix + "size_px"] != null ? clamp(+m[prefix + "size_px"], 8, 64) : null;
      m[prefix + "weight"] = m[prefix + "weight"] ? normalizeWeightKey(m[prefix + "weight"], "medium") : null;
      m[prefix + "color"] = m[prefix + "color"] || null;
      m[prefix + "pill"] = m[prefix + "pill"] != null ? !!m[prefix + "pill"] : null;
      m[prefix + "pill_background"] = m[prefix + "pill_background"] || null;
      m[prefix + "pill_padding_x"] = m[prefix + "pill_padding_x"] != null ? clamp(+m[prefix + "pill_padding_x"], 0, 80) : null;
      m[prefix + "pill_padding_y"] = m[prefix + "pill_padding_y"] != null ? clamp(+m[prefix + "pill_padding_y"], 0, 80) : null;
      m[prefix + "pill_radius"] = m[prefix + "pill_radius"] != null ? clamp(+m[prefix + "pill_radius"], 0, 999) : null;
      m[prefix + "pill_blur"] = m[prefix + "pill_blur"] != null ? clamp(+m[prefix + "pill_blur"], 0, 40) : null;
      m[prefix + "pill_border_style"] = ["none", "solid", "dashed", "dotted"].includes(m[prefix + "pill_border_style"]) ? m[prefix + "pill_border_style"] : null;
      m[prefix + "pill_border_width"] = m[prefix + "pill_border_width"] != null ? clamp(+m[prefix + "pill_border_width"], 0, 10) : null;
      m[prefix + "pill_border_color"] = m[prefix + "pill_border_color"] || null;
      m[prefix + "offset_x"] = toNum(m[prefix + "offset_x"], 0);
      m[prefix + "offset_y"] = toNum(m[prefix + "offset_y"], 0);
      m[prefix + "overflow"] = !!m[prefix + "overflow"]; // New overflow option
      // Offset mobile can be null to inherit desktop, so we check carefully
      m[prefix + "offset_x_mobile"] = m[prefix + "offset_x_mobile"] != null ? toNum(m[prefix + "offset_x_mobile"], 0) : null;
      m[prefix + "offset_y_mobile"] = m[prefix + "offset_y_mobile"] != null ? toNum(m[prefix + "offset_y_mobile"], 0) : null;
    });

    // Global info styling
    m.info_size_px = clamp(+m.info_size_px || 12, 8, 64);
    m.info_weight = normalizeWeightKey(m.info_weight ?? "medium", "medium");
    m.info_pill = !!m.info_pill;
    m.info_pill_padding_x = clamp(+m.info_pill_padding_x || 10, 0, 80);
    m.info_pill_padding_y = clamp(+m.info_pill_padding_y || 6, 0, 80);
    m.info_pill_radius = clamp(+m.info_pill_radius || 999, 0, 999);
    m.info_pill_blur = clamp(+m.info_pill_blur || 0, 0, 40);
    m.info_pill_border_style = ["none", "solid", "dashed", "dotted"].includes(m.info_pill_border_style) ? m.info_pill_border_style : "none";
    m.info_pill_border_width = clamp(+m.info_pill_border_width || 0, 0, 10);
    m.info_pill_border_color = m.info_pill_border_color || "rgba(255,255,255,0.1)";

    // Weather options (Global fallback)
    m.weather_show_icon = m.weather_show_icon !== false;
    m.weather_show_condition = m.weather_show_condition !== false;
    m.weather_show_temperature = m.weather_show_temperature !== false;
    m.weather_show_humidity = !!m.weather_show_humidity;
    m.weather_show_wind = !!m.weather_show_wind;
    m.weather_show_pressure = !!m.weather_show_pressure;
    m.weather_colored_icons = m.weather_colored_icons !== false;
    m.weather_icon_color_mode = ["state", "custom", "inherit"].includes(m.weather_icon_color_mode) ? m.weather_icon_color_mode : "state";
    m.weather_animate_icon = ["none", "float", "pulse", "spin"].includes(m.weather_animate_icon) ? m.weather_animate_icon : "none";

    // Datetime options (Global fallback)
    m.datetime_show_time = m.datetime_show_time !== false;
    m.datetime_show_date = m.datetime_show_date !== false;
    m.datetime_show_day = m.datetime_show_day !== false;
    m.datetime_animate_icon = ["none", "float", "pulse", "spin"].includes(m.datetime_animate_icon) ? m.datetime_animate_icon : "none";

    // Font options
    m.font_family = ["inherit", "system", "roboto", "inter", "arial", "georgia", "mono", "custom"].includes(m.font_family) ? m.font_family : "inherit";
    m.font_family_custom = typeof m.font_family_custom === "string" ? m.font_family_custom : "";
    m.font_style = ["normal", "italic"].includes(m.font_style) ? m.font_style : "normal";
    m.title_size_px = clamp(+m.title_size_px || 36, 8, 256);
    m.subtitle_size_px = clamp(+m.subtitle_size_px || 15, 8, 128);
    m.title_weight = normalizeWeightKey(m.title_weight ?? "bold", "bold");
    m.subtitle_weight = normalizeWeightKey(m.subtitle_weight ?? "medium", "medium");

    this._config = m;
    this._scheduleTemplateSetup(0);
    this._debouncedBadgesZIndex();
  }

  _isTemplateString(s) {
    if (typeof s !== "string") return false;
    return s.includes("{{") || s.includes("{%") || s.includes("{#");
  }

  _getUserVariable() {
    const u = this.hass?.user;
    return u?.name || u?.username || u?.id || "";
  }

  _buildTemplateVariables() {
    return { config: this._config ?? {}, user: this._getUserVariable() };
  }

  _scheduleTemplateSetup(delayMs = 0) {
    if (this._tpl.timer) clearTimeout(this._tpl.timer);
    this._tpl.timer = setTimeout(() => {
      this._tpl.timer = 0;
      this._setupTemplates();
    }, Math.max(0, delayMs));
  }

  _setupTemplates() {
    this._setupTemplateKey("title", this._config?.title ?? "");
    this._setupTemplateKey("subtitle", this._config?.subtitle ?? "");
  }

  _setupTemplateKey(key, raw) {
    const isTpl = this._isTemplateString(raw);

    if (!isTpl) {
      this._unsubscribeTemplate(key);
      this._tpl[key].raw = raw;
      this._tpl[key].sig = "";
      this._setRendered(key, raw);
      return;
    }

    this._setRendered(key, raw);

    const vars = this._buildTemplateVariables();
    const sig = cacheKey(raw, vars);
    const state = this._tpl[key];

    this._unsubscribeTemplate(key);
    state.raw = raw;
    state.sig = sig;
    state.seq += 1;
    const seq = state.seq;

    const hadCache = this._applyCachedTemplate(key, sig);

    if (!this._inPreview && this.hass?.connection?.subscribeMessage) {
      this._subscribeTemplateImmediate(key, seq, raw, vars, sig);
    } else if (this.hass?.callWS && !hadCache) {
      this._renderTemplateOnce(key, seq, raw, vars, sig);
    }
  }

  _applyCachedTemplate(key, sig) {
    try {
      const cached = sessionStorage.getItem(sig);
      if (cached != null && cached !== "") {
        this._setRendered(key, cached);
        return true;
      }
    } catch (_) {}
    return false;
  }

  async _renderTemplateOnce(key, seq, raw, vars, sig) {
    if (!this.hass?.callWS) return;
    try {
      const res = await this.hass.callWS({
        type: "render_template",
        template: raw,
        variables: vars,
        strict: false,
      });
      if (this._tpl[key].seq !== seq) return;
      const text = res?.result == null ? "" : String(res.result);
      this._setRendered(key, text);
      this._storeTemplateCache(sig, text);
    } catch (err) {
      console.warn(`Template render failed for ${key}:`, err);
    }
  }

  async _subscribeTemplateImmediate(key, seq, raw, vars, sig) {
    if (!this.hass?.connection?.subscribeMessage) return;
    try {
      const unsub = await this.hass.connection.subscribeMessage(
        (msg) => this._onTemplateMsg(key, seq, sig, msg),
        { type: "render_template", template: raw, variables: vars, strict: false, report_errors: false }
      );
      const st = this._tpl[key];
      if (st.seq !== seq) { unsub?.(); return; }
      st.unsub = unsub;
    } catch (err) {
      console.warn(`Template subscription failed for ${key}:`, err);
      this._renderTemplateOnce(key, seq, raw, vars, sig);
    }
  }

  _onTemplateMsg(key, seq, sig, msg) {
    if (this._tpl[key].seq !== seq) return;
    if (msg?.error) { console.warn(`Template update error for ${key}:`, msg.error); return; }
    const text = msg?.result == null ? "" : String(msg.result);
    this._setRendered(key, text);
    this._storeTemplateCache(sig, text);
  }

  _storeTemplateCache(sig, value) {
    try { sessionStorage.setItem(sig, value); } catch (_) {}
  }

  _setRendered(key, value) {
    const v = value == null ? "" : String(value);
    if (key === "title") {
      if (this._renderedTitle !== v) { this._renderedTitle = v; this.requestUpdate(); }
    } else if (key === "subtitle") {
      if (this._renderedSubtitle !== v) { this._renderedSubtitle = v; this.requestUpdate(); }
    }
  }

  _unsubscribeTemplate(key) {
    const st = this._tpl[key];
    if (st?.unsub) { try { st.unsub(); } catch (_) {} }
    if (st) st.unsub = null;
  }

  _resolveFontFamily() {
    const k = this._config?.font_family ?? "inherit";
    if (k === "custom") return (this._config?.font_family_custom || "").trim() || "inherit";
    return FONT_FAMILY_MAP[k] ?? "inherit";
  }

  _resolveWeight(key) {
    return WEIGHT_MAP[this._config?.[key]] ?? 400;
  }

  _resolveWeightValue(weight) {
    return WEIGHT_MAP[weight] ?? 400;
  }

  _resolveBackground(bg) {
    if (!bg || typeof bg !== "string") return bg;
    const t = bg.trim();
    if (t.startsWith("url(") || t.startsWith("linear-gradient(") || t.startsWith("radial-gradient(")) return t;
    const isPath = t.startsWith("/") || t.startsWith("./") || t.startsWith("../") ||
                   t.startsWith("http://") || t.startsWith("https://") ||
                   /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(t);
    return isPath ? `url('${t}')` : t;
  }

  _resolveWeatherIconColor(cfg, state, prefix = "") {
    // Check specific slot config first, then fallback to global
    const mode = cfg[prefix + "weather_icon_color_mode"] || cfg.weather_icon_color_mode;
    const customColor = cfg[prefix + "weather_icon_color"] || cfg.weather_icon_color;
    const coloredIcons = cfg[prefix + "weather_colored_icons"] !== undefined ? cfg[prefix + "weather_colored_icons"] : cfg.weather_colored_icons;

    if (mode === "custom" && customColor) return customColor.trim();
    if (mode === "inherit" || !coloredIcons) return "inherit";
    return WEATHER_COLOR_MAP[state] || "inherit";
  }

  _debouncedBadgesZIndex() {
    if (this._rafBadges) return;
    this._rafBadges = requestAnimationFrame(() => {
      this._rafBadges = 0;
      this._applyBadgesZIndex();
    });
  }

  _applyBadgesZIndex() {
    const cfg = this._config || {};
    const effectiveFixed = !!cfg.fixed && !this._inPreview;

    if (!effectiveFixed) { this._resetBadgesZIndex(); return; }

    const el = this._findHaBadgesElement();
    if (!el) { this._resetBadgesZIndex(); return; }

    if (el !== this._badgesEl) {
      this._resetBadgesZIndex();
      this._badgesEl = el;
    }

    const kioskAdjustment = this._kioskMode ? 0 : 48;
    const badgesOffset = cfg.badges_fixed ? (cfg.badges_offset_pinned || 48) : (cfg.badges_offset_unpinned || 100);
    const topPosition = Math.max(0, (this._headerHeight || 0) - badgesOffset + (cfg.fixed_top || 0) + kioskAdjustment);

    if (cfg.badges_fixed) {
      el.style.cssText = `position:fixed;top:${topPosition}px;left:${this._offsetLeft}px;width:${this._contentWidth}px;z-index:2;`;
    } else {
      const kioskGapAdjustment = this._kioskMode ? 48 : 0;
      const effectiveGap = (cfg.badges_gap || 0) + kioskGapAdjustment;
      el.style.cssText = `position:relative;z-index:0;margin-bottom:${effectiveGap}px;`;
    }
  }

  _resetBadgesZIndex() {
    if (this._badgesEl) {
      try { this._badgesEl.style.cssText = ""; } catch (_) {}
      this._badgesEl = null;
    }
  }

  _findHaBadgesElement() {
    const selectors = "hui-badges, ha-badges, .badges, .header-badges";
    let node = this;
    for (let i = 0; i < 12; i++) {
      const root = node.getRootNode?.();
      if (!root || root === document) break;
      const host = root.host;
      if (!host) break;
      const sr = host.shadowRoot;
      const hit = sr?.querySelector?.(selectors) || host.querySelector?.(selectors);
      if (hit) return hit;
      node = host;
    }
    return null;
  }

  _parseServiceData(serviceData) {
    if (!serviceData) return {};
    if (typeof serviceData === "object") return serviceData;
    if (typeof serviceData !== "string") return {};

    const raw = serviceData.trim();
    if (!raw) return {};

    if (raw.startsWith("{") || raw.startsWith("[")) {
      try { const v = JSON.parse(raw); return v && typeof v === "object" ? v : {}; } catch (_) {}
    }

    try {
      const loader = window?.jsyaml?.load;
      if (typeof loader === "function") {
        const v = loader(raw);
        return v && typeof v === "object" ? v : {};
      }
    } catch (_) {}

    // Simple key: value parser
    const out = {};
    raw.split("\n").forEach((line) => {
      const t = line.trim();
      if (!t || t.startsWith("#")) return;
      const idx = t.indexOf(":");
      if (idx <= 0) return;
      const k = t.slice(0, idx).trim();
      let v = t.slice(idx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      out[k] = v;
    });
    return out;
  }

  _handleAction(action) {
    if (!action || action.action === "none" || !this.hass) return;

    switch (action.action) {
      case "navigate":
        if (action.navigation_path) {
           if (action.navigation_path === "back") {
             history.back();
           } else {
             history.pushState(null, "", action.navigation_path);
             window.dispatchEvent(new CustomEvent("location-changed", { bubbles: true, composed: true, detail: { replace: false } }));
           }
        }
        break;
      case "back":
        history.back();
        break;
      case "menu":
        this.dispatchEvent(new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true }));
        break;
      case "url":
        if (action.url_path) window.open(action.url_path, "_blank");
        break;
      case "perform-action":
        if (action.perform_action) {
          const [domain, service] = action.perform_action.split(".");
          if (domain && service) {
            const serviceData = action.data || {};
            const target = action.target || {};
            this.hass.callService(domain, service, serviceData, target);
          }
        }
        break;
      case "call-service":
        // Legacy support for old call-service action
        if (action.service) {
          const [domain, service] = action.service.split(".");
          if (domain && service) this.hass.callService(domain, service, this._parseServiceData(action.service_data));
        }
        break;
      case "more-info": {
        const entity = action.entity || this._config.weather_entity;
        if (entity) this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId: entity } }));
        break;
      }
      case "toggle": {
        const toggleEntity = action.entity || this._config.weather_entity;
        if (toggleEntity) this.hass.callService("homeassistant", "toggle", { entity_id: toggleEntity });
        break;
      }
    }
  }

  async _updateCustomCards() {
    if (!window.loadCardHelpers) return;
    
    const slots = ['left', 'center', 'right'];
    let helpersLoaded = null;
    let needsUpdate = false;
    
    for (const slot of slots) {
        const type = this._config[`top_bar_${slot}`];
        const cardConfigKey = `top_bar_${slot}_card`;
        const cardConfig = this._config[cardConfigKey];
        
        // Generate a simple hash to detect config changes
        const configHash = type === 'custom' ? JSON.stringify(cardConfig || {}) : '';
        const cacheKey = `_customCardHash_${slot}`;
        
        if (type === 'custom') {
            // Only recreate if config has changed
            if (this[cacheKey] !== configHash || !this._customCards[slot]) {
                if (!helpersLoaded) helpersLoaded = await window.loadCardHelpers();
                
                let finalConfig = { 
                    use_header_styling: true, 
                    show_background: false,
                    show_empty: true,
                    ...(cardConfig || { type: "custom:hki-notification-card" })
                };

                try {
                    const element = await helpersLoaded.createCardElement(finalConfig);
                    if (this.hass) element.hass = this.hass;
                    element.style.display = "block";
                    this._customCards[slot] = element;
                    this[cacheKey] = configHash;
                    needsUpdate = true;
                } catch (e) {
                    console.error(`Failed to create custom card for ${slot}`, e);
                }
            }
        } else if (this._customCards[slot]) {
            this._customCards[slot] = null;
            this[cacheKey] = '';
            needsUpdate = true;
        }
    }
    
    if (needsUpdate) this.requestUpdate();
  }

  _getSlotStyle(slotName) {
    const cfg = this._config;
    const prefix = `top_bar_${slotName}_`;
    
    // Generate cache key based on relevant config values
    const cacheKey = `${slotName}:${cfg[prefix + "use_global"]}:${cfg[prefix + "size_px"]}:${cfg[prefix + "weight"]}:${cfg[prefix + "color"]}:${cfg[prefix + "pill"]}:${cfg.info_size_px}:${cfg.info_weight}:${cfg.info_color}:${cfg.info_pill}:${cfg.font_family}:${cfg.font_style}`;
    
    const cached = this._slotStyleCache.get(cacheKey);
    if (cached) return cached;
    
    const useGlobal = cfg[prefix + "use_global"] !== false;
    
    const fontFamily = this._resolveFontFamily();
    
    // Get values, preferring per-slot if not using global, otherwise use global
    const sizePx = (!useGlobal && cfg[prefix + "size_px"] != null) ? cfg[prefix + "size_px"] : cfg.info_size_px;
    const weight = (!useGlobal && cfg[prefix + "weight"] != null) ? cfg[prefix + "weight"] : cfg.info_weight;
    const color = (!useGlobal && cfg[prefix + "color"]) ? cfg[prefix + "color"] : (cfg.info_color?.trim() || "var(--hki-header-text-color, #fff)");
    const iconSize = Math.round(sizePx * 2);
    
    const pill = (!useGlobal && cfg[prefix + "pill"] != null) ? cfg[prefix + "pill"] : cfg.info_pill;
    const pillBg = (!useGlobal && cfg[prefix + "pill_background"]) ? cfg[prefix + "pill_background"] : cfg.info_pill_background;
    const pillPaddingX = (!useGlobal && cfg[prefix + "pill_padding_x"] != null) ? cfg[prefix + "pill_padding_x"] : cfg.info_pill_padding_x;
    const pillPaddingY = (!useGlobal && cfg[prefix + "pill_padding_y"] != null) ? cfg[prefix + "pill_padding_y"] : cfg.info_pill_padding_y;
    const pillRadius = (!useGlobal && cfg[prefix + "pill_radius"] != null) ? cfg[prefix + "pill_radius"] : cfg.info_pill_radius;
    const pillBlur = (!useGlobal && cfg[prefix + "pill_blur"] != null) ? cfg[prefix + "pill_blur"] : cfg.info_pill_blur;
    const pillBorderStyle = (!useGlobal && cfg[prefix + "pill_border_style"]) ? cfg[prefix + "pill_border_style"] : cfg.info_pill_border_style;
    const pillBorderWidth = (!useGlobal && cfg[prefix + "pill_border_width"] != null) ? cfg[prefix + "pill_border_width"] : cfg.info_pill_border_width;
    const pillBorderColor = (!useGlobal && cfg[prefix + "pill_border_color"]) ? cfg[prefix + "pill_border_color"] : cfg.info_pill_border_color;
    
    const weightValue = this._resolveWeightValue(weight);
    const fontStyleValue = cfg.font_style || "normal";
    
    const inlineStyle = `font-family:${fontFamily};font-style:${fontStyleValue};font-size:${sizePx}px;font-weight:${weightValue};color:${color};`;
    
    const pillStyle = pill ? `--hki-info-pill-background:${pillBg};--hki-info-pill-padding-x:${pillPaddingX}px;--hki-info-pill-padding-y:${pillPaddingY}px;--hki-info-pill-radius:${pillRadius}px;--hki-info-pill-blur:${pillBlur}px;--hki-info-pill-border-style:${pillBorderStyle};--hki-info-pill-border-width:${pillBorderWidth}px;--hki-info-pill-border-color:${pillBorderColor}` : "";
    
    // CSS variables for notification card
    const notifyVars = `--hki-notify-font-size:${sizePx}px;--hki-notify-font-weight:${weightValue};--hki-notify-color:${color};--hki-notify-icon-size:${iconSize}px;--hki-notify-font-family:${fontFamily};--hki-notify-font-style:${fontStyleValue};--hki-notify-pill-enabled:${pill ? '1' : '0'};--hki-notify-pill-bg:${pillBg};--hki-notify-pill-padding-x:${pillPaddingX}px;--hki-notify-pill-padding-y:${pillPaddingY}px;--hki-notify-pill-radius:${pillRadius}px;--hki-notify-pill-blur:${pillBlur}px;--hki-notify-pill-border-style:${pillBorderStyle};--hki-notify-pill-border-width:${pillBorderWidth}px;--hki-notify-pill-border-color:${pillBorderColor}`;
    
    const result = { 
      inlineStyle, 
      pillStyle, 
      notifyVars, 
      iconSize, 
      pill, 
      sizePx, 
      color,
      pillBorderStyle,
      pillBorderWidth,
      pillBorderColor
    };
    
    // Cache the result (limit cache size)
    if (this._slotStyleCache.size > 20) this._slotStyleCache.clear();
    this._slotStyleCache.set(cacheKey, result);
    
    return result;
  }

  _renderSlotContent(type, slotName) {
      const cfg = this._config;
      const slotStyle = this._getSlotStyle(slotName);
      
      switch (type) {
          case "weather": return this._renderWeatherSlot(slotName, slotStyle);
          case "datetime": return this._renderDatetimeSlot(slotName, slotStyle);
          case "custom": return this._renderCustomCardSlot(slotName, slotStyle);
          case "spacer": return html`<div class="slot-spacer"></div>`;
          case "button": return this._renderButtonSlot(slotName, slotStyle);
          default: return html``;
      }
  }

  _renderButtonSlot(slotName, slotStyle) {
    const cfg = this._config;
    const prefix = `top_bar_${slotName}_`;
    const icon = cfg[prefix + "icon"] || "mdi:gesture-tap";
    const label = cfg[prefix + "label"] || "";
    const tapAction = cfg[prefix + "tap_action"] || { action: "none" };
    
    const pillClass = slotStyle.pill ? "info-pill" : "";
    const combinedStyle = `${slotStyle.inlineStyle} ${slotStyle.pillStyle}`;
    
    return html`
      <div class="info-item ${pillClass}" style="${combinedStyle}" @click=${() => this._handleSlotTapAction(tapAction, slotName)}>
        <ha-icon .icon=${icon} style="--mdc-icon-size:${slotStyle.iconSize}px;"></ha-icon>
        ${label ? html`<span>${label}</span>` : ''}
      </div>
    `;
  }

  _handleSlotTapAction(action, slotName) {
    if (!action || action.action === "none") return;
    this._handleAction(action);
  }

  _renderWeatherSlot(slotName, slotStyle) {
    const cfg = this._config;
    const prefix = `top_bar_${slotName}_`;
    
    // Fallback to global if local is not set
    const entityId = cfg[prefix + "weather_entity"] || cfg.weather_entity;
    
    if (!entityId || !this.hass) return html``;

    const weatherEntity = this.hass.states[entityId];
    if (!weatherEntity) return html``;

    const state = weatherEntity.state;
    const attrs = weatherEntity.attributes || {};

    const weatherIcon = WEATHER_ICON_MAP[state] || "mdi:weather-cloudy";
    
    // Translate condition state
    let conditionText = state;
    if (this.hass.formatEntityState) {
        conditionText = this.hass.formatEntityState(weatherEntity);
    } else {
        conditionText = (attrs.friendly_name || state).replace(/-/g, " ");
    }
    
    const temperature = attrs.temperature;
    const humidity = attrs.humidity;
    const wind = attrs.wind_speed;
    const pressure = attrs.pressure;
    const unit = this.hass.config?.unit_system?.temperature || "°C";

    // Check for slot specific overrides, fallback to global
    const showIcon = cfg[prefix + "show_icon"] !== undefined ? cfg[prefix + "show_icon"] : (cfg.weather_show_icon !== false);
    const showCondition = cfg[prefix + "show_condition"] !== undefined ? cfg[prefix + "show_condition"] : (cfg.weather_show_condition !== false);
    const showTemp = cfg[prefix + "show_temperature"] !== undefined ? cfg[prefix + "show_temperature"] : (cfg.weather_show_temperature !== false);
    const showHum = cfg[prefix + "show_humidity"] !== undefined ? cfg[prefix + "show_humidity"] : !!cfg.weather_show_humidity;
    const showWind = cfg[prefix + "show_wind"] !== undefined ? cfg[prefix + "show_wind"] : !!cfg.weather_show_wind;
    const showPressure = cfg[prefix + "show_pressure"] !== undefined ? cfg[prefix + "show_pressure"] : !!cfg.weather_show_pressure;

    const iconColor = this._resolveWeatherIconColor(cfg, state, prefix);
    
    const animateIcon = cfg[prefix + "animate_icon"] || cfg.weather_animate_icon;
    const animClass = animateIcon && animateIcon !== "none" ? `animate-${animateIcon}` : "";

    const iconPack = cfg[prefix + "icon_pack_path"] || cfg.weather_icon_pack_path;
    const useSvg = !!iconPack;
    const svgUrl = useSvg ? `${iconPack}/${state}.svg` : "";

    const pillClass = slotStyle.pill ? "info-pill" : "";
    const combinedStyle = `${slotStyle.inlineStyle} ${slotStyle.pillStyle}`;
    
    const tapAction = cfg[prefix + "tap_action"] || cfg.info_tap_action || { action: "none" };

    return html`
      <div class="info-item ${pillClass}" style="${combinedStyle}" @click=${() => this._handleSlotTapAction(tapAction, slotName)}>
        ${showIcon ? (useSvg 
            ? html`<img src="${svgUrl}" class="info-icon ${animClass}" style="width:${slotStyle.iconSize}px;height:${slotStyle.iconSize}px;" alt="${state}" />`
            : html`<ha-icon class="info-weather-icon ${animClass}" .icon=${weatherIcon}
                   style="--mdc-icon-size:${slotStyle.iconSize}px;color:${iconColor};"></ha-icon>`)
        : ""}
        ${showCondition ? html`<span class="info-condition">${conditionText}</span>` : ""}
        ${showTemp && temperature != null ? html`<span class="info-temperature">${Math.round(temperature)}${unit}</span>` : ""}
        ${showHum && humidity != null ? html`<span class="info-humidity">${humidity}%</span>` : ""}
        ${showWind && wind != null ? html`<span class="info-wind">${wind} ${attrs.wind_speed_unit || "km/h"}</span>` : ""}
        ${showPressure && pressure != null ? html`<span class="info-pressure">${pressure} ${attrs.pressure_unit || "hPa"}</span>` : ""}
      </div>
    `;
  }

  _renderDatetimeSlot(slotName, slotStyle) {
    const cfg = this._config;
    const prefix = `top_bar_${slotName}_`;
    const locale = this.hass?.language || 'en';
    
    const now = new Date(this._currentTime);
    const parts = [];

    // Fallback to global defaults if local not set
    const showDay = cfg[prefix + "show_day"] !== undefined ? cfg[prefix + "show_day"] : (cfg.datetime_show_day !== false);
    const showDate = cfg[prefix + "show_date"] !== undefined ? cfg[prefix + "show_date"] : (cfg.datetime_show_date !== false);
    const showTime = cfg[prefix + "show_time"] !== undefined ? cfg[prefix + "show_time"] : (cfg.datetime_show_time !== false);
    
    const dateFormat = cfg[prefix + "date_format"] || cfg.datetime_date_format || "D MMM";
    const timeFormat = cfg[prefix + "time_format"] || cfg.datetime_time_format || "HH:mm";
    const sep = cfg[prefix + "separator"] || cfg.datetime_separator || " • ";
    const icon = cfg[prefix + "icon"] || cfg.datetime_icon;

    if (showDay) parts.push(formatDateTime(now, "DDDD", locale));
    if (showDate) parts.push(formatDateTime(now, dateFormat, locale));
    if (showTime) parts.push(formatDateTime(now, timeFormat, locale));

    const displayText = parts.join(sep);

    const pillClass = slotStyle.pill ? "info-pill" : "";
    const combinedStyle = `${slotStyle.inlineStyle} ${slotStyle.pillStyle}`;
    
    const animateIcon = cfg[prefix + "animate_icon"] || cfg.datetime_animate_icon;
    const animClass = animateIcon && animateIcon !== "none" ? `animate-${animateIcon}` : "";
    
    const tapAction = cfg[prefix + "tap_action"] || cfg.info_tap_action || { action: "none" };

    return html`
      <div class="info-item ${pillClass}" style="${combinedStyle}" @click=${() => this._handleSlotTapAction(tapAction, slotName)}>
        ${icon ? html`
          <ha-icon class="${animClass}" .icon=${icon}
                   style="--mdc-icon-size:${slotStyle.iconSize}px;"></ha-icon>
        ` : ""}
        <span>${displayText}</span>
      </div>
    `;
  }

  _renderCustomCardSlot(slotName, slotStyle) {
    const cardEl = this._customCards[slotName];
    if (!cardEl) return html``;
    
    const combinedStyle = `${slotStyle.inlineStyle} ${slotStyle.notifyVars}; min-width: 50px;`;

    return html`
      <div class="info-item" style="${combinedStyle}">
        ${cardEl}
      </div>
    `;
  }

  _renderTopBar() {
      if (!this._config.top_bar_enabled) return html``;

      const cfg = this._config;
      const offsetY = cfg.top_bar_offset_y !== undefined ? cfg.top_bar_offset_y : 10;
      const paddingX = cfg.top_bar_padding_x !== undefined ? cfg.top_bar_padding_x : 5;
      const topStyle = `top: ${offsetY}px; padding: 0 ${paddingX}px;`;
      
      const isMobile = this._viewportWidth > 0 && this._viewportWidth <= (cfg.mobile_breakpoint || 768);
      
      // Helper to calculate offset, preferring mobile override if valid number
      const getOffset = (base, mobile) => {
         if (isMobile && typeof mobile === 'number' && Number.isFinite(mobile)) return mobile;
         return base || 0;
      };

      const leftX = getOffset(cfg.top_bar_left_offset_x, cfg.top_bar_left_offset_x_mobile);
      const leftY = getOffset(cfg.top_bar_left_offset_y, cfg.top_bar_left_offset_y_mobile);
      
      const centerX = getOffset(cfg.top_bar_center_offset_x, cfg.top_bar_center_offset_x_mobile);
      const centerY = getOffset(cfg.top_bar_center_offset_y, cfg.top_bar_center_offset_y_mobile);
      
      const rightX = getOffset(cfg.top_bar_right_offset_x, cfg.top_bar_right_offset_x_mobile);
      const rightY = getOffset(cfg.top_bar_right_offset_y, cfg.top_bar_right_offset_y_mobile);
      
      const leftStyle = (leftX || leftY) ? `transform: translate(${leftX}px, ${leftY}px);` : "";
      const centerStyle = (centerX || centerY) ? `transform: translate(${centerX}px, ${centerY}px);` : "";
      const rightStyle = (rightX || rightY) ? `transform: translate(${rightX}px, ${rightY}px);` : "";
      
      // Determine which slots are occupied
      const leftEmpty = cfg.top_bar_left === "none";
      const centerEmpty = cfg.top_bar_center === "none";
      const rightEmpty = cfg.top_bar_right === "none";
      
      // Determine overflow
      const leftOverflow = !!cfg.top_bar_left_overflow;
      const centerOverflow = !!cfg.top_bar_center_overflow;
      const rightOverflow = !!cfg.top_bar_right_overflow;

      return html`
        <div class="top-bar-container" style="${topStyle}">
            <div class="slot slot-left ${leftEmpty ? 'slot-empty' : ''} ${leftOverflow ? 'slot-visible' : ''}" style="${leftStyle}">${this._renderSlotContent(cfg.top_bar_left, "left")}</div>
            <div class="slot slot-center ${centerEmpty ? 'slot-empty' : ''} ${centerOverflow ? 'slot-visible' : ''}" style="${centerStyle}">${this._renderSlotContent(cfg.top_bar_center, "center")}</div>
            <div class="slot slot-right ${rightEmpty ? 'slot-empty' : ''} ${rightOverflow ? 'slot-visible' : ''}" style="${rightStyle}">${this._renderSlotContent(cfg.top_bar_right, "right")}</div>
        </div>
      `;
  }

  _renderInfoDisplay() {
    return html``;
  }

  render() {
    if (!this._config) return html``;

    const cfg = this._config;
    const effectiveFixed = !!cfg.fixed && !this._inPreview;

    const titleText = this._isTemplateString(cfg.title) ? (this._renderedTitle ?? "") : (cfg.title ?? "");
    const subtitleText = this._isTemplateString(cfg.subtitle) ? (this._renderedSubtitle ?? "") : (cfg.subtitle ?? "");
    const subtitleVisible = !!subtitleText.trim();

    // Change: always use 100% for card width - when inside containers like Bubble popups,
    // 100vw can extend beyond the container boundaries
    const cardWidth = "100%";
    
    // Background can be a CSS color, a gradient, or an image URL.
    // Colors must map to background-color (not background-image).
    const bgRaw = (cfg.background ?? "").toString();
    const bgTrim = bgRaw.trim();
    const isGradient = bgTrim.startsWith("linear-gradient(") || bgTrim.startsWith("radial-gradient(");
    const isUrl = bgTrim.startsWith("url(");
    const isPath = bgTrim.startsWith("/") || bgTrim.startsWith("./") || bgTrim.startsWith("../") ||
                   bgTrim.startsWith("http://") || bgTrim.startsWith("https://") ||
                   /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(bgTrim);

    let bgImage = "";
    let bgColor = "";

    if (bgTrim) {
      if (isGradient || isUrl) bgImage = bgTrim;
      else if (isPath) bgImage = `url('${bgTrim}')`;
      else bgColor = bgTrim;
    }

    // Determine border-radius: custom > system default (when not fixed) > 0 (when fixed)
    let borderRadius = "";
    const br = cfg.card_border_radius;
    if (br !== undefined && br !== null && br !== "") {
      if (typeof br === "number") borderRadius = `${br}px`;
      else {
        const s = String(br).trim();
        borderRadius = /^\d+$/.test(s) ? `${s}px` : s;
      }
    } else if (!effectiveFixed) {
      borderRadius = "var(--ha-card-border-radius, 12px)";
    }

    // Build border style - always explicit to override ha-card defaults
    let borderStyle = "";
    if (cfg.card_border_style && cfg.card_border_style !== "none" && cfg.card_border_width > 0) {
      // Custom border configured
      borderStyle = `border-style:${cfg.card_border_style};border-width:${cfg.card_border_width}px;border-color:${cfg.card_border_color || 'transparent'}`;
    } else {
      // No border - explicitly set to none to override ha-card defaults
      borderStyle = "border:none";
    }

    const cardStyle = [
      `width:${cardWidth}`,
      `height:${cfg.height_vh}vh`,
      `min-height:${cfg.min_height}px`,
      `max-height:${cfg.max_height}px`,      (bgColor || cfg.background_color) ? `background-color:${bgColor || cfg.background_color}` : "",
      bgImage ? `background-image:${bgImage}` : "",
      cfg.background_position ? `background-position:${cfg.background_position}` : "",
      cfg.background_repeat ? `background-repeat:${cfg.background_repeat}` : "",
      cfg.background_size ? `background-size:${cfg.background_size}` : "",
      cfg.background_blend_mode ? `background-blend-mode:${cfg.background_blend_mode}` : "",
      borderRadius ? `border-radius:${borderRadius}` : "",
      cfg.card_box_shadow ? `box-shadow:${cfg.card_box_shadow}` : "box-shadow:none",
      borderStyle,
      // Apply overflow:hidden when not fixed OR when fixed with border-radius
      // When fixed with border-radius, we need overflow:hidden on BOTH wrapper and card for proper clipping
      (!effectiveFixed || borderRadius) ? "overflow:hidden" : ""
    ].filter(Boolean).join(";");

    // Only show overlay gradient if blend is enabled
    const blendEnabled = cfg.blend_enabled !== false;
    const overlayStyle = blendEnabled 
      ? `background:linear-gradient(to bottom, transparent 0%, ${cfg.blend_color} ${cfg.blend_stop}%, ${cfg.blend_color} 100%);`
      : "display:none;";
    
    // Change: if not fixed, do not apply calculated offsets
    const contentStyle = effectiveFixed 
      ? `margin-left:${this._offsetLeft}px;width:${this._contentWidth}px;`
      : `width:100%;`;

    const fontFamily = this._resolveFontFamily();
    const fontStyle = cfg.font_style || "normal";
    const titleColor = cfg.title_color?.trim() || "var(--hki-header-text-color, #fff)";
    const subtitleColor = cfg.subtitle_color?.trim() || "var(--hki-header-text-color, #fff)";
    const titleInline = `font-family:${fontFamily};font-style:${fontStyle};font-size:${cfg.title_size_px}px;font-weight:${this._resolveWeight("title_weight")};color:${titleColor};`;
    const subtitleInline = `font-family:${fontFamily};font-style:${fontStyle};font-size:${cfg.subtitle_size_px}px;font-weight:${this._resolveWeight("subtitle_weight")};color:${subtitleColor};`;

    const subtitleOffsetX = (cfg.subtitle_offset_x || 0) - (cfg.title_offset_x || 0);
    const subtitleOffsetY = (cfg.subtitle_offset_y || 0) - (cfg.title_offset_y || 0);
    const subtitleTransform = `transform:translate(${subtitleOffsetX}px, ${subtitleOffsetY}px);`;

    let titleBlockStyle;
    if (cfg.text_align === "right") titleBlockStyle = `left:auto;right:${cfg.title_offset_x}px;top:${cfg.title_offset_y}px;text-align:right;align-items:flex-end;`;
    else if (cfg.text_align === "center") titleBlockStyle = `left:50%;top:${cfg.title_offset_y}px;transform:translateX(-50%);text-align:center;align-items:center;`;
    else titleBlockStyle = `left:${cfg.title_offset_x}px;top:${cfg.title_offset_y}px;text-align:left;align-items:flex-start;`;

    const topOffset = this._kioskMode ? (cfg.fixed_top || 0) : (cfg.fixed_top || 0) + 48;
    const wrapperStyle = effectiveFixed 
      ? `top:${topOffset}px;${borderRadius ? `border-radius:${borderRadius};contain:paint;` : ''}` 
      : "";

    const badgesOffset = cfg.badges_fixed ? (cfg.badges_offset_pinned || 48) : (cfg.badges_offset_unpinned || 100);
    let spacerH = effectiveFixed ? Math.max(0, (this._headerHeight || 0) - badgesOffset + topOffset) : 0;

    if (cfg.badges_fixed && effectiveFixed) {
      const kioskGapAdjustment = this._kioskMode ? 48 : 0;
      spacerH += (cfg.badges_gap || 0) + kioskGapAdjustment - 48;
    }

    const cardMarkup = html`
      <ha-card class="header" style=${cardStyle} aria-label=${titleText || "Header"}>
        <div class="overlay" style=${overlayStyle}></div>
        <div class="content" style=${contentStyle}>
          ${this._renderTopBar()}
          <div class="title-block" style=${titleBlockStyle}>
            <div class="title" style=${titleInline} role="heading" aria-level="1">${titleText}</div>
            ${subtitleVisible ? html`<div class="subtitle" style="${subtitleInline}${subtitleTransform}">${subtitleText}</div>` : html``}
          </div>
          ${this._renderInfoDisplay()}
        </div>
      </ha-card>
    `;

    if (!effectiveFixed) return cardMarkup;

    return html`
      <div class="header-fixed" style=${wrapperStyle}>${cardMarkup}</div>
      <div class="header-spacer" style="height:${spacerH}px;"></div>
    `;
  }

  static getConfigElement() {
    return document.createElement("hki-header-card-editor");
  }

  static getStubConfig() {
    return {
      ...DEFAULTS,
      title: "{% if is_state('sun.sun','above_horizon') %}Good day, {{ user }}{% else %}Good evening, {{ user }}{% endif %}",
      subtitle: "{{ now().strftime('%A %H:%M') }}",
      font_family: "roboto",
    };
  }

  static getCardSize() {
    return 3;
  }
}

customElements.define(CARD_NAME, HkiHeaderCard);


// ─────────────────────────────────────────────────────────────
// EDITOR
// ─────────────────────────────────────────────────────────────

class HkiHeaderCardEditor extends LitElement {
  static get properties() {
    return {
      hass: {},
      lovelace: {},
      _config: { attribute: false },
    };
  }

  // Pre-computed field sets for performance (avoid recreating on every change)
  static _numericFields = new Set([
    "height_vh", "min_height", "max_height", "blend_stop", "fixed_top",
    "title_offset_x", "title_offset_y", "subtitle_offset_x", "subtitle_offset_y",
    "title_size_px", "subtitle_size_px", "badges_offset_pinned", "badges_offset_unpinned",
    "badges_gap", "info_offset_x", "info_offset_y", "info_size_px",
    "mobile_breakpoint", "info_pill_padding_x", "info_pill_padding_y",
    "info_pill_radius", "info_pill_blur", "top_bar_offset_y", "top_bar_padding_x",
    "top_bar_left_offset_x", "top_bar_left_offset_y",
    "top_bar_center_offset_x", "top_bar_center_offset_y",
    "top_bar_right_offset_x", "top_bar_right_offset_y",
    "top_bar_left_size_px", "top_bar_center_size_px", "top_bar_right_size_px",
    "top_bar_left_pill_padding_x", "top_bar_left_pill_padding_y", "top_bar_left_pill_radius", "top_bar_left_pill_blur",
    "top_bar_center_pill_padding_x", "top_bar_center_pill_padding_y", "top_bar_center_pill_radius", "top_bar_center_pill_blur",
    "top_bar_right_pill_padding_x", "top_bar_right_pill_padding_y", "top_bar_right_pill_radius", "top_bar_right_pill_blur",
    "info_pill_border_width", "top_bar_left_pill_border_width", "top_bar_center_pill_border_width", "top_bar_right_pill_border_width",
    "card_border_width"
  ]);

  static _nullableNumericFields = new Set([
    "info_offset_x_mobile", "info_offset_y_mobile",
    "top_bar_left_offset_x_mobile", "top_bar_left_offset_y_mobile",
    "top_bar_center_offset_x_mobile", "top_bar_center_offset_y_mobile",
    "top_bar_right_offset_x_mobile", "top_bar_right_offset_y_mobile"
  ]);

  static _booleanFields = new Set([
    "fixed", "badges_fixed", "weather_show_icon", "weather_show_condition",
    "weather_show_temperature", "weather_show_humidity", "weather_show_wind",
    "weather_show_pressure", "weather_colored_icons", "info_pill",
    "datetime_show_time", "datetime_show_date", "datetime_show_day", "top_bar_enabled",
    "blend_enabled",
    "top_bar_left_use_global", "top_bar_left_pill", "top_bar_left_overflow", "top_bar_left_show_icon", "top_bar_left_show_condition", "top_bar_left_show_temperature", "top_bar_left_show_humidity", "top_bar_left_show_wind", "top_bar_left_show_pressure", "top_bar_left_weather_colored_icons", "top_bar_left_show_day", "top_bar_left_show_date", "top_bar_left_show_time",
    "top_bar_center_use_global", "top_bar_center_pill", "top_bar_center_overflow", "top_bar_center_show_icon", "top_bar_center_show_condition", "top_bar_center_show_temperature", "top_bar_center_show_humidity", "top_bar_center_show_wind", "top_bar_center_show_pressure", "top_bar_center_weather_colored_icons", "top_bar_center_show_day", "top_bar_center_show_date", "top_bar_center_show_time",
    "top_bar_right_use_global", "top_bar_right_pill", "top_bar_right_overflow", "top_bar_right_show_icon", "top_bar_right_show_condition", "top_bar_right_show_temperature", "top_bar_right_show_humidity", "top_bar_right_show_wind", "top_bar_right_show_pressure", "top_bar_right_weather_colored_icons", "top_bar_right_show_day", "top_bar_right_show_date", "top_bar_right_show_time"
  ]);

  constructor() {
    super();
    this._config = {};
  }

  setConfig(config) {
    this._config = { ...DEFAULTS, ...config };
  }

  _stripDefaults(config) {
    // Create a clean config object with only changed values
    const stripped = { type: config.type }; // Always keep type
    
    for (const [key, value] of Object.entries(config)) {
      if (key === 'type') continue; // Already added
      
      const defaultValue = DEFAULTS[key];
      
      // Skip if value matches default
      if (defaultValue === value) continue;
      
      // Handle deep equality for objects (like tap_action)
      if (typeof value === 'object' && value !== null && typeof defaultValue === 'object' && defaultValue !== null) {
        if (JSON.stringify(value) === JSON.stringify(defaultValue)) continue;
      }
      
      // Keep the value if it's different from default
      stripped[key] = value;
    }
    
    return stripped;
  }

  _renderEntityPicker(label, field, value, helper = "", domain = null) {
    return html`
      <ha-selector
        .hass=${this.hass}
        .selector=${{ entity: { domain } }}
        .value=${value || ""}
        .label=${label}
        .helper=${helper}
        @value-changed=${(ev) => this._changed(ev, field)}
      ></ha-selector>
    `;
  }

  _renderNavigationPicker(label, field, value, helper = "") {
    return html`
      <ha-selector
        .hass=${this.hass}
        .selector=${{ navigation: {} }}
        .value=${value || ""}
        .label=${label}
        .helper=${helper}
        @value-changed=${(ev) => this._changed(ev, field)}
      ></ha-selector>
    `;
  }

  _renderIconPicker(label, field, value, helper = "") {
    return html`
      <ha-selector
        .hass=${this.hass}
        .selector=${{ icon: {} }}
        .value=${value || ""}
        .label=${label}
        .helper=${helper}
        @value-changed=${(ev) => this._changed(ev, field)}
      ></ha-selector>
    `;
  }

  _val(ev) {
    return ev.detail?.value ?? ev.target?.value;
  }

  _handleCustomCardChange(ev, slot) {
    ev.stopPropagation();
    if (!this._config) return;
    const newCardConfig = ev.detail.config;
    const field = `top_bar_${slot}_card`;
    this._config = { ...this._config, [field]: newCardConfig };
    const strippedConfig = this._stripDefaults(this._config);
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: strippedConfig } }));
  }

  _handleBgSizeSelect(ev) {
    ev.stopPropagation();
    // Use proper value extraction like other handlers - check detail.value first, then target.value
    const val = ev.detail?.value ?? ev.target?.value;
    if (!val) return;
    
    // If selecting "custom", we need to ensure the config has a valid value to start with if it was currently a preset.
    // If it was already custom (e.g. 150%), we keep it. 
    // If switching from "cover" to "custom", we default to "100%" or similar to prep the input.
    if (val === "custom") {
       const current = this._config.background_size || "cover";
       if (BG_SIZE_PRESETS.includes(current)) {
           // Reset to a safe custom default so input is not empty/confusing
           this._config = { ...this._config, background_size: "100%" };
           const strippedConfig = this._stripDefaults(this._config);
           this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: strippedConfig } }));
       }
       // Force re-render to show the custom input field
       this.requestUpdate();
    } else {
       // Selected a preset
       this._config = { ...this._config, background_size: val };
       const strippedConfig = this._stripDefaults(this._config);
       this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: strippedConfig } }));
    }
  }

  _changed(ev, explicitField = null) {
    ev.stopPropagation();
    const field = explicitField || ev.target?.dataset?.field;
    if (!field || !this._config) return;

    let value = this._val(ev);

    // Card border radius: allow users to enter just a number (stored as number, rendered as px)
    // while still allowing any valid CSS value (e.g., 12px, 0, 50%, var(--x)).
    if (field === "card_border_radius") {
      const s = (value ?? "").toString().trim();
      if (s === "") value = "";
      else if (/^\d+$/.test(s)) value = Number(s);
      else value = s;
    }

    // Use pre-computed static sets for field type checking
    const { _numericFields, _nullableNumericFields, _booleanFields } = HkiHeaderCardEditor;

    if (_nullableNumericFields.has(field)) {
      value = value === "" || value == null ? null : toNum(value, null);
      if (value === null || !Number.isFinite(value)) value = null;
    } else if (_numericFields.has(field)) {
      const n = Number(value);
      if (!Number.isFinite(n)) return;
      value = n;
    }

    if (_booleanFields.has(field)) value = !!(ev.target?.checked ?? value);

    let next;

    if (field.includes(".")) {
      const [rootField, subField] = field.split(".");
      const currentValue = this._config[rootField] || {};
      next = { ...this._config, [rootField]: { ...currentValue, [subField]: value } };

      if (subField === "action" && value === "perform-action") {
        next[rootField] = { ...next[rootField], perform_action: next[rootField].perform_action ?? "" };
      } else if (subField === "action" && value === "call-service") {
        // Legacy support for old call-service action
        next[rootField] = { ...next[rootField], service: next[rootField].service ?? "", service_data: next[rootField].service_data ?? "entity_id: \n" };
      }
    } else {
      next = { ...this._config, [field]: value };
    }

    if (field === "badges_fixed") {
      const currentOffset = this._config.badges_offset;
      if (currentOffset === 48 || currentOffset === 100 || currentOffset === 0) {
        next.badges_offset = value ? 48 : 100;
      }
    }

    this._config = next;
    const strippedConfig = this._stripDefaults(next);
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: strippedConfig } }));
  }

  _renderTemplateEditor(label, field, options = {}) {
    const value = this._config?.[field] ?? "";
    return html`
      <ha-yaml-editor
        .hass=${this.hass}
        .label=${label}
        .value=${value}
        @value-changed=${(ev) => {
          ev.stopPropagation();
          const newValue = ev.detail?.value;
          if (newValue !== value) {
            this._config = { ...this._config, [field]: newValue || undefined };
            this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
          }
        }}
        @click=${(e) => e.stopPropagation()}
      ></ha-yaml-editor>
    `;
  }

  // Removed - using ha-yaml-editor inline instead

  _getSlotLabel(type) {
    const labels = {
      none: "Empty",
      spacer: "Spacer",
      weather: "Weather",
      datetime: "Date/Time",
      custom: "Notifications",
      button: "Button"
    };
    return labels[type] || "Empty";
  }

  _renderSlotEditor(slotName) {
    const prefix = `top_bar_${slotName}_`;
    const type = this._config[`top_bar_${slotName}`] || "none";
    const useGlobal = this._config[prefix + "use_global"] !== false;
    
    return html`
      <ha-select label="Content Type" .value=${type} .fixedMenuPosition=${true} data-field="top_bar_${slotName}" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
        <mwc-list-item value="none">None</mwc-list-item>
        <mwc-list-item value="spacer">Spacer</mwc-list-item>
        <mwc-list-item value="weather">Weather</mwc-list-item>
        <mwc-list-item value="datetime">Date/Time</mwc-list-item>
        <mwc-list-item value="custom">Notifications</mwc-list-item>
        <mwc-list-item value="button">Button</mwc-list-item>
      </ha-select>
      
      ${type !== "none" && type !== "spacer" ? html`
        <div class="section" style="margin-top: 12px;">Position Offset</div>
        <div class="inline-fields-2">
          <ha-textfield label="X offset (px)" type="number" .value=${String(this._config[prefix + "offset_x"] || 0)} data-field="${prefix}offset_x" @input=${this._changed}></ha-textfield>
          <ha-textfield label="Y offset (px)" type="number" .value=${String(this._config[prefix + "offset_y"] || 0)} data-field="${prefix}offset_y" @input=${this._changed}></ha-textfield>
        </div>
        <div class="inline-fields-2">
          <ha-textfield label="Mobile X offset (px)" type="number" .value=${this._config[prefix + "offset_x_mobile"] == null ? "" : String(this._config[prefix + "offset_x_mobile"])} data-field="${prefix}offset_x_mobile" @input=${this._changed}></ha-textfield>
          <ha-textfield label="Mobile Y offset (px)" type="number" .value=${this._config[prefix + "offset_y_mobile"] == null ? "" : String(this._config[prefix + "offset_y_mobile"])} data-field="${prefix}offset_y_mobile" @input=${this._changed}></ha-textfield>
        </div>
        
        <div class="switch-row" style="margin-top: 8px;">
            <ha-switch .checked=${!!this._config[prefix + "overflow"]} data-field="${prefix}overflow" @change=${this._changed}></ha-switch>
            <span>Allow Overflow (content bleeds out)</span>
        </div>
      ` : ''}

      ${type === "weather" ? html`
        <div class="section" style="margin-top: 12px;">Weather Settings</div>
        ${this._renderEntityPicker("Weather entity", prefix + "weather_entity", this._config[prefix + "weather_entity"] || this._config.weather_entity || "", "Select a weather entity", "weather")}
        
        <div class="inline-fields-3" style="margin-top: 8px;">
            <div class="switch-row"><ha-switch .checked=${this._config[prefix + "show_icon"] !== false} data-field="${prefix}show_icon" @change=${this._changed}></ha-switch><span>Icon</span></div>
            <div class="switch-row"><ha-switch .checked=${this._config[prefix + "show_condition"] !== false} data-field="${prefix}show_condition" @change=${this._changed}></ha-switch><span>Condition</span></div>
            <div class="switch-row"><ha-switch .checked=${this._config[prefix + "show_temperature"] !== false} data-field="${prefix}show_temperature" @change=${this._changed}></ha-switch><span>Temp</span></div>
            <div class="switch-row"><ha-switch .checked=${!!this._config[prefix + "show_humidity"]} data-field="${prefix}show_humidity" @change=${this._changed}></ha-switch><span>Humidity</span></div>
            <div class="switch-row"><ha-switch .checked=${!!this._config[prefix + "show_wind"]} data-field="${prefix}show_wind" @change=${this._changed}></ha-switch><span>Wind</span></div>
            <div class="switch-row"><ha-switch .checked=${!!this._config[prefix + "show_pressure"]} data-field="${prefix}show_pressure" @change=${this._changed}></ha-switch><span>Pressure</span></div>
        </div>
        
        <ha-textfield label="Icon pack path (SVG)" helper="Path to folder (e.g., /local/icons/weather)" .value=${this._config[prefix + "icon_pack_path"] || ""} data-field="${prefix}icon_pack_path" @input=${this._changed}></ha-textfield>

        <div class="switch-row" style="margin-top: 8px;">
            <ha-switch .checked=${this._config[prefix + "weather_colored_icons"] !== false} data-field="${prefix}weather_colored_icons" @change=${this._changed}></ha-switch>
            <span>Colored icons</span>
        </div>
        
        <div class="inline-fields-2">
          <ha-select label="Icon color mode" .value=${this._config[prefix + "weather_icon_color_mode"] || "state"} .fixedMenuPosition=${true} data-field="${prefix}weather_icon_color_mode" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
            <mwc-list-item value="state">By condition</mwc-list-item>
            <mwc-list-item value="custom">Custom</mwc-list-item>
            <mwc-list-item value="inherit">Inherit</mwc-list-item>
          </ha-select>
          <ha-select label="Icon animation" .value=${this._config[prefix + "animate_icon"] || "none"} .fixedMenuPosition=${true} data-field="${prefix}animate_icon" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
            <mwc-list-item value="none">None</mwc-list-item>
            <mwc-list-item value="float">Float</mwc-list-item>
            <mwc-list-item value="pulse">Pulse</mwc-list-item>
            <mwc-list-item value="spin">Spin</mwc-list-item>
          </ha-select>
        </div>
        ${this._config[prefix + "weather_icon_color_mode"] === "custom" ? html`
            <ha-textfield label="Custom icon color (CSS)" .value=${this._config[prefix + "weather_icon_color"] || ""} data-field="${prefix}weather_icon_color" @input=${this._changed}></ha-textfield>
        ` : ""}
      ` : ''}

      ${type === "datetime" ? html`
        <div class="section" style="margin-top: 12px;">Date/Time Settings</div>
        <div class="inline-fields-3">
          <div class="switch-row"><ha-switch .checked=${this._config[prefix + "show_day"] !== false} data-field="${prefix}show_day" @change=${this._changed}></ha-switch><span>Day</span></div>
          <div class="switch-row"><ha-switch .checked=${this._config[prefix + "show_date"] !== false} data-field="${prefix}show_date" @change=${this._changed}></ha-switch><span>Date</span></div>
          <div class="switch-row"><ha-switch .checked=${this._config[prefix + "show_time"] !== false} data-field="${prefix}show_time" @change=${this._changed}></ha-switch><span>Time</span></div>
        </div>
        
        <ha-textfield label="Time format" helper="HH:mm (24h) or h:mm A (12h)" .value=${this._config[prefix + "time_format"] || "HH:mm"} data-field="${prefix}time_format" @input=${this._changed}></ha-textfield>
        <ha-textfield label="Date format" helper="D MMM, DD/MM/YYYY, MMMM D, etc." .value=${this._config[prefix + "date_format"] || "D MMM"} data-field="${prefix}date_format" @input=${this._changed}></ha-textfield>
        <ha-textfield label="Separator" .value=${this._config[prefix + "separator"] || " • "} data-field="${prefix}separator" @input=${this._changed}></ha-textfield>
        
        ${this._renderIconPicker("Icon", prefix + "icon", this._config[prefix + "icon"] || "", "Optional icon")}
        <ha-select label="Icon animation" .value=${this._config[prefix + "animate_icon"] || "none"} .fixedMenuPosition=${true} data-field="${prefix}animate_icon" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
            <mwc-list-item value="none">None</mwc-list-item>
            <mwc-list-item value="float">Float</mwc-list-item>
            <mwc-list-item value="pulse">Pulse</mwc-list-item>
            <mwc-list-item value="spin">Spin</mwc-list-item>
        </ha-select>
      ` : ''}
      
      ${type === "button" ? html`
        <div class="section" style="margin-top: 12px;">Button Settings</div>
        <ha-icon-picker label="Icon" .value=${this._config[prefix + "icon"] || "mdi:gesture-tap"} data-field="${prefix}icon" @value-changed=${(e) => this._changed({target: {value: e.detail.value, dataset: {field: prefix + "icon"}}})}></ha-icon-picker>
        <ha-textfield label="Label (optional)" .value=${this._config[prefix + "label"] || ""} data-field="${prefix}label" @input=${this._changed}></ha-textfield>
      ` : ''}
      
      ${type === "custom" ? html`
          <ha-alert alert-type="warning" style="margin-bottom: 8px;">
            This requires the <b>hki-notify</b> integration and the <b>custom:hki-notification-card</b> resource.
          </ha-alert>
          <p style="opacity: 0.7; font-size: 0.9em; margin-top: 8px;">Enable "Use Header Styling" in the notification card below to inherit styling from the Global Styling (Defaults) settings.</p>
          <div class="card-config">
            <hui-card-element-editor
              .hass=${this.hass}
              .lovelace=${this.lovelace}
              .value=${{ 
                type: "custom:hki-notification-card", 
                use_header_styling: true, 
                show_background: false,
                show_empty: true,
                ...(this._config[`top_bar_${slotName}_card`] || {})
              }}
              @config-changed=${(ev) => this._handleCustomCardChange(ev, slotName)}
            ></hui-card-element-editor>
          </div>
      ` : ''}
      
      ${type === "spacer" ? html`
        <div class="section" style="margin-top: 12px;">Spacer Tap Action</div>
        ${this._renderSlotActionEditor(prefix + "tap_action")}
      ` : ''}
      
      ${(type === "weather" || type === "datetime" || type === "button") ? html`
        <div class="section" style="margin-top: 12px;">Tap Action</div>
        ${this._renderSlotActionEditor(prefix + "tap_action")}
      ` : ''}
      
      ${type !== "none" && type !== "custom" && type !== "spacer" ? html`
        <div class="section" style="margin-top: 12px;">Styling</div>
        <div class="switch-row">
          <ha-switch .checked=${useGlobal} data-field="${prefix}use_global" @change=${this._changed}></ha-switch>
          <span>Use global styling</span>
        </div>
        
        ${!useGlobal ? html`
          <div class="inline-fields-2">
            <ha-textfield label="Font Size (px)" type="number" .value=${String(this._config[prefix + "size_px"] ?? "")} data-field="${prefix}size_px" @input=${this._changed}></ha-textfield>
            <ha-select label="Font Weight" .value=${this._config[prefix + "weight"] || ""} .fixedMenuPosition=${true} data-field="${prefix}weight" @selected=${this._changed} @closed=${this._changed}>
              <mwc-list-item value="">Use Global</mwc-list-item>
              ${["light", "regular", "medium", "semibold", "bold", "extrabold"].map(w => html`<mwc-list-item .value=${w}>${w.charAt(0).toUpperCase() + w.slice(1)}</mwc-list-item>`)}
            </ha-select>
          </div>
          <ha-textfield label="Text Color" .value=${this._config[prefix + "color"] || ""} data-field="${prefix}color" @input=${this._changed}></ha-textfield>
          
          <div class="switch-row">
            <ha-switch .checked=${this._config[prefix + "pill"] === true} data-field="${prefix}pill" @change=${this._changed}></ha-switch>
            <span>Enable Pill Style</span>
          </div>
          ${this._config[prefix + "pill"] ? html`
            <ha-textfield label="Pill Background" .value=${this._config[prefix + "pill_background"] || ""} data-field="${prefix}pill_background" @input=${this._changed}></ha-textfield>
            <div class="inline-fields-2">
              <ha-textfield label="Padding X" type="number" .value=${String(this._config[prefix + "pill_padding_x"] ?? "")} data-field="${prefix}pill_padding_x" @input=${this._changed}></ha-textfield>
              <ha-textfield label="Padding Y" type="number" .value=${String(this._config[prefix + "pill_padding_y"] ?? "")} data-field="${prefix}pill_padding_y" @input=${this._changed}></ha-textfield>
            </div>
            <div class="inline-fields-2">
              <ha-textfield label="Border Radius" type="number" .value=${String(this._config[prefix + "pill_radius"] ?? "")} data-field="${prefix}pill_radius" @input=${this._changed}></ha-textfield>
              <ha-textfield label="Blur" type="number" .value=${String(this._config[prefix + "pill_blur"] ?? "")} data-field="${prefix}pill_blur" @input=${this._changed}></ha-textfield>
            </div>
          ` : ''}
        ` : ''}
      ` : ''}
    `;
  }

  _renderSlotActionEditor(field) {
    const action = this._config?.[field] || { action: "none" };
    const actionType = action.action || "none";
    
    return html`
      <ha-select label="Action" .value=${actionType} .fixedMenuPosition=${true} data-field="${field}.action" @selected=${this._changed} @closed=${this._changed}>
        <mwc-list-item value="none">None</mwc-list-item>
        <mwc-list-item value="navigate">Navigate</mwc-list-item>
        <mwc-list-item value="back">Back</mwc-list-item>
        <mwc-list-item value="menu">Toggle Menu</mwc-list-item>
        <mwc-list-item value="url">Open URL</mwc-list-item>
        <mwc-list-item value="more-info">More Info</mwc-list-item>
        <mwc-list-item value="toggle">Toggle Entity</mwc-list-item>
        <mwc-list-item value="perform-action">Perform Action</mwc-list-item>
      </ha-select>
      ${actionType === "navigate" ? html`
        <ha-textfield label="Navigation path" .value=${action.navigation_path || ""} data-field="${field}.navigation_path" @input=${this._changed}></ha-textfield>
      ` : ''}
      ${actionType === "url" ? html`
        <ha-textfield label="URL" .value=${action.url_path || ""} data-field="${field}.url_path" @input=${this._changed}></ha-textfield>
      ` : ''}
      ${actionType === "more-info" || actionType === "toggle" ? html`
        <ha-entity-picker .hass=${this.hass} .value=${action.entity || ""} @value-changed=${(e) => this._changed(e, field + ".entity")}></ha-entity-picker>
      ` : ''}
      ${actionType === "perform-action" ? html`
        <ha-textfield
          label="Service (e.g., light.turn_on)"
          .value=${action.perform_action || ""}
          data-field="${field}.perform_action"
          @input=${this._changed}
          placeholder="light.turn_on"
        ></ha-textfield>
        
        ${action.perform_action ? html`
          <ha-selector
            .hass=${this.hass}
            .selector=${{ target: {} }}
            .label=${"Target (optional)"}
            .value=${action.target || null}
            @value-changed=${(ev) => {
              ev.stopPropagation();
              const target = ev.detail?.value;
              const currentTarget = action.target;
              if (JSON.stringify(currentTarget) !== JSON.stringify(target)) {
                const updated = { ...action };
                if (target && Object.keys(target).length > 0) {
                  updated.target = target;
                } else {
                  delete updated.target;
                }
                this._config = { ...this._config, [field]: updated };
                this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
              }
            }}
            @click=${(e) => e.stopPropagation()}
          ></ha-selector>
          
          <ha-yaml-editor
            .hass=${this.hass}
            .label=${"Service Data (optional, YAML)"}
            .value=${action.data || null}
            @value-changed=${(ev) => {
              ev.stopPropagation();
              const data = ev.detail?.value;
              const currentData = action.data;
              if (JSON.stringify(currentData) !== JSON.stringify(data)) {
                const updated = { ...action };
                if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                  updated.data = data;
                } else {
                  delete updated.data;
                }
                this._config = { ...this._config, [field]: updated };
                this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
              }
            }}
            @click=${(e) => e.stopPropagation()}
          ></ha-yaml-editor>
        ` : ''}
      ` : ''}
    `;
  }

  render() {
    if (!this._config) return html``;

    const showCustomFont = this._config.font_family === "custom";

    // --- LOGIC FOR BACKGROUND SIZE HYBRID SELECTOR ---
    const bgSize = this._config.background_size || "cover";
    const isCustomBgSize = !BG_SIZE_PRESETS.includes(bgSize);
    const bgSizeSelectValue = isCustomBgSize ? "custom" : bgSize;

    return html`
      <div class="card-config">
        <div class="disclaimer">
          <ha-alert alert-type="info" title="Documentation">
            This card should be placed in the header section! Please read the documentation at 
            <a href="https://github.com/jimz011/hki-header-card" target="_blank" rel="noopener noreferrer">github.com/jimz011/hki-header-card</a>
            to set up this card. <br><br>
            This card may contain bugs. Use at your own risk!
          </ha-alert>
        </div>

        <details class="box-section" open>
          <summary>Entity</summary>
          <div class="box-content">
            ${this._renderTemplateEditor("Title (Accepts jinja2 templates)", "title")}
            ${this._renderTemplateEditor("Subtitle (Accepts jinja2 templates)", "subtitle")}

            <ha-select label="Text alignment" .value=${this._config.text_align} .fixedMenuPosition=${true} data-field="text_align" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
              <mwc-list-item value="left">Left</mwc-list-item>
              <mwc-list-item value="center">Center</mwc-list-item>
              <mwc-list-item value="right">Right</mwc-list-item>
            </ha-select>
          </div>
        </details>

        <details class="box-section">
          <summary>Layout & Visibility</summary>
          <div class="box-content">
            <div class="section">Title position</div>
            <div class="inline-fields-2">
              <ha-textfield label="Title horizontal offset (px)" type="number" .value=${String(this._config.title_offset_x)} data-field="title_offset_x" @input=${this._changed}></ha-textfield>
              <ha-textfield label="Title vertical offset (px)" type="number" .value=${String(this._config.title_offset_y)} data-field="title_offset_y" @input=${this._changed}></ha-textfield>
            </div>

            <div class="section">Subtitle position</div>
            <div class="inline-fields-2">
              <ha-textfield label="Subtitle horizontal offset (px)" type="number" .value=${String(this._config.subtitle_offset_x)} data-field="subtitle_offset_x" @input=${this._changed}></ha-textfield>
              <ha-textfield label="Subtitle vertical offset (px)" type="number" .value=${String(this._config.subtitle_offset_y)} data-field="subtitle_offset_y" @input=${this._changed}></ha-textfield>
            </div>

            <div class="inline-fields-2">
              <ha-textfield label="Min height (px)" type="number" .value=${String(this._config.min_height)} data-field="min_height" @input=${this._changed}></ha-textfield>
              <ha-textfield label="Max height (px)" type="number" .value=${String(this._config.max_height)} data-field="max_height" @input=${this._changed}></ha-textfield>
            </div>
            
            <ha-textfield label="Mobile Breakpoint (px)" type="number" .value=${String(this._config.mobile_breakpoint || 768)} data-field="mobile_breakpoint" @input=${this._changed}></ha-textfield>
          </div>
        </details>

        <details class="box-section">
          <summary>Header Styling</summary>
          <div class="box-content">
            <div class="section">Text Colors</div>
            <div class="inline-fields-2">
              <ha-textfield label="Title color" helper="Any CSS color (hex, rgb, rgba, etc.)" placeholder="inherit" .value=${this._config.title_color || ""} data-field="title_color" @input=${this._changed}></ha-textfield>
              <ha-textfield label="Subtitle color" helper="Any CSS color (hex, rgb, rgba, etc.)" placeholder="inherit" .value=${this._config.subtitle_color || ""} data-field="subtitle_color" @input=${this._changed}></ha-textfield>
            </div>

            <div class="section">Background</div>
            <ha-textfield label="Background" helper="CSS color (hex, rgb, rgba, color name), gradient, or image URL (/local/image.jpg)" .value=${this._config.background} data-field="background" @input=${this._changed}></ha-textfield>

            <div class="inline-fields-2">
                <ha-select label="Background position" .value=${this._config.background_position} .fixedMenuPosition=${true} data-field="background_position" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
                  <mwc-list-item value="top">Top</mwc-list-item>
                  <mwc-list-item value="center">Center</mwc-list-item>
                  <mwc-list-item value="bottom">Bottom</mwc-list-item>
                  <mwc-list-item value="left">Left</mwc-list-item>
                  <mwc-list-item value="right">Right</mwc-list-item>
                </ha-select>

                <ha-select label="Background repeat" .value=${this._config.background_repeat} .fixedMenuPosition=${true} data-field="background_repeat" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
                  <mwc-list-item value="no-repeat">No repeat</mwc-list-item>
                  <mwc-list-item value="repeat">Repeat</mwc-list-item>
                  <mwc-list-item value="repeat-x">Repeat horizontally</mwc-list-item>
                  <mwc-list-item value="repeat-y">Repeat vertically</mwc-list-item>
                </ha-select>
            </div>

            <div class="inline-fields-2">
                <ha-select 
                    label="Background size" 
                    .value=${bgSizeSelectValue} 
                    .fixedMenuPosition=${true} 
                    @selected=${this._handleBgSizeSelect} 
                    @closed=${(e) => e.stopPropagation()}
                >
                  <mwc-list-item value="cover">Cover</mwc-list-item>
                  <mwc-list-item value="contain">Contain</mwc-list-item>
                  <mwc-list-item value="auto">Auto</mwc-list-item>
                  <mwc-list-item value="custom">Custom</mwc-list-item>
                </ha-select>
                
                <ha-select label="Background blend mode" .value=${this._config.background_blend_mode || "normal"} .fixedMenuPosition=${true} data-field="background_blend_mode" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
                  <mwc-list-item value="normal">Normal</mwc-list-item>
                  <mwc-list-item value="multiply">Multiply</mwc-list-item>
                  <mwc-list-item value="screen">Screen</mwc-list-item>
                  <mwc-list-item value="overlay">Overlay</mwc-list-item>
                  <mwc-list-item value="darken">Darken</mwc-list-item>
                  <mwc-list-item value="lighten">Lighten</mwc-list-item>
                  <mwc-list-item value="color-dodge">Color Dodge</mwc-list-item>
                  <mwc-list-item value="soft-light">Soft Light</mwc-list-item>
                  <mwc-list-item value="difference">Difference</mwc-list-item>
                </ha-select>
            </div>
            
            ${isCustomBgSize ? html`
                <ha-textfield 
                    label="Custom Size (e.g. 150%)" 
                    .value=${this._config.background_size} 
                    data-field="background_size" 
                    @input=${this._changed}
                ></ha-textfield>
            ` : ""}

            <ha-textfield label="Background blend color" helper="Color to blend with background image using blend mode above" .value=${this._config.background_color} data-field="background_color" @input=${this._changed}></ha-textfield>

            <div class="section">Gradient Overlay</div>
            <div class="switch-row">
              <ha-formfield label="Enable gradient overlay">
                <ha-switch .checked=${this._config.blend_enabled !== false} data-field="blend_enabled" @change=${this._changed}></ha-switch>
              </ha-formfield>
            </div>
            ${this._config.blend_enabled !== false ? html`
              <ha-textfield label="Blend color" helper="Any CSS color" .value=${this._config.blend_color} data-field="blend_color" @input=${this._changed}></ha-textfield>
              <ha-textfield label="Blend stop (%)" type="number" .value=${String(this._config.blend_stop)} data-field="blend_stop" @input=${this._changed}></ha-textfield>
            ` : ""}

            <div class="section">Border & Shadow</div>
            <ha-textfield label="Border Radius" helper="Enter a number (px) like 12, or any CSS value (12px, 0, 50%, var(--radius))" .value=${(this._config.card_border_radius ?? "").toString()} data-field="card_border_radius" @input=${this._changed}></ha-textfield>
            <ha-textfield label="Box Shadow" helper="e.g. 0 4px 12px rgba(0,0,0,0.3)" .value=${this._config.card_box_shadow || ""} data-field="card_box_shadow" @input=${this._changed}></ha-textfield>
            <div class="inline-fields-3">
              <ha-select label="Border Style" .value=${this._config.card_border_style || "none"} .fixedMenuPosition=${true} data-field="card_border_style" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
                <mwc-list-item value="none">None</mwc-list-item>
                <mwc-list-item value="solid">Solid</mwc-list-item>
                <mwc-list-item value="dashed">Dashed</mwc-list-item>
                <mwc-list-item value="dotted">Dotted</mwc-list-item>
                <mwc-list-item value="double">Double</mwc-list-item>
                <mwc-list-item value="groove">Groove</mwc-list-item>
                <mwc-list-item value="ridge">Ridge</mwc-list-item>
                <mwc-list-item value="inset">Inset</mwc-list-item>
                <mwc-list-item value="outset">Outset</mwc-list-item>
              </ha-select>
              <ha-textfield label="Border Width (px)" type="number" .value=${String(this._config.card_border_width || 0)} data-field="card_border_width" @input=${this._changed}></ha-textfield>
              <ha-textfield label="Border Color" .value=${this._config.card_border_color || ""} data-field="card_border_color" @input=${this._changed}></ha-textfield>
            </div>
          </div>
        </details>

        <details class="box-section">
          <summary>Typography</summary>
          <div class="box-content">
            <div class="section">Font Settings</div>
            <ha-select label="Font family" .value=${this._config.font_family} .fixedMenuPosition=${true} data-field="font_family" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
              <mwc-list-item value="inherit">Inherit</mwc-list-item>
              <mwc-list-item value="system">System</mwc-list-item>
              <mwc-list-item value="roboto">Roboto</mwc-list-item>
              <mwc-list-item value="inter">Inter</mwc-list-item>
              <mwc-list-item value="arial">Arial</mwc-list-item>
              <mwc-list-item value="georgia">Georgia</mwc-list-item>
              <mwc-list-item value="mono">Monospace</mwc-list-item>
              <mwc-list-item value="custom">Custom…</mwc-list-item>
            </ha-select>

            ${showCustomFont ? html`<ha-textfield label="Custom font-family (CSS)" .value=${this._config.font_family_custom} data-field="font_family_custom" @input=${this._changed}></ha-textfield>` : ""}

            <ha-select label="Font style" .value=${this._config.font_style} .fixedMenuPosition=${true} data-field="font_style" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
              <mwc-list-item value="normal">Normal</mwc-list-item>
              <mwc-list-item value="italic">Italic</mwc-list-item>
            </ha-select>

            <div class="inline-fields-2">
              <ha-textfield label="Title size (px)" type="number" .value=${String(this._config.title_size_px)} data-field="title_size_px" @input=${this._changed}></ha-textfield>
              <ha-textfield label="Subtitle size (px)" type="number" .value=${String(this._config.subtitle_size_px)} data-field="subtitle_size_px" @input=${this._changed}></ha-textfield>
            </div>

            <div class="inline-fields-2">
              <ha-select label="Title weight" .value=${this._config.title_weight} .fixedMenuPosition=${true} data-field="title_weight" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
                <mwc-list-item value="light">Light</mwc-list-item>
                <mwc-list-item value="regular">Regular</mwc-list-item>
                <mwc-list-item value="medium">Medium</mwc-list-item>
                <mwc-list-item value="semibold">Semi-bold</mwc-list-item>
                <mwc-list-item value="bold">Bold</mwc-list-item>
                <mwc-list-item value="black">Black</mwc-list-item>
              </ha-select>

              <ha-select label="Subtitle weight" .value=${this._config.subtitle_weight} .fixedMenuPosition=${true} data-field="subtitle_weight" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
                <mwc-list-item value="light">Light</mwc-list-item>
                <mwc-list-item value="regular">Regular</mwc-list-item>
                <mwc-list-item value="medium">Medium</mwc-list-item>
                <mwc-list-item value="semibold">Semi-bold</mwc-list-item>
                <mwc-list-item value="bold">Bold</mwc-list-item>
                <mwc-list-item value="black">Black</mwc-list-item>
              </ha-select>
            </div>
          </div>
        </details>
        <details class="box-section">
          <summary>Top Bar</summary>
          <div class="box-content">
            <div class="switch-row">
                <ha-switch .checked=${this._config.top_bar_enabled !== false} data-field="top_bar_enabled" @change=${this._changed}></ha-switch>
                <span>Enable top bar</span>
            </div>

            ${this._config.top_bar_enabled !== false ? html`
                <div class="inline-fields-2">
                    <ha-textfield label="Bar vertical offset (px)" type="number" .value=${String(this._config.top_bar_offset_y ?? 10)} data-field="top_bar_offset_y" @input=${this._changed}></ha-textfield>
                    <ha-textfield label="Bar padding X (px)" type="number" .value=${String(this._config.top_bar_padding_x ?? 5)} data-field="top_bar_padding_x" @input=${this._changed}></ha-textfield>
                </div>
                
                <details class="box-section">
                  <summary>Global Styling (Defaults)</summary>
                  <div class="box-content">
                    <div class="inline-fields-2">
                      <ha-textfield label="Font Size (px)" type="number" .value=${String(this._config.info_size_px || 12)} data-field="info_size_px" @input=${this._changed}></ha-textfield>
                      <ha-select label="Font Weight" .value=${this._config.info_weight || "medium"} .fixedMenuPosition=${true} data-field="info_weight" @selected=${this._changed} @closed=${this._changed}>
                        ${["light", "regular", "medium", "semibold", "bold", "extrabold"].map(w => html`<mwc-list-item .value=${w}>${w.charAt(0).toUpperCase() + w.slice(1)}</mwc-list-item>`)}
                      </ha-select>
                    </div>
                    <ha-textfield label="Text Color" .value=${this._config.info_color || ""} data-field="info_color" @input=${this._changed}></ha-textfield>
                    
                    <div class="switch-row">
                      <ha-switch .checked=${!!this._config.info_pill} data-field="info_pill" @change=${this._changed}></ha-switch>
                      <span>Enable Pill Style</span>
                    </div>
                    ${this._config.info_pill ? html`
                      <ha-textfield label="Pill Background" .value=${this._config.info_pill_background || "rgba(0,0,0,0.25)"} data-field="info_pill_background" @input=${this._changed}></ha-textfield>
                      <div class="inline-fields-2">
                        <ha-textfield label="Padding X (px)" type="number" .value=${String(this._config.info_pill_padding_x ?? 10)} data-field="info_pill_padding_x" @input=${this._changed}></ha-textfield>
                        <ha-textfield label="Padding Y (px)" type="number" .value=${String(this._config.info_pill_padding_y ?? 6)} data-field="info_pill_padding_y" @input=${this._changed}></ha-textfield>
                      </div>
                      <div class="inline-fields-2">
                        <ha-textfield label="Border Radius (px)" type="number" .value=${String(this._config.info_pill_radius ?? 999)} data-field="info_pill_radius" @input=${this._changed}></ha-textfield>
                        <ha-textfield label="Blur (px)" type="number" .value=${String(this._config.info_pill_blur ?? 0)} data-field="info_pill_blur" @input=${this._changed}></ha-textfield>
                      </div>
                      <div class="inline-fields-3">
                        <ha-select label="Border Style" .value=${this._config.info_pill_border_style || "none"} .fixedMenuPosition=${true} data-field="info_pill_border_style" @selected=${this._changed} @closed=${this._changed}>
                          <mwc-list-item value="none">None</mwc-list-item>
                          <mwc-list-item value="solid">Solid</mwc-list-item>
                          <mwc-list-item value="dashed">Dashed</mwc-list-item>
                          <mwc-list-item value="dotted">Dotted</mwc-list-item>
                        </ha-select>
                        <ha-textfield label="Border Width" type="number" .value=${String(this._config.info_pill_border_width ?? 0)} data-field="info_pill_border_width" @input=${this._changed}></ha-textfield>
                        <ha-textfield label="Border Color" .value=${this._config.info_pill_border_color || "rgba(255,255,255,0.1)"} data-field="info_pill_border_color" @input=${this._changed}></ha-textfield>
                      </div>
                    ` : ''}
                  </div>
                </details>

                <details class="box-section">
                  <summary>Left Slot: ${this._getSlotLabel(this._config.top_bar_left)}</summary>
                  <div class="box-content">
                    ${this._renderSlotEditor('left')}
                  </div>
                </details>

                <details class="box-section">
                  <summary>Center Slot: ${this._getSlotLabel(this._config.top_bar_center)}</summary>
                  <div class="box-content">
                    ${this._renderSlotEditor('center')}
                  </div>
                </details>

                <details class="box-section">
                  <summary>Right Slot: ${this._getSlotLabel(this._config.top_bar_right)}</summary>
                  <div class="box-content">
                    ${this._renderSlotEditor('right')}
                  </div>
                </details>
            ` : ''}
          </div>
        </details>

        <details class="box-section">
          <summary>Fixed Header</summary>
          <div class="box-content">
            <div class="section">Positioning</div>
            <div class="switch-row">
              <ha-formfield label="Keep header fixed to top">
                <ha-switch .checked=${!!this._config.fixed} data-field="fixed" @change=${this._changed}></ha-switch>
              </ha-formfield>
            </div>

            ${this._config.fixed ? html`<ha-textfield label="Fixed top offset (px)" type="number" .value=${String(this._config.fixed_top)} data-field="fixed_top" @input=${this._changed}></ha-textfield>` : ""}
          </div>
        </details>

        <details class="box-section">
          <summary>Badge Positioning</summary>
          <div class="box-content">
            <div class="section">Badge Settings</div>
            
            <ha-alert alert-type="warning" class="badge-warning">
              For badge positioning to work, this card must be placed in the <strong>header slot</strong> of your view/section. Otherwise, these badge settings will have no effect. <br><br>
              NOTE: This card does not manage or display any badges itself. Badges must be added separately using Home Assistant's native badge support (e.g. via the "badges" option in your Lovelace view/section configuration).
            </ha-alert>
            
            <div class="switch-row">
              <ha-formfield label="Pin badges in place (content scrolls beneath)">
                <ha-switch .checked=${!!this._config.badges_fixed} data-field="badges_fixed" @change=${this._changed}></ha-switch>
              </ha-formfield>
            </div>
            
            ${this._config.badges_fixed
              ? html`<ha-textfield label="Badges vertical offset when pinned (px)" helper="Negative values pull badges up (into header), positive values push down" type="number" .value=${String(this._config.badges_offset_pinned)} data-field="badges_offset_pinned" @input=${this._changed}></ha-textfield>`
              : html`<ha-textfield label="Badges vertical offset when unpinned (px)" helper="Negative values pull badges up (into header), positive values push down" type="number" .value=${String(this._config.badges_offset_unpinned)} data-field="badges_offset_unpinned" @input=${this._changed}></ha-textfield>`}
            
            <ha-textfield label="Gap under badges (px)" helper="Space between badges and next content (auto-adjusts -48px when pinned, +48px in kiosk mode)" type="number" .value=${String(this._config.badges_gap)} data-field="badges_gap" @input=${this._changed}></ha-textfield>
          </div>
        </details>

      </div>
    `;
  }

  static get styles() {
    return css`
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 8px;
      }
      .disclaimer { margin-bottom: 8px; }
      .disclaimer ha-alert { margin-bottom: 0; }
      .disclaimer a { color: var(--primary-color); text-decoration: none; }
      .disclaimer a:hover { text-decoration: underline; }
      .badge-warning { margin-bottom: 12px; }
      .section { margin-top: 8px; font-weight: 600; }
      .switch-row { display: flex; align-items: center; gap: 12px; }
      .inline-fields-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
      .inline-fields-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
      ha-textfield, ha-select, ha-combo-box, ha-navigation-picker, ha-entity-picker, ha-selector, ha-service-picker, ha-yaml-editor { width: 100%; }
      
      /* Collapsible Sections */
      details.box-section {
        background: var(--secondary-background-color);
        border-radius: 4px;
        margin-bottom: 8px;
        overflow: hidden;
        border: 1px solid var(--divider-color);
      }
      summary {
        padding: 12px;
        cursor: pointer;
        font-weight: 600;
        background: var(--primary-background-color);
        border-bottom: 1px solid var(--divider-color);
        list-style: none; /* Hide default triangle in some browsers */
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      summary::-webkit-details-marker { display: none; } /* Hide Chrome marker */
      summary::after {
        content: '+'; 
        font-weight: bold;
        font-size: 1.2em;
      }
      details[open] summary::after {
        content: '-';
      }
      .box-content {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    `;
  }
}

customElements.define("hki-header-card-editor", HkiHeaderCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: CARD_NAME,
  name: "HKI Header Card",
  description: "Full Width Customizable Header.",
  preview: false,
  documentationURL: "https://github.com/jimz011/hki-header-card",
});
