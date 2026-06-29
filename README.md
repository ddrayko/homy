# Homy

Self-hosted status board. Monitor your services in real time with a clean, minimal UI.

![Screen](https://img.drayko.xyz/assets/homy.png)

![Status banner](https://img.shields.io/badge/status-up-brightgreen)

## Features

- Add/remove services (name, URL, icon)
- Auto-ping every 60s with 10-minute history
- Visual ping bars showing latency
- Status banner: operational / degraded / major incident
- Drag-and-drop reordering
- Icon picker (Simple Icons + selfhst/icons)
- Mobile-friendly

## Quick start

```bash
docker run -d -p 3000:3000 ghcr.io/ddrayko/homy
```

Open http://localhost:3000.

## Docker Compose

```yaml
services:
  homy:
    image: ghcr.io/ddrayko/homy
    container_name: homy
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

```bash
docker compose up -d
```

## Build from source

```bash
git clone https://github.com/ddrayko/homy.git
cd homy
docker build -t homy .
docker run -d -p 3000:3000 homy
```

## Development

```bash
npm install
node server.js
```

## Tech

- Node.js + Express backend
- Vanilla JS frontend
- Docker / GHCR distribution

## License

MIT

---

![Logo](https://img.drayko.xyz/assets/DRAYKO.png)
