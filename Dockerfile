# --------- install dependence -----------
FROM node:20.14.0-alpine AS maindeps
WORKDIR /app

ARG proxy

RUN [ -z "$proxy" ] || sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
RUN apk add --no-cache libc6-compat && npm install -g pnpm@9.4.0

# copy packages and one project
COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY ./packages ./packages
COPY ./mcp-tools/package.json ./mcp-tools/package.json

RUN [ -f pnpm-lock.yaml ] || (echo "Lockfile not found." && exit 1)

# if proxy exists, set proxy
RUN if [ -z "$proxy" ]; then \
        pnpm i; \
    else \
        pnpm i --registry=https://registry.npmmirror.com; \
    fi

# --------- builder -----------
FROM node:20.14.0-alpine AS builder
WORKDIR /app

ARG proxy

# copy common node_modules and one project node_modules
COPY package.json pnpm-workspace.yaml .npmrc tsconfig.json ./
COPY --from=maindeps /app/node_modules ./node_modules
COPY --from=maindeps /app/packages ./packages
COPY ./mcp-tools ./mcp-tools
COPY --from=maindeps /app/mcp-tools/node_modules ./mcp-tools/node_modules

RUN [ -z "$proxy" ] || sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories

RUN apk add --no-cache libc6-compat && npm install -g pnpm@9.4.0

ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm --filter=mcp-tools build

# --------- runner -----------
FROM node:20.14.0-alpine AS runner
WORKDIR /app

ARG proxy

RUN [ -z "$proxy" ] || sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
RUN apk add --no-cache libc6-compat && npm install -g pnpm@9.4.0

COPY --from=builder /app/mcp-tools/next.config.js ./mcp-tools/next.config.js
COPY --from=builder /app/mcp-tools/public ./mcp-tools/public
COPY --from=builder /app/mcp-tools/.next/standalone ./
COPY --from=builder /app/mcp-tools/.next/static ./mcp-tools/.next/static

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "mcp-tools/server.js"]
