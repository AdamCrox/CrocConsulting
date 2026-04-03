# Croc Consulting

Procurement consultancy website with quote management portal.

## Project Structure

```
croc-consulting/
  frontend/           # React SPA
  backend/            # FastAPI API
  docker-compose.yml  # Local development
```

## Local Development

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- MongoDB: localhost:27017

## Zeabur Deployment

### Services Required
1. **frontend** - Docker service, expose port 80
2. **backend** - Docker service, expose port 8000
3. **mongodb** - Zeabur MongoDB add-on

### Environment Variables

**Backend:**
- `MONGODB_URI` - Auto-provided by Zeabur MongoDB add-on
- `DATABASE_NAME` - `croc_consulting`
- `OPENAI_API_KEY` - Your OpenAI API key
- `ALLOWED_ORIGINS` - Frontend domain (e.g., https://crocconsulting.com.au)

**Frontend:**
- `REACT_APP_API_URL` - Backend URL or `/api` for proxy

### Deployment Steps
1. Push code to GitHub (jaredcroxton/croc-consulting)
2. Create new project in Zeabur
3. Add MongoDB from Marketplace
4. Add frontend service (select frontend directory)
5. Add backend service (select backend directory)
6. Set environment variables
7. Bind custom domain to frontend

## Demo Credentials
- Client ID: `ERG-2025`
- Password: `demo1234`
- Client: Ergon Energy

## Features
- Marketing landing page
- Quote submission portal (upload or fill out)
- Quote viewing portal with authentication
- Progress tracking, line items, RFI management
- AI-powered RFQ document generation
- Contact/booking form
