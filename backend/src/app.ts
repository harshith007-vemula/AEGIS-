import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import incidentRoutes from './routes/incident.routes';
import agentRoutes from './routes/agent.routes';
import resourceRoutes from './routes/resource.routes';
import { db } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // For hackathon flexibility, allow all origins. Can be restricted in production.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase payload limits for base64 audio/image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/resources', resourceRoutes);

// Base Route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'AEGIS AI API Gateway',
    version: '1.0.0',
    status: 'ONLINE',
    mode: process.env.GEMINI_API_KEY ? 'LIVE_AI' : 'SIMULATION_AI',
    database: process.env.SUPABASE_URL ? 'SUPABASE_PROD' : 'IN_MEMORY_STATEFUL_FALLBACK'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 AEGIS AI Server is running on http://localhost:${PORT}`);
  db.logs.create('info', `AEGIS backend server successfully initialized on port ${PORT}`, 'app_gateway');
});
