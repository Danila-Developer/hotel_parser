FROM node:16.14.0 AS build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
WORKDIR /front
COPY ./frontend .
RUN yarn install
RUN yarn run build

FROM nginx:1.19-alpine
COPY --from=build /front/build /opt/site
COPY --from=build /front/nginx.conf /etc/nginx/nginx.conf