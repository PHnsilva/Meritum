FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run prisma:generate

RUN npm run build

RUN npx prisma migrate deploy

EXPOSE 3333

CMD ["npm", "run", "start"]