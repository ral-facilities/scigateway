FROM node:16.14-alpine3.15 as build
WORKDIR /scigateway
ENV PATH /scigateway/node_modules/.bin:$PATH

# Set Yarn version
RUN yarn set version 1.22

COPY . .
RUN yarn install
