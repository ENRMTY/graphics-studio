# EoL Graphics Studio — Graphics Tool

A React + TypeScript graphics tool for creating football (mainly Liverpool FC) social media post graphics.

## Tech Stack

- **React 18 + TypeScript** (Vite)
- **Konva.js** — canvas rendering & PNG export

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Features

### Full Time

- Upload custom background photo
- Select competition
- Pick home & away teams from saved library (or add your own)
- Set scoreline
- Add events: Goals, Penalties, Red Cards, Own Goals
- Each event has player name, minute, and home/away side

### Match Day

- Upload custom background photo
- Select competition
- Pick teams
- Set date, kick-off time, and venue

### Team Library

- Save teams with names and logos (PNG with transparency recommended)
- Search, edit, and delete saved teams
- Teams added inline during graphic creation are auto-saved

### Competition Library

- Upload custom icons (PNG with transparency)
- Set accent colour per competition (shown as a colour chip on the graphic)
- Add, edit, delete competitions

### Export

- Exports at full **selected** resolution regardless of preview scale
