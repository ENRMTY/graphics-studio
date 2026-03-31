# LFC Studio — Graphics Tool

A React + TypeScript graphics tool for creating Liverpool FC Facebook post graphics.
Outputs 1080×1080 PNG images for full-time results and match day announcements.

## Tech Stack

- **React 18 + TypeScript** (Vite)
- **Konva.js** — canvas rendering & PNG export
- **LocalStorage** — persists teams and competitions between sessions

---

## Project Structure

```
src/
├── components/
│   ├── Canvas.tsx              # Konva stage wrapper
│   ├── CompetitionManager.tsx  # Library view: manage competitions
│   ├── CompetitionPicker.tsx   # Inline competition selector with icon support
│   ├── EventRow.tsx            # Single match event row (goal / pen / red / OG)
│   ├── FullTimePanel.tsx       # Left panel for full-time config
│   ├── Icons.tsx               # SVG icon components
│   ├── MatchdayPanel.tsx       # Left panel for match day config
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── TeamManager.tsx         # Library view: manage teams
│   └── TeamPicker.tsx          # Inline team selector with search
├── hooks/
│   └── useFileUpload.ts        # Reusable file upload hook (returns base64)
├── styles/
│   ├── globals.css             # CSS variables, base resets, shared utilities
│   └── components.css          # Component-specific styles
├── types/
│   └── index.ts                # All TypeScript interfaces and types
├── utils/
│   ├── canvasRenderer.ts       # Konva rendering logic (full-time & match day)
│   └── storage.ts              # localStorage helpers + default competitions
├── App.tsx                     # Root component, state management
└── main.tsx                    # Entry point
```

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

### Build for Production

```bash
npm run build
npm run preview
```

---

## Features

### Full Time
- Upload custom background photo
- Select competition (with icon + accent colour)
- Pick home & away teams from saved library (searchable)
- Set scoreline
- Add events: Goals, Penalties, Red Cards, Own Goals
- Each event has player name, minute, and home/away side
- Events render in separate columns below the scoreline, never overlapping logos

### Match Day
- Upload custom background photo
- Select competition
- Pick teams
- Set date, kick-off time, and venue

### Team Library
- Save teams with names and logos (PNG with transparency recommended)
- Search, edit, and delete saved teams
- Teams persist across sessions via localStorage
- Teams added inline during graphic creation are auto-saved

### Competition Library
- Pre-loaded: Premier League, Champions League, FA Cup, Carabao Cup, Europa League, Friendly
- Upload custom icons (PNG with transparency)
- Set accent colour per competition (shown as a colour chip on the graphic)
- Add, edit, delete competitions

### Export
- Exports at full **1080×1080** resolution regardless of preview scale
- PNG format, named `lfc-fulltime-{timestamp}.png` or `lfc-matchday-{timestamp}.png`

---

## Deploying to Production (Recommended Stack)

For a hosted version with cloud storage (teams/logos survive clearing the browser):

| Layer       | Tech                          | Notes                              |
|-------------|-------------------------------|------------------------------------|
| Frontend    | This React app (Vite build)   | Deploy to Vercel / Netlify / Railway |
| Backend API | Node.js + Express (TypeScript)| REST endpoints for teams, matches  |
| Database    | PostgreSQL                    | Teams, competitions, match history |
| File storage| Cloudinary (free tier)        | Logo/image URLs instead of base64  |
| Auth        | Single password (JWT)         | Personal tool — no multi-user needed |

---

## Canvas Layout Logic

The renderer in `canvasRenderer.ts` uses a **bottom-up layout** strategy:

1. Start at the bottom (`SIZE - red_bar - bottom_padding`)
2. Place events block (height = `num_events × line_height`)
3. Place team names row above events
4. Place score + logos row above team names
5. Place competition label above score
6. Place "FULL TIME" / "MATCH DAY" heading at the top of content

This means the layout **expands upward** as you add events — nothing ever overlaps.
