// HKI Header Card - Optimized

import { LitElement, html, css } from "https://unpkg.com/lit@2.8.0/index.js?module";

const CARD_NAME = "hki-header-card";

console.info(
  '%c HKI-HEADER-CARD %c v1.1.2 ',
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

  // Info display type: "none", "weather", "datetime", "badge"
  info_type: "none",

  // Shared info positioning
  info_align: "right",
  info_offset_x: 5,
  info_offset_y: 40,
  info_offset_x_mobile: null,
  info_offset_y_mobile: null,
  mobile_breakpoint: 768,
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

  // Weather-specific
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

  // Datetime-specific
  datetime_show_time: true,
  datetime_show_date: true,
  datetime_show_day: true,
  datetime_time_format: "HH:mm",
  datetime_date_format: "D MMM",
  datetime_separator: " • ",
  datetime_icon: "",
  datetime_icon_color: "",
  datetime_animate_icon: "none",

  // Badge-specific
  badge_icon: "mdi:information",
  badge_text: "",
  badge_icon_color: "",
  badge_animate_icon: "none",
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
      _renderedBadgeText: { type: String },
      _renderedBadgeIcon: { type: String },
      _currentTime: { type: Number },
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
    this._renderedBadgeText = "";
    this._renderedBadgeIcon = "";
    this._currentTime = Date.now();

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
      badge_text: { raw: "", sig: "", seq: 0, unsub: null },
      badge_icon: { raw: "", sig: "", seq: 0, unsub: null },
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
        min-height: 180px;
        max-height: 340px;
        margin: 0;
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

      .info-container {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--hki-header-text-color, #fff);
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
        z-index: 2;
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
    this._unsubscribeTemplate("badge_text");
    this._unsubscribeTemplate("badge_icon");
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
      if (this._config?.info_type === "datetime") {
        this._currentTime = Date.now();
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
  }

  updated(changed) {
    if (changed.has("_config")) {
      this._detectPreview();
      this._debouncedMeasure(true);
      this._scheduleTemplateSetup(80);
      this._debouncedBadgesZIndex();
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

  // Optimized header search - limited depth, prioritized selectors
  _findHeader() {
    const selectors = ["app-header", "mwc-top-app-bar-fixed", ".toolbar", "[slot='header']", "ha-tabs"];
    
    const search = (root, depth = 0) => {
      if (depth > 6 || !root) return null;
      
      for (const sel of selectors) {
        const el = root.querySelector?.(sel);
        if (el) return el;
      }
      
      // Limited shadowRoot traversal
      const shadowHosts = root.querySelectorAll?.("home-assistant, hui-root, ha-panel-lovelace, hui-view");
      if (shadowHosts) {
        for (const host of shadowHosts) {
          if (host.shadowRoot) {
            const found = search(host.shadowRoot, depth + 1);
            if (found) return found;
          }
        }
      }
      return null;
    };

    const ha = document.querySelector("home-assistant");
    return ha?.shadowRoot ? search(ha.shadowRoot) : search(document);
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

    // Backward compatibility: migrate old weather_* positioning to info_*
    if (config.weather_align !== undefined && config.info_align === undefined) m.info_align = config.weather_align;
    if (config.weather_offset_x !== undefined && config.info_offset_x === undefined) m.info_offset_x = config.weather_offset_x;
    if (config.weather_offset_y !== undefined && config.info_offset_y === undefined) m.info_offset_y = config.weather_offset_y;
    if (config.weather_offset_x_mobile !== undefined && config.info_offset_x_mobile === undefined) m.info_offset_x_mobile = config.weather_offset_x_mobile;
    if (config.weather_offset_y_mobile !== undefined && config.info_offset_y_mobile === undefined) m.info_offset_y_mobile = config.weather_offset_y_mobile;
    if (config.weather_size_px !== undefined && config.info_size_px === undefined) m.info_size_px = config.weather_size_px;
    if (config.weather_weight !== undefined && config.info_weight === undefined) m.info_weight = config.weather_weight;
    if (config.weather_color !== undefined && config.info_color === undefined) m.info_color = config.weather_color;
    if (config.weather_pill !== undefined && config.info_pill === undefined) m.info_pill = config.weather_pill;
    if (config.weather_pill_background !== undefined && config.info_pill_background === undefined) m.info_pill_background = config.weather_pill_background;
    if (config.weather_pill_padding_x !== undefined && config.info_pill_padding_x === undefined) m.info_pill_padding_x = config.weather_pill_padding_x;
    if (config.weather_pill_padding_y !== undefined && config.info_pill_padding_y === undefined) m.info_pill_padding_y = config.weather_pill_padding_y;
    if (config.weather_pill_radius !== undefined && config.info_pill_radius === undefined) m.info_pill_radius = config.weather_pill_radius;
    if (config.weather_pill_blur !== undefined && config.info_pill_blur === undefined) m.info_pill_blur = config.weather_pill_blur;
    if (config.weather_tap_action !== undefined && config.info_tap_action === undefined) m.info_tap_action = config.weather_tap_action;

    // Auto-detect info_type for backward compatibility
    if (config.info_type === undefined && config.weather_entity) {
      m.info_type = "weather";
    }

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

    // Badge options
    m.badge_animate_icon = ["none", "float", "pulse", "spin"].includes(m.badge_animate_icon) ? m.badge_animate_icon : "none";

    // Font options
    m.font_family = ["inherit", "system", "roboto", "inter", "arial", "georgia", "mono", "custom"].includes(m.font_family) ? m.font_family : "inherit";
    m.font_family_custom = typeof m.font_family_custom === "string" ? m.font_family_custom : "";
    m.font_style = ["normal", "italic"].includes(m.font_style) ? m.font_style : "normal";
    m.title_size_px = clamp(+m.title_size_px || 36, 8, 256);
    m.subtitle_size_px = clamp(+m.subtitle_size_px || 15, 8, 128);
    m.title_weight = normalizeWeightKey(m.title_weight ?? "bold", "bold");
    m.subtitle_weight = normalizeWeightKey(m.subtitle_weight ?? "medium", "medium");

    // Info type validation
    m.info_type = ["none", "weather", "datetime", "badge"].includes(m.info_type) ? m.info_type : "none";

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
    this._setupTemplateKey("badge_text", this._config?.badge_text ?? "");
    this._setupTemplateKey("badge_icon", this._config?.badge_icon ?? "");
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
    } else if (key === "badge_text") {
      if (this._renderedBadgeText !== v) { this._renderedBadgeText = v; this.requestUpdate(); }
    } else if (key === "badge_icon") {
      if (this._renderedBadgeIcon !== v) { this._renderedBadgeIcon = v; this.requestUpdate(); }
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

  _getInfoContainerStyle(cfg) {
    const isMobile = this._viewportWidth > 0 && this._viewportWidth <= (cfg.mobile_breakpoint || 768);
    const offsetX = isMobile && cfg.info_offset_x_mobile != null ? cfg.info_offset_x_mobile : cfg.info_offset_x;
    const offsetY = isMobile && cfg.info_offset_y_mobile != null ? cfg.info_offset_y_mobile : cfg.info_offset_y;

    const fontFamily = this._resolveFontFamily();
    const iconSize = Math.round((cfg.info_size_px || 12) * 2);
    const infoColor = cfg.info_color?.trim() || "var(--hki-header-text-color, #fff)";
    const infoInline = `font-family:${fontFamily};font-style:${cfg.font_style || "normal"};font-size:${cfg.info_size_px || 12}px;font-weight:${this._resolveWeight("info_weight")};color:${infoColor};`;

    const posStyle = cfg.info_align === "left"
      ? `left:${offsetX}px;top:${offsetY}px;--info-icon-size:${iconSize}px;`
      : `right:${offsetX}px;top:${offsetY}px;--info-icon-size:${iconSize}px;`;

    const pillStyle = cfg.info_pill
      ? `--hki-info-pill-background:${cfg.info_pill_background};--hki-info-pill-padding-x:${cfg.info_pill_padding_x}px;--hki-info-pill-padding-y:${cfg.info_pill_padding_y}px;--hki-info-pill-radius:${cfg.info_pill_radius}px;--hki-info-pill-blur:${cfg.info_pill_blur}px;`
      : "";

    return { posStyle, infoInline, pillStyle, iconSize };
  }

  _renderWeather() {
    if (!this._config.weather_entity || !this.hass) return html``;

    const weatherEntity = this.hass.states[this._config.weather_entity];
    if (!weatherEntity) return html``;

    const cfg = this._config;
    const state = weatherEntity.state;
    const attrs = weatherEntity.attributes || {};

    const icon = WEATHER_ICON_MAP[state] || "mdi:weather-partly-cloudy";
    const iconColor = cfg.weather_icon_color_mode === "custom" && cfg.weather_icon_color?.trim()
      ? cfg.weather_icon_color.trim()
      : cfg.weather_icon_color_mode === "inherit" || !cfg.weather_colored_icons
        ? "inherit"
        : WEATHER_COLOR_MAP[state] || "inherit";

    let conditionText = String(state || "").replace(/-/g, " ");
    if (this.hass.formatEntityState) conditionText = this.hass.formatEntityState(weatherEntity);

    const temperature = attrs.temperature;
    const tempUnit = this.hass.config.unit_system.temperature;
    const humidity = attrs.humidity;
    const windSpeed = attrs.wind_speed;
    const speedUnit = this.hass.config.unit_system.speed || attrs.wind_speed_unit || "";
    const pressure = attrs.pressure;
    const pressureUnit = this.hass.config.unit_system.pressure || attrs.pressure_unit || "";

    const { posStyle, infoInline, pillStyle, iconSize } = this._getInfoContainerStyle(cfg);

    const hasAction = cfg.info_tap_action?.action !== "none";
    const baseClass = hasAction ? "info-container info-clickable" : "info-container";
    const pillClass = cfg.info_pill ? "info-pill" : "";
    const iconAnimClass = cfg.weather_animate_icon === "float" ? "animate-float"
                        : cfg.weather_animate_icon === "pulse" ? "animate-pulse"
                        : cfg.weather_animate_icon === "spin" ? "animate-spin" : "";

    const useSvg = !!cfg.weather_icon_pack_path;
    const svgUrl = useSvg ? `${cfg.weather_icon_pack_path}/${state}.svg` : "";

    const handleTap = (e) => { e.stopPropagation(); if (cfg.info_tap_action) this._handleAction(cfg.info_tap_action); };

    return html`
      <div class="${baseClass} ${pillClass}" style="${posStyle}${infoInline}${pillStyle}" @click=${handleTap}>
        ${cfg.weather_show_icon
          ? useSvg
            ? html`<img src="${svgUrl}" class="info-icon ${iconAnimClass}" style="width:${iconSize}px;height:${iconSize}px;" alt="${state}" />`
            : html`<ha-icon icon="${icon}" class="info-icon ${iconAnimClass}" style="color:${iconColor};"></ha-icon>`
          : html``}
        ${cfg.weather_show_condition ? html`<span class="info-text">${conditionText}</span>` : html``}
        ${cfg.weather_show_temperature && Number.isFinite(+temperature) ? html`<span class="info-temperature">${Math.round(+temperature)}${tempUnit}</span>` : html``}
        ${cfg.weather_show_humidity && Number.isFinite(+humidity) ? html`<span>${Math.round(+humidity)}%</span>` : html``}
        ${cfg.weather_show_wind && Number.isFinite(+windSpeed) ? html`<span>${Math.round(+windSpeed)}${speedUnit ? " " + speedUnit : ""}</span>` : html``}
        ${cfg.weather_show_pressure && Number.isFinite(+pressure) ? html`<span>${Math.round(+pressure)}${pressureUnit ? " " + pressureUnit : ""}</span>` : html``}
      </div>
    `;
  }

  _renderDatetime() {
    const cfg = this._config;
    const now = new Date(this._currentTime);
    const locale = this.hass?.language || 'en';

    const parts = [];
    if (cfg.datetime_show_day) {
      parts.push(formatDateTime(now, "DDDD", locale));
    }
    if (cfg.datetime_show_date) {
      parts.push(formatDateTime(now, cfg.datetime_date_format || "D MMM", locale));
    }
    if (cfg.datetime_show_time) {
      parts.push(formatDateTime(now, cfg.datetime_time_format || "HH:mm", locale));
    }

    if (parts.length === 0) return html``;

    const separator = cfg.datetime_separator || " • ";
    const displayText = parts.join(separator);

    const { posStyle, infoInline, pillStyle, iconSize } = this._getInfoContainerStyle(cfg);

    const hasAction = cfg.info_tap_action?.action !== "none";
    const baseClass = hasAction ? "info-container info-clickable" : "info-container";
    const pillClass = cfg.info_pill ? "info-pill" : "";
    const iconAnimClass = cfg.datetime_animate_icon === "float" ? "animate-float"
                        : cfg.datetime_animate_icon === "pulse" ? "animate-pulse"
                        : cfg.datetime_animate_icon === "spin" ? "animate-spin" : "";

    const handleTap = (e) => { e.stopPropagation(); if (cfg.info_tap_action) this._handleAction(cfg.info_tap_action); };

    const iconColor = cfg.datetime_icon_color?.trim() || "inherit";

    return html`
      <div class="${baseClass} ${pillClass}" style="${posStyle}${infoInline}${pillStyle}" @click=${handleTap}>
        ${cfg.datetime_icon ? html`<ha-icon icon="${cfg.datetime_icon}" class="info-icon ${iconAnimClass}" style="color:${iconColor};"></ha-icon>` : html``}
        <span class="info-text">${displayText}</span>
      </div>
    `;
  }

  _renderBadge() {
    const cfg = this._config;

    const badgeText = this._isTemplateString(cfg.badge_text) ? this._renderedBadgeText : (cfg.badge_text || "");
    const badgeIcon = this._isTemplateString(cfg.badge_icon) ? this._renderedBadgeIcon : (cfg.badge_icon || "");

    if (!badgeIcon && !badgeText.trim()) return html``;

    const { posStyle, infoInline, pillStyle, iconSize } = this._getInfoContainerStyle(cfg);

    const hasAction = cfg.info_tap_action?.action !== "none";
    const baseClass = hasAction ? "info-container info-clickable" : "info-container";
    const pillClass = cfg.info_pill ? "info-pill" : "";
    const iconAnimClass = cfg.badge_animate_icon === "float" ? "animate-float"
                        : cfg.badge_animate_icon === "pulse" ? "animate-pulse"
                        : cfg.badge_animate_icon === "spin" ? "animate-spin" : "";

    const handleTap = (e) => { e.stopPropagation(); if (cfg.info_tap_action) this._handleAction(cfg.info_tap_action); };

    const iconColor = cfg.badge_icon_color?.trim() || "inherit";

    return html`
      <div class="${baseClass} ${pillClass}" style="${posStyle}${infoInline}${pillStyle}" @click=${handleTap}>
        ${badgeIcon ? html`<ha-icon icon="${badgeIcon}" class="info-icon ${iconAnimClass}" style="color:${iconColor};"></ha-icon>` : html``}
        ${badgeText.trim() ? html`<span class="info-text">${badgeText}</span>` : html``}
      </div>
    `;
  }

  _renderInfoDisplay() {
    const cfg = this._config;
    switch (cfg.info_type) {
      case "weather": return this._renderWeather();
      case "datetime": return this._renderDatetime();
      case "badge": return this._renderBadge();
      default: return html``;
    }
  }

  render() {
    if (!this._config) return html``;

    const cfg = this._config;
    const effectiveFixed = !!cfg.fixed && !this._inPreview;

    const titleText = this._isTemplateString(cfg.title) ? (this._renderedTitle ?? "") : (cfg.title ?? "");
    const subtitleText = this._isTemplateString(cfg.subtitle) ? (this._renderedSubtitle ?? "") : (cfg.subtitle ?? "");
    const subtitleVisible = !!subtitleText.trim();

    // Layout Logic Update: If not fixed, behave like a normal card (100% width, no negative margins)
    const cardWidth = effectiveFixed || this._inPreview ? "100vw" : "100%";
    const resolvedBackground = this._resolveBackground(cfg.background);

    const cardStyle = [
      `width:${cardWidth}`,
      `height:${cfg.height_vh}vh`,
      `min-height:${cfg.min_height}px`,
      `max-height:${cfg.max_height}px`,
      resolvedBackground ? `background:${resolvedBackground}` : "",
      cfg.background_position ? `background-position:${cfg.background_position}` : "",
      cfg.background_repeat ? `background-repeat:${cfg.background_repeat}` : "",
      cfg.background_size ? `background-size:${cfg.background_size}` : "",
      !effectiveFixed ? "border-radius: var(--ha-card-border-radius, 12px)" : "", // Normal card radius if not fixed
    ].filter(Boolean).join(";");

    const overlayStyle = `background:linear-gradient(to bottom, transparent 0%, ${cfg.blend_color} ${cfg.blend_stop}%, ${cfg.blend_color} 100%);`;
    
    // Logic Update: Only apply viewport offsetting if fixed
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
    const wrapperStyle = effectiveFixed ? `top:${topOffset}px;` : "";

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
      _config: { attribute: false },
    };
  }

  constructor() {
    super();
    this._config = {};
  }

  setConfig(config) {
    this._config = { ...DEFAULTS, ...config };
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

  _parseColor(value) {
    return value || "";
  }

  _handleColorChange(ev, field) {
    ev.stopPropagation();
    const value = ev.detail.value;
    this._changed({ target: { value } }, field);
  }

  _renderColorPicker(label, field, value) {
    return html`
      <div class="color-field">
        <label>${label}</label>
        <ha-selector
          .hass=${this.hass}
          .selector=${{ color_rgb: {} }}
          .value=${this._parseColor(value)}
          @value-changed=${(ev) => this._handleColorChange(ev, field)}
        ></ha-selector>
      </div>
    `;
  }

  _val(ev) {
    return ev.detail?.value ?? ev.target?.value;
  }

  _changed(ev, explicitField = null) {
    ev.stopPropagation();
    const field = explicitField || ev.target?.dataset?.field;
    if (!field || !this._config) return;

    let value = this._val(ev);

    const numeric = new Set([
      "height_vh", "min_height", "max_height", "blend_stop", "fixed_top",
      "title_offset_x", "title_offset_y", "subtitle_offset_x", "subtitle_offset_y",
      "title_size_px", "subtitle_size_px", "badges_offset_pinned", "badges_offset_unpinned",
      "badges_gap", "info_offset_x", "info_offset_y", "info_size_px",
      "mobile_breakpoint", "info_pill_padding_x", "info_pill_padding_y",
      "info_pill_radius", "info_pill_blur",
    ]);

    const nullableNumeric = new Set(["info_offset_x_mobile", "info_offset_y_mobile"]);

    if (nullableNumeric.has(field)) {
      value = value === "" || value == null ? null : toNum(value, null);
      if (value === null || !Number.isFinite(value)) value = null;
    } else if (numeric.has(field)) {
      const n = Number(value);
      if (!Number.isFinite(n)) return;
      value = n;
    }

    const bools = new Set([
      "fixed", "badges_fixed", "weather_show_icon", "weather_show_condition",
      "weather_show_temperature", "weather_show_humidity", "weather_show_wind",
      "weather_show_pressure", "weather_colored_icons", "info_pill",
      "datetime_show_time", "datetime_show_date", "datetime_show_day",
    ]);
    if (bools.has(field)) value = !!(ev.target?.checked ?? value);

    let next;

    if (field.includes(".")) {
      const [rootField, subField] = field.split(".");
      const currentValue = this._config[rootField] || {};
      next = { ...this._config, [rootField]: { ...currentValue, [subField]: value } };

      if (subField === "action" && value === "call-service") {
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
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next } }));
  }

  _renderTemplateEditor(label, field, options = {}) {
    const value = this._config?.[field] ?? "";
    const { autocompleteIcons = false } = options;
    return html`
      <div class="code-wrap">
        <div class="code-label">${label}</div>
        <ha-code-editor 
          .hass=${this.hass} 
          .value=${value} 
          mode="jinja2" 
          data-field=${field} 
          ?autocomplete-entities=${true}
          ?autocomplete-icons=${autocompleteIcons}
          @value-changed=${this._changed}
        ></ha-code-editor>
      </div>
    `;
  }

  _renderServiceDataEditor(field, serviceData) {
    let value = "";
    if (serviceData) {
      if (typeof serviceData === 'string') value = serviceData;
      else value = Object.entries(serviceData).map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`).join('\n');
    }
    return html`
      <div class="code-wrap">
        <div class="code-label">Service data (YAML)</div>
        <ha-code-editor .hass=${this.hass} .value=${value} mode="yaml" ?autocomplete-entities=${true} ?autocomplete-icons=${true} data-field="${field}.service_data" @value-changed=${this._changed}></ha-code-editor>
      </div>
    `;
  }

  _renderActionEditor(label, field) {
    const action = this._config?.[field] || { action: "none" };
    const actionType = action.action || "none";
    const hasServicePicker = !!customElements.get("ha-service-picker");

    return html`
      <div class="code-wrap">
        <div class="code-label">${label}</div>
        <ha-select label="Action type" .value=${actionType} data-field="${field}.action" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
          <mwc-list-item value="none">None</mwc-list-item>
          <mwc-list-item value="navigate">Navigate</mwc-list-item>
          <mwc-list-item value="url">URL</mwc-list-item>
          <mwc-list-item value="call-service">Call service</mwc-list-item>
          <mwc-list-item value="more-info">More info</mwc-list-item>
          <mwc-list-item value="toggle">Toggle</mwc-list-item>
        </ha-select>
        
        ${actionType === "navigate" ? this._renderNavigationPicker("Navigation path", `${field}.navigation_path`, action.navigation_path || "", "Pick a view or enter a custom path") : ""}
        ${actionType === "url" ? html`<ha-textfield label="URL" .value=${action.url_path || ""} data-field="${field}.url_path" @input=${this._changed}></ha-textfield>` : ""}
        ${actionType === "call-service" ? html`
          ${hasServicePicker
            ? html`<ha-service-picker style="width:100%;display:block;" .hass=${this.hass} .value=${action.service || ""} @value-changed=${(ev) => this._changed(ev, `${field}.service`)}></ha-service-picker>`
            : html`<ha-textfield label="Service" helper="e.g., light.turn_on" .value=${action.service || ""} data-field="${field}.service" @input=${this._changed}></ha-textfield>`}
          ${this._renderServiceDataEditor(field, action.service_data)}
        ` : ""}
        ${actionType === "more-info" || actionType === "toggle" ? this._renderEntityPicker("Entity", `${field}.entity`, action.entity || "", "Entity to show info for or toggle") : ""}
      </div>
    `;
  }

  _renderInfoTypeOptions() {
    const cfg = this._config;
    const infoType = cfg.info_type || "none";

    if (infoType === "none") return html``;

    // Shared positioning options
    const sharedOptions = html`
      <div class="section">Position</div>
      <ha-select label="Alignment" .value=${cfg.info_align || "right"} data-field="info_align" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
        <mwc-list-item value="left">Left</mwc-list-item>
        <mwc-list-item value="right">Right</mwc-list-item>
      </ha-select>

      <div class="inline-fields-2">
        <ha-textfield label="Horizontal offset (px)" type="number" .value=${String(cfg.info_offset_x ?? 5)} data-field="info_offset_x" @input=${this._changed}></ha-textfield>
        <ha-textfield label="Vertical offset (px)" type="number" .value=${String(cfg.info_offset_y ?? 40)} data-field="info_offset_y" @input=${this._changed}></ha-textfield>
      </div>

      <div class="section">Position (mobile phone)</div>
      <div class="inline-fields-2">
        <ha-textfield label="Mobile horizontal (px)" type="number" .value=${cfg.info_offset_x_mobile == null ? "" : String(cfg.info_offset_x_mobile)} data-field="info_offset_x_mobile" @input=${this._changed}></ha-textfield>
        <ha-textfield label="Mobile vertical (px)" type="number" .value=${cfg.info_offset_y_mobile == null ? "" : String(cfg.info_offset_y_mobile)} data-field="info_offset_y_mobile" @input=${this._changed}></ha-textfield>
      </div>
      <ha-textfield label="Mobile breakpoint (px)" type="number" .value=${String(cfg.mobile_breakpoint || 768)} data-field="mobile_breakpoint" @input=${this._changed}></ha-textfield>

      <div class="section">Font Style</div>
      <div class="inline-fields-2">
        <ha-textfield label="Font size (px)" type="number" .value=${String(cfg.info_size_px || 12)} data-field="info_size_px" @input=${this._changed}></ha-textfield>
        <ha-select label="Font weight" .value=${cfg.info_weight || "medium"} data-field="info_weight" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
          <mwc-list-item value="light">Light</mwc-list-item>
          <mwc-list-item value="regular">Regular</mwc-list-item>
          <mwc-list-item value="medium">Medium</mwc-list-item>
          <mwc-list-item value="semibold">Semi-bold</mwc-list-item>
          <mwc-list-item value="bold">Bold</mwc-list-item>
          <mwc-list-item value="black">Black</mwc-list-item>
        </ha-select>
      </div>

      ${this._renderColorPicker("Text color", "info_color", cfg.info_color)}

      <div class="section">Pill background</div>
      <div class="switch-row">
        <ha-switch .checked=${!!cfg.info_pill} data-field="info_pill" @change=${this._changed}></ha-switch>
        <span>Enable pill</span>
      </div>
      ${cfg.info_pill ? html`
        ${this._renderColorPicker("Pill background", "info_pill_background", cfg.info_pill_background)}
        <div class="inline-fields-2">
          <ha-textfield label="Padding X (px)" type="number" .value=${String(cfg.info_pill_padding_x ?? 10)} data-field="info_pill_padding_x" @input=${this._changed}></ha-textfield>
          <ha-textfield label="Padding Y (px)" type="number" .value=${String(cfg.info_pill_padding_y ?? 6)} data-field="info_pill_padding_y" @input=${this._changed}></ha-textfield>
        </div>
        <div class="inline-fields-2">
          <ha-textfield label="Radius (px)" type="number" .value=${String(cfg.info_pill_radius ?? 999)} data-field="info_pill_radius" @input=${this._changed}></ha-textfield>
          <ha-textfield label="Blur (px)" type="number" .value=${String(cfg.info_pill_blur ?? 0)} data-field="info_pill_blur" @input=${this._changed}></ha-textfield>
        </div>
      ` : ""}

      ${this._renderActionEditor("Tap action", "info_tap_action")}
    `;

    // Type-specific options
    if (infoType === "weather") {
      return html`
        <div class="section">Weather Settings</div>
        ${this._renderEntityPicker("Weather entity", "weather_entity", cfg.weather_entity, "Select a weather entity", "weather")}

        ${cfg.weather_entity ? html`
          <div class="section">Weather elements</div>
          <div class="inline-fields-3">
            <div class="switch-row"><ha-switch .checked=${cfg.weather_show_icon !== false} data-field="weather_show_icon" @change=${this._changed}></ha-switch><span>Icon</span></div>
            <div class="switch-row"><ha-switch .checked=${cfg.weather_show_condition !== false} data-field="weather_show_condition" @change=${this._changed}></ha-switch><span>Condition</span></div>
            <div class="switch-row"><ha-switch .checked=${cfg.weather_show_temperature !== false} data-field="weather_show_temperature" @change=${this._changed}></ha-switch><span>Temp</span></div>
            <div class="switch-row"><ha-switch .checked=${!!cfg.weather_show_humidity} data-field="weather_show_humidity" @change=${this._changed}></ha-switch><span>Humidity</span></div>
            <div class="switch-row"><ha-switch .checked=${!!cfg.weather_show_wind} data-field="weather_show_wind" @change=${this._changed}></ha-switch><span>Wind</span></div>
            <div class="switch-row"><ha-switch .checked=${!!cfg.weather_show_pressure} data-field="weather_show_pressure" @change=${this._changed}></ha-switch><span>Pressure</span></div>
          </div>

          <div class="section">Weather icon styling</div>
          <ha-textfield label="Icon pack path (SVG)" helper="Path to folder (e.g., /local/icons/weather)" .value=${cfg.weather_icon_pack_path || ""} data-field="weather_icon_pack_path" @input=${this._changed}></ha-textfield>
          
          <div class="switch-row">
            <ha-switch .checked=${cfg.weather_colored_icons !== false} data-field="weather_colored_icons" @change=${this._changed}></ha-switch>
            <span>Colored icons</span>
          </div>
          <div class="inline-fields-2">
            <ha-select label="Icon color mode" .value=${cfg.weather_icon_color_mode || "state"} data-field="weather_icon_color_mode" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
              <mwc-list-item value="state">By condition</mwc-list-item>
              <mwc-list-item value="custom">Custom</mwc-list-item>
              <mwc-list-item value="inherit">Inherit</mwc-list-item>
            </ha-select>
            <ha-select label="Icon animation" .value=${cfg.weather_animate_icon || "none"} data-field="weather_animate_icon" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
              <mwc-list-item value="none">None</mwc-list-item>
              <mwc-list-item value="float">Float</mwc-list-item>
              <mwc-list-item value="pulse">Pulse</mwc-list-item>
              <mwc-list-item value="spin">Spin</mwc-list-item>
            </ha-select>
          </div>
          ${cfg.weather_icon_color_mode === "custom" ? html`
            ${this._renderColorPicker("Custom icon color", "weather_icon_color", cfg.weather_icon_color)}
          ` : ""}

          ${sharedOptions}
        ` : html`
          <ha-alert alert-type="warning">Please select a weather entity to configure weather display.</ha-alert>
        `}
      `;
    }

    if (infoType === "datetime") {
      return html`
        <div class="section">Date & Time Settings</div>
        <div class="inline-fields-3">
          <div class="switch-row"><ha-switch .checked=${cfg.datetime_show_day !== false} data-field="datetime_show_day" @change=${this._changed}></ha-switch><span>Day</span></div>
          <div class="switch-row"><ha-switch .checked=${cfg.datetime_show_date !== false} data-field="datetime_show_date" @change=${this._changed}></ha-switch><span>Date</span></div>
          <div class="switch-row"><ha-switch .checked=${cfg.datetime_show_time !== false} data-field="datetime_show_time" @change=${this._changed}></ha-switch><span>Time</span></div>
        </div>

        <ha-textfield label="Time format" helper="HH:mm (24h) or h:mm A (12h)" .value=${cfg.datetime_time_format || "HH:mm"} data-field="datetime_time_format" @input=${this._changed}></ha-textfield>
        <ha-textfield label="Date format" helper="D MMM, DD/MM/YYYY, MMMM D, etc." .value=${cfg.datetime_date_format || "D MMM"} data-field="datetime_date_format" @input=${this._changed}></ha-textfield>
        <ha-textfield label="Separator" .value=${cfg.datetime_separator || " • "} data-field="datetime_separator" @input=${this._changed}></ha-textfield>

        <div class="section">Icon (optional)</div>
        ${this._renderIconPicker("Icon", "datetime_icon", cfg.datetime_icon, "Optional icon to display")}
        <div class="inline-fields-2">
          ${this._renderColorPicker("Icon color", "datetime_icon_color", cfg.datetime_icon_color)}
          <ha-select label="Icon animation" .value=${cfg.datetime_animate_icon || "none"} data-field="datetime_animate_icon" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
            <mwc-list-item value="none">None</mwc-list-item>
            <mwc-list-item value="float">Float</mwc-list-item>
            <mwc-list-item value="pulse">Pulse</mwc-list-item>
            <mwc-list-item value="spin">Spin</mwc-list-item>
          </ha-select>
        </div>

        ${sharedOptions}
      `;
    }

    if (infoType === "badge") {
      return html`
        <div class="section">Custom Badge Settings</div>
        ${this._renderTemplateEditor("Icon (supports Jinja2, e.g. mdi:home)", "badge_icon", { autocompleteIcons: true })}
        ${this._renderTemplateEditor("Text (supports Jinja2)", "badge_text")}

        <div class="inline-fields-2">
          ${this._renderColorPicker("Icon color", "badge_icon_color", cfg.badge_icon_color)}
          <ha-select label="Icon animation" .value=${cfg.badge_animate_icon || "none"} data-field="badge_animate_icon" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
            <mwc-list-item value="none">None</mwc-list-item>
            <mwc-list-item value="float">Float</mwc-list-item>
            <mwc-list-item value="pulse">Pulse</mwc-list-item>
            <mwc-list-item value="spin">Spin</mwc-list-item>
          </ha-select>
        </div>

        ${sharedOptions}
      `;
    }

    return html``;
  }

  render() {
    if (!this._config) return html``;

    const showCustomFont = this._config.font_family === "custom";

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

        ${this._renderTemplateEditor("Title (Accepts jinja2 templates)", "title")}
        ${this._renderTemplateEditor("Subtitle (Accepts jinja2 templates)", "subtitle")}

        <ha-select label="Text alignment" .value=${this._config.text_align} data-field="text_align" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
          <mwc-list-item value="left">Left</mwc-list-item>
          <mwc-list-item value="center">Center</mwc-list-item>
          <mwc-list-item value="right">Right</mwc-list-item>
        </ha-select>

        <div class="section">Colors</div>
        <div class="inline-fields-2">
          ${this._renderColorPicker("Title color", "title_color", this._config.title_color)}
          ${this._renderColorPicker("Subtitle color", "subtitle_color", this._config.subtitle_color)}
        </div>

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

        <div class="section">Info Display</div>
        <ha-select label="Display type" .value=${this._config.info_type || "none"} data-field="info_type" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
          <mwc-list-item value="none">None</mwc-list-item>
          <mwc-list-item value="weather">Weather</mwc-list-item>
          <mwc-list-item value="datetime">Date & Time</mwc-list-item>
          <mwc-list-item value="badge">Custom Badge</mwc-list-item>
        </ha-select>

        ${this._renderInfoTypeOptions()}

        <div class="section">Background</div>
        <ha-textfield label="Background (color/gradient/url)" helper="Auto-wraps image paths in url() - just enter /local/image.jpg or color value" .value=${this._config.background} data-field="background" @input=${this._changed}></ha-textfield>

        <ha-select label="Background position" .value=${this._config.background_position} data-field="background_position" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
          <mwc-list-item value="top">Top</mwc-list-item>
          <mwc-list-item value="center">Center</mwc-list-item>
          <mwc-list-item value="bottom">Bottom</mwc-list-item>
          <mwc-list-item value="left">Left</mwc-list-item>
          <mwc-list-item value="right">Right</mwc-list-item>
        </ha-select>

        <ha-select label="Background repeat" .value=${this._config.background_repeat} data-field="background_repeat" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
          <mwc-list-item value="no-repeat">No repeat</mwc-list-item>
          <mwc-list-item value="repeat">Repeat</mwc-list-item>
          <mwc-list-item value="repeat-x">Repeat horizontally</mwc-list-item>
          <mwc-list-item value="repeat-y">Repeat vertically</mwc-list-item>
        </ha-select>

        <ha-select label="Background size" .value=${this._config.background_size} data-field="background_size" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
          <mwc-list-item value="cover">Cover</mwc-list-item>
          <mwc-list-item value="contain">Contain</mwc-list-item>
          <mwc-list-item value="auto">Auto</mwc-list-item>
        </ha-select>

        <div class="inline-fields-2">
          <ha-textfield label="Min height (px)" type="number" .value=${String(this._config.min_height)} data-field="min_height" @input=${this._changed}></ha-textfield>
          <ha-textfield label="Max height (px)" type="number" .value=${String(this._config.max_height)} data-field="max_height" @input=${this._changed}></ha-textfield>
        </div>

        <div class="section">Blend</div>
        ${this._renderColorPicker("Blend color", "blend_color", this._config.blend_color)}
        <ha-textfield label="Blend stop (%)" type="number" .value=${String(this._config.blend_stop)} data-field="blend_stop" @input=${this._changed}></ha-textfield>

        <div class="section">Typography</div>
        <ha-select label="Font family" .value=${this._config.font_family} data-field="font_family" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
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

        <ha-select label="Font style" .value=${this._config.font_style} data-field="font_style" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
          <mwc-list-item value="normal">Normal</mwc-list-item>
          <mwc-list-item value="italic">Italic</mwc-list-item>
        </ha-select>

        <div class="inline-fields-2">
          <ha-textfield label="Title size (px)" type="number" .value=${String(this._config.title_size_px)} data-field="title_size_px" @input=${this._changed}></ha-textfield>
          <ha-textfield label="Subtitle size (px)" type="number" .value=${String(this._config.subtitle_size_px)} data-field="subtitle_size_px" @input=${this._changed}></ha-textfield>
        </div>

        <div class="inline-fields-2">
          <ha-select label="Title weight" .value=${this._config.title_weight} data-field="title_weight" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
            <mwc-list-item value="light">Light</mwc-list-item>
            <mwc-list-item value="regular">Regular</mwc-list-item>
            <mwc-list-item value="medium">Medium</mwc-list-item>
            <mwc-list-item value="semibold">Semi-bold</mwc-list-item>
            <mwc-list-item value="bold">Bold</mwc-list-item>
            <mwc-list-item value="black">Black</mwc-list-item>
          </ha-select>

          <ha-select label="Subtitle weight" .value=${this._config.subtitle_weight} data-field="subtitle_weight" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
            <mwc-list-item value="light">Light</mwc-list-item>
            <mwc-list-item value="regular">Regular</mwc-list-item>
            <mwc-list-item value="medium">Medium</mwc-list-item>
            <mwc-list-item value="semibold">Semi-bold</mwc-list-item>
            <mwc-list-item value="bold">Bold</mwc-list-item>
            <mwc-list-item value="black">Black</mwc-list-item>
          </ha-select>
        </div>

        <div class="section">Fixed header</div>
        <div class="switch-row">
          <ha-formfield label="Keep header fixed to top">
            <ha-switch .checked=${!!this._config.fixed} data-field="fixed" @change=${this._changed}></ha-switch>
          </ha-formfield>
        </div>

        ${this._config.fixed ? html`<ha-textfield label="Fixed top offset (px)" type="number" .value=${String(this._config.fixed_top)} data-field="fixed_top" @input=${this._changed}></ha-textfield>` : ""}

        <div class="section">Badge positioning</div>
        
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
      ha-textfield, ha-select, ha-combo-box, ha-navigation-picker, ha-entity-picker, ha-selector, ha-service-picker { width: 100%; }
      .code-wrap { display: flex; flex-direction: column; gap: 6px; }
      .code-label { font-size: 0.9rem; opacity: 0.9; }
      ha-code-editor { height: 180px; border-radius: 8px; overflow: hidden; }
      .color-field { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
      .color-field label { flex: 1; color: var(--secondary-text-color); }
      .color-field ha-selector { width: auto; }
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