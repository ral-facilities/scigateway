# Multipart build dockerfile to build and serve scigateway

FROM node:16.14-alpine3.15 as build
WORKDIR /scigateway
ENV PATH /scigateway/node_modules/.bin:$PATH

# Set Yarn version
RUN yarn set version 1.22

COPY . .
RUN yarn install
RUN yarn build

# Put the output of the build into an apache server
FROM httpd:2.4-alpine3.15
WORKDIR /usr/local/apache2/htdocs
COPY --from=build /scigateway/build/. .
