FROM node:22-alpine AS base
WORKDIR /usr/src/app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir -p /usr/src/app/public_answers \
    && chown -R node:node /usr/src/app \
    && corepack enable \
    && apk add --no-cache openssl ffmpeg \
    && pnpm -v
USER node
COPY package.json /usr/src/app/package.json
COPY pnpm-lock.yaml /usr/src/app/pnpm-lock.yaml
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true


FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY prisma ./prisma
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm dlx prisma generate
COPY src ./src
COPY tsconfig.json .
COPY tsconfig.build.json .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm run build &&  \
    pnpm swc ./src/prisma/seed.ts -o ./dist/prisma/seed.js

FROM base AS production

COPY --from=prod-deps /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/dist /usr/src/app/dist
COPY --from=build /usr/src/app/prisma /usr/src/app/prisma

RUN node_modules/.bin/prisma generate

COPY script/start.sh /usr/src/app/script/start.sh

ENV NODE_ENV=production
EXPOSE 4000
CMD ["sh", "script/start.sh"]
