import { Request, Response } from 'express';
import { db } from '../config/db';
import { AgentOrchestrator } from '../services/agent-orchestrator';
import { PdfService } from '../services/pdf.service';
import { Incident } from '../models/types';

export class IncidentController {
  static async create(req: Request, res: Response) {
    const { title, description, location_lat, location_lng, address, media_url, voice_url, document_url } = req.body;

    if (!title || !description || location_lat === undefined || location_lng === undefined) {
      return res.status(400).json({ error: 'Title, description, latitude, and longitude are required.' });
    }

    try {
      const incident = await db.incidents.create({
        title,
        description,
        status: 'reported',
        priority: 'medium',
        location_lat,
        location_lng,
        address,
        media_url,
        voice_url,
        document_url,
        reporter_id: (req as any).user?.id
      });

      // Log action
      await db.logs.create('info', `New incident reported: ${title}`, 'incident_controller', { incident_id: incident.id });
      await db.notifications.create(`NEW INCIDENT: "${title}" reported at ${address || 'unknown location'}.`, 'info');

      res.status(201).json(incident);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const list = await db.incidents.list();
      res.status(200).json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const incident = await db.incidents.findById(id);
      if (!incident) {
        return res.status(404).json({ error: 'Incident not found' });
      }
      res.status(200).json(incident);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async runOrchestrator(req: Request, res: Response) {
    const { id } = req.params;
    const { imageBase64, imageMimeType, audioBase64, audioMimeType, documentText } = req.body;

    try {
      let fileData: { buffer: Buffer; mimeType: string } | undefined;
      let audioData: { buffer: Buffer; mimeType: string } | undefined;

      if (imageBase64 && imageMimeType) {
        fileData = {
          buffer: Buffer.from(imageBase64, 'base64'),
          mimeType: imageMimeType
        };
      }

      if (audioBase64 && audioMimeType) {
        audioData = {
          buffer: Buffer.from(audioBase64, 'base64'),
          mimeType: audioMimeType
        };
      }

      // Mark incident as analyzing
      await db.incidents.updateStatus(id, 'analyzing');

      // Process with Agent Swarm
      const report = await AgentOrchestrator.processIncident(
        id,
        fileData,
        audioData,
        documentText
      );

      res.status(200).json({
        message: 'Agent orchestration swarm execution complete.',
        report
      });
    } catch (err: any) {
      console.error('Orchestration trigger failure:', err);
      // Revert status to reported or error state
      await db.incidents.updateStatus(id, 'reported');
      await db.logs.create('error', `Agent swarm crashed: ${err.message}`, 'incident_controller', { incident_id: id });
      res.status(500).json({ error: `Swarm Orchestrator failed: ${err.message}` });
    }
  }

  static async getReport(req: Request, res: Response) {
    const { incidentId } = req.params;
    try {
      const report = await db.reports.findByIncidentId(incidentId);
      if (!report) {
        return res.status(404).json({ error: 'No AI report found for this incident' });
      }
      res.status(200).json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getReports(req: Request, res: Response) {
    try {
      const reports = await db.reports.list();
      res.status(200).json(reports);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async downloadReportPdf(req: Request, res: Response) {
    const { incidentId } = req.params;
    try {
      const incident = await db.incidents.findById(incidentId);
      const report = await db.reports.findByIncidentId(incidentId);

      if (!incident || !report) {
        return res.status(404).json({ error: 'Incident or AI report not found' });
      }

      const pdfBuffer = await PdfService.generateReportPdf(report, incident);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=aegis_brief_${incidentId.substring(0, 8)}.pdf`);
      res.status(200).send(pdfBuffer);
    } catch (err: any) {
      console.error('PDF creation failed:', err);
      res.status(500).json({ error: `Failed to compile PDF: ${err.message}` });
    }
  }
}
