import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`E-commerce Server is running on port ${PORT}`);
  });
}

export default app;