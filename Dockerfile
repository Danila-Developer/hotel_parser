FROM node:16.14.0

RUN apt-get update && apt-get install -y \
      git \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \

#RUN apt-get update \
#    && apt-get install -y wget gnupg \
#    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
#    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#    && apt-get update \
#    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 dbus dbus-x11 \
#      --no-install-recommends \
#    && service dbus start \
#    && rm -rf /var/lib/apt/lists/* \
#    && groupadd -r pptruser && useradd -rm -g pptruser -G audio,video pptruser

#RUN apt update

#RUN apt-get install -y --no-install-recommends \
#chromium \
#&& \
#apt-get clean && \
#rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY . .


EXPOSE 8800

CMD ["node", "src/index"]