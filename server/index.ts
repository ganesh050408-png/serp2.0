import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be a valid TCP port number.');
}

const app = createApp();

app.listen(port, () => {
  console.log(`Aethera API server listening on port ${port}`);
});
