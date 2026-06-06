# Adswadi WhatsApp API

WhatsApp Marketing SaaS Platform for Indian Digital Marketing Agencies.

## Quick Start

1. Copy `.env.example` to `.env` in server/ and fill in values
2. Run: `docker-compose up -d`
3. Or manually: start MongoDB + Redis, then `cd server && npm run dev` and `cd client && npm run dev`

## Environment Setup

See `server/.env.example` for required variables.

## Tech Stack
- Frontend: React 18 + Vite + TailwindCSS + shadcn/ui
- Backend: Node.js + Express.js + MongoDB + Redis
- Real-time: Socket.IO
- WhatsApp: Meta Cloud API
- Payments: Razorpay
