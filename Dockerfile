# Multipart build dockerfile to build and serve scigateway

FROM node:16.14-alpine3.15 as build

WORKDIR /scigateway

COPY package.json tsconfig.json yarn.lock .yarnrc.yml ./
COPY .yarn /scigateway/.yarn/
COPY public /scigateway/public/

RUN yarn workspaces focus --production

COPY . .

RUN yarn build

# Put the output of the build into an apache server
FROM httpd:2.4-alpine3.15
WORKDIR /usr/local/apache2/htdocs
COPY --from=build /scigateway/build/. .

RUN apk --no-cache add libcap \
  # Privileged ports are permitted to root only by default.
  # setcap to bind to privileged ports (80) as non-root.
  && setcap 'cap_net_bind_service=+ep' /usr/local/apache2/bin/httpd \
  # Change access righs for logs from root to www-data
  && chown www-data:www-data /usr/local/apache2/logs

# Switch to non-root user defined in httpd image
USER www-data
