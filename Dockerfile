FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \
      chromium-browser \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV NVM_DIR /usr/local/nvm # or ~/.nvm , depending
ENV NODE_VERSION 0.10.33

# Install nvm with node and npm
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.20.0/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

WORKDIR /app

COPY . .

EXPOSE 8800

CMD ["node", "src/index"]