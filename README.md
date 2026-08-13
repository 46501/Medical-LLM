# MediMind AI

MediMind AI is a full-stack AI-powered medical assistant application. It provides an interactive chat interface with a Medical Safety Engine, medical document OCR, and RAG capabilities.

## Architecture
- **Frontend**: Next.js 15+ (App Router), TailwindCSS, TypeScript.
- **Backend**: FastAPI, Python 3.11+, SQLAlchemy, Uvicorn/Gunicorn.
- **Database**: PostgreSQL with `pgvector` extension for embeddings and vector search.
- **LLM**: Gemini API integration.

## Local Development (Without Docker)

### 1. Database Setup
Ensure you have a PostgreSQL instance running locally with the `pgvector` extension installed. Create a database named `medimind_db`.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env   # Update the variables in .env
alembic upgrade head      # Run migrations
uvicorn main:app --reload # Start the server
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev               # Start the Next.js development server
```

## Docker Deployment (Full Stack)
The easiest way to run the entire application is using Docker Compose.

1. Create a `.env` file in the root directory by copying `.env.example` and filling in your API keys:
   ```bash
   cp .env.example .env
   ```
2. Build and start the containers:
   ```bash
   docker compose up -d --build
   ```
3. Run the database migrations (only needed on first run):
   ```bash
   docker compose exec backend alembic upgrade head
   ```
4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API Docs: http://localhost:8000/docs

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ENVIRONMENT` | `development` or `production`. Controls logging and debug modes. |
| `FRONTEND_URL` | The URL of the deployed frontend (e.g., `https://medimind.vercel.app`). Used for CORS. |
| `DATABASE_URL` | PostgreSQL connection string (e.g., `postgresql+psycopg://user:pass@host:5432/db`). |
| `JWT_SECRET` | Secret key used for signing JWT authentication tokens. Generate a strong random string. |
| `OPENAI_API_KEY` | (Optional) OpenAI API key if using GPT models for specific pipelines. |
| `GEMINI_API_KEY` | Required Gemini API key for the primary LLM provider. |

## Cloud Production Deployment

### 1. Database (Managed PostgreSQL)
Deploy a managed PostgreSQL database (e.g., Supabase, Neon, AWS RDS, Render) that supports the `pgvector` extension.
Update the `DATABASE_URL` in your backend environment variables with the connection string.

### 2. Backend (Render / AWS / Railway / Fly.io)
1. Connect your GitHub repository to your hosting provider.
2. Set the root directory to `backend`.
3. Set the build command: `pip install -r requirements.txt`
4. Set the start command: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
5. Add all required Environment Variables.
6. After deployment, run `alembic upgrade head` via your provider's shell/console to run migrations on the production database.

### 3. Frontend (Vercel / Netlify)
1. Connect your GitHub repository to Vercel.
2. Set the root directory to `frontend`.
3. The build command will automatically be detected as `npm run build`.
4. Add the `NEXT_PUBLIC_API_URL` environment variable pointing to your deployed backend URL (e.g., `https://your-backend-url.onrender.com`).
5. Deploy.
