import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, isUsingMockDB, supabase } from '../config/db';
import { User, UserRole } from '../models/types';

const JWT_SECRET = process.env.JWT_SECRET || 'aegis_jwt_secret_token_123';

// In-memory passwords for mock mode
const mockPasswords = new Map<string, string>();

// Seed default admin in mock passwords
bcrypt.hash('admin123', 10).then(hash => {
  mockPasswords.set('admin@aegis.ai', hash);
});

export class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password, full_name, role, phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    try {
      let userId: string;
      const userRole: UserRole = role || 'operator';

      if (!isUsingMockDB && supabase) {
        // Sign up user via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError || !authData.user) {
          return res.status(400).json({ error: authError?.message || 'Authentication signup failed.' });
        }

        userId = authData.user.id;

        // Insert into public users table
        await db.users.create({
          id: userId,
          email,
          full_name,
          role: userRole,
          phone,
          created_at: new Date().toISOString()
        });
      } else {
        // Mock Mode registration
        const existing = await db.users.findByEmail(email);
        if (existing) {
          return res.status(400).json({ error: 'User already exists.' });
        }

        userId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        const passwordHash = await bcrypt.hash(password, 10);
        mockPasswords.set(email, passwordHash);

        await db.users.create({
          id: userId,
          email,
          full_name,
          role: userRole,
          phone,
          created_at: new Date().toISOString()
        });
      }

      // Generate JWT
      const token = jwt.sign({ id: userId, email, role: userRole }, JWT_SECRET, { expiresIn: '24h' });

      res.status(201).json({
        token,
        user: { id: userId, email, full_name, role: userRole, phone }
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
      let user: User | null = null;
      let token = '';

      if (!isUsingMockDB && supabase) {
        // Sign in via Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError || !authData.user) {
          return res.status(400).json({ error: authError?.message || 'Invalid email or password.' });
        }

        user = await db.users.findById(authData.user.id);
        if (!user) {
          return res.status(404).json({ error: 'User profiles not found.' });
        }

        token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      } else {
        // Mock Mode login
        // Seed default admin in database dynamically if it does not exist
        const adminEmail = 'admin@aegis.ai';
        if (email === adminEmail) {
          const adminExists = await db.users.findByEmail(adminEmail);
          if (!adminExists) {
            await db.users.create({
              id: 'admin-uuid-1111',
              email: adminEmail,
              full_name: 'AEGIS Commander',
              role: 'admin',
              created_at: new Date().toISOString()
            });
            const hash = await bcrypt.hash('admin123', 10);
            mockPasswords.set(adminEmail, hash);
          }
        }

        user = await db.users.findByEmail(email);
        if (!user) {
          return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const hashed = mockPasswords.get(email);
        if (!hashed || !(await bcrypt.compare(password, hashed))) {
          return res.status(400).json({ error: 'Invalid email or password.' });
        }

        token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      }

      res.status(200).json({
        token,
        user
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  static async getMe(req: any, res: Response) {
    try {
      const user = await db.users.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User profile not found.' });
      }
      res.status(200).json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
