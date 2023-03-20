# Multipart build dockerfile to build and serve scigateway

FROM node:16.14-alpine3.15 as build

WORKDIR /scigateway

# Enable dependency caching and share the cache between projects
ENV YARN_ENABLE_GLOBAL_CACHE=true
ENV YARN_GLOBAL_FOLDER=/root/.cache/.yarn

COPY package.json tsconfig.json yarn.lock .yarnrc.yml ./
COPY .yarn /scigateway/.yarn/
COPY public /scigateway/public/

RUN --mount=type=cache,target=/root/.cache/.yarn/cache \
    set -eux; \
    yarn workspaces focus --production;

COPY . .
COPY docker/settings.json public/settings.json

RUN yarn build

# Put the output of the build into an apache server
FROM httpd:2.4-alpine3.15
WORKDIR /usr/local/apache2/htdocs
COPY --from=build /scigateway/build/. .

RUN set -eux; \
    # Privileged ports are permitted to root only by default. \
    # setcap to bind to privileged ports (80) as non-root. \
    apk --no-cache add libcap; \
    setcap 'cap_net_bind_service=+ep' /usr/local/apache2/bin/httpd; \
    \
    # Change ownership of logs directory \
    chown www-data:www-data /usr/local/apache2/logs; \
    \
    # Change ownership of settings file \
    chown www-data:www-data /usr/local/apache2/htdocs/settings.json;

# Switch to non-root user defined in httpd image
USER www-data

ENV AUTH_PROVIDER="icat"
ENV AUTH_URL="/api"

COPY docker/docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["httpd-foreground"]
EXPOSE 80
