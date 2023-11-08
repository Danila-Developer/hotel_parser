FROM ghcr.io/linuxserver/baseimage-kasmvnc:alpine318

# set version label
ARG BUILD_DATE
ARG VERSION
LABEL build_version="Linuxserver.io version:- ${VERSION} Build-date:- ${BUILD_DATE}"
LABEL maintainer="thelamer"

# title
ENV TITLE=Chromium

RUN \
  echo "**** install packages ****" && \
  apk add --no-cache \
    chromium && \
  echo "**** cleanup ****" && \
  rm -rf \
    /tmp/*


WORKDIR /app

COPY . .


EXPOSE 8800

#CMD ["node", "src/index"]