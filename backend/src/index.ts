import { app } from './app';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root Medicloud folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
