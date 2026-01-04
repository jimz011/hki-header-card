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

    this._resizeHandler = null;
    this._ro = null;
    this._rafMeasure = 0;
    this._rafBadges = 0;
    this._kioskCheckInterval = null;

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
    `;
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

    // Check for kiosk mode periodically
    this._kioskCheckInterval = setInterval(() => {
      this._detectKioskMode();
    }, 2000);

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
      }

      this._debouncedBadgesZIndex();
    }

    if (changed.has("_kioskMode")) {
      this._debouncedMeasure(true);
      this._debouncedBadgesZIndex();
    }
  }

  _detectKioskMode() {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlKiosk = urlParams.get("kiosk") === "true" || window.location.search.includes("kiosk");
    
    // Check if header is actually rendered (kiosk-mode hides it with injected CSS)
    let headerHidden = false;
    try {
      const findHeader = (root, depth = 0) => {
        if (depth > 15) return null;
        
        const header = root.querySelector?.("app-header, mwc-top-app-bar-fixed, .toolbar, [slot='header']");
        if (header) return header;
        
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
        const header = findHeader(ha.shadowRoot);
        if (header) {
          const rect = header.getBoundingClientRect();
          const offsetHeight = header.offsetHeight;
          const clientHeight = header.clientHeight;
          const style = window.getComputedStyle(header);
          
          headerHidden = 
            rect.height === 0 || 
            offsetHeight === 0 || 
            clientHeight === 0 ||
            rect.top < -100 ||
            style.display === "none" || 
            style.visibility === "hidden" || 
            style.opacity === "0";
        }
      }
    } catch (e) {
      // Silent fail
    }
    
    // Check for kiosk-mode class
    const bodyKiosk = document.body.classList.contains("kiosk-mode") || 
                      document.documentElement.classList.contains("kiosk-mode");
    
    const newKioskMode = urlKiosk || headerHidden || bodyKiosk;
    
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
    
    // Already has url(), return as-is
    if (trimmed.startsWith("url(") || trimmed.startsWith("linear-gradient(") || trimmed.startsWith("radial-gradient(")) {
      return trimmed;
    }
    
    // Check if it looks like a file path or URL
    const isPath = trimmed.startsWith("/") || 
                   trimmed.startsWith("./") || 
                   trimmed.startsWith("../") ||
                   trimmed.startsWith("http://") || 
                   trimmed.startsWith("https://") ||
                   /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(trimmed);
    
    // Wrap in url() if it's a path
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

    // Calculate top position: header height minus badges offset, plus 48px if not in kiosk mode
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
      // When unpinned, apply the gap as margin-bottom with kiosk adjustment
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
    const titleInline = `font-family:${fontFamily};font-style:${fontStyle};font-size:${cfg.title_size_px}px;font-weight:${this._resolveWeight("title_weight")};`;
    const subtitleInline = `font-family:${fontFamily};font-style:${fontStyle};font-size:${cfg.subtitle_size_px}px;font-weight:${this._resolveWeight("subtitle_weight")};`;

    // Calculate subtitle position offset relative to title
    const subtitleOffsetX = (cfg.subtitle_offset_x || 0) - (cfg.title_offset_x || 0);
    const subtitleOffsetY = (cfg.subtitle_offset_y || 0) - (cfg.title_offset_y || 0);
    const subtitleTransform = `transform:translate(${subtitleOffsetX}px, ${subtitleOffsetY}px);`;

    let titleBlockStyle = "";
    if (cfg.text_align === "right") titleBlockStyle = `left:auto;right:${cfg.title_offset_x}px;top:${cfg.title_offset_y}px;text-align:right;align-items:flex-end;`;
    else if (cfg.text_align === "center") titleBlockStyle = `left:50%;top:${cfg.title_offset_y}px;transform:translateX(-50%);text-align:center;align-items:center;`;
    else titleBlockStyle = `left:${cfg.title_offset_x}px;top:${cfg.title_offset_y}px;text-align:left;align-items:flex-start;`;

    // Kiosk mode detection: use fixed_top when kiosk, add 48px when not kiosk (HA header visible)
    const topOffset = this._kioskMode ? (cfg.fixed_top || 0) : (cfg.fixed_top || 0) + 48;
    const wrapperStyle = effectiveFixed ? `top:${topOffset}px;` : "";
    
    // Use the appropriate badges offset based on whether badges are pinned
    const badgesOffset = cfg.badges_fixed ? (cfg.badges_offset_pinned || 48) : (cfg.badges_offset_unpinned || 100);
    
    // Only add gap to spacer when badges are pinned (when unpinned, gap is applied as margin-bottom on badges)
    let spacerH = effectiveFixed 
      ? Math.max(0, (this._headerHeight || 0) - badgesOffset + topOffset)
      : 0;
    
    if (cfg.badges_fixed && effectiveFixed) {
      // When pinned, add the gap with adjustments
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
    };
  }

  static getCardSize() {
    return 3;
  }
}

customElements.define("hki-header-card", HkiHeaderCard);

class HkiHeaderCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: { attribute: false } };
  }

  setConfig(config) {
    this._config = {
      title: "",
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
      ...config,
    };
  }

  _val(ev) {
    return ev.detail?.value ?? ev.target?.value;
  }

  _changed(ev) {
    ev.stopPropagation();
    const field = ev.target?.dataset?.field;
    if (!field || !this._config) return;

    let value = this._val(ev);

    const numeric = new Set(["height_vh", "min_height", "max_height", "blend_stop", "fixed_top", "title_offset_x", "title_offset_y", "subtitle_offset_x", "subtitle_offset_y", "title_size_px", "subtitle_size_px", "badges_offset_pinned", "badges_offset_unpinned", "badges_gap"]);
    if (numeric.has(field)) {
      value = Number(value);
      if (!Number.isFinite(value)) return;
    }

    const bools = new Set(["fixed", "badges_fixed"]);
    if (bools.has(field)) value = !!(ev.target?.checked ?? value);

    const next = { ...this._config, [field]: value };
    
    // When badges_fixed changes, update badges_offset default if it's currently at a default value
    if (field === "badges_fixed") {
      const currentOffset = this._config.badges_offset;
      // If it's at one of the default values, update it to the new default
      if (currentOffset === 48 || currentOffset === 100 || currentOffset === 0) {
        next.badges_offset = value ? 48 : 100;
      }
    }
    
    this._config = next;

    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next } }));
  }

  _renderTemplateEditor(label, field, rows = 6) {
    const value = this._config?.[field] ?? "";
    const hasCodeEditor = !!customElements.get("ha-code-editor");

    if (hasCodeEditor) {
      return html`
        <div class="code-wrap">
          <div class="code-label">${label}</div>
          <ha-code-editor .hass=${this.hass} .value=${value} mode="jinja2" data-field=${field} @value-changed=${this._changed}></ha-code-editor>
        </div>
      `;
    }

    return html`<ha-textfield label=${label} .value=${value} data-field=${field} textarea rows=${String(rows)} @input=${this._changed}></ha-textfield>`;
  }

  render() {
    if (!this._config) return html``;

    const showCustomFont = this._config.font_family === "custom";

    return html`
      <div class="card-config">
        <div class="disclaimer">
          <ha-alert alert-type="info" title="Documentation">
            Please read the documentation at 
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
