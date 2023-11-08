FROM node:16.14.0

RUN apt install snapd

RUN ln -s /var/lib/snapd/snap /snap

RUN snap install chromium

WORKDIR /app

COPY . .

EXPOSE 8800

CMD ["node", "src/index"]