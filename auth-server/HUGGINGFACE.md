# Auth Server - Hugging Face Spaces Deployment

This is the authentication server for the Physical AI textbook, deployed on Hugging Face Spaces.

## Environment Variables (Set in Hugging Face Spaces Settings)

```
BETTER_AUTH_SECRET=<your-secret-32-chars>
BETTER_AUTH_URL=<hugging-face-space-url>
DATABASE_URL=<neon-postgres-url>
CORS_ORIGINS=https://abdulrehman346790.github.io,http://localhost:3000
PORT=7860
NODE_ENV=production
```

## Deployment Instructions

1. Create a new Space on Hugging Face (https://huggingface.co/new-space)
2. Select Docker as the runtime
3. Connect to this GitHub repository
4. Set the environment variables above in Space Settings
5. Space will auto-build and deploy from Dockerfile

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/*` - Better-auth endpoints (handled by better-auth middleware)
- `GET /api/profile/questionnaire` - Get user profile with questionnaire data
- `PUT /api/profile/questionnaire` - Update user profile

## CORS Configuration

GitHub Pages domain is automatically allowed via `CORS_ORIGINS` environment variable.
