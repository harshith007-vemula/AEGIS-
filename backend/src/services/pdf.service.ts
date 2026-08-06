import PDFDocument from 'pdfkit';
import { Report, Incident, RescuePlanStep } from '../models/types';

export class PdfService {
  /**
   * Generates a beautifully formatted PDF document for government reporting.
   */
  static async generateReportPdf(report: Report, incident: Incident): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', err => reject(err));

        // Draw Header Banner
        doc.rect(0, 0, doc.page.width, 100).fill('#0f172a');
        doc.fillColor('#ffffff').fontSize(22).text('AEGIS EMERGENCY GOVERNANCE SYSTEM', 50, 35, { align: 'center' });
        doc.fontSize(9).text('AUTONOMOUS MULTI-AGENT STATE EMERGENCY BRIEFING', 50, 65, { align: 'center' });

        // Title and Metadata
        doc.fillColor('#1e293b').fontSize(14).text(`Official Crisis Report: ${incident.title}`, 50, 130);
        doc.fontSize(10).fillColor('#475569').text(`Generated: ${new Date(report.created_at).toLocaleString()}`, 50, 150);
        doc.text(`Incident ID: ${incident.id}`, 50, 165);
        doc.text(`Address: ${incident.address || 'Reported Location Coordinates'}`, 50, 180);
        
        // Divider Line
        doc.moveTo(50, 200).lineTo(doc.page.width - 50, 200).stroke('#cbd5e1');

        // Summary
        doc.fontSize(12).fillColor('#0f172a').text('Executive Incident Summary', 50, 215);
        doc.fontSize(10).fillColor('#334155').text(report.summary, 50, 235, { width: doc.page.width - 100, align: 'justify' });

        // Risk & Priority Metric Cards
        doc.rect(50, 290, 230, 60).fill('#f1f5f9');
        doc.fillColor('#0f172a').fontSize(10).text('AI Risk Score', 60, 300);
        doc.fontSize(18).fillColor('#dc2626').text(`${report.risk_score} / 100`, 60, 315);

        doc.rect(300, 290, 230, 60).fill('#f1f5f9');
        doc.fillColor('#0f172a').fontSize(10).text('Priority Level', 310, 300);
        doc.fontSize(18).fillColor('#e11d48').text(report.priority.toUpperCase(), 310, 315);

        // Tactical Plan Steps
        let y = 370;
        doc.fillColor('#0f172a').fontSize(12).text('Tactical Rescue Plan Actions', 50, y);
        y += 20;

        report.rescue_plan.forEach((step: RescuePlanStep) => {
          if (y > 680) {
            doc.addPage();
            y = 50;
          }
          doc.fontSize(10).fillColor('#0f172a').text(`Step ${step.step}: ${step.title}`, 50, y);
          doc.fontSize(9).fillColor('#475569').text(`[Unit: ${step.assigned_team}] ${step.description}`, 70, y + 15, { width: doc.page.width - 120 });
          y += 40;
        });

        if (y > 600) {
          doc.addPage();
          y = 50;
        }

        // Recipient Hospitals
        y += 15;
        doc.fillColor('#0f172a').fontSize(12).text('Nearby Recommended Medical Establishments', 50, y);
        y += 20;

        report.hospital_recommendation.forEach((h: any) => {
          doc.fontSize(9).fillColor('#334155').text(`* ${h.name} (${h.distance}) - Bed Space Available: ${h.available_capacity} | Contact: ${h.contact}`, 50, y);
          y += 15;
        });

        // Resources Allocated
        y += 15;
        doc.fillColor('#0f172a').fontSize(12).text('Resource Deployments Allocated', 50, y);
        y += 20;

        report.resource_allocation.forEach((r: any) => {
          doc.fontSize(9).fillColor('#334155').text(`* ${r.name} - Allocated Qty: ${r.quantity} ${r.type}`, 50, y);
          y += 15;
        });

        // Government Report
        if (y > 450) {
          doc.addPage();
          y = 50;
        }

        y += 20;
        doc.fillColor('#0f172a').fontSize(12).text('Government Report Cryptographic Transcript', 50, y);
        y += 20;
        doc.font('Courier').fontSize(8).fillColor('#0f172a').text(report.govt_report || 'Transcript empty.', 50, y, { width: doc.page.width - 100 });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
