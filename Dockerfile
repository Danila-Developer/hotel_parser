FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \
      chromium-browser \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

RUN curl https://get.volta.sh | bash

RUN volta install node@16.14.0

WORKDIR /app

COPY . .

EXPOSE 8800

CMD ["node", "src/index"]