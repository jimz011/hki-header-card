// HKI Header Card

import { LitElement, html, css } from "https://unpkg.com/lit@2.8.0/index.js?module";

const clamp = (n, min, max) => (Number.isFinite(n) ? Math.min(Math.max(n, min), max) : min);

const WEIGHT_MAP = Object.freeze({
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 900,
});

const FONT_FAMILY_MAP = Object.freeze({
  inherit: "inherit",
  system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  roboto: "Roboto, system-ui, sans-serif",
  inter: "Inter, system-ui, sans-serif",
  arial: "Arial, Helvetica, sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  mono:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
});

// Weather icons + default colors (colors can be overridden via theme vars)
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

function normalizeWeightKey(input, fallbackKey) {
  if (typeof input === "string" && WEIGHT_MAP[input]) return input;
  if (typeof input === "number" && Number.isFinite(input)) {
    let best = fallbackKey;
    let bestDist = Infinity;
    for (const [k, v] of Object.entries(WEIGHT_MAP)) {
      const d = Math.abs(v - input);
      if (d < bestDist) {
        best = k;
        bestDist = d;
      }
    }
    return best;
  }
  return fallbackKey;
}

function hashStringDjb2(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16);
}

function cacheKey(raw, vars) {
  const v = vars ? JSON.stringify(vars) : "";
  return `hkiHeaderTpl:${hashStringDjb2(`${raw}::${v}`)}`;
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
      _weatherState: { type: Object },
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
    this._weatherState = null;

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
    this._initialCheckTimer = null;
    this._editModeInterval = null;

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
      :host {
        display: block;
      }

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
        border-style: none;
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

      .weather-container {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--hki-header-text-color, #fff);
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
        z-index: 2;
      }

      .weather-clickable {
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .weather-clickable:hover {
        opacity: 0.8;
      }

      .weather-icon {
        --mdc-icon-size: var(--weather-icon-size, 32px);
        width: var(--weather-icon-size, 32px);
        height: var(--weather-icon-size, 32px);
        color: var(--hki-header-text-color, #fff);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
      }
      
      /* Ensure SVG images act like icons */
      img.weather-icon {
        object-fit: contain;
        display: block;
      }

      .weather-condition {
        text-transform: capitalize;
      }

      .weather-temperature {
        font-weight: 500;
      }

      /* Weather pill */
      .weather-pill {
        background: var(--hki-weather-pill-background, rgba(0, 0, 0, 0.25));
        border-radius: var(--hki-weather-pill-radius, 999px);
        padding: var(--hki-weather-pill-padding-y, 6px) var(--hki-weather-pill-padding-x, 10px);
        backdrop-filter: blur(var(--hki-weather-pill-blur, 0px));
        -webkit-backdrop-filter: blur(var(--hki-weather-pill-blur, 0px));
      }

      /* Weather icon animations */
      .animate-float {
        animation: hki-weather-float 3s ease-in-out infinite;
      }

      .animate-pulse {
        animation: hki-weather-pulse 1.8s ease-in-out infinite;
      }

      .animate-spin {
        animation: hki-weather-spin 2.8s linear infinite;
      }

      @keyframes hki-weather-float {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-4px);
        }
      }

      @keyframes hki-weather-pulse {
        0%,
        100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.08);
          opacity: 0.85;
        }
      }

      @keyframes hki-weather-spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
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
    if (this._rafMeasure) {
      cancelAnimationFrame(this._rafMeasure);
      this._rafMeasure = 0;
    }
    if (this._rafBadges) {
      cancelAnimationFrame(this._rafBadges);
      this._rafBadges = 0;
    }
    if (this._tpl.timer) {
      clearTimeout(this._tpl.timer);
      this._tpl.timer = 0;
    }
    if (this._kioskCheckInterval) {
      clearInterval(this._kioskCheckInterval);
      this._kioskCheckInterval = null;
    }
    if (this._kioskMutationObserver) {
      this._kioskMutationObserver.disconnect();
      this._kioskMutationObserver = null;
    }
    if (this._urlChangeHandler) {
      window.removeEventListener("popstate", this._urlChangeHandler);
      window.removeEventListener("hashchange", this._urlChangeHandler);
      this._urlChangeHandler = null;
    }
    if (this._visibilityHandler) {
      document.removeEventListener("visibilitychange", this._visibilityHandler);
      this._visibilityHandler = null;
    }
    if (this._focusHandler) {
      window.removeEventListener("focus", this._focusHandler);
      this._focusHandler = null;
    }
    if (this._initialCheckTimer) {
      clearTimeout(this._initialCheckTimer);
      this._initialCheckTimer = null;
    }

    if (this._editModeInterval) {
      clearInterval(this._editModeInterval);
      this._editModeInterval = null;
    }

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

    this._ro = new ResizeObserver(() => {
      this._debouncedMeasure(true);
      this._debouncedBadgesZIndex();
    });
    this._ro.observe(this);

    this._kioskMutationObserver = new MutationObserver(() => {
      this._detectKioskMode();
    });
    this._kioskMutationObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    this._kioskMutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    this._urlChangeHandler = () => {
      this._detectKioskMode();
      this._detectEditMode();
    };
    window.addEventListener("popstate", this._urlChangeHandler);
    window.addEventListener("hashchange", this._urlChangeHandler);

    this._visibilityHandler = () => {
      if (!document.hidden) {
        this._cachedHeader = null;
        this._detectKioskMode();
        setTimeout(() => this._detectKioskMode(), 100);
        setTimeout(() => this._detectKioskMode(), 300);
      }
    };
    document.addEventListener("visibilitychange", this._visibilityHandler);

    this._focusHandler = () => {
      this._cachedHeader = null;
      this._detectKioskMode();
      setTimeout(() => this._detectKioskMode(), 100);
    };
    window.addEventListener("focus", this._focusHandler);

    this._editModeInterval = setInterval(() => {
      this._detectEditMode();
    }, 1000);

    const initialChecks = [50, 150, 300, 600, 1000, 2000];
    initialChecks.forEach(delay => {
      setTimeout(() => {
        this._cachedHeader = null;
        this._detectKioskMode();
      }, delay);
    });

    this._kioskCheckInterval = setInterval(() => {
      this._detectKioskMode();
    }, 5000);

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

    if (
      vw !== this._viewportWidth ||
      rect.left !== this._offsetLeft ||
      rect.width !== this._contentWidth
    ) {
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
      if (
        tag === "hui-card-preview" ||
        tag === "hui-dialog-edit-card" ||
        tag === "ha-dialog" ||
        tag === "ha-dialog-scroller"
      ) {
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
      const huiRoot =
        document.querySelector("hui-root") ||
        document.querySelector("home-assistant")?.shadowRoot?.querySelector("hui-root");
      edit = !!(huiRoot?.lovelace?.editMode || huiRoot?.editMode);
    } catch (_) {
      // ignore
    }

    if (!edit) {
      try {
        edit =
          document.body?.classList?.contains("edit-mode") ||
          document.documentElement?.classList?.contains("edit-mode") ||
          !!document.querySelector("hui-dialog-edit-card") ||
          !!document.querySelector("hui-card-element-editor");
      } catch (_) {
        // ignore
      }
    }

    if (edit !== this._editMode) {
      this._editMode = edit;
      this.requestUpdate();
    }
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");

    const defaults = {
      title: "Header",
      subtitle: "",
      text_align: "left",
      title_color: "",
      subtitle_color: "",
      weather_color: "",
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
      badges_offset: 0,
      badges_gap: 0,
      weather_entity: "",
      weather_align: "right",
      weather_offset_x: 5,
      weather_offset_y: 40,
      weather_offset_x_mobile: null,
      weather_offset_y_mobile: null,
      mobile_breakpoint: 768,
      weather_size_px: 12,
      weather_weight: "medium",
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
      weather_pill: false,
      weather_pill_background: "rgba(0,0,0,0.25)",
      weather_pill_padding_x: 10,
      weather_pill_padding_y: 6,
      weather_pill_radius: 999,
      weather_pill_blur: 0,
      weather_tap_action: { action: "more-info" },
    };

    const m = { ...defaults, ...config };

    m.height_vh = clamp(Number(m.height_vh), 10, 100);
    m.min_height = clamp(Number(m.min_height), 60, 2000);
    m.max_height = clamp(Number(m.max_height), m.min_height, 4000);
    m.blend_stop = clamp(Number(m.blend_stop), 0, 100);

    m.fixed = !!m.fixed;
    m.fixed_top = Number.isFinite(+m.fixed_top) ? +m.fixed_top : 0;

    m.title_offset_x = Number.isFinite(+m.title_offset_x) ? +m.title_offset_x : 5;
    m.title_offset_y = Number.isFinite(+m.title_offset_y) ? +m.title_offset_y : 32;
    m.subtitle_offset_x = Number.isFinite(+m.subtitle_offset_x) ? +m.subtitle_offset_x : 5;
    m.subtitle_offset_y = Number.isFinite(+m.subtitle_offset_y) ? +m.subtitle_offset_y : 32;

    m.badges_offset_pinned = Number.isFinite(+m.badges_offset_pinned) ? +m.badges_offset_pinned : 48;
    m.badges_offset_unpinned = Number.isFinite(+m.badges_offset_unpinned) ? +m.badges_offset_unpinned : 100;
    m.badges_gap = Number.isFinite(+m.badges_gap) ? +m.badges_gap : 0;

    m.weather_offset_x = Number.isFinite(+m.weather_offset_x) ? +m.weather_offset_x : 5;
    m.weather_offset_y = Number.isFinite(+m.weather_offset_y) ? +m.weather_offset_y : 40;
    m.weather_offset_x_mobile =
      m.weather_offset_x_mobile === null || m.weather_offset_x_mobile === undefined || m.weather_offset_x_mobile === ""
        ? null
        : Number.isFinite(+m.weather_offset_x_mobile)
          ? +m.weather_offset_x_mobile
          : null;
    m.weather_offset_y_mobile =
      m.weather_offset_y_mobile === null || m.weather_offset_y_mobile === undefined || m.weather_offset_y_mobile === ""
        ? null
        : Number.isFinite(+m.weather_offset_y_mobile)
          ? +m.weather_offset_y_mobile
          : null;
    m.mobile_breakpoint = clamp(Number(m.mobile_breakpoint ?? 768), 240, 2500);
    m.weather_size_px = clamp(Number(m.weather_size_px ?? 12), 8, 64);
    m.weather_weight = normalizeWeightKey(m.weather_weight ?? "medium", "medium");
    m.weather_show_icon = m.weather_show_icon !== false;
    m.weather_show_condition = m.weather_show_condition !== false;
    m.weather_show_temperature = m.weather_show_temperature !== false;
    m.weather_show_humidity = !!m.weather_show_humidity;
    m.weather_show_wind = !!m.weather_show_wind;
    m.weather_show_pressure = !!m.weather_show_pressure;
    m.weather_colored_icons = m.weather_colored_icons !== false;
    m.weather_icon_color_mode = ["state", "custom", "inherit"].includes(m.weather_icon_color_mode)
      ? m.weather_icon_color_mode
      : "state";
    m.weather_animate_icon = ["none", "float", "pulse", "spin"].includes(m.weather_animate_icon)
      ? m.weather_animate_icon
      : "none";
    m.weather_pill = !!m.weather_pill;
    m.weather_pill_padding_x = clamp(Number(m.weather_pill_padding_x ?? 10), 0, 80);
    m.weather_pill_padding_y = clamp(Number(m.weather_pill_padding_y ?? 6), 0, 80);
    m.weather_pill_radius = clamp(Number(m.weather_pill_radius ?? 999), 0, 999);
    m.weather_pill_blur = clamp(Number(m.weather_pill_blur ?? 0), 0, 40);

    m.font_family =
      ["inherit", "system", "roboto", "inter", "arial", "georgia", "mono", "custom"].includes(
        m.font_family
      )
        ? m.font_family
        : "inherit";
    m.font_family_custom = typeof m.font_family_custom === "string" ? m.font_family_custom : "";
    m.font_style = ["normal", "italic"].includes(m.font_style) ? m.font_style : "normal";
    m.title_size_px = clamp(Number(m.title_size_px ?? 36), 8, 256);
    m.subtitle_size_px = clamp(Number(m.subtitle_size_px ?? 15), 8, 128);
    m.title_weight = normalizeWeightKey(m.title_weight ?? "bold", "bold");
    m.subtitle_weight = normalizeWeightKey(m.subtitle_weight ?? "medium", "medium");

    this._config = m;
    this._scheduleTemplateSetup(0);
    this._debouncedBadgesZIndex();
  }

  _isTemplateString(s) {
    if (typeof s !== "string") return false;
    const t = s.trim();
    return t.includes("{{") || t.includes("{%") || t.includes("{#");
  }

  _getUserVariable() {
    const u = this.hass?.user;
    return u?.name || u?.username || u?.id || "";
  }

  _buildTemplateVariables() {
    return {
      config: this._config ?? {},
      user: this._getUserVariable(),
    };
  }

  _scheduleTemplateSetup(delayMs = 0) {
    if (this._tpl.timer) clearTimeout(this._tpl.timer);
    this._tpl.timer = setTimeout(() => {
      this._tpl.timer = 0;
      this._setupTemplates();
    }, Math.max(0, delayMs));
  }

  _setupTemplates() {
    const titleRaw = this._config?.title ?? "";
    const subtitleRaw = this._config?.subtitle ?? "";
    this._setupTemplateKey("title", titleRaw);
    this._setupTemplateKey("subtitle", subtitleRaw);
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

      const st = this._tpl[key];
      if (st.seq !== seq) return;

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
        (msg) => this._onTemplateMsg(key, seq, raw, sig, msg),
        {
          type: "render_template",
          template: raw,
          variables: vars,
          strict: false,
          report_errors: false,
        }
      );

      const st = this._tpl[key];
      if (st.seq !== seq) {
        unsub?.();
        return;
      }
      st.unsub = unsub;
    } catch (err) {
      console.warn(`Template subscription failed for ${key}:`, err);
      this._renderTemplateOnce(key, seq, raw, vars, sig);
    }
  }

  _onTemplateMsg(key, seq, raw, sig, msg) {
    const st = this._tpl[key];
    if (st.seq !== seq) return;
    if (msg?.error) {
      console.warn(`Template update error for ${key}:`, msg.error);
      return;
    }

    const text = msg?.result == null ? "" : String(msg.result);
    this._setRendered(key, text);
    this._storeTemplateCache(sig, text);
  }

  _storeTemplateCache(sig, value) {
    try {
      sessionStorage.setItem(sig, value);
    } catch (_) {}
  }

  _setRendered(key, value) {
    const v = value == null ? "" : String(value);
    if (key === "title") {
      if (this._renderedTitle !== v) {
        this._renderedTitle = v;
        this.requestUpdate();
      }
    } else {
      if (this._renderedSubtitle !== v) {
        this._renderedSubtitle = v;
        this.requestUpdate();
      }
    }
  }

  _unsubscribeTemplate(key) {
    const st = this._tpl[key];
    if (!st) return;
    if (st.unsub) {
      try {
        st.unsub();
      } catch (_) {}
    }
    st.unsub = null;
  }

  _resolveFontFamily() {
    const k = this._config?.font_family ?? "inherit";
    if (k === "custom") return (this._config?.font_family_custom || "").trim() || "inherit";
    return FONT_FAMILY_MAP[k] ?? "inherit";
  }

  _resolveWeight(key) {
    const k = this._config?.[key];
    return WEIGHT_MAP[k] ?? 400;
  }

  _resolveBackground(bg) {
    if (!bg || typeof bg !== "string") return bg;
    const trimmed = bg.trim();
    
    if (trimmed.startsWith("url(") || trimmed.startsWith("linear-gradient(") || trimmed.startsWith("radial-gradient(")) {
      return trimmed;
    }
    
    const isPath = trimmed.startsWith("/") || 
                   trimmed.startsWith("./") || 
                   trimmed.startsWith("../") ||
                   trimmed.startsWith("http://") || 
                   trimmed.startsWith("https://") ||
                   /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(trimmed);
    
    return isPath ? `url('${trimmed}')` : trimmed;
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

    if (!effectiveFixed) {
      this._resetBadgesZIndex();
      return;
    }

    const el = this._findHaBadgesElement();
    if (!el) {
      this._resetBadgesZIndex();
      return;
    }

    if (el !== this._badgesEl) {
      this._resetBadgesZIndex();
      this._badgesEl = el;
    }

    const kioskAdjustment = this._kioskMode ? 0 : 48;
    const badgesOffset = cfg.badges_fixed ? (cfg.badges_offset_pinned || 48) : (cfg.badges_offset_unpinned || 100);
    const topPosition = Math.max(0, (this._headerHeight || 0) - badgesOffset + (cfg.fixed_top || 0) + kioskAdjustment);

    if (cfg.badges_fixed) {
      el.style.position = "fixed";
      el.style.top = `${topPosition}px`;
      el.style.left = `${this._offsetLeft}px`;
      el.style.width = `${this._contentWidth}px`;
      el.style.zIndex = "2";
      el.style.marginBottom = "";
    } else {
      el.style.position = "relative";
      el.style.left = "";
      el.style.width = "";
      el.style.zIndex = "0";
      const kioskGapAdjustment = this._kioskMode ? 48 : 0;
      const effectiveGap = (cfg.badges_gap || 0) + kioskGapAdjustment;
      el.style.marginBottom = `${effectiveGap}px`;
    }
  }

  _resetBadgesZIndex() {
    if (this._badgesEl) {
      try {
        this._badgesEl.style.position = "";
        this._badgesEl.style.top = "";
        this._badgesEl.style.left = "";
        this._badgesEl.style.width = "";
        this._badgesEl.style.right = "";
        this._badgesEl.style.zIndex = "";
        this._badgesEl.style.marginBottom = "";
      } catch (_) {}
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
      const hit = (sr && sr.querySelector?.(selectors)) || host.querySelector?.(selectors);
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
      try {
        const v = JSON.parse(raw);
        return v && typeof v === "object" ? v : {};
      } catch (_) {
        // fall through
      }
    }

    try {
      const loader = window?.jsyaml?.load;
      if (typeof loader === "function") {
        const v = loader(raw);
        return v && typeof v === "object" ? v : {};
      }
    } catch (_) {
      // fall through
    }

    const out = {};
    raw.split("\n").forEach((line) => {
      const t = String(line || "").trim();
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
          const navEvent = new Event("location-changed", {
            bubbles: true,
            composed: true,
          });
          navEvent.detail = { replace: false };
          window.dispatchEvent(navEvent);
        }
        break;
        
      case "url":
        if (action.url_path) {
          window.open(action.url_path, "_blank");
        }
        break;
        
      case "call-service":
        if (action.service) {
          const [domain, service] = action.service.split(".");
          if (domain && service) {
            const data = this._parseServiceData(action.service_data);
            this.hass.callService(domain, service, data);
          }
        }
        break;
        
      case "more-info":
        const entity = action.entity || this._config.weather_entity;
        if (entity) {
          const moreInfoEvent = new Event("hass-more-info", {
            bubbles: true,
            composed: true,
          });
          moreInfoEvent.detail = { entityId: entity };
          this.dispatchEvent(moreInfoEvent);
        }
        break;
        
      case "toggle":
        const toggleEntity = action.entity || this._config.weather_entity;
        if (toggleEntity) {
          this.hass.callService("homeassistant", "toggle", {
            entity_id: toggleEntity,
          });
        }
        break;
    }
  }

  _renderWeather() {
    if (!this._config.weather_entity || !this.hass) return html``;

    const weatherEntity = this.hass.states[this._config.weather_entity];
    if (!weatherEntity) return html``;

    const cfg = this._config;
    const state = weatherEntity.state;
    const attrs = weatherEntity.attributes || {};

    const isMobile =
      Number.isFinite(this._viewportWidth) && this._viewportWidth > 0
        ? this._viewportWidth <= (cfg.mobile_breakpoint || 768)
        : false;

    const offsetX =
      isMobile && cfg.weather_offset_x_mobile !== null && cfg.weather_offset_x_mobile !== undefined
        ? cfg.weather_offset_x_mobile
        : cfg.weather_offset_x;
    const offsetY =
      isMobile && cfg.weather_offset_y_mobile !== null && cfg.weather_offset_y_mobile !== undefined
        ? cfg.weather_offset_y_mobile
        : cfg.weather_offset_y;

    const icon = WEATHER_ICON_MAP[state] || "mdi:weather-partly-cloudy";
    const iconColor =
      cfg.weather_icon_color_mode === "custom" && String(cfg.weather_icon_color || "").trim()
        ? String(cfg.weather_icon_color).trim()
        : cfg.weather_icon_color_mode === "inherit" || !cfg.weather_colored_icons
          ? "inherit"
          : WEATHER_COLOR_MAP[state] || "inherit";

    const conditionText = String(state || "").replace(/-/g, " ");

    const temperature = attrs.temperature;
    const tempUnit = this.hass.config.unit_system.temperature;

    const humidity = attrs.humidity;

    const windSpeed = attrs.wind_speed;
    const speedUnit = this.hass.config.unit_system.speed || attrs.wind_speed_unit || "";

    const pressure = attrs.pressure;
    const pressureUnit = this.hass.config.unit_system.pressure || attrs.pressure_unit || "";

    // Typography
    const fontFamily = this._resolveFontFamily();
    const fontStyle = cfg.font_style || "normal";
    const weatherFontSize = cfg.weather_size_px || 12;
    const weatherWeight = this._resolveWeight("weather_weight");
    const weatherColor = String(cfg.weather_color || "").trim() || "var(--hki-header-text-color, #fff)";
    const weatherInline = `font-family:${fontFamily};font-style:${fontStyle};font-size:${weatherFontSize}px;font-weight:${weatherWeight};color:${weatherColor};`;

    // Icon size scales with font size (2x for good proportion)
    const iconSize = Math.round(weatherFontSize * 2);

    // Position
    let weatherStyle = "";
    if (cfg.weather_align === "left") {
      weatherStyle = `left:${offsetX}px;top:${offsetY}px;--weather-icon-size:${iconSize}px;`;
    } else {
      weatherStyle = `right:${offsetX}px;top:${offsetY}px;--weather-icon-size:${iconSize}px;`;
    }

    // Weather pill vars
    const pillStyle = cfg.weather_pill
      ? `--hki-weather-pill-background:${cfg.weather_pill_background};--hki-weather-pill-padding-x:${cfg.weather_pill_padding_x}px;--hki-weather-pill-padding-y:${cfg.weather_pill_padding_y}px;--hki-weather-pill-radius:${cfg.weather_pill_radius}px;--hki-weather-pill-blur:${cfg.weather_pill_blur}px;`
      : "";

    const handleTap = (e) => {
      e.stopPropagation();
      if (cfg.weather_tap_action) this._handleAction(cfg.weather_tap_action);
    };

    const hasAction = cfg.weather_tap_action && cfg.weather_tap_action.action !== "none";
    const baseClass = hasAction ? "weather-container weather-clickable" : "weather-container";
    const pillClass = cfg.weather_pill ? "weather-pill" : "";

    const iconAnimClass =
      cfg.weather_animate_icon === "float"
        ? "animate-float"
        : cfg.weather_animate_icon === "pulse"
          ? "animate-pulse"
          : cfg.weather_animate_icon === "spin"
            ? "animate-spin"
            : "";
            
    // Animated SVG logic
    const useSvg = !!cfg.weather_icon_pack_path;
    const svgUrl = useSvg ? `${cfg.weather_icon_pack_path}/${state}.svg` : "";

    return html`
      <div class="${baseClass} ${pillClass}" style="${weatherStyle}${weatherInline}${pillStyle}" @click=${handleTap}>
        ${cfg.weather_show_icon
          ? useSvg 
            ? html`<img src="${svgUrl}" class="weather-icon ${iconAnimClass}" style="width: ${iconSize}px; height: ${iconSize}px;" alt="${state}" />`
            : html`<ha-icon icon="${icon}" class="weather-icon ${iconAnimClass}" style="color:${iconColor};"></ha-icon>`
          : html``}

        ${cfg.weather_show_condition ? html`<span class="weather-condition">${conditionText}</span>` : html``}

        ${cfg.weather_show_temperature && Number.isFinite(+temperature)
          ? html`<span class="weather-temperature">${Math.round(+temperature)}${tempUnit}</span>`
          : html``}

        ${cfg.weather_show_humidity && Number.isFinite(+humidity)
          ? html`<span class="weather-humidity">${Math.round(+humidity)}%</span>`
          : html``}

        ${cfg.weather_show_wind && Number.isFinite(+windSpeed)
          ? html`<span class="weather-wind">${Math.round(+windSpeed)}${speedUnit ? " " + speedUnit : ""}</span>`
          : html``}

        ${cfg.weather_show_pressure && Number.isFinite(+pressure)
          ? html`<span class="weather-pressure">${Math.round(+pressure)}${pressureUnit ? " " + pressureUnit : ""}</span>`
          : html``}
      </div>
    `;
  }

  render() {
    if (!this._config) return html``;

    const cfg = this._config;
    const effectiveFixed = !!cfg.fixed && !this._inPreview;

    const titleText = this._isTemplateString(cfg.title) ? (this._renderedTitle ?? "") : (cfg.title ?? "");
    const subtitleText = this._isTemplateString(cfg.subtitle) ? (this._renderedSubtitle ?? "") : (cfg.subtitle ?? "");
    const subtitleVisible = !!String(subtitleText || "").trim();

    const cardWidth = this._inPreview ? "100%" : "100vw";

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
    ].filter(Boolean).join(";");

    const overlayStyle = `background:linear-gradient(to bottom, transparent 0%, ${cfg.blend_color} ${cfg.blend_stop}%, ${cfg.blend_color} 100%);`;
    const contentStyle = `margin-left:${this._offsetLeft}px;width:${this._contentWidth}px;`;

    const fontFamily = this._resolveFontFamily();
    const fontStyle = cfg.font_style || "normal";
    const titleColor = String(cfg.title_color || "").trim() || "var(--hki-header-text-color, #fff)";
    const subtitleColor = String(cfg.subtitle_color || "").trim() || "var(--hki-header-text-color, #fff)";
    const titleInline = `font-family:${fontFamily};font-style:${fontStyle};font-size:${cfg.title_size_px}px;font-weight:${this._resolveWeight("title_weight")};color:${titleColor};`;
    const subtitleInline = `font-family:${fontFamily};font-style:${fontStyle};font-size:${cfg.subtitle_size_px}px;font-weight:${this._resolveWeight("subtitle_weight")};color:${subtitleColor};`;

    const subtitleOffsetX = (cfg.subtitle_offset_x || 0) - (cfg.title_offset_x || 0);
    const subtitleOffsetY = (cfg.subtitle_offset_y || 0) - (cfg.title_offset_y || 0);
    const subtitleTransform = `transform:translate(${subtitleOffsetX}px, ${subtitleOffsetY}px);`;

    let titleBlockStyle = "";
    if (cfg.text_align === "right") titleBlockStyle = `left:auto;right:${cfg.title_offset_x}px;top:${cfg.title_offset_y}px;text-align:right;align-items:flex-end;`;
    else if (cfg.text_align === "center") titleBlockStyle = `left:50%;top:${cfg.title_offset_y}px;transform:translateX(-50%);text-align:center;align-items:center;`;
    else titleBlockStyle = `left:${cfg.title_offset_x}px;top:${cfg.title_offset_y}px;text-align:left;align-items:flex-start;`;

    const topOffset = this._kioskMode ? (cfg.fixed_top || 0) : (cfg.fixed_top || 0) + 48;
    const wrapperStyle = effectiveFixed ? `top:${topOffset}px;` : "";
    
    const badgesOffset = cfg.badges_fixed ? (cfg.badges_offset_pinned || 48) : (cfg.badges_offset_unpinned || 100);
    
    let spacerH = effectiveFixed 
      ? Math.max(0, (this._headerHeight || 0) - badgesOffset + topOffset)
      : 0;
    
    if (cfg.badges_fixed && effectiveFixed) {
      const kioskGapAdjustment = this._kioskMode ? 48 : 0;
      const pinnedGapAdjustment = -48;
      const effectiveBadgesGap = (cfg.badges_gap || 0) + kioskGapAdjustment + pinnedGapAdjustment;
      spacerH += effectiveBadgesGap;
    }

    const cardMarkup = html`
      <ha-card class="header" style=${cardStyle} aria-label=${titleText || "Header"}>
        <div class="overlay" style=${overlayStyle}></div>
        <div class="content" style=${contentStyle}>
          <div class="title-block" style=${titleBlockStyle}>
            <div class="title" style=${titleInline} role="heading" aria-level="1">${titleText}</div>
            ${subtitleVisible ? html`<div class="subtitle" style="${subtitleInline}${subtitleTransform}">${subtitleText}</div>` : html``}
          </div>
          ${this._renderWeather()}
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
      title: "{% if is_state('sun.sun','above_horizon') %}Good day, {{ user }}{% else %}Good evening, {{ user }}{% endif %}",
      subtitle: "{{ now().strftime('%A %H:%M') }}",
      text_align: "left",
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
      title_color: "",
      subtitle_color: "",
      weather_color: "",
      title_offset_x: 5,
      title_offset_y: 32,
      subtitle_offset_x: 5,
      subtitle_offset_y: 32,
      badges_offset_pinned: 48,
      badges_offset_unpinned: 100,
      badges_gap: 0,
      badges_fixed: false,
      font_family: "roboto",
      font_style: "normal",
      title_size_px: 36,
      subtitle_size_px: 15,
      title_weight: "bold",
      subtitle_weight: "medium",
      weather_entity: "",
      weather_align: "right",
      weather_offset_x: 5,
      weather_offset_y: 40,
      weather_offset_x_mobile: null,
      weather_offset_y_mobile: null,
      mobile_breakpoint: 768,
      weather_size_px: 12,
      weather_weight: "medium",
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
      weather_pill: false,
      weather_pill_background: "rgba(0,0,0,0.25)",
      weather_pill_padding_x: 10,
      weather_pill_padding_y: 6,
      weather_pill_radius: 999,
      weather_pill_blur: 0,
      weather_tap_action: { action: "more-info" },
    };
  }

  static getCardSize() {
    return 3;
  }
}

customElements.define("hki-header-card", HkiHeaderCard);

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
    this._config = {
      title: "",
      subtitle: "",
      text_align: "left",
      title_color: "",
      subtitle_color: "",
      weather_color: "",

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

      // Weather
      weather_entity: "",
      weather_align: "right",
      weather_offset_x: 5,
      weather_offset_y: 40,
      weather_offset_x_mobile: null,
      weather_offset_y_mobile: null,
      mobile_breakpoint: 768,
      weather_size_px: 12,
      weather_weight: "medium",
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
      weather_pill: false,
      weather_pill_background: "rgba(0,0,0,0.25)",
      weather_pill_padding_x: 10,
      weather_pill_padding_y: 6,
      weather_pill_radius: 999,
      weather_pill_blur: 0,
      weather_tap_action: { action: "more-info" },
      ...config,
    };
  }

  _renderEntityPicker(label, field, value, helper = "", domain = null) {
    // Strictly use ha-selector with entity type for consistent dropdowns
    return html`
      <ha-selector
        .hass=${this.hass}
        .selector=${{ entity: { domain: domain } }}
        .value=${value || ""}
        .label=${label}
        .helper=${helper}
        @value-changed=${(ev) => this._changed(ev, field)}
      ></ha-selector>
    `;
  }

  _renderNavigationPicker(label, field, value, helper = "") {
    // Strictly use ha-selector with navigation type
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

  _val(ev) {
    return ev.detail?.value ?? ev.target?.value;
  }

  _changed(ev, explicitField = null) {
    ev.stopPropagation();
    const field = explicitField || ev.target?.dataset?.field;
    if (!field || !this._config) return;

    let value = this._val(ev);

    const numeric = new Set([
      "height_vh",
      "min_height",
      "max_height",
      "blend_stop",
      "fixed_top",
      "title_offset_x",
      "title_offset_y",
      "subtitle_offset_x",
      "subtitle_offset_y",
      "title_size_px",
      "subtitle_size_px",
      "badges_offset_pinned",
      "badges_offset_unpinned",
      "badges_gap",
      "weather_offset_x",
      "weather_offset_y",
      "weather_size_px",
      "mobile_breakpoint",
      "weather_pill_padding_x",
      "weather_pill_padding_y",
      "weather_pill_radius",
      "weather_pill_blur",
    ]);

    const nullableNumeric = new Set(["weather_offset_x_mobile", "weather_offset_y_mobile"]);

    if (nullableNumeric.has(field)) {
      if (value === "" || value === null || value === undefined) {
        value = null;
      } else {
        const n = Number(value);
        if (!Number.isFinite(n)) return;
        value = n;
      }
    } else if (numeric.has(field)) {
      const n = Number(value);
      if (!Number.isFinite(n)) return;
      value = n;
    }

    const bools = new Set([
      "fixed",
      "badges_fixed",
      "weather_show_icon",
      "weather_show_condition",
      "weather_show_temperature",
      "weather_show_humidity",
      "weather_show_wind",
      "weather_show_pressure",
      "weather_colored_icons",
      "weather_pill",
    ]);
    if (bools.has(field)) value = !!(ev.target?.checked ?? value);

    let next;
    
    if (field.includes(".")) {
      const parts = field.split(".");
      const rootField = parts[0];
      const subField = parts[1];
      
      const currentValue = this._config[rootField] || {};
      
      next = {
        ...this._config,
        [rootField]: {
          ...currentValue,
          [subField]: value
        }
      };

      if (subField === "action" && value === "call-service") {
        next[rootField] = {
          ...next[rootField],
          service: next[rootField].service ?? "",
          service_data: next[rootField].service_data ?? "entity_id: \n",
        };
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

  _renderTemplateEditor(label, field, rows = 6) {
    const value = this._config?.[field] ?? "";
    // Forced usage of ha-code-editor (no fallback)
    return html`
      <div class="code-wrap">
        <div class="code-label">${label}</div>
        <ha-code-editor .hass=${this.hass} .value=${value} mode="jinja2" data-field=${field} @value-changed=${this._changed}></ha-code-editor>
      </div>
    `;
  }

  _renderServiceDataEditor(field, serviceData) {
    let value = "";
    if (serviceData) {
      if (typeof serviceData === 'string') {
        value = serviceData;
      } else {
        value = Object.entries(serviceData)
          .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
          .join('\n');
      }
    }
    
    // Forced usage of ha-code-editor with autocomplete attributes
    // Added both property binding and attribute as requested
    return html`
      <div class="code-wrap">
        <div class="code-label">Service data (YAML)</div>
        <ha-code-editor 
          .hass=${this.hass} 
          .value=${value} 
          mode="yaml" 
          ?autocomplete-entities=${true}
          ?autocomplete-icons=${true}
          data-field="${field}.service_data" 
          @value-changed=${this._changed}>
        </ha-code-editor>
      </div>
    `;
  }

_renderActionEditor(label, field) {
    const action = this._config?.[field] || { action: "more-info" };
    const actionType = action.action || "more-info";
    
    // Check if the native service picker is available in this context
    const hasServicePicker = !!customElements.get("ha-service-picker");

    return html`
      <div class="code-wrap">
        <div class="code-label">${label}</div>
        <ha-select 
          label="Action type" 
          .value=${actionType} 
          data-field="${field}.action" 
          @selected=${this._changed} 
          @closed=${this._changed} 
          @value-changed=${this._changed}>
          <mwc-list-item value="none">None</mwc-list-item>
          <mwc-list-item value="navigate">Navigate</mwc-list-item>
          <mwc-list-item value="url">URL</mwc-list-item>
          <mwc-list-item value="call-service">Call service</mwc-list-item>
          <mwc-list-item value="more-info">More info</mwc-list-item>
          <mwc-list-item value="toggle">Toggle</mwc-list-item>
        </ha-select>
        
        ${actionType === "navigate" ? html`
          ${this._renderNavigationPicker(
            "Navigation path",
            `${field}.navigation_path`,
            action.navigation_path || "",
            "Pick a view or enter a custom path"
          )}
        ` : ""}
        
        ${actionType === "url" ? html`
          <ha-textfield 
            label="URL" 
            .value=${action.url_path || ""} 
            data-field="${field}.url_path" 
            @input=${this._changed}>
          </ha-textfield>
        ` : ""}
        
        ${actionType === "call-service" ? html`
          ${hasServicePicker
            ? html`
                <ha-service-picker
                  style="width: 100%; display: block;"
                  .hass=${this.hass}
                  .value=${action.service || ""}
                  @value-changed=${(ev) => this._changed(ev, `${field}.service`)}
                ></ha-service-picker>`
            : html`
                <ha-textfield 
                  label="Service" 
                  helper="e.g., light.turn_on"
                  .value=${action.service || ""} 
                  data-field="${field}.service" 
                  @input=${this._changed}>
                </ha-textfield>`
          }
          ${this._renderServiceDataEditor(field, action.service_data)}
        ` : ""}
        
        ${actionType === "more-info" || actionType === "toggle" ? html`
          ${this._renderEntityPicker(
            "Entity",
            `${field}.entity`,
            action.entity || "",
            "Leave empty to use the weather entity"
          )}
        ` : ""}
      </div>
    `;
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

        ${this._renderTemplateEditor("Title (Accepts jinja2 templates)", "title", 8)}
        ${this._renderTemplateEditor("Subtitle (Accepts jinja2 templates)", "subtitle", 6)}

        <ha-select label="Text alignment" .value=${this._config.text_align} data-field="text_align" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
          <mwc-list-item value="left">Left</mwc-list-item>
          <mwc-list-item value="center">Center</mwc-list-item>
          <mwc-list-item value="right">Right</mwc-list-item>
        </ha-select>

        <div class="section">Colors</div>
        <div class="inline-fields-3">
          <ha-textfield label="Title color (CSS)" placeholder="inherit" .value=${this._config.title_color || ""} data-field="title_color" @input=${this._changed}></ha-textfield>
          <ha-textfield label="Subtitle color (CSS)" placeholder="inherit" .value=${this._config.subtitle_color || ""} data-field="subtitle_color" @input=${this._changed}></ha-textfield>
          <ha-textfield label="Weather color (CSS)" placeholder="inherit" .value=${this._config.weather_color || ""} data-field="weather_color" @input=${this._changed}></ha-textfield>
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

        <div class="section">Weather</div>
        ${this._renderEntityPicker(
          "Weather entity",
          "weather_entity",
          this._config.weather_entity,
          "Optional: Add a weather entity to display conditions (e.g., weather.home)",
          "weather"
        )}

        ${this._config.weather_entity ? html`
          <ha-select label="Weather alignment" .value=${this._config.weather_align || "right"} data-field="weather_align" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
            <mwc-list-item value="left">Left</mwc-list-item>
            <mwc-list-item value="right">Right</mwc-list-item>
          </ha-select>

          <div class="inline-fields-2">
            <ha-textfield label="Weather horizontal offset (px)" type="number" .value=${String(this._config.weather_offset_x !== undefined ? this._config.weather_offset_x : 5)} data-field="weather_offset_x" @input=${this._changed}></ha-textfield>
            <ha-textfield label="Weather vertical offset (px)" type="number" .value=${String(this._config.weather_offset_y !== undefined ? this._config.weather_offset_y : 40)} data-field="weather_offset_y" @input=${this._changed}></ha-textfield>
          </div>

          <div class="section">Mobile weather offset</div>
          <div class="inline-fields-2">
            <ha-textfield label="Mobile horizontal offset (px)" type="number" .value=${this._config.weather_offset_x_mobile == null ? "" : String(this._config.weather_offset_x_mobile)} data-field="weather_offset_x_mobile" @input=${this._changed}></ha-textfield>
            <ha-textfield label="Mobile vertical offset (px)" type="number" .value=${this._config.weather_offset_y_mobile == null ? "" : String(this._config.weather_offset_y_mobile)} data-field="weather_offset_y_mobile" @input=${this._changed}></ha-textfield>
          </div>
          <ha-textfield label="Mobile breakpoint (px)" type="number" .value=${String(this._config.mobile_breakpoint || 768)} data-field="mobile_breakpoint" @input=${this._changed}></ha-textfield>

          <div class="section">Weather elements</div>
          <div class="inline-fields-3">
            <div class="switch-row"><ha-switch .checked=${this._config.weather_show_icon !== false} data-field="weather_show_icon" @change=${this._changed}></ha-switch><span>Icon</span></div>
            <div class="switch-row"><ha-switch .checked=${this._config.weather_show_condition !== false} data-field="weather_show_condition" @change=${this._changed}></ha-switch><span>Condition</span></div>
            <div class="switch-row"><ha-switch .checked=${this._config.weather_show_temperature !== false} data-field="weather_show_temperature" @change=${this._changed}></ha-switch><span>Temp</span></div>
            <div class="switch-row"><ha-switch .checked=${!!this._config.weather_show_humidity} data-field="weather_show_humidity" @change=${this._changed}></ha-switch><span>Humidity</span></div>
            <div class="switch-row"><ha-switch .checked=${!!this._config.weather_show_wind} data-field="weather_show_wind" @change=${this._changed}></ha-switch><span>Wind</span></div>
            <div class="switch-row"><ha-switch .checked=${!!this._config.weather_show_pressure} data-field="weather_show_pressure" @change=${this._changed}></ha-switch><span>Pressure</span></div>
          </div>

          <div class="section">Weather icon styling</div>
          <ha-textfield label="Icon pack path (SVG)" helper="Path to folder (e.g., /local/icons/weather). Images must match state name (e.g., sunny.svg)" .value=${this._config.weather_icon_pack_path || ""} data-field="weather_icon_pack_path" @input=${this._changed}></ha-textfield>
          
          <div class="switch-row">
            <ha-switch .checked=${this._config.weather_colored_icons !== false} data-field="weather_colored_icons" @change=${this._changed}></ha-switch>
            <span>Colored icons</span>
          </div>
          <div class="inline-fields-2">
            <ha-select label="Icon color mode" .value=${this._config.weather_icon_color_mode || "state"} data-field="weather_icon_color_mode" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
              <mwc-list-item value="state">By condition</mwc-list-item>
              <mwc-list-item value="custom">Custom</mwc-list-item>
              <mwc-list-item value="inherit">Inherit</mwc-list-item>
            </ha-select>
            <ha-select label="Icon animation" .value=${this._config.weather_animate_icon || "none"} data-field="weather_animate_icon" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
              <mwc-list-item value="none">None</mwc-list-item>
              <mwc-list-item value="float">Float</mwc-list-item>
              <mwc-list-item value="pulse">Pulse</mwc-list-item>
              <mwc-list-item value="spin">Spin</mwc-list-item>
            </ha-select>
          </div>
          ${String(this._config.weather_icon_color_mode || "state") === "custom" ? html`
            <ha-textfield label="Custom icon color (CSS)" helper="e.g., #ffcc00 or var(--accent-color)" .value=${this._config.weather_icon_color || ""} data-field="weather_icon_color" @input=${this._changed}></ha-textfield>
          ` : html``}

          <div class="section">Weather pill background</div>
          <div class="switch-row">
            <ha-switch .checked=${!!this._config.weather_pill} data-field="weather_pill" @change=${this._changed}></ha-switch>
            <span>Enable pill</span>
          </div>
          ${this._config.weather_pill ? html`
            <ha-textfield label="Pill background (CSS)" .value=${this._config.weather_pill_background || "rgba(0,0,0,0.25)"} data-field="weather_pill_background" @input=${this._changed}></ha-textfield>
            <div class="inline-fields-2">
              <ha-textfield label="Padding X (px)" type="number" .value=${String(this._config.weather_pill_padding_x ?? 10)} data-field="weather_pill_padding_x" @input=${this._changed}></ha-textfield>
              <ha-textfield label="Padding Y (px)" type="number" .value=${String(this._config.weather_pill_padding_y ?? 6)} data-field="weather_pill_padding_y" @input=${this._changed}></ha-textfield>
            </div>
            <div class="inline-fields-2">
              <ha-textfield label="Radius (px)" type="number" .value=${String(this._config.weather_pill_radius ?? 999)} data-field="weather_pill_radius" @input=${this._changed}></ha-textfield>
              <ha-textfield label="Blur (px)" type="number" .value=${String(this._config.weather_pill_blur ?? 0)} data-field="weather_pill_blur" @input=${this._changed}></ha-textfield>
            </div>
          ` : html``}

          <div class="inline-fields-2">
            <ha-textfield label="Weather size (px)" type="number" .value=${String(this._config.weather_size_px || 12)} data-field="weather_size_px" @input=${this._changed}></ha-textfield>
            <ha-select label="Weather weight" .value=${this._config.weather_weight || "medium"} data-field="weather_weight" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
              <mwc-list-item value="light">Light</mwc-list-item>
              <mwc-list-item value="regular">Regular</mwc-list-item>
              <mwc-list-item value="medium">Medium</mwc-list-item>
              <mwc-list-item value="semibold">Semi-bold</mwc-list-item>
              <mwc-list-item value="bold">Bold</mwc-list-item>
              <mwc-list-item value="black">Black</mwc-list-item>
            </ha-select>
          </div>

          ${this._renderActionEditor("Weather tap action", "weather_tap_action")}
        ` : html``}

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
        <ha-textfield label="Blend color (CSS)" .value=${this._config.blend_color} data-field="blend_color" @input=${this._changed}></ha-textfield>
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

        ${showCustomFont ? html`<ha-textfield label="Custom font-family (CSS)" .value=${this._config.font_family_custom} data-field="font_family_custom" @input=${this._changed}></ha-textfield>` : html``}

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

        ${this._config.fixed ? html`<ha-textfield label="Fixed top offset (px)" type="number" .value=${String(this._config.fixed_top)} data-field="fixed_top" @input=${this._changed}></ha-textfield>` : html``}

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
          : html`<ha-textfield label="Badges vertical offset when unpinned (px)" helper="Negative values pull badges up (into header), positive values push down" type="number" .value=${String(this._config.badges_offset_unpinned)} data-field="badges_offset_unpinned" @input=${this._changed}></ha-textfield>`
        }
        
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

      .disclaimer {
        margin-bottom: 8px;
      }

      .disclaimer ha-alert {
        margin-bottom: 0;
      }

      .disclaimer a {
        color: var(--primary-color);
        text-decoration: none;
      }

      .disclaimer a:hover {
        text-decoration: underline;
      }

      .badge-warning {
        margin-bottom: 12px;
      }

      .section {
        margin-top: 8px;
        font-weight: 600;
      }

      .switch-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .inline-fields-2 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .inline-fields-3 {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }

      ha-textfield,
      ha-select,
      ha-combo-box,
      ha-navigation-picker,
      ha-entity-picker,
      ha-selector,
      ha-service-picker {
        width: 100%;
      }

      .helper-text {
        font-size: 0.75rem;
        opacity: 0.7;
        margin-top: -2px;
      }

      .code-wrap {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .code-label {
        font-size: 0.9rem;
        opacity: 0.9;
      }

      ha-code-editor {
        height: 180px;
        border-radius: 8px;
        overflow: hidden;
      }
    `;
  }
}

customElements.define("hki-header-card-editor", HkiHeaderCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "hki-header-card",
  name: "HKI Header Card",
  description: "Full Width Customizable Header.",
  preview: false,
  documentationURL: "https://github.com/jimz011/hki-header-card",
});
