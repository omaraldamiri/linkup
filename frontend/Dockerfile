# Stage 1 — Build the React app
FROM node:20-slim AS builder

WORKDIR /app

COPY . .

ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# We must remove package-lock.json because it locks optional dependencies for Windows, causing lightningcss to fail on Linux.
RUN rm -f package-lock.json && npm install

RUN npm run build

# Stage 2 — Serve with nginx
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]