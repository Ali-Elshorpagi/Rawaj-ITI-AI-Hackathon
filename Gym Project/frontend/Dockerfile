# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# ---- Production Stage ----
FROM nginx:1.25-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
