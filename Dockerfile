FROM node

WORKDIR /app

COPY . .

RUN npm install

CMD ["node", "src/app.js"]
