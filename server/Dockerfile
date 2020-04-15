  
FROM node:10

WORKDIR /usr/app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 8080

CMD [ "node", "index.js" ]