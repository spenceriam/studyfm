var photo = (() => {
  function DuotonePhoto({ src, shadow, highlight, style, id, contrast = 1.3, brightness = 0, className }) {
    const filterId = `duo-${id}`;
    const hexToRgb = (h) => {
      const c = h.replace("#", "");
      const n = parseInt(c.length === 3 ? c.split("").map((x) => x + x).join("") : c, 16);
      return [n >> 16 & 255, n >> 8 & 255, n & 255];
    };
    const [sr, sg, sb] = hexToRgb(shadow);
    const [hr, hg, hb] = hexToRgb(highlight);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", ...style }, className }, /* @__PURE__ */ React.createElement("svg", { width: "0", height: "0", style: { position: "absolute" } }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("filter", { id: filterId, colorInterpolationFilters: "sRGB" }, /* @__PURE__ */ React.createElement("feColorMatrix", { type: "matrix", values: "\n              0.299 0.587 0.114 0 0\n              0.299 0.587 0.114 0 0\n              0.299 0.587 0.114 0 0\n              0     0     0     1 0\n            " }), /* @__PURE__ */ React.createElement("feComponentTransfer", null, /* @__PURE__ */ React.createElement("feFuncR", { type: "linear", slope: contrast, intercept: brightness - (contrast - 1) / 2 }), /* @__PURE__ */ React.createElement("feFuncG", { type: "linear", slope: contrast, intercept: brightness - (contrast - 1) / 2 }), /* @__PURE__ */ React.createElement("feFuncB", { type: "linear", slope: contrast, intercept: brightness - (contrast - 1) / 2 })), /* @__PURE__ */ React.createElement("feComponentTransfer", null, /* @__PURE__ */ React.createElement("feFuncR", { type: "table", tableValues: `${sr / 255} ${hr / 255}` }), /* @__PURE__ */ React.createElement("feFuncG", { type: "table", tableValues: `${sg / 255} ${hg / 255}` }), /* @__PURE__ */ React.createElement("feFuncB", { type: "table", tableValues: `${sb / 255} ${hb / 255}` }))))), /* @__PURE__ */ React.createElement(
      "img",
      {
        src,
        alt: "",
        style: {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          filter: `url(#${filterId})`,
          display: "block"
        }
      }
    ));
  }
  function HalftoneOverlay({ color = "#3a2818", size = 3, spacing = 6, opacity = 0.25 }) {
    const id = `ht-${Math.random().toString(36).slice(2, 7)}`;
    return /* @__PURE__ */ React.createElement(
      "svg",
      {
        style: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", mixBlendMode: "multiply", opacity },
        preserveAspectRatio: "none"
      },
      /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("pattern", { id, width: spacing, height: spacing, patternUnits: "userSpaceOnUse" }, /* @__PURE__ */ React.createElement("circle", { cx: spacing / 2, cy: spacing / 2, r: size / 2, fill: color }))),
      /* @__PURE__ */ React.createElement("rect", { width: "100%", height: "100%", fill: `url(#${id})` })
    );
  }
  Object.assign(window, { DuotonePhoto, HalftoneOverlay });
})();
