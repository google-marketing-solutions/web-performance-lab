# Performance Lab Sandbox: Editorial News Site Production Anomalies

This repository is a sandboxed news site containing three pages—**Home** (`index.html`), **Global** (`global.html`), and **Economy** (`economy.html`)—designed to demonstrate authentic, non-simulated performance bugs commonly found in high-traffic, ad-heavy publisher websites. 

These issues directly impact Core Web Vitals (LCP, CLS, INP) and BFCache safety, mimicking real-world production configurations.

---

## Codebase Folder Structure

To ensure a clean, professional architecture and completely eliminate code redundancy, all common styling, placeholder images, and JavaScript functionality are extracted into shared modular files under dedicated directories:

```
├── css/
│   └── style.css            # Shared visual layouts, styles, and typography
├── images/
│   ├── hero-home.bmp        # Solid slate gray home hero placeholder (5.49 MB)
│   ├── hero-global.bmp      # Solid burgundy maroon global hero placeholder (5.49 MB)
│   └── hero-economy.bmp     # Solid deep navy economy hero placeholder (5.49 MB)
├── js/
│   ├── ads.js               # Shared Google Publisher Tag (GPT) setup engine
│   ├── metrics.js           # Shared Cross-Page Metrics observer engine
│   └── scripts.js           # Shared lab performance scripts (LCP, CLS, INP)
├── index.html               # Home section page
├── global.html              # Global section feed page
├── economy.html             # Economy macro market section page
└── README.md                # Sandbox catalog documentation
```

---

## You can run a local server

`python3 -m http.server`