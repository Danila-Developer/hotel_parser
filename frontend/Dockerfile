FROM node:16.14.0 AS build
WORKDIR /front
COPY ./frontend .
RUN yarn install
RUN yarn run build

FROM nginx:1.19-alpine
COPY --from=build /front/build /opt/site
COPY --from=build /front/nginx.conf /etc/nginx/nginx.conf