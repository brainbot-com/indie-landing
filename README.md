# INDIE LANDING PAGE
*The Open AI Platform for Decentralized Intelligence.*

## Overview
Indie (formerly Boxy) is a dedicated hardware platform for running open-weight AI models locally. Be Your Own Cloud.

This landing page is designed to:
1.  **Educate**: Explain the value of local, airgapped AI (privacy, cost, control).
2.  **Showcase**: Highlight the "Indie" hardware platform and ecosystem.
3.  **Capture**: Collect emails for the Q1 2026 Batch 01 allocation.

**Live Site:** https://brainbot-com.github.io/boxy-landing/

---

## Design Philosophy
*   **Aesthetic**: "Teenage Engineering meets Arc Raiders". Industrial, colorful, retro-futurist, technical.
*   **Core Colors**: Signal Orange (`#FF4D00`), Cream (`#EAEAE5`), Dark Grey (`#1A1A1A`).
*   **Typography**: `Inter` (UI) and `Courier New` (Technical specs).
*   **Vibe**: Solid, premium, hackable, transparent.

---

## Quick Start

### 1. Enable GitHub Pages
1. Go to **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** → **/ (root)**
4. Click **Save**

### 2. Configure Email Collection
Update `script.js` with your backend endpoint:
```javascript
const CONFIG = {
    formEndpoint: 'https://formspree.io/f/YOUR_FORM_ID',
    // ...
};
```

### 3. Analytics
Matomo and simple performance tracking are built-in. Update `script.js` with your instance URL if using Matomo.

---

## File Structure
```
boxy-landing/
├── index.html          # Main landing page (Indie rebranding)
├── style.css           # Industrial / retro-futurist design system
├── script.js           # Form handling + telemetry
├── README.md           # This file
└── image2.png          # Product placeholder
```

---

## Analytics Events
1. **Email Signups**: "Submit" events
2. **Scroll Depth**: 25%, 50%, 75%, 100%
3. **CTA Clicks**: "INITIATE_ACCESS", "SECURE_ALLOCATION"
4. **FAQ**: Question expansion tracking
5. **Performance**: Page load time logging

---

## Support & Contact
- **Email**: sysadmin@indie.ai
- **GitHub**: [brainbot-com/indie-core](https://github.com/brainbot-com/indie-core)

---

**Built with ❤️ in Europe. No tracking. No cookies. Pure HTML/CSS.**