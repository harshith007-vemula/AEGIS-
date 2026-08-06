import { Request, Response } from 'express';
import { db } from '../config/db';

export class AgentController {
  static async list(req: Request, res: Response) {
    try {
      const agents = await db.agents.list();
      res.status(200).json(agents);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getByRole(req: Request, res: Response) {
    const { role } = req.params;
    try {
      const agents = await db.agents.list();
      const agent = agents.find(a => a.role === role);
      if (!agent) {
        return res.status(404).json({ error: `Agent with role ${role} not found` });
      }
      res.status(200).json(agent);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async reset(req: Request, res: Response) {
    try {
      const roles: any[] = ['coordinator', 'vision', 'research', 'planning', 'risk', 'voice', 'communication', 'automation', 'memory'];
      for (const r of roles) {
        await db.agents.updateStatus(r, 'idle');
        // Clear logs by resetting them
        const agents = await db.agents.list();
        const agent = agents.find(a => a.role === r);
        if (agent) {
          agent.logs = [];
        }
      }
      await db.logs.create('info', 'All AI agents reset to IDLE status', 'agent_controller');
      res.status(200).json({ message: 'All agents reset successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
