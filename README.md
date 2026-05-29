# 🌸 Jajie's Expense Tracker

A cute, fast, local-first personal budgeting app with pink theme, dark mode, and full-year analytics.

---

## 📁 Folder Structure

```
jajie-expense-tracker/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx        ← Entire app in one file
    └── index.css
```

---

## 📦 Installation

```bash
# 1. Open this folder in VS Code terminal
cd jajie-expense-tracker

# 2. Install dependencies
npm install
```

---

## 🚀 Run in VS Code

```bash
npm run dev
```

Then open: **http://localhost:5173**

---

## 🏗️ Build for Production

```bash
npm run build
```

Output goes to `/dist`.

---

## 🌐 Deploy to GitHub Pages

### One-time setup:
1. Create a GitHub repo (e.g. `jajie-expense-tracker`)
2. Push this project to it
3. In `package.json`, the `"homepage"` field is optional since `base: "./"` handles paths

### Deploy command:
```bash
npm run deploy
```

This runs `vite build` then publishes `/dist` to the `gh-pages` branch automatically.

Your app will be live at:
`https://<your-github-username>.github.io/jajie-expense-tracker/`

---

## ✨ Features

- **Dashboard** — Summary cards + monthly bar chart + recent transactions
- **Transactions** — Full list with edit/delete per month+year
- **Analytics** — Area chart, pie chart by category, savings bar chart
- **Dark mode** — Toggle with 🌙/☀️ button, persisted
- **localStorage** — All data persists across sessions
- **Year filter** — 2026–2035
- **Month filter** — All 12 months

## 💰 Transaction Types

| Type | Behavior |
|------|----------|
| Income | Added to Income total |
| Expense | Added to Expenses total |
| Savings | Shown separately, NOT counted as expense |

**Balance = Income − Expenses − Savings**

---

## 📱 Mobile Responsive
Fully optimized for phones with sticky header, tap-friendly buttons, and compact cards.
