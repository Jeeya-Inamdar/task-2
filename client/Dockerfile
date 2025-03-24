# Use official Node.js LTS image
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy client dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire client codebase
COPY . .

# Build your app (adjust if using Vite/React accordingly)
RUN npm run build

# Final stage: Host static files with Nginx
FROM nginx:stable-alpine

# Copy built files from previous stage into nginx's HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (default HTTP port)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
