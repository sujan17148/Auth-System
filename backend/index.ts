import { app } from './app.js';
import 'dotenv/config';
import { config } from './src/config/config.js';
import { configDotenv } from 'dotenv';

configDotenv({
  path: 'process.env',
});

const port = config.serverPort;

app.listen(port, () => {
  console.log('listening on port', port);
});
