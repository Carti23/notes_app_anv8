# Build stage
FROM --platform=linux/amd64 node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install axios react-router-dom --save

COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
RUN npm run build

# Production stage
FROM --platform=linux/amd64 nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create directory for static files
RUN mkdir -p /usr/share/nginx/html/static

# Copy static files
COPY --from=build /app/build/static /usr/share/nginx/html/static

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
