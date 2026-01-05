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

// Weather icon mapping with colors and animations
const WEATHER_ICONS = Object.freeze({
  'clear-night': { icon: '🌙', color: '#9ca3af', animation: 'pulse' },
  'cloudy': { icon: '☁️', color: '#9ca3af', animation: 'float' },
  'fog': { icon: '🌫️', color: '#9ca3af', animation: 'fade' },
  'hail': { icon: '🧊', color: '#60a5fa', animation: 'bounce' },
  'lightning': { icon: '⚡', color: '#fbbf24', animation: 'flash' },
  'lightning-rainy': { icon: '⛈️', color: '#60a5fa', animation: 'flash' },
  'partlycloudy': { icon: '⛅', color: '#fbbf24', animation: 'float' },
  'pouring': { icon: '🌧️', color: '#60a5fa', animation: 'drip' },
  'rainy': { icon: '🌦️', color: '#60a5fa', animation: 'drip' },
  'snowy': { icon: '❄️', color: '#93c5fd', animation: 'fall' },
  'snowy-rainy': { icon: '🌨️', color: '#60a5fa', animation: 'fall' },
  'sunny': { icon: '☀️', color: '#fbbf24', animation: 'rotate' },
  'windy': { icon: '💨', color: '#9ca3af', animation: 'drift' },
  'windy-variant': { icon: '🌬️', color: '#9ca3af', animation: 'drift' },
  'exceptional': { icon: '⚠️', color: '#ef4444', animation: 'pulse' },
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
      }

      .weather-container {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 8px;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
        z-index: 2;
      }

      .weather-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 24px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      }

      .weather-pill.rounded {
        border-radius: 12px;
      }

      .weather-pill.square {
        border-radius: 8px;
      }

      .weather-pill.compact {
        padding: 6px 12px;
      }

      .weather-pill.comfortable {
        padding: 10px 20px;
      }

      .weather-pill.spacious {
        padding: 14px 24px;
      }

      .weather-clickable {
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .weather-clickable:hover {
        opacity: 0.8;
      }

      .weather-icon {
        font-size: var(--weather-icon-size, 32px);
        line-height: 1;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .weather-icon.animated {
        animation-duration: 3s;
        animation-iteration-count: infinite;
        animation-timing-function: ease-in-out;
      }

      .weather-main-info {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .weather-condition {
        text-transform: capitalize;
      }

      .weather-temperature {
        font-weight: 500;
      }

      .weather-attributes {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.9em;
        opacity: 0.95;
      }

      .weather-attribute {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .weather-attribute-icon {
        font-size: 0.9em;
        opacity: 0.8;
      }

      /* Weather animations */
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }

      @keyframes fade {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }

      @keyframes bounce {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }

      @keyframes flash {
        0%, 50%, 100% { opacity: 1; }
        25%, 75% { opacity: 0.4; }
      }

      @keyframes drip {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(3px); }
      }

      @keyframes fall {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(5px) rotate(5deg); }
      }

      @keyframes rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes drift {
        0%, 100% { transform: translateX(0px); }
        50% { transform: translateX(5px); }
      }

      .animate-pulse { animation-name: pulse; }
      .animate-float { animation-name: float; }
      .animate-fade { animation-name: fade; }
      .animate-bounce { animation-name: bounce; }
      .animate-flash { animation-name: flash; }
      .animate-drip { animation-name: drip; }
      .animate-fall { animation-name: fall; }
      .animate-rotate { animation-name: rotate; }
      .animate-drift { animation-name: drift; }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.scheduleKioskCheck();
    this.startUrlChangeListener();
    this._visibilityHandler = () => {
      if (document.visibilityState === "visible") this.scheduleKioskCheck();
    };
    document.addEventListener("visibilitychange", this._visibilityHandler);
    this._focusHandler = () => this.scheduleKioskCheck();
    window.addEventListener("focus", this._focusHandler);
    this._initialCheckTimer = setTimeout(() => this.scheduleKioskCheck(), 2000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopResizeObserver();
    this.stopKioskCheck();
    this.stopUrlChangeListener();
    if (this._rafMeasure) cancelAnimationFrame(this._rafMeasure);
    if (this._rafBadges) cancelAnimationFrame(this._rafBadges);
    if (this._tpl.title.unsub) this._tpl.title.unsub();
    if (this._tpl.subtitle.unsub) this._tpl.subtitle.unsub();
    if (this._visibilityHandler)
      document.removeEventListener("visibilitychange", this._visibilityHandler);
    if (this._focusHandler) window.removeEventListener("focus", this._focusHandler);
    if (this._initialCheckTimer) clearTimeout(this._initialCheckTimer);
  }

  firstUpdated() {
    this.startResizeObserver();
    this.requestUpdate();
  }

  setConfig(cfg) {
    if (!cfg) throw new Error("Invalid configuration");

    const c = {
      title: "",
      title_x: 0,
      title_y: 90,
      title_size_px: 28,
      title_weight: "bold",
      title_color: "",

      subtitle: "",
      subtitle_x: 0,
      subtitle_y: 0,
      subtitle_size_px: 16,
      subtitle_weight: "medium",
      subtitle_color: "",

      weather: "",
      weather_x: 0,
      weather_y: 0,
      weather_mobile_x: null,
      weather_mobile_y: null,
      weather_size_px: 12,
      weather_weight: "medium",
      weather_color: "",
      weather_show_icon: true,
      weather_show_condition: true,
      weather_show_temperature: true,
      weather_use_pill: false,
      weather_pill_style: "pill",
      weather_pill_size: "comfortable",
      weather_pill_background: "rgba(0,0,0,0.3)",
      weather_show_humidity: false,
      weather_show_pressure: false,
      weather_show_wind_speed: false,
      weather_show_wind_bearing: false,
      weather_animated_icons: true,
      weather_colored_icons: true,

      weather_tap_action: { action: "more-info" },

      background: "",
      background_position: "center",
      background_repeat: "no-repeat",
      background_size: "cover",
      min_height: 180,
      max_height: 340,

      blend_color: "rgba(0,0,0,0.45)",
      blend_stop: 70,

      font_family: "inherit",
      font_family_custom: "",
      font_style: "normal",

      fixed: false,
      fixed_top: 0,

      badges_fixed: false,
      badges_offset_pinned: -30,
      badges_offset_unpinned: 0,
      badges_gap: 0,

      ...cfg,
    };

    this._config = c;

    if (c.title !== this._tpl.title.raw) {
      this._setupTemplate("title", c.title);
    }
    if (c.subtitle !== this._tpl.subtitle.raw) {
      this._setupTemplate("subtitle", c.subtitle);
    }

    this.requestUpdate();
  }

  _setupTemplate(field, rawValue) {
    if (this._tpl[field].unsub) {
      this._tpl[field].unsub();
      this._tpl[field].unsub = null;
    }

    const sig = cacheKey(rawValue, null);
    if (this._tpl[field].sig === sig) return;

    this._tpl[field] = { raw: rawValue, sig, seq: 0, unsub: null };

    if (!this._hassReady || !rawValue) {
      if (field === "title") this._renderedTitle = rawValue;
      if (field === "subtitle") this._renderedSubtitle = rawValue;
      return;
    }

    this._renderTemplate(field, rawValue);
  }

  _renderTemplate(field, rawValue) {
    const localSeq = ++this._tpl[field].seq;

    try {
      const unsub = this.hass.connection.subscribeMessage(
        (msg) => {
          if (localSeq !== this._tpl[field].seq) return;
          if (field === "title") this._renderedTitle = msg.result || "";
          if (field === "subtitle") this._renderedSubtitle = msg.result || "";
        },
        { type: "render_template", template: rawValue }
      );

      this._tpl[field].unsub = () => {
        unsub.then((u) => u()).catch(() => {});
      };
    } catch (err) {
      console.warn(`[HkiHeaderCard] Template render error (${field}):`, err);
      if (field === "title") this._renderedTitle = rawValue;
      if (field === "subtitle") this._renderedSubtitle = rawValue;
    }
  }

  updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has("hass")) {
      if (this.hass && !this._hassReady) {
        this._hassReady = true;
        if (this._tpl.title.raw) this._renderTemplate("title", this._tpl.title.raw);
        if (this._tpl.subtitle.raw) this._renderTemplate("subtitle", this._tpl.subtitle.raw);
      }

      if (this._config.weather && this.hass && this.hass.states) {
        const weatherEntity = this.hass.states[this._config.weather];
        if (weatherEntity) {
          this._weatherState = weatherEntity;
        }
      }
    }
  }

  scheduleKioskCheck() {
    if (this._kioskCheckInterval) return;
    this._kioskCheckInterval = setInterval(() => {
      this.checkKioskMode();
    }, 1000);
    this.checkKioskMode();
  }

  stopKioskCheck() {
    if (this._kioskCheckInterval) clearInterval(this._kioskCheckInterval);
    this._kioskCheckInterval = null;
    if (this._kioskMutationObserver) this._kioskMutationObserver.disconnect();
    this._kioskMutationObserver = null;
  }

  checkKioskMode() {
    let panelContainer = null;
    let el = this;
    while (el && el !== document.body) {
      if (el.matches && el.matches("hui-panel-view, hui-masonry-view, hui-sections-view")) {
        panelContainer = el;
        break;
      }
      el = el.parentElement || el.getRootNode().host;
    }

    const now = !!panelContainer?.classList?.contains("kiosk");
    if (now !== this._kioskMode) {
      this._kioskMode = now;
      this.requestUpdate();
    }
  }

  startUrlChangeListener() {
    this._urlChangeHandler = () => this.checkKioskMode();
    window.addEventListener("location-changed", this._urlChangeHandler);
  }

  stopUrlChangeListener() {
    if (this._urlChangeHandler)
      window.removeEventListener("location-changed", this._urlChangeHandler);
    this._urlChangeHandler = null;
  }

  startResizeObserver() {
    if (!this.shadowRoot) return;
    const card = this.shadowRoot.querySelector("ha-card.header");
    if (!card) return;

    if (this._ro) this._ro.disconnect();
    this._ro = new ResizeObserver(() => this.scheduleLayoutMeasure());
    this._ro.observe(card);

    this.scheduleLayoutMeasure();
  }

  stopResizeObserver() {
    if (this._ro) this._ro.disconnect();
    this._ro = null;
  }

  scheduleLayoutMeasure() {
    if (this._rafMeasure) return;
    this._rafMeasure = requestAnimationFrame(() => {
      this._rafMeasure = 0;
      this._measureLayout();
    });
  }

  _measureLayout() {
    if (!this.shadowRoot) return;
    const card = this.shadowRoot.querySelector("ha-card.header");
    if (!card) return;

    const vw = window.innerWidth;
    const rect = card.getBoundingClientRect();
    const offL = rect.left;
    const cw = rect.width;
    const hh = rect.height;

    if (this._offsetLeft !== offL) {
      this._offsetLeft = offL;
      this.style.setProperty("--hki-offset-left", `${offL}px`);
    }
    if (this._viewportWidth !== vw) {
      this._viewportWidth = vw;
      this.style.setProperty("--hki-viewport-width", `${vw}px`);
    }
    if (this._contentWidth !== cw) {
      this._contentWidth = cw;
      this.style.setProperty("--hki-content-width", `${cw}px`);
    }
    if (this._headerHeight !== hh) {
      this._headerHeight = hh;
      this.style.setProperty("--hki-header-height", `${hh}px`);
    }

    this.scheduleBadgePosition();
  }

  scheduleBadgePosition() {
    if (this._rafBadges) return;
    this._rafBadges = requestAnimationFrame(() => {
      this._rafBadges = 0;
      this._updateBadgePosition();
    });
  }

  _updateBadgePosition() {
    if (!this._badgesEl) this._badgesEl = this.findBadgesElement();
    if (!this._badgesEl) return;

    const cf = this._config;
    const fixed = !!cf.badges_fixed;
    const gap = Number(cf.badges_gap) || 0;

    let adjGap = gap;
    if (fixed) adjGap -= 48;
    if (this._kioskMode) adjGap += 48;

    let off = fixed ? Number(cf.badges_offset_pinned) || -30 : Number(cf.badges_offset_unpinned) || 0;

    this._badgesEl.style.position = fixed ? "sticky" : "";
    this._badgesEl.style.top = fixed ? `${off}px` : "";
    this._badgesEl.style.marginBottom = `${adjGap}px`;
    this._badgesEl.style.zIndex = fixed ? "3" : "";
  }

  findBadgesElement() {
    let current = this;
    while (current && current !== document.body) {
      const next = current.parentElement || current.getRootNode().host;
      if (next && next.tagName === "HUI-VIEW") {
        const badges = next.shadowRoot?.querySelector("hui-badges");
        if (badges) return badges;
      }
      current = next;
    }
    return null;
  }

  _handleWeatherClick(e) {
    e.stopPropagation();
    if (!this._config.weather || !this.hass) return;

    const action = this._config.weather_tap_action || { action: "more-info" };

    if (action.action === "more-info") {
      const ev = new Event("hass-more-info", {
        composed: true,
        bubbles: true,
        cancelable: false,
      });
      ev.detail = { entityId: this._config.weather };
      this.dispatchEvent(ev);
    } else if (action.action === "toggle") {
      this.hass.callService("homeassistant", "toggle", {
        entity_id: this._config.weather,
      });
    } else if (action.action === "navigate" && action.navigation_path) {
      window.history.pushState(null, "", action.navigation_path);
      const navEv = new Event("location-changed", {
        composed: true,
        bubbles: false,
        cancelable: false,
      });
      window.dispatchEvent(navEv);
    } else if (action.action === "url" && action.url_path) {
      window.open(action.url_path);
    } else if (action.action === "call-service") {
      const [domain, service] = (action.service || "").split(".", 2);
      if (domain && service) {
        this.hass.callService(domain, service, action.service_data || {});
      }
    }
  }

  _renderWeather() {
    const cf = this._config;
    if (!cf.weather || !this._weatherState) return html``;

    const state = this._weatherState;
    const attrs = state.attributes || {};

    // Determine if mobile
    const isMobile = this._viewportWidth > 0 && this._viewportWidth < 768;
    
    // Use mobile-specific offsets if available, otherwise fall back to desktop
    const weatherX = isMobile && cf.weather_mobile_x !== null ? cf.weather_mobile_x : cf.weather_x;
    const weatherY = isMobile && cf.weather_mobile_y !== null ? cf.weather_mobile_y : cf.weather_y;

    const showIcon = cf.weather_show_icon !== false;
    const showCondition = cf.weather_show_condition !== false;
    const showTemperature = cf.weather_show_temperature !== false;
    const usePill = cf.weather_use_pill || false;
    const pillStyle = cf.weather_pill_style || "pill";
    const pillSize = cf.weather_pill_size || "comfortable";
    const pillBackground = cf.weather_pill_background || "rgba(0,0,0,0.3)";
    const animatedIcons = cf.weather_animated_icons !== false;
    const coloredIcons = cf.weather_colored_icons !== false;

    const showHumidity = cf.weather_show_humidity || false;
    const showPressure = cf.weather_show_pressure || false;
    const showWindSpeed = cf.weather_show_wind_speed || false;
    const showWindBearing = cf.weather_show_wind_bearing || false;

    const condition = state.state || "";
    const temp = attrs.temperature;
    const unit = this.hass?.config?.unit_system?.temperature || "°C";
    
    const weatherInfo = WEATHER_ICONS[condition] || { icon: '🌡️', color: '#9ca3af', animation: 'pulse' };
    const iconColor = coloredIcons ? weatherInfo.color : (cf.weather_color || 'var(--hki-header-text-color, #fff)');
    const animationClass = animatedIcons ? `animate-${weatherInfo.animation}` : '';

    const styles = `
      left: calc(50% + ${weatherX}px);
      bottom: ${weatherY}px;
      transform: translateX(-50%);
      color: ${cf.weather_color || 'var(--hki-header-text-color, #fff)'};
      font-size: ${cf.weather_size_px || 12}px;
      font-weight: ${WEIGHT_MAP[normalizeWeightKey(cf.weather_weight, "medium")]};
    `;

    const pillStyles = usePill ? `background: ${pillBackground};` : '';

    const mainContent = html`
      <div class="weather-main-info">
        ${showIcon ? html`
          <div 
            class="weather-icon ${animatedIcons ? 'animated' : ''} ${animationClass}" 
            style="color: ${iconColor}; font-size: ${(cf.weather_size_px || 12) * 2.5}px;"
          >
            ${weatherInfo.icon}
          </div>
        ` : ''}
        ${showCondition ? html`<div class="weather-condition">${condition}</div>` : ''}
        ${showTemperature && temp != null ? html`<div class="weather-temperature">${temp}${unit}</div>` : ''}
      </div>
    `;

    const hasAttributes = showHumidity || showPressure || showWindSpeed || showWindBearing;
    const attributesContent = hasAttributes ? html`
      <div class="weather-attributes">
        ${showHumidity && attrs.humidity != null ? html`
          <div class="weather-attribute">
            <span class="weather-attribute-icon">💧</span>
            <span>${attrs.humidity}%</span>
          </div>
        ` : ''}
        ${showPressure && attrs.pressure != null ? html`
          <div class="weather-attribute">
            <span class="weather-attribute-icon">🔽</span>
            <span>${attrs.pressure} ${attrs.pressure_unit || 'hPa'}</span>
          </div>
        ` : ''}
        ${showWindSpeed && attrs.wind_speed != null ? html`
          <div class="weather-attribute">
            <span class="weather-attribute-icon">💨</span>
            <span>${attrs.wind_speed} ${attrs.wind_speed_unit || 'km/h'}</span>
          </div>
        ` : ''}
        ${showWindBearing && attrs.wind_bearing != null ? html`
          <div class="weather-attribute">
            <span class="weather-attribute-icon">🧭</span>
            <span>${this._getWindDirection(attrs.wind_bearing)}</span>
          </div>
        ` : ''}
      </div>
    ` : '';

    const content = hasAttributes ? html`
      ${mainContent}
      ${attributesContent}
    ` : mainContent;

    return html`
      <div
        class="weather-container weather-clickable"
        style="${styles}"
        @click=${this._handleWeatherClick}
      >
        ${usePill ? html`
          <div class="weather-pill ${pillStyle} ${pillSize}" style="${pillStyles}">
            ${content}
          </div>
        ` : content}
      </div>
    `;
  }

  _getWindDirection(bearing) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  }

  render() {
    const cf = this._config;
    const hasWeather = cf.weather && this._weatherState;

    const titleX = Number(cf.title_x) || 0;
    const titleY = Number(cf.title_y) || 90;
    const titleSizePx = clamp(Number(cf.title_size_px) || 28, 10, 100);
    const titleWeight = normalizeWeightKey(cf.title_weight, "bold");
    const titleColor = cf.title_color || '';

    const subtitleX = Number(cf.subtitle_x) || 0;
    const subtitleY = Number(cf.subtitle_y) || 0;
    const subtitleSizePx = clamp(Number(cf.subtitle_size_px) || 16, 8, 60);
    const subtitleWeight = normalizeWeightKey(cf.subtitle_weight, "medium");
    const subtitleColor = cf.subtitle_color || '';

    const fontFamily =
      cf.font_family === "custom" && cf.font_family_custom
        ? cf.font_family_custom
        : FONT_FAMILY_MAP[cf.font_family] || FONT_FAMILY_MAP.inherit;
    const fontStyle = cf.font_style || "normal";

    let bgVal = cf.background || "";
    if (bgVal && !bgVal.includes("url(") && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(bgVal)) {
      bgVal = `url(${bgVal})`;
    }

    const bgPos = cf.background_position || "center";
    const bgRep = cf.background_repeat || "no-repeat";
    const bgSz = cf.background_size || "cover";
    const minH = clamp(Number(cf.min_height), 100, 600);
    const maxH = clamp(Number(cf.max_height), 100, 800);

    const blendColor = cf.blend_color || "rgba(0,0,0,0.45)";
    const blendStop = clamp(Number(cf.blend_stop) || 70, 0, 100);

    const titleBlockStyle = `
      left: calc(50% + ${titleX}px);
      bottom: ${titleY}px;
      transform: translateX(-50%);
      font-family: ${fontFamily};
      font-style: ${fontStyle};
    `;

    const titleStyle = `
      font-size: ${titleSizePx}px;
      font-weight: ${WEIGHT_MAP[titleWeight]};
      ${titleColor ? `color: ${titleColor};` : ''}
    `;

    const subtitleStyle = `
      font-size: ${subtitleSizePx}px;
      font-weight: ${WEIGHT_MAP[subtitleWeight]};
      ${subtitleColor ? `color: ${subtitleColor};` : ''}
    `;

    const subtitleOffset = subtitleY ? `transform: translate(-50%, ${subtitleY}px);` : "";

    const cardStyle = `
      background: ${bgVal};
      background-position: ${bgPos};
      background-repeat: ${bgRep};
      background-size: ${bgSz};
      min-height: ${minH}px;
      max-height: ${maxH}px;
    `;

    const overlayStyle = `
      background: linear-gradient(180deg, transparent ${blendStop}%, ${blendColor} 100%);
    `;

    const weatherIconSize = (cf.weather_size_px || 12) * 2.5;
    this.style.setProperty("--weather-icon-size", `${weatherIconSize}px`);

    const cardContent = html`
      <ha-card class="header" style="${cardStyle}">
        <div class="overlay" style="${overlayStyle}"></div>
        <div class="content">
          <div class="title-block" style="${titleBlockStyle}">
            ${this._renderedTitle ? html`<div class="title" style="${titleStyle}">${this._renderedTitle}</div>` : html``}
            ${this._renderedSubtitle ? html`<div class="subtitle" style="${subtitleStyle} ${subtitleOffset}">${this._renderedSubtitle}</div>` : html``}
          </div>
          ${hasWeather ? this._renderWeather() : html``}
        </div>
      </ha-card>
    `;

    const spacerStyle = `height: ${this._headerHeight || minH}px;`;

    if (cf.fixed) {
      const fixedTop = Number(cf.fixed_top) || 0;
      return html`
        <div class="header-fixed" style="top: ${fixedTop}px;">${cardContent}</div>
        <div class="header-spacer" style="${spacerStyle}"></div>
      `;
    } else {
      return cardContent;
    }
  }

  getCardSize() {
    return 4;
  }

  static getConfigElement() {
    return document.createElement("hki-header-card-editor");
  }

  static getStubConfig() {
    return {
      title: "Welcome Home",
      subtitle: "{{ now().strftime('%A, %B %d') }}",
      background: "/local/header-bg.jpg",
    };
  }
}

