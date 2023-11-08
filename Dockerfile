FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \
      chromium-browser \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs

WORKDIR /app

COPY . .

EXPOSE 8800

CMD ["node", "src/index"]