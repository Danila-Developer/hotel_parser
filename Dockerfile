FROM node:16.14.0

#RUN apt-get update && apt-get install -y \
#      chromium \
#      chromium-l10n \
#      fonts-liberation \
#      fonts-roboto \
#      hicolor-icon-theme \
#      libcanberra-gtk-module \
#      libexif-dev \
#      libgl1-mesa-dri \
#      libgl1-mesa-glx \
#      libpangox-1.0-0 \
#      libv4l-0 \
#      fonts-symbola \
#      --no-install-recommends \
#    && rm -rf /var/lib/apt/lists/* \
#    && mkdir -p /etc/chromium.d/ \
#    && /bin/echo -e 'export GOOGLE_API_KEY="AIzaSyCkfPOPZXDKNn8hhgu3JrA62wIgC93d44k"\nexport GOOGLE_DEFAULT_CLIENT_ID="811574891467.apps.googleusercontent.com"\nexport GOOGLE_DEFAULT_CLIENT_SECRET="kdloedMFGdGla2P1zacGjAQh"' > /etc/chromium.d/googleapikeys
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 dbus dbus-x11 \
      --no-install-recommends \
    && service dbus start \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r pptruser && useradd -rm -g pptruser -G audio,video pptruser

## Add chromium user
#RUN groupadd -r chromium && useradd -r -g chromium -G audio,video chromium \
#    && mkdir -p /home/chromium/Downloads && chown -R chromium:chromium /home/chromium

WORKDIR /app

COPY . .


EXPOSE 8800

CMD ["node", "src/index"]