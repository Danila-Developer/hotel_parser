FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \
      chromium-browser \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

RUN NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && export NVM_DIR && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

RUN nvm install 16.14.0

WORKDIR /app

COPY . .

EXPOSE 8800

CMD ["node", "src/index"]