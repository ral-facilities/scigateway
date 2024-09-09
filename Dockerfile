# Dockerfile to build and serve scigateway

# Build stage
FROM node:20.14.0-alpine3.20@sha256:928b24aaadbd47c1a7722c563b471195ce54788bf8230ce807e1dd500aec0549 as builder

WORKDIR /scigateway-build

# Enable dependency caching and share the cache between projects
ENV YARN_ENABLE_GLOBAL_CACHE=true
ENV YARN_GLOBAL_FOLDER=/root/.cache/.yarn

COPY package.json tsconfig.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY public public

RUN --mount=type=cache,target=/root/.cache/.yarn/cache \
    set -eux; \
    \
    yarn workspaces focus --production;

COPY . .
COPY docker/settings.json public/settings.json

RUN yarn build

# Run stage
FROM httpd:2.4.59-alpine3.20@sha256:f32374473ef537ea79cb0d17cb5003c9f10c6b4bc885d0affcb5c37d63e3a3d3

WORKDIR /usr/local/apache2/htdocs

# Put the output of the build into an apache server
COPY --from=builder /scigateway-build/build/. .

RUN set -eux; \
    \
    # Enable mod_rewrite \
    sed -i -e 's/^#LoadModule rewrite_module/LoadModule rewrite_module/' /usr/local/apache2/conf/httpd.conf; \
    # Enable mod_deflate \
    sed -i -e 's/^#LoadModule deflate_module/LoadModule deflate_module/' /usr/local/apache2/conf/httpd.conf; \
    echo '<Location / >' >> /usr/local/apache2/conf/httpd.conf; \
    echo '    RewriteEngine on' >> /usr/local/apache2/conf/httpd.conf; \
    # Don't rewrite files or directories \
    echo '    RewriteCond %{REQUEST_FILENAME} -f [OR]' >> /usr/local/apache2/conf/httpd.conf; \
    echo '    RewriteCond %{REQUEST_FILENAME} -d' >> /usr/local/apache2/conf/httpd.conf; \
    echo '    RewriteRule ^ - [L]' >> /usr/local/apache2/conf/httpd.conf; \
    # Rewrite everything else to index.html to allow html5 state links \
    echo '    RewriteRule ^ index.html [QSA,L]' >> /usr/local/apache2/conf/httpd.conf; \
    echo '</Location>' >> /usr/local/apache2/conf/httpd.conf; \
    # Compress all files except images \
    echo 'SetOutputFilter DEFLATE' >> /usr/local/apache2/conf/httpd.conf; \
    echo 'SetEnvIfNoCase Request_URI "\.(?:gif|jpe?g|png)$" no-gzip' >> /usr/local/apache2/conf/httpd.conf; \
    # Disable caching for .json and .html files \
    echo '<FilesMatch ".(json|html)$">' >> /usr/local/apache2/conf/httpd.conf; \
    echo '    Header set Cache-Control "no-cache"' >> /usr/local/apache2/conf/httpd.conf; \
    echo '</FilesMatch>' >> /usr/local/apache2/conf/httpd.conf; \
    \
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
