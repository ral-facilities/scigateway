# Multipart build dockerfile to build and serve scigateway

FROM node:16.14-alpine3.15 as build

WORKDIR /scigateway

COPY package.json tsconfig.json yarn.lock ./

# TODO - Use Yarn 2 when project is upgraded
RUN yarn set version 1.22 \
  # TODO: use yarn install --production: 
  # https://github.com/ral-facilities/scigateway/issues/1025
  && yarn install

COPY . .

RUN yarn build

# Put the output of the build into an apache server
FROM httpd:2.4-alpine3.15
WORKDIR /usr/local/apache2/htdocs
COPY --from=build /scigateway/build/. .

# Switch to non-root user defined in httpd image
USER www-data
