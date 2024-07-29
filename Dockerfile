# base node image
FROM node:18-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /splitwiser

ADD package.json yarn.lock .npmrc ./
RUN npm install --include=dev

# Setup production node_modules
FROM base as production-deps

WORKDIR /splitwiser

COPY --from=deps /splitwiser/node_modules /splitwiser/node_modules
ADD package.json yarn.lock .npmrc ./
RUN npm prune --omit=dev

# Build the app
FROM base as build

WORKDIR /splitwiser

COPY --from=deps /splitwiser/node_modules /splitwiser/node_modules

ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

ENV DATABASE_URL=file:/data/sqlite.db
ENV PORT="8080"
ENV NODE_ENV="production"

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

WORKDIR /splitwiser

COPY --from=production-deps /splitwiser/node_modules /splitwiser/node_modules
COPY --from=build /splitwiser/node_modules/.prisma /splitwiser/node_modules/.prisma

COPY --from=build /splitwiser/build /splitwiser/build
COPY --from=build /splitwiser/public /splitwiser/public
COPY --from=build /splitwiser/package.json /splitwiser/package.json
COPY --from=build /splitwiser/start.sh /splitwiser/start.sh
COPY --from=build /splitwiser/prisma /splitwiser/prisma

ENTRYPOINT [ "./start.sh" ]
