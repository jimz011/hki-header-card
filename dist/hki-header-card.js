// HKI Header Card - Optimized & Updated with Native Visual Editor for Custom Cards

import { LitElement, html, css } from "https://unpkg.com/lit@2.8.0/index.js?module";

const CARD_NAME = "hki-header-card";

console.info(
  '%c HKI-HEADER-CARD %c v1.5.0 ',
  'color: white; background: #17a2b8; font-weight: bold;',
  'color: #17a2b8; background: white; font-weight: bold;'
);

const clamp = (n, min, max) => (Number.isFinite(n) ? Math.min(Math.max(n, min), max) : min);
const toNum = (v, fallback) => { const n = +v; return Number.isFinite(n) ? n : fallback; };

const WEIGHT_MAP = Object.freeze({
  light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, black: 900,
});

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
  background_position: "center",
  background_repeat: "no-repeat",
  background_size: "cover",
  height_vh: 35,
  min_height: 180,
  max_height: 220,
  blend_color: "var(--primary-background-color)",
  blend_stop: 95,
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

  // Layout Mode: "default" (legacy floating) or "top_bar" (slots)
  layout_mode: "default",

  // --- LEGACY (Floating) ---
  info_type: "none",
  info_card: { type: "custom:hki-notification-card" },
  info_align: "right",
  info_offset_x: 5,
  info_offset_y: 40,
  info_offset_x_mobile: null,
  info_offset_y_mobile: null,
  info_size_px: 12,
  info_weight: "medium",
  info_color: "",
  info_pill: false,
  info_pill_background: "rgba(0,0,0,0.25)",
  info_pill_padding_x: 10,
  info_pill_padding_y: 6,
  info_pill_radius: 999,
  info_pill_blur: 0,
  info_tap_action: { action: "none" },
  
  // --- TOP BAR SLOTS ---
  // Left Slot
  left_type: "none",
  left_entity: "", 
  left_content: { type: "custom:hki-notification-card" },
  left_offset_x: 0,
  left_offset_y: 0,
  left_tap_action: { action: "none" },
  
  // Center Slot
  center_type: "none",
  center_entity: "",
  center_content: { type: "custom:hki-notification-card" },
  center_offset_x: 0,
  center_offset_y: 0,
  center_tap_action: { action: "none" },

  // Right Slot
  right_type: "none",
  right_entity: "",
  right_content: { type: "custom:hki-notification-card" },
  right_offset_x: 0,
  right_offset_y: 0,
  right_tap_action: { action: "none" },

  // Shared Mobile Setting
  mobile_breakpoint: 768,

  // Global Weather Config (Applied to any slot using weather)
  weather_entity: "", 
  weather_show_icon: true,
  weather_show_condition: true,
  weather_show_temperature: true,
  weather_show_humidity: false,
  weather_show_wind: false,
  weather_show_pressure: false,
  weather_colored_icons: true,
  weather_icon_color_mode: "state",
  weather_icon_color: "",
  weather_animate_icon: "none",
  weather_icon_pack_path: "",

  // Global Datetime Config (Applied to any slot using datetime)
  datetime_show_time: true,
  datetime_show_date: true,
  datetime_show_day: true,
  datetime_time_format: "HH:mm",
  datetime_date_format: "D MMM",
  datetime_separator: " • ",
  datetime_icon: "",
  datetime_icon_color: "",
  datetime_animate_icon: "none",
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

