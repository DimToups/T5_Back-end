FROM node:21

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

COPY tsconfig.json ./

COPY . .

RUN npm install -g pnpm
RUN pnpm install

RUN pnpm dlx prisma generate

EXPOSE 4000

CMD pnpm dlx prisma migrate deploy && npx prisma db seed && pnpm build && pnpm start:prod
