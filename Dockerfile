FROM node:16.14.0

RUN wget http://mirrors.kernel.org/ubuntu/pool/universe/c/chromium-browser/chromium-chromedriver_85.0.4183.83-0ubuntu2_amd64.deb && apt install ./chromium-chromedriver_85.0.4183.83-0ubuntu2_amd64.deb

WORKDIR /app

COPY . .

EXPOSE 8800

CMD ["node", "src/index"]