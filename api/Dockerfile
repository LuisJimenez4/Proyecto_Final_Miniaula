FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --chown=node:node . .
USER node
EXPOSE 3000
CMD ["sh", "-c", "node src/database/migrate.js && node src/database/seed.js && node src/index.js"]