customElements.define("hki-header-card", HkiHeaderCard);

class HkiHeaderCardEditor extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: {},
    };
  }

  setConfig(cfg) {
    this._config = cfg || {};
  }

  _changed(e) {
    if (!this._config || !this.hass) return;

    const target = e.target;
    const field = target.dataset.field;
    if (!field) return;

    let val;
    if (target.type === "checkbox" || target.tagName === "HA-SWITCH") {
      val = target.checked;
    } else if (target.type === "number") {
      val = target.value === "" ? undefined : Number(target.value);
    } else if (target.tagName === "HA-SELECT") {
      val = target.value;
    } else {
      val = target.value || undefined;
    }

    const newCfg = { ...this._config };

    if (val === undefined || val === "") {
      delete newCfg[field];
    } else {
      newCfg[field] = val;
    }

    this._config = newCfg;

    const ev = new CustomEvent("config-changed", {
      detail: { config: newCfg },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(ev);
  }

  _actionChanged(e, actionKey) {
    if (!this._config || !this.hass) return;
    const newCfg = { ...this._config };
    newCfg[actionKey] = e.detail.value;
    this._config = newCfg;
    const ev = new CustomEvent("config-changed", {
      detail: { config: newCfg },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(ev);
  }

  _renderActionEditor(label, actionKey) {
    const action = this._config[actionKey] || { action: "more-info" };
    return html`
      <div class="code-wrap">
        <div class="code-label">${label}</div>
        <ha-selector
          .hass=${this.hass}
          .selector=${{ action: {} }}
          .value=${action}
          @value-changed=${(e) => this._actionChanged(e, actionKey)}
        ></ha-selector>
      </div>
    `;
  }

  render() {
    if (!this._config) return html``;

    const showCustomFont = this._config.font_family === "custom";

    return html`
      <div class="card-config">
        <div class="disclaimer">
          <ha-alert alert-type="info">
            This card is designed to be placed in the <strong>header slot</strong> of your Lovelace view or section for optimal integration with Home Assistant's layout system.
            <br /><br />
            For comprehensive documentation, visit the 
            <a href="https://github.com/jimz011/hki-header-card" target="_blank" rel="noopener noreferrer">
              HKI Header Card GitHub repository
            </a>.
          </ha-alert>
        </div>

        <div class="section">Title</div>
        <div class="code-wrap">
          <div class="code-label">Title text (supports templates)</div>
          <ha-code-editor mode="jinja2" .hass=${this.hass} .value=${this._config.title || ""} @value-changed=${(e) => {
            const newCfg = { ...this._config, title: e.detail.value };
            this._config = newCfg;
            const ev = new CustomEvent("config-changed", { detail: { config: newCfg }, bubbles: true, composed: true });
            this.dispatchEvent(ev);
          }}></ha-code-editor>
        </div>

        <div class="inline-fields-2">
          <ha-textfield label="Title X offset (px)" type="number" .value=${String(this._config.title_x || 0)} data-field="title_x" @input=${this._changed}></ha-textfield>
          <ha-textfield label="Title Y offset (px)" type="number" .value=${String(this._config.title_y || 90)} data-field="title_y" @input=${this._changed}></ha-textfield>
        </div>

        <div class="inline-fields-2">
          <ha-textfield label="Title size (px)" type="number" .value=${String(this._config.title_size_px || 28)} data-field="title_size_px" @input=${this._changed}></ha-textfield>
          <ha-select label="Title weight" .value=${this._config.title_weight || "bold"} data-field="title_weight" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
            <mwc-list-item value="light">Light</mwc-list-item>
            <mwc-list-item value="regular">Regular</mwc-list-item>
            <mwc-list-item value="medium">Medium</mwc-list-item>
            <mwc-list-item value="semibold">Semi-bold</mwc-list-item>
            <mwc-list-item value="bold">Bold</mwc-list-item>
            <mwc-list-item value="black">Black</mwc-list-item>
          </ha-select>
        </div>

        <ha-textfield label="Title color (CSS)" helper="Leave empty to use default header text color" .value=${this._config.title_color || ""} data-field="title_color" @input=${this._changed}></ha-textfield>

        <div class="section">Subtitle</div>
        <div class="code-wrap">
          <div class="code-label">Subtitle text (supports templates)</div>
          <ha-code-editor mode="jinja2" .hass=${this.hass} .value=${this._config.subtitle || ""} @value-changed=${(e) => {
            const newCfg = { ...this._config, subtitle: e.detail.value };
            this._config = newCfg;
            const ev = new CustomEvent("config-changed", { detail: { config: newCfg }, bubbles: true, composed: true });
            this.dispatchEvent(ev);
          }}></ha-code-editor>
        </div>

        <div class="inline-fields-2">
          <ha-textfield label="Subtitle X offset (px)" type="number" .value=${String(this._config.subtitle_x || 0)} data-field="subtitle_x" @input=${this._changed}></ha-textfield>
          <ha-textfield label="Subtitle Y offset (px)" type="number" .value=${String(this._config.subtitle_y || 0)} data-field="subtitle_y" @input=${this._changed}></ha-textfield>
        </div>

        <div class="inline-fields-2">
          <ha-textfield label="Subtitle size (px)" type="number" .value=${String(this._config.subtitle_size_px || 16)} data-field="subtitle_size_px" @input=${this._changed}></ha-textfield>
          <ha-select label="Subtitle weight" .value=${this._config.subtitle_weight || "medium"} data-field="subtitle_weight" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
            <mwc-list-item value="light">Light</mwc-list-item>
            <mwc-list-item value="regular">Regular</mwc-list-item>
            <mwc-list-item value="medium">Medium</mwc-list-item>
            <mwc-list-item value="semibold">Semi-bold</mwc-list-item>
            <mwc-list-item value="bold">Bold</mwc-list-item>
            <mwc-list-item value="black">Black</mwc-list-item>
          </ha-select>
        </div>

        <ha-textfield label="Subtitle color (CSS)" helper="Leave empty to use default header text color" .value=${this._config.subtitle_color || ""} data-field="subtitle_color" @input=${this._changed}></ha-textfield>

        <div class="section">Weather</div>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this._config.weather || ""}
          .label=${"Weather entity"}
          .includeDomains=${["weather"]}
          @value-changed=${(e) => {
            const newCfg = { ...this._config, weather: e.detail.value };
            this._config = newCfg;
            const ev = new CustomEvent("config-changed", { detail: { config: newCfg }, bubbles: true, composed: true });
            this.dispatchEvent(ev);
          }}
        ></ha-entity-picker>

        ${this._config.weather ? html`
          <div class="inline-fields-2">
            <ha-textfield label="Weather X offset (px)" type="number" .value=${String(this._config.weather_x || 0)} data-field="weather_x" @input=${this._changed}></ha-textfield>
            <ha-textfield label="Weather Y offset (px)" type="number" .value=${String(this._config.weather_y || 0)} data-field="weather_y" @input=${this._changed}></ha-textfield>
          </div>

          <div class="inline-fields-2">
            <ha-textfield 
              label="Mobile X offset (px)" 
              helper="Leave empty to use desktop X offset"
              type="number" 
              .value=${this._config.weather_mobile_x !== null && this._config.weather_mobile_x !== undefined ? String(this._config.weather_mobile_x) : ""} 
              data-field="weather_mobile_x" 
              @input=${this._changed}>
            </ha-textfield>
            <ha-textfield 
              label="Mobile Y offset (px)" 
              helper="Leave empty to use desktop Y offset"
              type="number" 
              .value=${this._config.weather_mobile_y !== null && this._config.weather_mobile_y !== undefined ? String(this._config.weather_mobile_y) : ""} 
              data-field="weather_mobile_y" 
              @input=${this._changed}>
            </ha-textfield>
          </div>

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

          <ha-textfield label="Weather color (CSS)" helper="Leave empty to use default header text color" .value=${this._config.weather_color || ""} data-field="weather_color" @input=${this._changed}></ha-textfield>

          <div class="switch-row">
            <ha-formfield label="Show weather icon">
              <ha-switch .checked=${this._config.weather_show_icon !== false} data-field="weather_show_icon" @change=${this._changed}></ha-switch>
            </ha-formfield>
            <ha-formfield label="Show condition text">
              <ha-switch .checked=${this._config.weather_show_condition !== false} data-field="weather_show_condition" @change=${this._changed}></ha-switch>
            </ha-formfield>
          </div>

          <div class="switch-row">
            <ha-formfield label="Show temperature">
              <ha-switch .checked=${this._config.weather_show_temperature !== false} data-field="weather_show_temperature" @change=${this._changed}></ha-switch>
            </ha-formfield>
            <ha-formfield label="Animated icons">
              <ha-switch .checked=${this._config.weather_animated_icons !== false} data-field="weather_animated_icons" @change=${this._changed}></ha-switch>
            </ha-formfield>
          </div>

          <div class="switch-row">
            <ha-formfield label="Colored icons">
              <ha-switch .checked=${this._config.weather_colored_icons !== false} data-field="weather_colored_icons" @change=${this._changed}></ha-switch>
            </ha-formfield>
          </div>

          <div class="section">Weather Attributes</div>
          <div class="switch-row">
            <ha-formfield label="Show humidity">
              <ha-switch .checked=${!!this._config.weather_show_humidity} data-field="weather_show_humidity" @change=${this._changed}></ha-switch>
            </ha-formfield>
            <ha-formfield label="Show pressure">
              <ha-switch .checked=${!!this._config.weather_show_pressure} data-field="weather_show_pressure" @change=${this._changed}></ha-switch>
            </ha-formfield>
          </div>

          <div class="switch-row">
            <ha-formfield label="Show wind speed">
              <ha-switch .checked=${!!this._config.weather_show_wind_speed} data-field="weather_show_wind_speed" @change=${this._changed}></ha-switch>
            </ha-formfield>
            <ha-formfield label="Show wind bearing">
              <ha-switch .checked=${!!this._config.weather_show_wind_bearing} data-field="weather_show_wind_bearing" @change=${this._changed}></ha-switch>
            </ha-formfield>
          </div>

          <div class="section">Weather Pill Background</div>
          <div class="switch-row">
            <ha-formfield label="Use pill background">
              <ha-switch .checked=${!!this._config.weather_use_pill} data-field="weather_use_pill" @change=${this._changed}></ha-switch>
            </ha-formfield>
          </div>

          ${this._config.weather_use_pill ? html`
            <ha-select label="Pill style" .value=${this._config.weather_pill_style || "pill"} data-field="weather_pill_style" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
              <mwc-list-item value="pill">Pill (fully rounded)</mwc-list-item>
              <mwc-list-item value="rounded">Rounded</mwc-list-item>
              <mwc-list-item value="square">Square</mwc-list-item>
            </ha-select>

            <ha-select label="Pill size" .value=${this._config.weather_pill_size || "comfortable"} data-field="weather_pill_size" @selected=${this._changed} @closed=${this._changed} @value-changed=${this._changed}>
              <mwc-list-item value="compact">Compact</mwc-list-item>
              <mwc-list-item value="comfortable">Comfortable</mwc-list-item>
              <mwc-list-item value="spacious">Spacious</mwc-list-item>
            </ha-select>

            <ha-textfield label="Pill background (CSS)" helper="e.g., rgba(0,0,0,0.3) or linear-gradient(...)" .value=${this._config.weather_pill_background || "rgba(0,0,0,0.3)"} data-field="weather_pill_background" @input=${this._changed}></ha-textfield>
          ` : html``}

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
      ha-select {
        width: 100%;
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