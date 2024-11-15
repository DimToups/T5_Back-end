FROM node:21

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

COPY tsconfig.json ./

COPY . .

RUN npm install -g pnpm
RUN pnpm install

RUN pnpm dlx prisma generate

RUN pnpm run build

EXPOSE 4000

CMD pnpm dlx prisma migrate deploy && npx prisma db seed && pnpm run start:prod
