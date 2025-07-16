# Stage 1: Build the React application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.21-alpine
COPY --from=builder /app/build /usr/share/nginx/html
# The nginx config is copied via the volume mount in docker-compose.yml
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 