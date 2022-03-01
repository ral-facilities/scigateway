
FROM node:14-alpine AS development
ENV NODE_ENV development
# Add a work directory
WORKDIR /app

COPY . /app

RUN yarn install

# Expose port
EXPOSE 3000
# Start the app
CMD [ "yarn", "start" ]


