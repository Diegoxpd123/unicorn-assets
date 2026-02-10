class UnicornStudioEmbed extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.scene = null;
  }

  connectedCallback() {
    this.initializeUnicornStudio();
  }

  disconnectedCallback() {
    if (this.scene && typeof this.scene.destroy === "function") {
      this.scene.destroy();
    }
  }

  loadUnicornStudioScript() {
    return new Promise((resolve, reject) => {
      const src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js";
      const existingScript = document.querySelector(`script[src="${src}"]`);

      if (existingScript) {
        if (window.UnicornStudio || window.unicornStudio) {
          resolve();
        } else {
          existingScript.addEventListener("load", resolve);
          existingScript.addEventListener("error", reject);
        }
        return;
      }

      const appendScriptToHead = () => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = () => {
          console.error("Error loading Unicorn Studio script.");
          reject();
        };
        document.head.appendChild(script);
      };

      if (document.head) {
        appendScriptToHead();
      } else {
        document.addEventListener("DOMContentLoaded", appendScriptToHead);
      }
    });
  }

  initializeUnicornStudio() {
    this.loadUnicornStudioScript()
      .then(() => {
        const US = window.UnicornStudio || window.unicornStudio;
        if (US && typeof US.addScene === "function") {
          const isMobile = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
          const prefersReducedMotion =
            window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          const projectId = this.getAttribute("project-id");
          const filePath = this.getAttribute("file-path");
          const dpiAttr = this.getAttribute("dpi");
          const scaleAttr = this.getAttribute("scale");
          const fpsAttr = this.getAttribute("fps");
          const lazyLoadAttr = this.getAttribute("lazy-load");
          const disableMouseAttr = this.getAttribute("disable-mouse");
          const productionAttr = this.getAttribute("production");
          const fixedAttr = this.getAttribute("fixed");
          const dpi = Number(dpiAttr || (isMobile ? 1 : 1.5));
          const scale = Number(scaleAttr || (isMobile ? 0.75 : 1));
          const fps = fpsAttr ? Number(fpsAttr) : isMobile ? 30 : undefined;
          const lazyLoad = lazyLoadAttr ? lazyLoadAttr === "true" : isMobile;
          const disableMouseExplicit = disableMouseAttr !== null;
          const disableMouse = disableMouseExplicit ? disableMouseAttr === "true" : isMobile;
          const production = productionAttr ? productionAttr === "true" : isMobile;
          const fixed = fixedAttr ? fixedAttr === "true" : undefined;
          const altText = this.getAttribute("alt-text") || "Welcome to Unicorn Studio";
          const ariaLabel = this.getAttribute("aria-label") || "This is a canvas scene";

          if (!projectId && !filePath) {
            console.error("Missing project-id or file-path for Unicorn Studio scene.");
            return;
          }

          const container = document.createElement("div");
          container.classList.add("unicorn-embed");
          container.style.width = "100%";
          container.style.height = "100%";
          this.shadowRoot.appendChild(container);

          const config = {
            element: container,
            dpi,
            scale,
            lazyLoad,
            altText,
            ariaLabel,
            production,
          };

          if (typeof fps === "number" && !Number.isNaN(fps)) {
            config.fps = fps;
          }

          if (typeof fixed === "boolean") {
            config.fixed = fixed;
          }

          if (disableMouse || prefersReducedMotion) {
            config.interactivity = {
              mouse: {
                disableMobile: true,
                disabled: true,
              },
            };
          }

          if (filePath) {
            config.filePath = filePath;
          } else {
            config.projectId = projectId;
          }

          US.addScene(config)
            .then((scene) => {
              this.scene = scene;
            })
            .catch((err) => {
              console.error("Error loading Unicorn Studio scene:", err);
            });
        } else {
          console.error("Unicorn Studio is not available or addScene is not a function");
        }
      })
      .catch((err) => {
        console.error("Error loading Unicorn Studio script:", err);
      });
  }
}

customElements.define("unicorn-studio-embed", UnicornStudioEmbed);
