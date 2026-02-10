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
          const projectId = this.getAttribute("project-id");
          const filePath = this.getAttribute("file-path");
          const dpi = Number(this.getAttribute("dpi") || 1.5);
          const scale = Number(this.getAttribute("scale") || 1);
          const lazyLoad = this.getAttribute("lazy-load") === "true";
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
          };

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
