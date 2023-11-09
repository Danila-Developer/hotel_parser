FROM ubuntu:20.04

ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION v16.14.0
RUN mkdir -p /usr/local/nvm && apt-get update && echo "y" | apt-get install curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
RUN /bin/bash -c "source $NVM_DIR/nvm.sh && nvm install $NODE_VERSION && nvm use --delete-prefix $NODE_VERSION"
ENV NODE_PATH $NVM_DIR/versions/node/$NODE_VERSION/bin
ENV PATH $NODE_PATH:$PATH

#RUN apt-get update && apt-get install -y \
#      chromium \
#      --no-install-recommends \
#    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt install snapd
RUN snap install chromium

WORKDIR /app

COPY . .

EXPOSE 8800

CMD ["node", "src/index"]