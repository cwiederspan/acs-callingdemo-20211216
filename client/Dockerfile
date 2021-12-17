FROM node:lts-alpine AS build
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json client.js ./
RUN npm install -g webpack@4.42.0 webpack-cli@3.3.11
RUN npm install -D
RUN npx webpack --entry ./client.js --output dist/bundle.js
COPY index.html /app/dist/

FROM nginx
COPY --from=build /app/dist/* /usr/share/nginx/html/