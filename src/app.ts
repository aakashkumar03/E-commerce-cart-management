import express from 'express';
import storeRoutes from './routes/store.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', storeRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`E-commerce Server is running on port ${PORT}`);
  });
}

export default app;