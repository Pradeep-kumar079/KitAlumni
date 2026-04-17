# 🔥 BUILD STAGE
FROM node:18 as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 🔥 PRODUCTION STAGE
FROM nginx:alpine

# Copy React build
COPY --from=build /app/build /usr/share/nginx/html

# 🔥 COPY CUSTOM NGINX CONFIG
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]