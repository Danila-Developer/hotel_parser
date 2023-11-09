FROM node:15.8-alpine3.11 AS build
WORKDIR /app
COPY package.json package.json
RUN yarn install
COPY . .
RUN yarn build

FROM nginx:1.19-alpine
COPY --from=build /app/build /opt/site
COPY /nginx/nginx.conf /etc/nginx/nginx.conf