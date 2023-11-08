FROM node:16.14.0

RUN apt-get install -y chromium-browser --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .


EXPOSE 8800

CMD ["node", "src/index"]