# --- Stage 1: Build React App ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install dependency (pakai pnpm kalau di laptop pnpm, tapi npm aman buat docker)
RUN npm install
COPY . .
# Build aplikasi jadi file static HTML/CSS/JS
RUN npm run build

# --- Stage 2: Serve pakai Nginx ---
FROM nginx:alpine
# Copy hasil build dari Stage 1 ke folder Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy config nginx default (biar routing React Router aman)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]