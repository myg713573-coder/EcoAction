# EcoAction Deployment Guide

## Required production envs

### Backend
- DATABASE_URL
- PORT=4000

### Frontend
- NEXT_PUBLIC_API_BASE_URL=https://your-render-backend-url

## Recommended cloud deployment

### Option A: Netlify + Render
1. Deploy the backend to Render using the included `render.yaml`.
2. After the backend is live, copy its public HTTPS URL.
3. Set the live `DATABASE_URL` in Render.
4. Deploy the frontend to Netlify using the included `netlify.toml`.
5. In Netlify, set the environment variable `NEXT_PUBLIC_API_BASE_URL` to the public Render backend URL.
6. Redeploy the frontend after the env change.

### Option B: Docker Compose
1. Run the stack locally using `docker compose up --build`.
2. For cloud hosting, move the same Docker service definitions to a cloud VM or container host.

## Public preview checklist

Before you expect the site to be internet-previewable:
- The backend must be live on a public HTTPS host.
- The frontend must be live on Vercel with the correct public backend URL.
- The backend must point to a production PostgreSQL instance.
- Run `npx prisma migrate deploy` once against the production DB before launching the API.

## Live DB setup

Use PostgreSQL and run:

```bash
cd backend
npx prisma migrate deploy
```

## Verification

- Frontend should respond on `http://localhost:3000` in local preview.
- Backend should respond on `http://localhost:4000` in local preview.
- Registration should be tested with a valid or invalid referral code flow.
