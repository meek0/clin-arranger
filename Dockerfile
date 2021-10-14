FROM node:16.11.1-alpine

ADD . /code
WORKDIR /code
RUN npm install
RUN npm run build

RUN rm -rf node_modules
RUN npm install --only=prod

EXPOSE 5050

CMD ["node", "./dist/index.js"]
