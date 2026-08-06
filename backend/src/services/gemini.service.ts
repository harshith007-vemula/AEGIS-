import { GoogleGenerativeAI, Schema } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('🤖 Gemini AI Service initialized with API Key.');
  } catch (err) {
    console.error('❌ Failed to initialize Gemini AI Client:', err);
  }
} else {
  console.log('ℹ️ Gemini API key missing. Running AI in simulation mode.');
}

export const isUsingMockAI = !genAI;

export class GeminiService {
  /**
   * General generation with fallback support
   */
  static async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    if (isUsingMockAI || !genAI) {
      return this.getSimulatedTextResponse(prompt);
    }

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemInstruction,
      });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.error('Gemini generateText error:', err);
      return this.getSimulatedTextResponse(prompt);
    }
  }

  /**
   * Structured JSON generation with fallback support
   */
  static async generateJson<T>(prompt: string, schema: Schema, systemInstruction?: string): Promise<T> {
    if (isUsingMockAI || !genAI) {
      return this.getSimulatedJsonResponse<T>(prompt, schema);
    }

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemInstruction,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        }
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text) as T;
    } catch (err) {
      console.error('Gemini generateJson error:', err);
      return this.getSimulatedJsonResponse<T>(prompt, schema);
    }
  }

  /**
   * Vision API for damage estimation, satellite images
   */
  static async analyzeImage(imageBuffer: Buffer, mimeType: string, prompt: string): Promise<string> {
    if (isUsingMockAI || !genAI) {
      return JSON.stringify({
        hazard_detected: "Severe Flooding & Structural Inundation",
        confidence: 0.94,
        damage_assessment: "Water levels have breached residential floors. Multiple vehicles submerged. Roads impassable.",
        critical_infrastructure_affected: ["Main electricity feeder", "Local sewer channels"],
        priority: "critical"
      });
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const imageParts = [
        {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType
          }
        }
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      return result.response.text();
    } catch (err) {
      console.error('Gemini analyzeImage error:', err);
      return JSON.stringify({
        hazard_detected: "Severe Flooding & Structural Inundation (Simulated)",
        confidence: 0.88,
        damage_assessment: "Simulated vision assessment: image processed. Flood levels reached critical levels. Rescue boats and rafts needed.",
        critical_infrastructure_affected: ["Local roadways"],
        priority: "critical"
      });
    }
  }

  /**
   * Speech to Text / Transcription simulation (mock whisper)
   */
  static async transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
    // Standard simulation since audio file processing requires specialized models or integrations
    return "Emergency broadcast command: We are trapped on the third floor of the local school near San Francisco city center. The floodwaters are rising rapidly. Need immediate boat evacuation for 12 people including 3 children.";
  }

  // --- Mock Generators ---

  private static getSimulatedTextResponse(prompt: string): string {
    const p = prompt.toLowerCase();
    if (p.includes('government') || p.includes('official report')) {
      return `AEGIS AI EXECUTIVE DISASTER SUMMARY\n\nINCIDENT REPORT FOR STATE COMMAND\n\nAn emergency situation has been declared. Coordinate actions with priority response units. Allocate resources immediately. Operations are active.`;
    }
    return `Simulated AI text analysis completed for command: ${prompt}`;
  }

  private static getSimulatedJsonResponse<T>(prompt: string, schema: Schema): T {
    const p = prompt.toLowerCase();
    
    // 1. Coordinator Breakdown
    if (p.includes('coordinator') || p.includes('break down') || p.includes('subtasks')) {
      return {
        incident_type: p.includes('flood') || p.includes('water') ? 'Flood' : (p.includes('fire') ? 'Wildfire' : 'Earthquake'),
        assigned_agents: ['vision', 'research', 'planning', 'risk', 'communication', 'automation', 'memory'],
        subtasks: [
          { agent: 'vision', task: 'Scan satellite feeds and user uploads for water levels.' },
          { agent: 'research', task: 'Fetch FEMA protocol for flash flooding and water rescue.' },
          { agent: 'planning', task: 'Formulate evacuation route and dispatch ambulances/boats.' },
          { agent: 'risk', task: 'Calculate population density at risk and priority score.' },
          { agent: 'communication', task: 'Prepare emergency broadcast alerts for SMS and radio.' }
        ]
      } as unknown as T;
    }

    // 2. Planning Agent
    if (p.includes('planning') || p.includes('rescue') || p.includes('tactical') || p.includes('hospitals')) {
      return {
        rescue_plan: [
          { step: 1, title: 'Establish Safe Staging Area', description: 'Setup response post outside flood zone at coordinates (37.7800, -122.4200)', status: 'pending', assigned_team: 'Fire Engine 14' },
          { step: 2, title: 'Inundation Scouting & Evacuation', description: 'Deploy Inflatable Boat Taskforce to retrieve stranded individuals', status: 'pending', assigned_team: 'Inflatable Boat Taskforce' },
          { step: 3, title: 'Triage & Medical Dispatch', description: 'Transport critical patients to Saint Sebastian General Hospital', status: 'pending', assigned_team: 'Rescue Unit Alpha' }
        ],
        hospitals: [
          { name: 'Saint Sebastian General Hospital', distance: '1.2 km', available_capacity: 42, contact: '+1-555-0199', priority: 1 },
          { name: 'Pacific Emergency Medical Center', distance: '2.4 km', available_capacity: 18, contact: '+1-555-0188', priority: 2 }
        ],
        resources: [
          { name: 'Emergency Trauma Kits', quantity: 20, type: 'medical' },
          { name: 'Clean Drinking Water', quantity: 200, type: 'water' },
          { name: 'Rapid Deployment Tents', quantity: 5, type: 'shelter' }
        ]
      } as unknown as T;
    }

    // 3. Risk Prediction
    if (p.includes('risk') || p.includes('predict') || p.includes('population')) {
      return {
        risk_score: 88,
        priority: 'critical',
        affected_population_estimate: 450,
        risk_factors: [
          'Rapid rise of water level (approx 12cm/hour)',
          'High density residential zoning',
          'Aged housing units vulnerable to water damage'
        ]
      } as unknown as T;
    }

    // 4. Communication Templates
    if (p.includes('communication') || p.includes('alert') || p.includes('sms') || p.includes('email') || p.includes('whatsapp')) {
      return {
        sms_template: '⚠️ EMERGENCY ALERT: Severe flooding active in San Francisco SOMA area. Avoid low areas. Evacuation post active at Civic Center. Call 911 for rescue. - AEGIS AI',
        email_template: 'Subject: URGENT: Disaster Response Operations Active - SOMA Flooding\n\nDear Resident,\n\nAn active emergency rescue operation is underway in SOMA. Please remain indoors if on upper floors, or evacuate immediately via the designated safe routes to the Civic Center shelter.',
        whatsapp_template: '🔴 *AEGIS AI EMERGENCY WARNING*: Flooding in SOMA region. Do not drive through flooded waters. Emergency shelter open at Civic Center.'
      } as unknown as T;
    }

    // 5. Memory Agent
    if (p.includes('memory') || p.includes('previous') || p.includes('similar') || p.includes('historic')) {
      return {
        similar_past_incidents: [
          { id: 'm-98', date: '2025-02-14', title: 'Mission District Flooding', severity: 'High', action_taken: 'Deployed inflatable boats, redirected traffic. Key takeaway: Establish triage shelters early.' }
        ]
      } as unknown as T;
    }

    // Generic JSON fallback
    return {
      success: true,
      message: 'Simulated JSON output',
      data: prompt
    } as unknown as T;
  }
}
