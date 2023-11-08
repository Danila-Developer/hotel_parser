FROM node:16.14.0

RUN apt-get update && apt-get install -y \
      git \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \

WORKDIR /app

COPY . .


EXPOSE 8800

CMD ["node", "src/index"]