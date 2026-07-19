# Homy

Self-hosted status board. Monitor your services in real time with a clean, minimal UI.

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/44b43dd9-5ba4-4ac7-a993-ceba82e5f325" />

## Features

- Add/remove services (name, URL, icon)
- Auto-ping every 60s with 10-minute history
- Visual ping bars showing latency
- Status banner: operational / degraded / major incident
- Drag-and-drop reordering
- Icon picker (Simple Icons)
- Mobile-friendly

## Quick start

```bash
docker run -d \
  -p 3000:3000 \
  -e DATA_DIR=/app/data \
  -v ./data:/app/data \
  ghcr.io/ddrayko/homy
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
    environment:
      - DATA_DIR=/app/data
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

```bash
docker compose up -d
```

> **Note:** `DATA_DIR` must be set to `/app/data` so data files are written inside the mounted volume. Without it, services and ping history are stored inside the container and lost on recreate.

## Build from source

```bash
git clone https://github.com/ddrayko/homy.git
cd homy
docker build -t homy .
docker run -d -p 3000:3000 homy
```

## Update

**Docker Compose:**

```bash
docker compose pull && docker compose up -d --force-recreate
```

**Docker Run:**

```bash
docker pull ghcr.io/ddrayko/homy
docker stop homy && docker rm homy
docker run -d \
  -p 3000:3000 \
  -e DATA_DIR=/app/data \
  -v ./data:/app/data \
  --restart unless-stopped \
  --name homy \
  ghcr.io/ddrayko/homy
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

## Star History

[![Star History Chart](https://api.star-history.com/chart?repos=ddrayko/homy&type=date&legend=top-left&sealed_token=q40w3_bUAhdyb71n9ngKayQyLyiq8aQcpPM410WaCBloV2H3u1MK0LUpyTjxMZ1fLk4BJMEH_mMaFV1queen88zQsfmuZ8n52T6LNfZZ_a8K4DeOdpxqEppG3jVtJ1Y-QCTp_uThPBNpHTbnxiUI_gzF8CKOiAU3y9ltL1GkDWelehRCzDWvXmF3KdRZ)](https://www.star-history.com/?repos=ddrayko%2Fhomy&type=date&legend=top-left)
