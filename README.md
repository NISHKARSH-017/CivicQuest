CivicQuest

Punk-blue 3D civic engagement app with a persistent Express + SQLite backend.

## Run locally

```bash
npm install
npm start
```
Open http://localhost:3000/#/home

## API

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/wallet`
- `GET /api/issues`
- `POST /api/issues`
- `PATCH /api/issues/:id/status`
- `GET /api/missions`
- `POST /api/missions/:id/complete`
- `POST /api/rewards/redeem`

The demo user is seeded as Alex Stone. Issue submission awards 10 Civic Coins, verification awards 30, and resolution awards 50. Exact category/location matches from another user within seven days are marked as duplicates and receive no coins.

GitHub Pages note

GitHub Pages can host the static frontend but cannot run this Node backend. Deploy the Node server to Render, Railway, Fly.io, or another Node host, then configure the frontend API base URL for that deployment.
