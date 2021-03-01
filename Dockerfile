FROM node:14.4.0-alpine

ADD . /code
WORKDIR /code
RUN npm install

EXPOSE 5050

CMD ["npm", "start"]