import { Request, Response } from 'express';
import { db } from '../config/db';

export class ResourceController {
  static async getResources(req: Request, res: Response) {
    try {
      const data = await db.resources.list();
      res.status(200).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getHospitals(req: Request, res: Response) {
    try {
      const data = await db.hospitals.list();
      res.status(200).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getVehicles(req: Request, res: Response) {
    try {
      const data = await db.vehicles.list();
      res.status(200).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getLogs(req: Request, res: Response) {
    try {
      const data = await db.logs.list();
      res.status(200).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getNotifications(req: Request, res: Response) {
    try {
      const data = await db.notifications.list();
      res.status(200).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async markNotificationRead(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const success = await db.notifications.markAsRead(id);
      res.status(200).json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getDashboardStats(req: Request, res: Response) {
    try {
      const incidents = await db.incidents.list();
      const vehicles = await db.vehicles.list();
      const hospitals = await db.hospitals.list();
      const resources = await db.resources.list();

      const activeIncidents = incidents.filter(i => i.status === 'active' || i.status === 'analyzing').length;
      const totalIncidents = incidents.length;
      const dispatchedVehicles = vehicles.filter(v => v.status === 'active').length;
      const totalVehicles = vehicles.length;
      const averageRisk = incidents.length > 0 ? 75 : 0; // Simulated default metric

      res.status(200).json({
        activeIncidents,
        totalIncidents,
        dispatchedVehicles,
        totalVehicles,
        averageRisk,
        resourcesCount: resources.length,
        hospitalsCount: hospitals.length
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
