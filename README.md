# EcoAction

## Local development

### Backend
1. Copy `backend/.env.example` to `backend/.env`
2. Install dependencies:
   - `cd backend && npm install`
3. Generate Prisma client:
   - `cd backend && npm run prisma:generate`
4. Build backend:
   - `cd backend && npm run build`
5. Start backend:
   - `cd backend && npm start`

### Frontend
1. Copy `frontend/.env.example` to `frontend/.env.local`
2. Install dependencies:
   - `cd frontend && npm install`
3. Build frontend:
   - `cd frontend && npm run build`
4. Start frontend:
   - `cd frontend && npm run dev`

## Deployment notes

- Backend requires a production `DATABASE_URL` environment variable.
- Frontend should point `NEXT_PUBLIC_API_BASE_URL` to the backend URL you want to use. By default, local development uses `http://localhost:4000`.
- Netlify deployment uses the included `netlify.toml` file with the `@netlify/plugin-nextjs` plugin.
- Use `prisma migrate deploy` (or `prisma migrate dev` for staging) against your production database before starting the backend.
- Do not commit `.env` or `frontend/.env.local` to source control.
