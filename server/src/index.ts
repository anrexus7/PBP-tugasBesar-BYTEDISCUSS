import express from 'express';
import cors from 'cors';
import sequelize from './config/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// app.use(sessionMiddleware);
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/', userRoutes);


// Database connection
sequelize.sync({ force: false }).then(() => {
  console.log('Database connected');
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Unable to connect to the database:', error);
});