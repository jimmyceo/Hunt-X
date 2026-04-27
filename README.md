# Hunt-X

AI-Powered Job Search Copilot — Auto-find jobs, generate tailored CVs, track applications.

## Features

- 🤖 **AI Resume Analysis** — Upload your resume, get optimization suggestions
- 📝 **Tailored CV Generation** — Generate ATS-optimized CVs for any job
- 📊 **Application Tracker** — Dashboard to manage all applications
- 💳 **Subscription Plans** — Free, Starter (€9), Pro (€29), Team (€49)

## Tech Stack

- **Frontend:** Next.js 14 + Tailwind CSS
- **Backend:** Python FastAPI
- **AI:** Ollama Cloud (Kimi models)
- **Database:** SQLite (PostgreSQL ready)
- **Auth:** JWT-based (custom implementation with bcrypt + python-jose)
- **Payments:** Stripe

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## Environment Variables

Create `.env` in backend:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=sqlite:///./hunt_x.db
```

## Documentation

- [Stripe Integration Guide](STRIPE_INTEGRATION_GUIDE.md)
- [SaaS Strategy](.github/SAAS_TRANSFORMATION_STRATEGY.md)

## License

MIT
