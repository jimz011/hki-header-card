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

      /* UPDATED WEATHER STYLES */
      .weather-container {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--hki-header-text-color, #fff);
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
        z-index: 2;
        transition: all 0.2s ease;
      }

      /* Pill Shape Styles */
      .weather-container.pill {
        background: var(--weather-pill-background, rgba(0, 0, 0, 0.3));
        border-radius: 50px;
        padding: var(--weather-pill-padding, 4px 12px);
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        text-shadow: none; /* Remove text shadow inside pill for cleaner look */
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
      
      .weather-icon-img {
        width: var(--weather-icon-size, 32px);
        height: var(--weather-icon-size, 32px);
        object-fit: contain;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
      }

      .weather-condition {
        text-transform: capitalize;
      }

      .weather-temperature {
        font-weight: 500;
      }

      /* EDIT MODE PLACEHOLDER STYLES */
      .edit-placeholder {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px;
        margin: 16px;
        background: var(--card-background-color, #202020);
        border: 2px dashed var(--primary-color);
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .edit-placeholder:hover {
        background: var(--secondary-background-color);
      }
      
      .edit-placeholder ha-icon {
        color: var(--primary-color);
        --mdc-icon-size: 32px;
      }
      
      .edit-placeholder-text {
        display: flex;
        flex-direction: column;
      }
      
      .edit-placeholder-title {
        font-weight: bold;
        font-size: 1.1em;
        margin-bottom: 4px;
      }
      
      .edit-placeholder-desc {
        opacity: 0.7;
        font-size: 0.9em;
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

    this._unsubscribeTemplate("title");
    this._unsubscribeTemplate("subtitle");
    this._resetBadgesZIndex();
  }

  firstUpdated() {
    this._detectPreview();
    this._detectKioskMode();

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
    } catch (e) {}
    
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

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");

    const defaults = {
      title: "Header",
      subtitle: "",
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

      title_offset_x: 5,
      title_offset_y: 32,
      subtitle_offset_x: 5,
      subtitle_offset_y: 32,

      badges_offset: 0,
      badges_gap: 0,
      
      // NEW DEFAULTS
      weather_show: ['icon', 'temp', 'condition'],
      weather_pill_size: '4px 12px',
      title_color: '',
      subtitle_color: '',
      weather_color: '',
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
            this.hass.callService(domain, service, action.service_data || {});
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

  // --- NEW WEATHER RENDERING LOGIC ---
  _getWeatherIcon(state, animated) {
    // Map Home Assistant weather states to icon names
    const iconMap = {
      'clear-night': 'night',
      'cloudy': 'cloudy',
      'fog': 'fog',
      'hail': 'hail',
      'lightning': 'thunderstorms',
      'lightning-rainy': 'thunderstorms-rain',
      'partlycloudy': 'cloudy-day-3',
      'pouring': 'rain',
      'rainy': 'rain',
      'snowy': 'snow',
      'sunny': 'day',
      'windy': 'wind',
      'exceptional': 'warning'
    };
    
    const iconName = iconMap[state] || 'cloudy';
    
    // Use Animated SVG if requested, otherwise standard MDI
    if (animated) {
      return `https://basmilius.github.io/weather-icons/production/fill/all/${iconName}.svg`;
    } else {
      // Map back to MDI for standard icons if needed, or use a static image set
      // For now, we will return the mdi icon name for the ha-icon element
      const mdiMap = {
        'clear-night': 'mdi:weather-night',
        'cloudy': 'mdi:weather-cloudy',
        'fog': 'mdi:weather-fog',
        'hail': 'mdi:weather-hail',
        'lightning': 'mdi:weather-lightning',
        'lightning-rainy': 'mdi:weather-lightning-rainy',
        'partlycloudy': 'mdi:weather-partly-cloudy',
        'pouring': 'mdi:weather-pouring',
        'rainy': 'mdi:weather-rainy',
        'snowy': 'mdi:weather-snowy',
        'snowy-rainy': 'mdi:weather-snowy-rainy',
        'sunny': 'mdi:weather-sunny',
        'windy': 'mdi:weather-windy',
        'windy-variant': 'mdi:weather-windy-variant',
        'exceptional': 'mdi:alert-circle-outline',
      };
      return mdiMap[state] || 'mdi:weather-partly-cloudy';
    }
  }

  _renderWeather() {
    if (!this._config.weather_entity || !this.hass) return html``;
    
    const weatherEntity = this.hass.states[this._config.weather_entity];
    if (!weatherEntity) return html``;

    const cfg = this._config;
    const state = weatherEntity.state;
    const temperature = weatherEntity.attributes.temperature;
    const unit = this.hass.config.unit_system.temperature;
    
    // Determine which elements to show
    const show = cfg.weather_show || ['icon', 'temp']; // Default
    
    // Determine layout variables
    const fontFamily = this._resolveFontFamily();
    const fontStyle = cfg.font_style || "normal";
    const weatherFontSize = cfg.weather_size_px || 12;
    const weatherWeight = this._resolveWeight("weather_weight");
    
    // MOBILE DETECTION & OFFSETS
    const isMobile = window.innerWidth <= 768; // Standard mobile breakpoint
    const currentOffsetX = isMobile && cfg.weather_offset_x_mobile !== undefined ? cfg.weather_offset_x_mobile : (cfg.weather_offset_x || 5);
    const currentOffsetY = isMobile && cfg.weather_offset_y_mobile !== undefined ? cfg.weather_offset_y_mobile : (cfg.weather_offset_y || 40);

    const weatherInline = `
      font-family:${fontFamily};
      font-style:${fontStyle};
      font-size:${weatherFontSize}px;
      font-weight:${weatherWeight};
      color: ${cfg.weather_color || 'inherit'};
    `;
    
    // Icon size logic
    const iconSize = Math.round(weatherFontSize * 2.5);
    
    let weatherStyle = "";
    if (cfg.weather_align === "left") {
      weatherStyle = `left:${currentOffsetX}px;top:${currentOffsetY}px;--weather-icon-size:${iconSize}px;`;
    } else {
      weatherStyle = `right:${currentOffsetX}px;top:${currentOffsetY}px;--weather-icon-size:${iconSize}px;`;
    }
    
    // Pill Styling Variables
    let pillStyle = "";
    if (cfg.weather_use_pill) {
      pillStyle = `--weather-pill-padding:${cfg.weather_pill_size || '4px 12px'};`;
    }

    const handleTap = (e) => {
      e.stopPropagation();
      if (cfg.weather_tap_action) {
        this._handleAction(cfg.weather_tap_action);
      }
    };
    
    const hasAction = cfg.weather_tap_action && cfg.weather_tap_action.action !== "none";
    const containerClass = `weather-container ${hasAction ? 'weather-clickable' : ''} ${cfg.weather_use_pill ? 'pill' : ''}`;
    
    // Icon Rendering
    const animated = !!cfg.weather_animated;
    const iconSource = this._getWeatherIcon(state, animated);

    return html`
      <div class="${containerClass}" style="${weatherStyle}${weatherInline}${pillStyle}" @click=${handleTap}>
        
        ${show.includes('icon') ? (animated ? 
          html`<img class="weather-icon-img" src="${iconSource}" alt="${state}" />` : 
          html`<ha-icon icon="${iconSource}" class="weather-icon"></ha-icon>`
        ) : ''}
        
        ${show.includes('condition') ? html`<span class="weather-condition">${state.replace('-', ' ')}</span>` : ''}
        ${show.includes('temp') ? html`<span class="weather-temperature">${Math.round(temperature)}${unit}</span>` : ''}
        ${show.includes('humidity') ? html`<span class="weather-humidity">${weatherEntity.attributes.humidity}%</span>` : ''}
      </div>
    `;
  }
  
  // --- NEW PLACEHOLDER FOR EDIT MODE ---
  _renderPlaceholder() {
    return html`
      <div class="edit-placeholder">
        <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
        <div class="edit-placeholder-text">
          <span class="edit-placeholder-title">HKI Header Card</span>
          <span class="edit-placeholder-desc">The header is fixed to the top. Click this box to edit settings.</span>
        </div>
      </div>
    `;
  }

  render() {
    if (!this._config) return html``;

    const cfg = this._config;
    const effectiveFixed = !!cfg.fixed && !this._inPreview;
    
    // PLACEHOLDER LOGIC: If in preview mode, render the placeholder first
    if (this._inPreview) {
      return html`
        ${this._renderPlaceholder()}
        <div style="opacity: 0.5; pointer-events: none; filter: grayscale(1);">
           ${this._renderHeaderContent(cfg, effectiveFixed)}
        </div>
      `;
    }

    return this._renderHeaderContent(cfg, effectiveFixed);
  }

  _renderHeaderContent(cfg, effectiveFixed) {
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
    
    // TITLE/SUBTITLE COLORS
    const titleColor = cfg.title_color ? `color:${cfg.title_color};` : "";
    const subtitleColor = cfg.subtitle_color ? `color:${cfg.subtitle_color};` : "";

    const titleInline = `font-family:${fontFamily};font-style:${fontStyle};font-size:${cfg.title_size_px}px;font-weight:${this._resolveWeight("title_weight")};${titleColor}`;
    const subtitleInline = `font-family:${fontFamily};font-style:${fontStyle};font-size:${cfg.subtitle_size_px}px;font-weight:${this._resolveWeight("subtitle_weight")};${subtitleColor}`;

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
      weather_offset_x_mobile: 5,
      weather_offset_y_mobile: 40,
      weather_size_px: 12,
      weather_weight: "medium",
      weather_tap_action: { action: "more-info" },
      weather_show: ['icon', 'temp'],
      weather_use_pill: false,
      weather_animated: false,
    };
  }

  static getCardSize() {
    return 3;
  }
}

customElements.define("hki-header-card", HkiHeaderCard);

// --- EDITOR CLASS ---
class HkiHeaderCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: { attribute: false } };
  }

  setConfig(config) {
    this._config = {
      title: "",
      subtitle: "",
      text_align: "left",
      background: "",
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
      // New Defaults
      weather_show: ['icon', 'temp'],
      weather_use_pill: false,
      weather_pill_size: "4px 12px",
      weather_animated: false,
      title_color: "",
      subtitle_color: "",
      weather_color: "",
      ...config,
    };
  }

  _val(ev) {
    return ev.detail?.value ?? ev.target?.value;
  }

  _changed(ev) {
    ev.stopPropagation();
    const field = ev.target?.dataset?.field || ev.target?.configValue; // Support both ways
    if (!field || !this._config) return;

    let value = this._val(ev);

    // Multi-select handling (for weather_show)
    if (ev.target.tagName === 'HA-SELECTOR-SELECT') {
         value = ev.detail.value; 
    }

    const numeric = new Set([
      "height_vh", "min_height", "max_height", "blend_stop", "fixed_top", 
      "title_offset_x", "title_offset_y", "subtitle_offset_x", "subtitle_offset_y", 
      "title_size_px", "subtitle_size_px", "badges_offset_pinned", "badges_offset_unpinned", "badges_gap",
      "weather_offset_x", "weather_offset_y", "weather_size_px",
      "weather_offset_x_mobile", "weather_offset_y_mobile"
    ]);
    if (numeric.has(field)) {
      value = Number(value);
      if (!Number.isFinite(value)) return;
    }

    const bools = new Set(["fixed", "badges_fixed", "weather_use_pill", "weather_animated"]);
    if (bools.has(field)) value = !!(ev.target?.checked ?? value);

    let next;
    
    // Handle nested fields (e.g., "weather_tap_action.action")
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

  // Helper for array toggle (weather elements)
  _toggleWeatherShow(ev) {
    const val = ev.target.value;
    const current = [...(this._config.weather_show || [])];
    const idx = current.indexOf(val);
    
    if (ev.target.checked && idx === -1) {
      current.push(val);
    } else if (!ev.target.checked && idx !== -1) {
      current.splice(idx, 1);
    }
    
    this._config = { ...this._config, weather_show: current };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config } }));
  }

  _renderTemplateEditor(label, field, rows = 6) {
    const value = this._config?.[field] ?? "";
    // Use ha-code-editor if available, otherwise textfield
    return html`
      <div class="code-wrap">
        <div class="code-label">${label}</div>
        <ha-code-editor .hass=${this.hass} .value=${value} mode="jinja2" data-field=${field} @value-changed=${this._changed}></ha-code-editor>
      </div>
    `;
  }

  _renderServiceDataEditor(field, serviceData) {
    // Convert object to YAML string if needed
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
    
    return html`
      <div class="code-wrap">
        <div class="code-label">Service data (YAML)</div>
        <ha-code-editor 
          .hass=${this.hass} 
          .value=${value} 
          mode="yaml" 
          autocomplete-entities
          data-field="${field}.service_data" 
          @value-changed=${this._changed}>
        </ha-code-editor>
      </div>
    `;
  }

  _renderActionEditor(label, field) {
    const action = this._config?.[field] || { action: "more-info" };
    const actionType = action.action || "more-info";
    
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
          <ha-navigation-picker
            label="Navigation Path"
            .hass=${this.hass}
            .value=${action.navigation_path || ""}
            data-field="${field}.navigation_path"
            @value-changed=${this._changed}
          ></ha-navigation-picker>
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
           <ha-textfield 
             label="Service"
             .value=${action.service || ""}
             data-field="${field}.service"
             @input=${this._changed}
           ></ha-textfield>
           ${this._renderServiceDataEditor(field, action.service_data)}
        ` : ""}
        
        ${actionType === "more-info" || actionType === "toggle" ? html`
          <ha-entity-picker
            label="Entity (Optional override)"
            .hass=${this.hass}
            .value=${action.entity || ""}
            data-field="${field}.entity"
            @value-changed=${this._changed}
          ></ha-entity-picker>
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
          <ha-alert alert-type="info" title="Configuration">
            Settings updated. Use the box above to edit efficiently.
          </ha-alert>
        </div>

        ${this._renderTemplateEditor("Title (Jinja2)", "title", 8)}
        ${this._renderTemplateEditor("Subtitle (Jinja2)", "subtitle", 6)}

        <div class="section">Colors</div>
        <div class="inline-fields-3">
            <ha-textfield label="Title Color" .value=${this._config.title_color || ""} data-field="title_color" @input=${this._changed}></ha-textfield>
            <ha-textfield label="Subtitle Color" .value=${this._config.subtitle_color || ""} data-field="subtitle_color" @input=${this._changed}></ha-textfield>
            <ha-textfield label="Weather Color" .value=${this._config.weather_color || ""} data-field="weather_color" @input=${this._changed}></ha-textfield>
        </div>

        <div class="section">Weather</div>
        <ha-entity-picker
          label="Weather Entity"
          .hass=${this.hass}
          .value=${this._config.weather_entity || ""}
          configValue="weather_entity"
          data-field="weather_entity"
          @value-changed=${this._changed}
        ></ha-entity-picker>

        ${this._config.weather_entity ? html`
          <div class="section-sub">Elements to Show</div>
          <div class="checkbox-row">
            <ha-formfield label="Icon">
                <ha-checkbox .checked=${(this._config.weather_show || []).includes('icon')} value="icon" @change=${this._toggleWeatherShow}></ha-checkbox>
            </ha-formfield>
            <ha-formfield label="Temp">
                <ha-checkbox .checked=${(this._config.weather_show || []).includes('temp')} value="temp" @change=${this._toggleWeatherShow}></ha-checkbox>
            </ha-formfield>
            <ha-formfield label="Condition">
                <ha-checkbox .checked=${(this._config.weather_show || []).includes('condition')} value="condition" @change=${this._toggleWeatherShow}></ha-checkbox>
            </ha-formfield>
            <ha-formfield label="Humidity">
                <ha-checkbox .checked=${(this._config.weather_show || []).includes('humidity')} value="humidity" @change=${this._toggleWeatherShow}></ha-checkbox>
            </ha-formfield>
          </div>
          
          <div class="switch-row">
            <ha-formfield label="Use Animated Icons">
              <ha-switch .checked=${!!this._config.weather_animated} data-field="weather_animated" @change=${this._changed}></ha-switch>
            </ha-formfield>
            <ha-formfield label="Pill Background">
              <ha-switch .checked=${!!this._config.weather_use_pill} data-field="weather_use_pill" @change=${this._changed}></ha-switch>
            </ha-formfield>
          </div>
          
          ${this._config.weather_use_pill ? html`
             <ha-textfield label="Pill Size (padding)" .value=${this._config.weather_pill_size || "4px 12px"} data-field="weather_pill_size" @input=${this._changed}></ha-textfield>
          ` : ''}

          <div class="section-sub">Positioning</div>
          <div class="inline-fields-2">
            <ha-textfield label="Desktop X Offset" type="number" .value=${String(this._config.weather_offset_x || 5)} data-field="weather_offset_x" @input=${this._changed}></ha-textfield>
            <ha-textfield label="Desktop Y Offset" type="number" .value=${String(this._config.weather_offset_y || 40)} data-field="weather_offset_y" @input=${this._changed}></ha-textfield>
          </div>
          <div class="inline-fields-2">
            <ha-textfield label="Mobile X Offset" type="number" .value=${String(this._config.weather_offset_x_mobile || 5)} data-field="weather_offset_x_mobile" @input=${this._changed}></ha-textfield>
            <ha-textfield label="Mobile Y Offset" type="number" .value=${String(this._config.weather_offset_y_mobile || 40)} data-field="weather_offset_y_mobile" @input=${this._changed}></ha-textfield>
          </div>

          ${this._renderActionEditor("Weather tap action", "weather_tap_action")}
        ` : html``}

        <div class="section">Background & Dimensions</div>
        <ha-textfield label="Background" .value=${this._config.background || ""} data-field="background" @input=${this._changed}></ha-textfield>
        <div class="inline-fields-2">
          <ha-textfield label="Min Height" type="number" .value=${String(this._config.min_height)} data-field="min_height" @input=${this._changed}></ha-textfield>
          <ha-textfield label="Max Height" type="number" .value=${String(this._config.max_height)} data-field="max_height" @input=${this._changed}></ha-textfield>
        </div>

        <div class="section">Offsets & Fixes</div>
        <ha-switch .checked=${!!this._config.fixed} data-field="fixed" @change=${this._changed}></ha-switch> Fixed Mode
        <div class="inline-fields-2">
            <ha-textfield label="Title Offset X" type="number" .value=${String(this._config.title_offset_x)} data-field="title_offset_x" @input=${this._changed}></ha-textfield>
            <ha-textfield label="Title Offset Y" type="number" .value=${String(this._config.title_offset_y)} data-field="title_offset_y" @input=${this._changed}></ha-textfield>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .card-config { display: flex; flex-direction: column; gap: 12px; padding: 8px; }
      .section { font-weight: 600; margin-top: 10px; border-bottom: 1px solid var(--divider-color); padding-bottom: 4px; }
      .section-sub { font-size: 0.9em; font-weight: 600; opacity: 0.8; margin-top: 8px; }
      .checkbox-row { display: flex; gap: 16px; flex-wrap: wrap; }
      .switch-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
      .inline-fields-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .inline-fields-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
      .code-wrap { display: flex; flex-direction: column; gap: 6px; }
      .code-label { font-size: 0.9rem; opacity: 0.9; }
      ha-code-editor { height: 180px; border-radius: 8px; overflow: hidden; }
      ha-textfield, ha-select { width: 100%; }
    `;
  }
}

customElements.define("hki-header-card-editor", HkiHeaderCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "hki-header-card",
  name: "HKI Header Card",
  description: "Full Width Customizable Header with Weather & Mobile options.",
  preview: true,
  documentationURL: "https://github.com/jimz011/hki-header-card",
});
