# Portfolio Website

Personal portfolio site for **Joel Albert Montuya** — Applied AI and Backend Engineer. Showcases background, selected projects, and technical skills across conversational AI, RAG, speech AI, backend engineering, and cloud delivery.

This project was built with **AI-assisted development** using [Cursor](https://cursor.com), Antigravity, and Codex.

## Live Site

Deployed on Vercel. See the repository's GitHub Pages or Vercel deployment for the live URL.

## Features

- **Hero** — animated background, typed role text, profile summary, and quick stats
- **About** — experience timeline, education, highlights, and awards
- **Projects** — curated project cards with tech tags, live demo links, and featured highlights (including HomeCare Scheduler)
- **Skills** — grouped skillsets across AI/ML, backend, cloud/DevOps, and data
- **Contact** — email and social links (GitHub, LinkedIn)

## Tech Stack

- HTML5, CSS3, vanilla JavaScript
- [Vercel Analytics](https://vercel.com/docs/analytics) for usage tracking
- [serve](https://www.npmjs.com/package/serve) for local static hosting

## AI-Assisted Development

This portfolio was developed with AI-assisted workflows:

- **Cursor** — agentic coding, edits, and iteration
- **Antigravity** — AI-assisted development
- **Codex** — AI-assisted coding

## Featured Project: HomeCare Scheduler

Microsoft AI103 capstone — full-stack home care platform with caregiver/admin portals and the **Uhie** AI assistant (Microsoft Foundry + RAG + OpenAPI tools).

**Live demo:** [home-care-website-react.vercel.app](https://home-care-website-react.vercel.app)

**Sample accounts (demo data only):**
- Admin: James Smith · `ADM-003`
- Caregiver: Sarah Connor · `EMP003`

### Architecture

![HomeCare Scheduler architecture](assets/homecare-scheduler-architecture.png)

## Project Structure

```
portfolio-website/
├── index.html      # Main page (hero, portfolio tabs, contact)
├── style.css       # Global styles and component layout
├── main.js         # Particles, tabs, animations, analytics
├── profile.png     # Profile image
├── assets/         # Project images and diagrams
├── package.json    # Dependencies and scripts
└── Dockerfile      # Optional container build (nginx)
```

## Local Development

```bash
npm install
npm start
```

This serves the site locally (default port from `serve`).

## Author

**Joel Albert Montuya**

- GitHub: [montuyajoel](https://github.com/montuyajoel)
- LinkedIn: [joel-montuya](https://www.linkedin.com/in/joel-montuya/)

## License

MIT
