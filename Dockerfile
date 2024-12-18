FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /usr/src/app
RUN chown -R node:node /usr/src/app
WORKDIR /usr/src/app

USER node

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY prisma ./prisma
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm dlx prisma generate
COPY src ./src
COPY tsconfig.json .
COPY tsconfig.build.json .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm run build

FROM base AS production

WORKDIR /usr/src/app
RUN chown -R node:node /usr/src/app
USER node

COPY --from=prod-deps /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/dist /usr/src/app/dist

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/src/app"]
