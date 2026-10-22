# Dockerfile to build and serve scigateway

# Build stage
FROM node:24.22.1-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS builder

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

RUN yarn build

# Run stage
FROM httpd:2.4.69-alpine@sha256:3440c39d8d6f54fa9ad2549e5a60c19ddd435faadc29c1ad28aa795f71888889

WORKDIR /usr/local/apache2/htdocs

# Put the output of the build into an apache server
COPY --from=builder /scigateway-build/dist/. .

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
    # Allow encoded slashes - this enables datafile location redirects to work
    echo 'AllowEncodedSlashes NoDecode' >> /usr/local/apache2/conf/httpd.conf; \
    \
    # Privileged ports are permitted to root only by default. \
    # setcap to bind to privileged ports (80) as non-root. \
    apk --no-cache add libcap; \
    setcap 'cap_net_bind_service=+ep' /usr/local/apache2/bin/httpd; \
    \
    # Change ownership of logs directory \
    chown www-data:www-data /usr/local/apache2/logs; \
    \
    # Change ownership of settings location \
    chown www-data:www-data -R /usr/local/apache2/htdocs/;

# Switch to non-root user defined in httpd image
USER www-data

ENV AUTH_PROVIDER="icat"
ENV AUTH_URL="/api"

COPY docker/docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["httpd-foreground"]
EXPOSE 80
