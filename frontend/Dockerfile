## FRONTEND

FROM oven/bun:1

WORKDIR /app

# backend is needed for some types in frontend
COPY --chown=bun:bun backend/ ./backend/
COPY --chown=bun:bun frontend/ ./frontend/

WORKDIR /app/frontend
RUN bun install --frozen-lockfile

USER bun

EXPOSE 3000

CMD bun start
