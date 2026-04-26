# 🥋 TypeDojo

> A modern, glassmorphism-styled typing speed trainer with belt-rank progression, mistake heatmaps, and live WPM analytics.

[![MIT License](https://img.shields.io/badge/license-MIT-yellow.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)](https://vitejs.dev)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://typedojo.vercel.app)

---

## ✨ What makes TypeDojo different

Most typing test clones are pixel-for-pixel Monkeytype copies. TypeDojo isn't. It's built with three showstopper features:

| Feature | What it does |
|---------|-------------|
| 🥋 **Belt Rank System** | Earn White → Black belt based on your WPM. Ranks persist across sessions. A cinematic unlock animation fires when you hit a new rank. |
| 🔥 **Mistake Heatmap** | After every test, a keyboard SVG lights up your weakest keys in red — giving you a fingerprint of exactly where to drill. |
| 📈 **Live WPM Chart** | Real-time graph of your speed across the test so you can see exactly where you slow down. |

---

## 🖥️ Preview

![TypeDojo Screenshot](./public/preview.png)
> _Add a screenshot at `public/preview.png` after your first deploy_

---

## 🚀 Getting started

### Prerequisites
- Node.js ≥ 18
- npm or yarn

### Install & run locally

```bash
git clone https://github.com/Aarya-Mhatre69/TypeDojo.git
cd TypeDojo
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
```

Output goes to `/dist` — ready to deploy anywhere.

---

## ☁️ Deploy to Vercel (one-click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Aarya-Mhatre69/TypeDojo)

**Manual steps:**
1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import `Aarya-Mhatre69/TypeDojo`
3. Framework preset: **Vite** (auto-detected)
4. Click **Deploy** — done ✅

No environment variables needed. TypeDojo is fully client-side.

---

## 🗂️ Project structure

```
TypeDojo/
├── public/
│   └── words/
│       └── english.json          # Word list (1000 common English words)
├── src/
│   ├── components/
│   │   ├── ConfigBar.jsx         # Mode / time / punctuation toggles
│   │   ├── TypingTest.jsx        # Core typing engine
│   │   ├── ResultScreen.jsx      # Post-test results with chart + heatmap
│   │   ├── BeltBadge.jsx         # Belt badge + unlock overlay
│   │   └── KeyboardHeatmap.jsx   # SVG keyboard mistake visualiser
│   ├── store/
│   │   └── useStore.js           # Zustand store (with localStorage persistence)
│   ├── utils/
│   │   └── helpers.js            # WPM calc, belt logic, word gen, mistake map
│   ├── App.jsx
│   └── index.css                 # Full glassmorphism theme
├── package.json
└── README.md
```

---

## 🛠️ Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React 18 | Component model fits the typing UI perfectly |
| Build tool | Vite 5 | Sub-second HMR during development |
| State | Zustand + persist middleware | Minimal boilerplate, localStorage sync out of the box |
| Charts | Recharts | Declarative, easy to theme |
| Fonts | Space Mono + DM Sans | Monospace for the typing area, clean sans for UI |
| Styling | Vanilla CSS with variables | Zero runtime overhead, full control |

---

## 🎮 How to use

1. **Pick your mode** — `time` (15 / 30 / 60 / 120s) or `words` (10 / 25 / 50 / 100)
2. **Toggle punctuation / numbers** for harder tests
3. **Start typing** — the test begins on your first keystroke
4. **Read your results** — WPM, accuracy, belt rank, WPM chart, and mistake heatmap
5. **Hit Try Again** — your belt and best WPM are saved automatically

---

## 🥋 Belt rank thresholds

| Belt | WPM Range | Unlocks |
|------|-----------|---------|
| ⬜ White | 0 – 20 | Starting rank |
| 🟡 Yellow | 21 – 35 | You're getting warmed up |
| 🟢 Green | 36 – 50 | Solid everyday typist |
| 🔵 Blue | 51 – 70 | Above average — most people stop here |
| 🔴 Red | 71 – 90 | Power user territory |
| ⬛ Black | 91+ | Elite — fewer than 1% of typists |

---

## 🤝 Contributing

Contributions are welcome! This repo is intentionally open — fork it, make it yours.

```bash
# 1. Fork the repo on GitHub
# 2. Create a feature branch
git checkout -b feature/my-cool-thing

# 3. Commit your changes
git commit -m "feat: add my cool thing"

# 4. Push and open a PR
git push origin feature/my-cool-thing
```

**Ideas for contributions:**
- [ ] Ghost mode — race your personal best as a ghost cursor
- [ ] Sound design — mechanical / typewriter keystroke themes  
- [ ] Themed word lists — Code Syntax, Hindi, Movie Quotes
- [ ] Multiplayer race mode
- [ ] Mobile soft-keyboard support

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for full text. Free to use, modify, and distribute. Attribution appreciated but not required.

---

## 👤 Author

**Aarya Mhatre**

[![GitHub](https://img.shields.io/badge/GitHub-Aarya--Mhatre69-black?logo=github)](https://github.com/Aarya-Mhatre69)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-aarya--mhatre-blue?logo=linkedin)](https://www.linkedin.com/in/aarya-mhatre-3b98a7289/)
[![Email](https://img.shields.io/badge/Email-theaaryamahtre%40gmail.com-red?logo=gmail)](mailto:theaaryamahtre@gmail.com)

---

<p align="center">
  Built with ♥ · Star the repo if TypeDojo helped you level up your typing 🌟
</p>
