FROM node:16.14.0

RUN apt-get update && apt-get install -y \
      chromium-browser \
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
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

EXPOSE 8800

CMD ["node", "src/index"]