// Date formatting helper
function formatDateTime(date, format, locale = 'en') {
  const pad = (n) => String(n).padStart(2, '0');
  
  const getDayName = (d, style) => {
    try { return new Intl.DateTimeFormat(locale, { weekday: style }).format(d); } 
    catch (_) { return style === 'long' ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]; }
  };
  
  const getMonthName = (d, style) => {
    try { return new Intl.DateTimeFormat(locale, { month: style }).format(d); } 
    catch (_) { return style === 'long' ? ['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()] : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]; }
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
      // Custom cards for each slot
      _infoCardLegacy: { attribute: false },
      _infoCardLeft: { attribute: false },
      _infoCardCenter: { attribute: false },
      _infoCardRight: { attribute: false },
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
    
    this._infoCardLegacy = null;
    this._infoCardLeft = null;
    this._infoCardCenter = null;
    this._infoCardRight = null;

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
  }

  static get styles() {
    return css`
      :host { display: block; }

      .header-fixed {
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        z-index: 1;
      }

      ha-card.header {
        position: relative;
        width: 100vw;
        height: 35vh;
        min-height: 180px;
        max-height: 340px;
        margin: 0;
        border-radius: 0;
        overflow: hidden;
        box-sizing: border-box;
        color: var(--hki-header-text-color, #fff);
        border: none;
        box-shadow: none !important;
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
        gap: 4px;
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

      /* INFO & SLOT STYLES */
      .info-container {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--hki-header-text-color, #fff);
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
        z-index: 2;
        /* Default for legacy relative positioning */
        position: absolute; 
      }
      
      .top-bar-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        padding: 16px;
        z-index: 5;
        pointer-events: none; /* Let clicks pass through gaps */
        box-sizing: border-box;
      }

      .hb-slot {
        pointer-events: auto;
        position: relative;
        display: flex;
        align-items: center;
        /* Allow slots to shrink/grow based on content, but try to be balanced */
        flex: 1 1 auto;
        min-width: 0; /* Important for text truncation/wrapping in flex items */
      }

      .hb-slot.slot-left { justify-content: flex-start; }
      .hb-slot.slot-center { justify-content: center; }
      .hb-slot.slot-right { justify-content: flex-end; }

      /* If only one slot is present, it can take full width */
      .hb-slot.only-one { flex: 1 0 100%; }

      /* Remove absolute positioning for slots inside the top bar */
      .top-bar-container .info-container {
        position: relative;
        left: auto !important;
        right: auto !important;
        top: auto !important;
        transform: none; /* Reset transform, we apply offsets via slot wrapper */
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

      .info-text { text-transform: capitalize; white-space: nowrap; }
      .info-temperature { font-weight: 500; }

      .info-pill {
        background: var(--hki-info-pill-background, rgba(0, 0, 0, 0.25));
        border-radius: var(--hki-info-pill-radius, 999px);
        padding: var(--hki-info-pill-padding-y, 6px) var(--hki-info-pill-padding-x, 10px);
        backdrop-filter: blur(var(--hki-info-pill-blur, 0px));
        -webkit-backdrop-filter: blur(var(--hki-info-pill-blur, 0px));
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

    this._resizeHandler = () => {
      this._debouncedMeasure(true);
      this._debouncedBadgesZIndex();
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

    this._editModeInterval = setInterval(() => this._detectEditMode(), 2000);
    this._timeInterval = setInterval(() => {
        this._currentTime = Date.now();
    }, 1000);
    
    // Reduced kiosk polling
    this._kioskCheckInterval = setInterval(() => this._detectKioskMode(), 10000);

    requestAnimationFrame(() => this._measure(true));
    this._scheduleTemplateSetup(0);
    this._debouncedBadgesZIndex();

    this._createCustomCards();
  }

  updated(changed) {
    if (changed.has("_config")) {
      this._detectPreview();
      this._debouncedMeasure(true);
      this._scheduleTemplateSetup(80);
      this._debouncedBadgesZIndex();
      this._createCustomCards();
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
      
      // Update HASS for all custom cards
      [this._infoCardLegacy, this._infoCardLeft, this._infoCardCenter, this._infoCardRight].forEach(el => {
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
  
  _debouncedMeasure(readCard=false) {
      if(this._rafMeasure) return;
      this._rafMeasure = requestAnimationFrame(() => { this._rafMeasure=0; this._measure(readCard); });
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

    // Info positioning
    m.info_offset_x = toNum(m.info_offset_x, 5);
    m.info_offset_y = toNum(m.info_offset_y, 40);
    m.info_offset_x_mobile = m.info_offset_x_mobile == null || m.info_offset_x_mobile === "" ? null : toNum(m.info_offset_x_mobile, null);
    m.info_offset_y_mobile = m.info_offset_y_mobile == null || m.info_offset_y_mobile === "" ? null : toNum(m.info_offset_y_mobile, null);
    m.mobile_breakpoint = clamp(+m.mobile_breakpoint || 768, 240, 2500);
    m.info_size_px = clamp(+m.info_size_px || 12, 8, 64);
    m.info_weight = normalizeWeightKey(m.info_weight ?? "medium", "medium");
    m.info_pill = !!m.info_pill;
    m.info_pill_padding_x = clamp(+m.info_pill_padding_x || 10, 0, 80);
    m.info_pill_padding_y = clamp(+m.info_pill_padding_y || 6, 0, 80);
    m.info_pill_radius = clamp(+m.info_pill_radius || 999, 0, 999);
    m.info_pill_blur = clamp(+m.info_pill_blur || 0, 0, 40);

    // Slot offsets
    ['left', 'center', 'right'].forEach(slot => {
        m[`${slot}_offset_x`] = toNum(m[`${slot}_offset_x`], 0);
        m[`${slot}_offset_y`] = toNum(m[`${slot}_offset_y`], 0);
    });

    // Weather options
    m.weather_show_icon = m.weather_show_icon !== false;
    m.weather_show_condition = m.weather_show_condition !== false;
    m.weather_show_temperature = m.weather_show_temperature !== false;
    m.weather_show_humidity = !!m.weather_show_humidity;
    m.weather_show_wind = !!m.weather_show_wind;
    m.weather_show_pressure = !!m.weather_show_pressure;
    m.weather_colored_icons = m.weather_colored_icons !== false;
    m.weather_icon_color_mode = ["state", "custom", "inherit"].includes(m.weather_icon_color_mode) ? m.weather_icon_color_mode : "state";
    m.weather_animate_icon = ["none", "float", "pulse", "spin"].includes(m.weather_animate_icon) ? m.weather_animate_icon : "none";

    // Datetime options
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

  _resolveBackground(bg) {
    if (!bg || typeof bg !== "string") return bg;
    const t = bg.trim();
    if (t.startsWith("url(") || t.startsWith("linear-gradient(") || t.startsWith("radial-gradient(")) return t;
    const isPath = t.startsWith("/") || t.startsWith("./") || t.startsWith("../") ||
                   t.startsWith("http://") || t.startsWith("https://") ||
                   /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(t);
    return isPath ? `url('${t}')` : t;
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
          history.pushState(null, "", action.navigation_path);
          window.dispatchEvent(new CustomEvent("location-changed", { bubbles: true, composed: true, detail: { replace: false } }));
        }
        break;
      case "url":
        if (action.url_path) window.open(action.url_path, "_blank");
        break;
      case "call-service":
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

  // --- STYLING HELPERS ---

  _getSlotStyle(settings, isLegacy = false) {
    const cfg = this._config;
    const fontFamily = this._resolveFontFamily();
    
    // Legacy positioning uses absolute specific logic
    if (isLegacy) {
        const isMobile = this._viewportWidth > 0 && this._viewportWidth <= (cfg.mobile_breakpoint || 768);
        const offsetX = isMobile && cfg.info_offset_x_mobile != null ? cfg.info_offset_x_mobile : cfg.info_offset_x;
        const offsetY = isMobile && cfg.info_offset_y_mobile != null ? cfg.info_offset_y_mobile : cfg.info_offset_y;
        
        const posStyle = cfg.info_align === "left"
          ? `left:${offsetX}px;top:${offsetY}px;`
          : `right:${offsetX}px;top:${offsetY}px;`;
          
        return {
            posStyle,
            wrapperStyle: `font-family:${fontFamily};font-size:${cfg.info_size_px}px;font-weight:${this._resolveWeight("info_weight")};color:${cfg.info_color || "inherit"};`,
            iconSize: Math.round(cfg.info_size_px * 2)
        };
    }

    // Top Bar Slots use generic styling + margin offsets
    const iconSize = Math.round((cfg.info_size_px || 12) * 2);
    const color = cfg.info_color?.trim() || "var(--hki-header-text-color, #fff)";
    
    // We apply offsets via transform to not break flex flow completely
    const transX = settings.offset_x || 0;
    const transY = settings.offset_y || 0;
    const transform = (transX || transY) ? `transform: translate(${transX}px, ${transY}px);` : "";

    return {
        posStyle: "",
        wrapperStyle: `font-family:${fontFamily};font-size:${cfg.info_size_px}px;font-weight:${this._resolveWeight("info_weight")};color:${color};${transform}`,
        iconSize
    };
  }

  // --- CARD GENERATION ---

  async _createCustomCards() {
    if (!window.loadCardHelpers) return;
    const cfg = this._config;

    const loadCard = async (conf, propName) => {
        if (!conf) return;
        try {
            const helpers = await window.loadCardHelpers();
            const el = await helpers.createCardElement(conf);
            if (this.hass) el.hass = this.hass;
            el.style.display = "block";
            this[propName] = el;
        } catch (e) { console.error("HKI Header: Custom Card Error", e); }
    };

    if (cfg.layout_mode === 'default' && cfg.info_type === 'custom') {
        loadCard(cfg.info_card, '_infoCardLegacy');
    } else if (cfg.layout_mode === 'top_bar') {
        if (cfg.left_type === 'custom') loadCard(cfg.left_content, '_infoCardLeft');
        if (cfg.center_type === 'custom') loadCard(cfg.center_content, '_infoCardCenter');
        if (cfg.right_type === 'custom') loadCard(cfg.right_content, '_infoCardRight');
    }
  }

  // --- RENDERERS ---

  _renderWeather(settings, slotStyle) {
    if (!settings.entity || !this.hass) return html``;
    const weatherEntity = this.hass.states[settings.entity];
    if (!weatherEntity) return html``;

    const cfg = this._config; // Global weather settings
    const state = weatherEntity.state;
    const attrs = weatherEntity.attributes || {};
    const icon = WEATHER_ICON_MAP[state] || "mdi:weather-partly-cloudy";
    
    // Color logic
    const iconColor = cfg.weather_icon_color_mode === "custom" && cfg.weather_icon_color 
      ? cfg.weather_icon_color 
      : cfg.weather_icon_color_mode === "inherit" || !cfg.weather_colored_icons
        ? "inherit"
        : WEATHER_COLOR_MAP[state] || "inherit";

    let conditionText = String(state || "").replace(/-/g, " ");
    if (this.hass.formatEntityState) conditionText = this.hass.formatEntityState(weatherEntity);

    const useSvg = !!cfg.weather_icon_pack_path;
    const svgUrl = useSvg ? `${cfg.weather_icon_pack_path}/${state}.svg` : "";
    const iconAnim = cfg.weather_animate_icon;
    const animClass = iconAnim === 'float' ? 'animate-float' : iconAnim === 'pulse' ? 'animate-pulse' : iconAnim === 'spin' ? 'animate-spin' : '';

    const pillClass = cfg.info_pill ? "info-pill" : "";
    const pillStyle = cfg.info_pill ? `--hki-info-pill-background:${cfg.info_pill_background};padding:${cfg.info_pill_padding_y}px ${cfg.info_pill_padding_x}px;border-radius:${cfg.info_pill_radius}px;backdrop-filter:blur(${cfg.info_pill_blur}px);` : "";

    const handleTap = (e) => { e.stopPropagation(); if (settings.tap_action) this._handleAction(settings.tap_action); };

    return html`
      <div class="info-container ${pillClass} ${settings.tap_action?.action !== 'none' ? 'info-clickable' : ''}" 
           style="${slotStyle.posStyle}${slotStyle.wrapperStyle}${pillStyle}" 
           @click=${handleTap}>
        ${cfg.weather_show_icon
          ? useSvg
            ? html`<img src="${svgUrl}" class="info-icon ${animClass}" style="width:${slotStyle.iconSize}px;height:${slotStyle.iconSize}px;" alt="${state}" />`
            : html`<ha-icon icon="${icon}" class="info-icon ${animClass}" style="color:${iconColor};--mdc-icon-size:${slotStyle.iconSize}px"></ha-icon>`
          : html``}
        ${cfg.weather_show_condition ? html`<span class="info-text">${conditionText}</span>` : html``}
        ${cfg.weather_show_temperature && attrs.temperature != null ? html`<span class="info-temperature">${Math.round(attrs.temperature)}${this.hass.config.unit_system.temperature}</span>` : html``}
        ${cfg.weather_show_humidity && Number.isFinite(+attrs.humidity) ? html`<span>${Math.round(+attrs.humidity)}%</span>` : html``}
        ${cfg.weather_show_wind && Number.isFinite(+attrs.wind_speed) ? html`<span>${Math.round(+attrs.wind_speed)}</span>` : html``}
        ${cfg.weather_show_pressure && Number.isFinite(+attrs.pressure) ? html`<span>${Math.round(+attrs.pressure)}</span>` : html``}
      </div>
    `;
  }

  _renderDatetime(settings, slotStyle) {
    const cfg = this._config;
    const now = new Date(this._currentTime);
    const locale = this.hass?.language || 'en';

    const parts = [];
    if (cfg.datetime_show_day) parts.push(formatDateTime(now, "DDDD", locale));
    if (cfg.datetime_show_date) parts.push(formatDateTime(now, cfg.datetime_date_format, locale));
    if (cfg.datetime_show_time) parts.push(formatDateTime(now, cfg.datetime_time_format, locale));
    
    if (!parts.length) return html``;
    
    const pillClass = cfg.info_pill ? "info-pill" : "";
    const pillStyle = cfg.info_pill ? `--hki-info-pill-background:${cfg.info_pill_background};padding:${cfg.info_pill_padding_y}px ${cfg.info_pill_padding_x}px;border-radius:${cfg.info_pill_radius}px;backdrop-filter:blur(${cfg.info_pill_blur}px);` : "";
    
    const animClass = cfg.datetime_animate_icon === 'float' ? 'animate-float' : cfg.datetime_animate_icon === 'pulse' ? 'animate-pulse' : '';
    const handleTap = (e) => { e.stopPropagation(); if (settings.tap_action) this._handleAction(settings.tap_action); };

    return html`
      <div class="info-container ${pillClass} ${settings.tap_action?.action !== 'none' ? 'info-clickable' : ''}" 
           style="${slotStyle.posStyle}${slotStyle.wrapperStyle}${pillStyle}"
           @click=${handleTap}>
        ${cfg.datetime_icon ? html`<ha-icon icon="${cfg.datetime_icon}" class="info-icon ${animClass}" style="color:${cfg.datetime_icon_color||'inherit'};--mdc-icon-size:${slotStyle.iconSize}px"></ha-icon>` : html``}
        <span class="info-text">${parts.join(cfg.datetime_separator)}</span>
      </div>
    `;
  }

  _renderCustomCardElement(element, settings, slotStyle) {
    if (!element) return html``;
    const transform = (settings.offset_x || settings.offset_y) ? `transform: translate(${settings.offset_x}px, ${settings.offset_y}px);` : "";
    return html`
      <div class="info-container" style="${slotStyle.posStyle}${slotStyle.wrapperStyle}${transform} display: block; min-width: 100px;">
        ${element}
      </div>
    `;
  }

  _renderSlotContent(type, settings, element, isLegacy = false) {
    const slotStyle = this._getSlotStyle(settings, isLegacy);
    
    if (type === 'weather') return this._renderWeather(settings, slotStyle);
    if (type === 'datetime') return this._renderDatetime(settings, slotStyle);
    if (type === 'custom') return this._renderCustomCardElement(element, settings, slotStyle);
    return html``;
  }

  render() {
    if (!this._config) return html``;
    const cfg = this._config;
    const effectiveFixed = !!cfg.fixed && !this._inPreview;

    // --- MAIN RENDER ---
    const titleText = this._isTemplateString(cfg.title) ? (this._renderedTitle ?? "") : (cfg.title ?? "");
    const subtitleText = this._isTemplateString(cfg.subtitle) ? (this._renderedSubtitle ?? "") : (cfg.subtitle ?? "");

    // Background & Card Styles
    const bgStyle = this._resolveBackground(cfg.background);
    const cardStyle = `
        width:${effectiveFixed ? "100vw" : "100%"};
        height:${cfg.height_vh}vh;
        min-height:${cfg.min_height}px;max-height:${cfg.max_height}px;
        background:${bgStyle};
        background-position:${cfg.background_position};
        background-repeat:${cfg.background_repeat};
        background-size:${cfg.background_size};
    `;
    const overlayStyle = `background:linear-gradient(to bottom, transparent 0%, ${cfg.blend_color} ${cfg.blend_stop}%, ${cfg.blend_color} 100%);`;

    // Content Styles
    const contentStyle = effectiveFixed ? `margin-left:${this._offsetLeft}px;width:${this._contentWidth}px;` : `width:100%;`;
    
    // Title Positioning
    const titleStyle = `font-family:${this._resolveFontFamily()};font-style:${cfg.font_style};font-size:${cfg.title_size_px}px;font-weight:${this._resolveWeight("title_weight")};color:${cfg.title_color||"var(--hki-header-text-color, #fff)"};`;
    const subStyle = `font-family:${this._resolveFontFamily()};font-style:${cfg.font_style};font-size:${cfg.subtitle_size_px}px;font-weight:${this._resolveWeight("subtitle_weight")};color:${cfg.subtitle_color||"var(--hki-header-text-color, #fff)"};`;
    const subTrans = `transform:translate(${(cfg.subtitle_offset_x||0)-(cfg.title_offset_x||0)}px, ${(cfg.subtitle_offset_y||0)-(cfg.title_offset_y||0)}px);`;
    
    let titleBlockPos;
    if (cfg.text_align === "right") titleBlockPos = `right:${cfg.title_offset_x}px;top:${cfg.title_offset_y}px;text-align:right;align-items:flex-end;`;
    else if (cfg.text_align === "center") titleBlockPos = `left:50%;top:${cfg.title_offset_y}px;transform:translateX(-50%);text-align:center;align-items:center;`;
    else titleBlockPos = `left:${cfg.title_offset_x}px;top:${cfg.title_offset_y}px;text-align:left;align-items:flex-start;`;

    // --- SLOT LOGIC ---
    let extraContent = html``;

    if (cfg.layout_mode === 'top_bar') {
        const leftType = cfg.left_type || 'none';
        const centerType = cfg.center_type || 'none';
        const rightType = cfg.right_type || 'none';
        
        const hasLeft = leftType !== 'none';
        const hasCenter = centerType !== 'none';
        const hasRight = rightType !== 'none';
        const activeCount = (hasLeft?1:0) + (hasCenter?1:0) + (hasRight?1:0);

        extraContent = html`
            <div class="top-bar-container">
                ${hasLeft ? html`
                    <div class="hb-slot slot-left ${activeCount===1?'only-one':''}">
                        ${this._renderSlotContent(leftType, {
                            entity: cfg.left_entity || cfg.weather_entity, // Fallback for weather
                            offset_x: cfg.left_offset_x,
                            offset_y: cfg.left_offset_y,
                            tap_action: cfg.left_tap_action
                        }, this._infoCardLeft)}
                    </div>
                ` : (activeCount > 1 ? html`<div class="hb-slot slot-left"></div>` : html``)}

                ${hasCenter ? html`
                    <div class="hb-slot slot-center ${activeCount===1?'only-one':''}">
                        ${this._renderSlotContent(centerType, {
                            entity: cfg.center_entity || cfg.weather_entity,
                            offset_x: cfg.center_offset_x,
                            offset_y: cfg.center_offset_y,
                            tap_action: cfg.center_tap_action
                        }, this._infoCardCenter)}
                    </div>
                ` : (activeCount > 2 ? html`<div class="hb-slot slot-center"></div>` : html``)}

                ${hasRight ? html`
                    <div class="hb-slot slot-right ${activeCount===1?'only-one':''}">
                        ${this._renderSlotContent(rightType, {
                            entity: cfg.right_entity || cfg.weather_entity,
                            offset_x: cfg.right_offset_x,
                            offset_y: cfg.right_offset_y,
                            tap_action: cfg.right_tap_action
                        }, this._infoCardRight)}
                    </div>
                ` : (activeCount > 1 ? html`<div class="hb-slot slot-right"></div>` : html``)}
            </div>
        `;
    } else {
        // LEGACY MODE
        if (cfg.info_type !== 'none') {
            extraContent = this._renderSlotContent(cfg.info_type, {
                entity: cfg.weather_entity, // Legacy uses shared
                offset_x: 0, // Legacy styling handles offsets via CSS left/top
                offset_y: 0,
                tap_action: cfg.info_tap_action
            }, this._infoCardLegacy, true);
        }
    }

    const cardMarkup = html`
      <ha-card class="header" style=${cardStyle}>
        <div class="overlay" style=${overlayStyle}></div>
        <div class="content" style=${contentStyle}>
          ${extraContent}
          <div class="title-block" style=${titleBlockPos}>
            <div class="title" style=${titleStyle}>${titleText}</div>
            ${subtitleText ? html`<div class="subtitle" style="${subStyle}${subTrans}">${subtitleText}</div>` : html``}
          </div>
        </div>
      </ha-card>
    `;

    if (!effectiveFixed) return cardMarkup;
    
    // Calculate spacer
    const topOffset = (this._kioskMode ? 0 : 48) + (cfg.fixed_top||0);
    let spacerH = Math.max(0, (this._headerHeight||0) - (cfg.badges_fixed ? (cfg.badges_offset_pinned||48) : (cfg.badges_offset_unpinned||100)) + topOffset);
    
    return html`
      <div class="header-fixed" style="top:${topOffset}px">${cardMarkup}</div>
      <div class="header-spacer" style="height:${spacerH}px"></div>
    `;
  }

  static getConfigElement() { return document.createElement("hki-header-card-editor"); }
  
  static getStubConfig() {
    return {
      ...DEFAULTS,
      title: "{% if is_state('sun.sun','above_horizon') %}Good day, {{ user }}{% else %}Good evening, {{ user }}{% endif %}",
      subtitle: "{{ now().strftime('%A %H:%M') }}",
      font_family: "roboto",
    };
  }
  
  static getCardSize() { return 3; }
}

customElements.define(CARD_NAME, HkiHeaderCard);


// ─────────────────────────────────────────────────────────────
// EDITOR
// ─────────────────────────────────────────────────────────────

class HkiHeaderCardEditor extends LitElement {
  static get properties() { return { hass: {}, _config: { attribute: false } }; }

  setConfig(config) { this._config = { ...DEFAULTS, ...config }; }

  _changed(ev) {
      if (!this._config || !ev.target) return;
      const target = ev.target;
      const field = target.dataset.field; 
      let value = ev.detail?.value ?? target.value;
      
      if (target.type === 'number') value = Number(value);
      if (target.type === 'checkbox' || target.tagName === 'HA-SWITCH') value = target.checked;
      
      // Handle nested
      if (field.includes('.')) {
          const [p, c] = field.split('.');
          const prev = this._config[p] || {};
          // Specific logic for notification card yaml
          if (field.includes('_content')) {
             // Handled by custom event usually, but if manually edited:
             // We generally skip text editing for object props to avoid complexity in this snippet
          }
          this._config = { ...this._config, [p]: { ...prev, [c]: value } };
      } else {
          this._config = { ...this._config, [field]: value };
      }
      
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config } }));
  }

  _handleCustomCardChange(ev, field) {
      ev.stopPropagation();
      const newCardConfig = ev.detail.config;
      this._config = { ...this._config, [field]: newCardConfig };
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config } }));
  }

  _renderSlotSettings(label, prefix) {
      const cfg = this._config;
      const type = cfg[`${prefix}_type`] || 'none';
      
      return html`
        <div class="slot-config" style="border:1px solid var(--divider-color); padding:10px; margin-bottom:10px; border-radius:4px;">
            <div style="font-weight:bold;margin-bottom:8px;">${label}</div>
            <ha-select label="Type" .value=${type} data-field="${prefix}_type" @selected=${(e)=>this._changed(e)} @closed=${(e)=>e.stopPropagation()}>
                <mwc-list-item value="none">None</mwc-list-item>
                <mwc-list-item value="weather">Weather</mwc-list-item>
                <mwc-list-item value="datetime">Date & Time</mwc-list-item>
                <mwc-list-item value="custom">Notifications</mwc-list-item>
            </ha-select>
            
            ${type !== 'none' ? html`
                <div class="inline-fields-2" style="margin-top:8px;">
                    <ha-textfield label="Offset X (px)" type="number" .value=${cfg[`${prefix}_offset_x`]||0} data-field="${prefix}_offset_x" @change=${(e)=>this._changed(e)}></ha-textfield>
                    <ha-textfield label="Offset Y (px)" type="number" .value=${cfg[`${prefix}_offset_y`]||0} data-field="${prefix}_offset_y" @change=${(e)=>this._changed(e)}></ha-textfield>
                </div>
            ` : ''}

            ${type === 'weather' ? html`
                <ha-entity-picker 
                    label="Weather Entity (Override)" 
                    .hass=${this.hass}
                    .value=${cfg[`${prefix}_entity`] || cfg.weather_entity}
                    .includeDomains=${['weather']}
                    data-field="${prefix}_entity"
                    @value-changed=${(e)=>this._changed(e)}
                ></ha-entity-picker>
            ` : ''}

            ${type === 'custom' ? html`
                 <ha-alert alert-type="warning" style="margin: 8px 0;">Requires <b>hki-notify</b> integration & <b>custom:hki-notification-card</b>.</ha-alert>
                 <hui-card-element-editor 
                    .hass=${this.hass} 
                    .value=${cfg[`${prefix}_content`]} 
                    @config-changed=${(e) => this._handleCustomCardChange(e, `${prefix}_content`)}
                 ></hui-card-element-editor>
            ` : ''}
        </div>
      `;
  }

  render() {
    if (!this._config) return html``;
    const cfg = this._config;

    return html`
      <div class="card-config">
        <ha-select label="Layout Mode" .value=${cfg.layout_mode} data-field="layout_mode" @selected=${(e)=>this._changed(e)} @closed=${(e)=>e.stopPropagation()}>
            <mwc-list-item value="default">Legacy (Floating)</mwc-list-item>
            <mwc-list-item value="top_bar">Top Bar (Slots)</mwc-list-item>
        </ha-select>

        ${cfg.layout_mode === 'top_bar' ? html`
            <div class="section">Top Bar Configuration</div>
            <p class="description">Slots sit above the title. If only one slot is used, it takes full width.</p>
            ${this._renderSlotSettings("Left Slot", "left")}
            ${this._renderSlotSettings("Center Slot", "center")}
            ${this._renderSlotSettings("Right Slot", "right")}
        ` : html`
            <div class="section">Legacy Info Display</div>
            <ha-select label="Type" .value=${cfg.info_type} data-field="info_type" @selected=${(e)=>this._changed(e)} @closed=${(e)=>e.stopPropagation()}>
                <mwc-list-item value="none">None</mwc-list-item>
                <mwc-list-item value="weather">Weather</mwc-list-item>
                <mwc-list-item value="datetime">Date & Time</mwc-list-item>
                <mwc-list-item value="custom">Notifications</mwc-list-item>
            </ha-select>
            ${cfg.info_type === 'custom' ? html`
                 <ha-alert alert-type="warning">Requires <b>hki-notify</b> integration & <b>custom:hki-notification-card</b>.</ha-alert>
                 <hui-card-element-editor .hass=${this.hass} .value=${cfg.info_card} @config-changed=${(e)=>this._handleCustomCardChange(e, 'info_card')}></hui-card-element-editor>
            ` : ''}
            <div class="inline-fields-2">
                <ha-textfield label="Offset X" type="number" .value=${cfg.info_offset_x} data-field="info_offset_x" @change=${(e)=>this._changed(e)}></ha-textfield>
                <ha-textfield label="Offset Y" type="number" .value=${cfg.info_offset_y} data-field="info_offset_y" @change=${(e)=>this._changed(e)}></ha-textfield>
            </div>
            <ha-select label="Alignment" .value=${cfg.info_align} data-field="info_align" @selected=${(e)=>this._changed(e)} @closed=${(e)=>e.stopPropagation()}>
                <mwc-list-item value="left">Left</mwc-list-item>
                <mwc-list-item value="right">Right</mwc-list-item>
            </ha-select>
        `}

        <div class="section">Global Settings (Weather/Date)</div>
        <div class="inline-fields-2">
             <ha-textfield label="Font Size (px)" type="number" .value=${cfg.info_size_px} data-field="info_size_px" @change=${(e)=>this._changed(e)}></ha-textfield>
             <ha-textfield label="Color" .value=${cfg.info_color} data-field="info_color" @change=${(e)=>this._changed(e)}></ha-textfield>
        </div>
        ${cfg.layout_mode === 'default' || cfg.left_type === 'weather' || cfg.center_type === 'weather' || cfg.right_type === 'weather' || cfg.info_type === 'weather' ? html`
             <ha-entity-picker label="Global Weather Entity" .hass=${this.hass} .value=${cfg.weather_entity} .includeDomains=${['weather']} data-field="weather_entity" @value-changed=${(e)=>this._changed(e)}></ha-entity-picker>
             <div class="switch-row"><ha-switch .checked=${cfg.weather_show_icon} data-field="weather_show_icon" @change=${(e)=>this._changed(e)}></ha-switch><span>Show Icon</span></div>
             <div class="switch-row"><ha-switch .checked=${cfg.weather_show_temperature} data-field="weather_show_temperature" @change=${(e)=>this._changed(e)}></ha-switch><span>Show Temp</span></div>
             <div class="switch-row"><ha-switch .checked=${cfg.weather_show_condition} data-field="weather_show_condition" @change=${(e)=>this._changed(e)}></ha-switch><span>Show Condition</span></div>
        ` : ''}

        <div class="section">Main Header Config</div>
        <ha-textfield label="Title" .value=${cfg.title} data-field="title" @change=${(e)=>this._changed(e)}></ha-textfield>
        <ha-textfield label="Subtitle" .value=${cfg.subtitle} data-field="subtitle" @change=${(e)=>this._changed(e)}></ha-textfield>
        <ha-textfield label="Background" .value=${cfg.background} data-field="background" @change=${(e)=>this._changed(e)}></ha-textfield>
      </div>
    `;
  }

  static get styles() {
    return css`
      .card-config { display: flex; flex-direction: column; gap: 12px; padding: 8px; }
      .section { margin-top: 12px; font-weight: 600; text-transform: uppercase; font-size: 0.9em; opacity: 0.8; }
      .description { font-size: 0.85em; opacity: 0.7; margin: -8px 0 8px 0; }
      .inline-fields-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .switch-row { display: flex; align-items: center; gap: 12px; margin: 4px 0; }
      ha-select, ha-textfield { width: 100%; }
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
