FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src

# Expose port (Hugging Face will use 7860 by default, but we listen on PORT env var)
EXPOSE 3001

# Set environment variables for Hugging Face Spaces
ENV NODE_ENV=production
ENV PORT=7860
ENV CORS_ORIGINS=https://abdulrehman346790.github.io,http://localhost:3000

# Start the app
CMD ["node", "src/index.js"]
