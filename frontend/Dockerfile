FROM node:16.14.0 AS build
WORKDIR /app
COPY package.json package.json
RUN yarn install
COPY . .
RUN yarn build

FROM nginx:1.19-alpine
COPY --from=build /app/build /opt/site
COPY --from=build /app/nginx.conf /etc/nginx/nginx.conf