import app from './src/app';
import dotenv from 'dotenv';

dotenv.config();

const PORT: string | number = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
