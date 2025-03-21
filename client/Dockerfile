FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# Add this line to debug
RUN ls -la && ls -la ./nginx

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Try with explicit paths
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]