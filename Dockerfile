# Build
FROM node:12-alpine AS builder
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Exec
FROM node:12-alpine

WORKDIR /app

# Default variables (this change on runtime depending the deployment)
ENV BACKEND_ENV=dev
ENV BACKEND_SITE=pantheon-rogers-funny-words

ENV PORT 8080

COPY --from=builder /app .

CMD [ "npm", "run", "serve" ]