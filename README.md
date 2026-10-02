# AdsToto — Real-Time Pay-to-Rank Digital Advertising Exchange

> **Transparent, high-velocity digital advertising exchange & sponsor marketplace.**
> Live on [adstoto.com](https://adstoto.com)

---

## 🌟 Overview

AdsToto is a modern, transparent pay-to-rank advertising platform. Rather than relying on opaque ad networks or algorithmic black boxes, ad placements (#1, #2, #3, etc.) are strictly determined by real-time bidding.

The highest bidder holds the prestigious **#1 Crown Spot**, capturing maximum impressions, click-through rates (CTR), and referral traffic.

---

## 🚀 Key Features

- **🏆 Real-Time Leaderboard**: Live transparent rankings sorted dynamically by active bid value.
- **👑 Rank #1 Crown Spotlight**: Highlighted hero slot for the top campaign with interactive preview and live telemetry.
- **👤 Advertiser Account & Login Hub**:
  - Email & Password authentication + persistent advertiser profiles.
  - **Decentralized Web3 Login**: Sign in with any BEP-20 / EVM wallet address.
  - **Secure Password Reset**: 2-step verification code flow with 15-minute expiration.
  - **Automated Transactional Emails**: Welcome confirmation and password reset dispatch.
- **📊 Real-Time Advertiser Telemetry**:
  - Live impression counts, click tracking, CTR%, CPC, and ROAS calculations.
- **🛡️ Auto-Bid Defense Shield**:
  - Automatically matches and leapfrogs competitor bids up to a configurable budget ceiling.
- **⚡ Crypto Payment & Settlement Support**:
  - Native BNB Smart Chain (BEP-20) for USDT, USDC, and BNB with 3-second block finality and low gas fees.
- **🔍 Full SEO & OpenGraph Optimization**:
  - Semantic HTML, Schema.org JSON-LD structured data (`WebApplication`, `Organization`, `FAQPage`), OpenGraph cards, Twitter cards, and sitemap.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Storage**: Browser `localStorage` for zero-backend client persistence.

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Build for Production
```bash
npm run build
```
The optimized static build will be generated in the `dist/` directory.

---

## 🌐 Deploying to GitHub Pages

This repository is pre-configured with a zero-configuration GitHub Actions workflow (`.github/workflows/deploy.yml`) and `CNAME` for `adstoto.com`:

1. Push this repository to your GitHub account (`git push origin main`).
2. In your GitHub repository, navigate to **Settings** &rarr; **Pages**.
3. Under **Build and deployment** &rarr; **Source**, select **GitHub Actions**.
4. GitHub Actions will automatically build and publish your site!

---

## 📄 License

MIT © [AdsToto](https://adstoto.com)
