FROM node:16.14.0 AS build
WORKDIR /front
COPY ./package.json package.json
RUN yarn install
COPY . .
RUN react-scripts build

FROM nginx:1.19-alpine
COPY --from=build /front/build /opt/site
COPY --from=build /front/nginx.conf /etc/nginx/nginx.conf