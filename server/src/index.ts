import express from 'express';
import cors from 'cors';
import sequelize from './config/database'; 
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import questionAnswerRoutes from './routes/question_answer.routes';
import tagRoutes from './routes/tag.routes';
import voteRoutes from './routes/vote.routes';
import commentRoutes from './routes/comment.routes';
const app = express();

// Middleware
app.use(cors(
  {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
));
app.use(express.json());
// app.use(sessionMiddleware);
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/', userRoutes);
app.use('/api', questionAnswerRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api', voteRoutes);
app.use('/api/', commentRoutes);

// app.listen(3000, () => console.log('Server berjalan di port 3000'));

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