FROM node:18.1-alpine

ADD . /code
WORKDIR /code
RUN npm ci --only=production

EXPOSE 5050

CMD ["npm", "run",  "prod"]
