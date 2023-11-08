FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \
      chromium-browser \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_VERSION=16.14.0
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

WORKDIR /app

COPY . .

EXPOSE 8800

CMD ["node", "src/index"]