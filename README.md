# FARUKH – Lab Test Result Management System

Lab Test Result Management System with role-based workflow (Lab Technician → Doctor → Admin) and full CI/CD pipeline.

## Research Question

*How can DevOps practices (CI/CD) be designed and integrated into an Agile-based Lab Test Result Management System to improve software quality, deployment reliability, and development efficiency in healthcare software development?*

## Roles and Status Flow

- **Lab Technician**: Upload test results → status **Pending**
- **Doctor**: Review results → status **Reviewed**
- **Admin**: Approve results → status **Approved**

## Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Joi, Helmet, CORS
- **Frontend**: React (Vite), React Router, Axios
- **Testing**: Jest, Supertest, mongodb-memory-server (in-memory DB for local tests)
- **CI/CD**: GitHub Actions (`.github/workflows/ci-cd.yml`)

## MongoDB

Same connection string as existing project; **database name**: `farukh-lab-results`.  
Set `MONGODB_URI` in server `.env` to override (e.g. for local: `mongodb://localhost:27017/farukh-lab-results`).

## Setup

### Server

```bash
cd server
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET
npm install
npm run dev
```

Runs on `http://localhost:5000`. Health: `GET /health`.

### Client

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:5173`. Uses Vite proxy to `/api` → `http://localhost:5000`.

### Tests

```bash
cd server
npm install
npm test
```

**Local:** Tests use **mongodb-memory-server** (in-memory MongoDB), so you do **not** need MongoDB installed or running. First run may download the MongoDB binary into `server/.cache/`.

**CI:** GitHub Actions uses the MongoDB service container and sets `MONGODB_URI`; no extra config needed.

### Lint

```bash
cd server
npm run lint
```

## CI/CD Pipeline

- **Lint**: ESLint on server
- **Test**: Jest (auth + results + roles). CI uses MongoDB service; local runs use in-memory DB.
- **Build**: Vite build for client
- **Deploy Staging**: on push to `develop` (placeholder)
- **Deploy Production**: on push to `main` (placeholder)

See `.github/workflows/ci-cd.yml`. For first-time CI, ensure `server/package-lock.json` exists (run `npm install` in `server` and commit).

## Project Structure

```
FARUKH/
├── .github/workflows/ci-cd.yml
├── client/          # Vite + React
├── server/          # Express API, models, routes, tests
└── README.md
```
