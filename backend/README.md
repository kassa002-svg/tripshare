# Development

## Database & services

Copy the .env.example file to .env, and set up a mongo database for the app.

For development, use the one in compose.yaml with Docker if preferred: `docker compose up`

## Running the app

Install [Bun](https://bun.sh) and run:

```
source ../.env && bun run index.ts
```
