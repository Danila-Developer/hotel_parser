FROM node:16.14.0

RUN snap install chromium

WORKDIR /app

COPY . .

EXPOSE 8800

CMD ["node", "src/index"]