## BACKEND

FROM oven/bun:1

WORKDIR /app

COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile --production

COPY --chown=bun:bun backend/ ./

USER bun

EXPOSE 3001

CMD bun run index.ts
