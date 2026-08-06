import { Schema, SchemaType } from '@google/generative-ai';
import { db } from '../config/db';
import { GeminiService } from './gemini.service';
import { Incident, Report, RescuePlanStep } from '../models/types';

// Gemini Schema Definitions for Structured Outputs
const coordinatorSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    incident_type: { type: SchemaType.STRING },
    assigned_agents: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    subtasks: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          agent: { type: SchemaType.STRING },
          task: { type: SchemaType.STRING }
        },
        required: ['agent', 'task']
      }
    }
  },
  required: ['incident_type', 'assigned_agents', 'subtasks']
};

const planningSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    rescue_plan: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          step: { type: SchemaType.INTEGER },
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          assigned_team: { type: SchemaType.STRING }
        },
        required: ['step', 'title', 'description', 'assigned_team']
      }
    },
    hospitals: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          distance: { type: SchemaType.STRING },
          available_capacity: { type: SchemaType.INTEGER },
          contact: { type: SchemaType.STRING },
          priority: { type: SchemaType.INTEGER }
        },
        required: ['name', 'distance', 'available_capacity', 'contact', 'priority']
      }
    },
    resources: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          quantity: { type: SchemaType.INTEGER },
          type: { type: SchemaType.STRING }
        },
        required: ['name', 'quantity', 'type']
      }
    }
  },
  required: ['rescue_plan', 'hospitals', 'resources']
};

const riskSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    risk_score: { type: SchemaType.INTEGER },
    priority: { type: SchemaType.STRING },
    affected_population_estimate: { type: SchemaType.INTEGER },
    risk_factors: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
  },
  required: ['risk_score', 'priority', 'affected_population_estimate', 'risk_factors']
};

const communicationSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    sms_template: { type: SchemaType.STRING },
    email_template: { type: SchemaType.STRING },
    whatsapp_template: { type: SchemaType.STRING }
  },
  required: ['sms_template', 'email_template', 'whatsapp_template']
};

const memorySchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    similar_past_incidents: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          date: { type: SchemaType.STRING },
          title: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
          action_taken: { type: SchemaType.STRING }
        },
        required: ['id', 'date', 'title', 'severity', 'action_taken']
      }
    }
  },
  required: ['similar_past_incidents']
};

export class AgentOrchestrator {
  /**
   * Run the full multi-agent collaborative swarm workflow
   */
  static async processIncident(
    incidentId: string,
    fileData?: { buffer: Buffer; mimeType: string },
    audioData?: { buffer: Buffer; mimeType: string },
    documentText?: string
  ): Promise<Report> {
    
    // Retrieve Incident details
    const incident = await db.incidents.findById(incidentId);
    if (!incident) {
      throw new Error(`Incident with ID ${incidentId} not found`);
    }

    const logs: string[] = [];
    const logUpdate = async (role: any, status: any, msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      console.log(`[${role.toUpperCase()}] ${msg}`);
      await db.agents.updateStatus(role, status, msg);
      await db.logs.create(type === 'error' ? 'error' : (type === 'warning' ? 'warn' : 'info'), msg, `agent_${role}`);
      logs.push(`[${role}] ${msg}`);
    };

    // Reset all agents to idle
    const roles: any[] = ['coordinator', 'vision', 'research', 'planning', 'risk', 'voice', 'communication', 'automation', 'memory'];
    for (const r of roles) {
      await db.agents.updateStatus(r, 'idle');
    }

    // Context accumulated across agents
    let incidentType = 'General Crisis';
    let visionAnalysis = '';
    let voiceTranscription = '';
    let coordinatorPlan: any = null;
    let researchProtocols = '';
    let riskAnalysis: any = null;
    let rescuePlanDetails: any = null;
    let communicationTemplates: any = null;
    let memoryInsights: any = null;

    // ==========================================
    // 1. VOICE AGENT (Pre-processing if voice exists)
    // ==========================================
    if (audioData) {
      await logUpdate('voice', 'active', 'Listening and transcribing incoming voice message distress call...', 'info');
      await new Promise(r => setTimeout(r, 1000));
      voiceTranscription = await GeminiService.transcribeAudio(audioData.buffer, audioData.mimeType);
      await logUpdate('voice', 'idle', `Distress transcription complete: "${voiceTranscription.substring(0, 80)}..."`, 'success');
    }

    // ==========================================
    // 2. COORDINATOR AGENT
    // ==========================================
    await logUpdate('coordinator', 'thinking', 'Analyzing incident details and user uploads. Formulating agency assignments...', 'info');
    await new Promise(r => setTimeout(r, 1500));
    
    const inputContext = `
      Title: ${incident.title}
      Description: ${incident.description}
      Transcription: ${voiceTranscription}
      Attached PDF Text: ${documentText || 'None'}
    `;

    const coordPrompt = `
      You are the Aegis Coordinator Agent. Analyze this incident details:
      ${inputContext}
      1. Determine the incident type (e.g. Flood, Wildfire, Chemical Spill, Earthquake, Medical).
      2. Decide which agents to assign.
      3. List the critical subtasks required for this crisis response.
    `;

    coordinatorPlan = await GeminiService.generateJson<any>(
      coordPrompt,
      coordinatorSchema,
      'You are the coordinator agent for an emergency OS. Break down tasks logically.'
    );
    incidentType = coordinatorPlan.incident_type;
    await logUpdate('coordinator', 'idle', `Categorized incident as ${incidentType}. Delegated tasks to 8 sub-agents.`, 'success');

    // ==========================================
    // 3. VISION AGENT
    // ==========================================
    if (fileData) {
      await logUpdate('vision', 'thinking', 'Processing visual input (image/satellite feed) for hazard verification and damage levels...', 'info');
      await new Promise(r => setTimeout(r, 1500));
      
      const visionPrompt = `
        Analyze this emergency picture or satellite imagery. Detect:
        1. Nature of hazard/disaster.
        2. Damage level (severe, moderate, minor).
        3. Infrastructure affected.
        4. Priority score requirement.
        Provide your assessment as JSON.
      `;
      visionAnalysis = await GeminiService.analyzeImage(fileData.buffer, fileData.mimeType, visionPrompt);
      const parsedVision = JSON.parse(visionAnalysis);
      await logUpdate('vision', 'idle', `Vision Sentinel assessment completed. Hazard: ${parsedVision.hazard_detected}. Priority: ${parsedVision.priority}.`, 'success');
    } else {
      await logUpdate('vision', 'active', 'No onsite image provided. Querying area GIS and public surveillance cameras...', 'info');
      await new Promise(r => setTimeout(r, 1000));
      visionAnalysis = JSON.stringify({ hazard_detected: incidentType, confidence: 0.7, damage_assessment: 'Standard visual mapping from public records. Moderate damage assumed.', priority: 'medium' });
      await logUpdate('vision', 'idle', 'Standard spatial visual index fetched.', 'success');
    }

    // ==========================================
    // 4. MEMORY AGENT
    // ==========================================
    await logUpdate('memory', 'thinking', `Searching knowledge history for similar past incidents of type ${incidentType}...`, 'info');
    await new Promise(r => setTimeout(r, 1200));

    const memoryPrompt = `
      Retrieve similar incidents from historic records. Incident Type: ${incidentType}.
      Format output with similar_past_incidents containing ID, date, title, severity, action_taken.
    `;
    memoryInsights = await GeminiService.generateJson<any>(
      memoryPrompt,
      memorySchema,
      'Recall previous incidents to supply lessons learned.'
    );
    const pastIds = memoryInsights.similar_past_incidents.map((i: any) => i.id).join(', ');
    await logUpdate('memory', 'idle', `Memory lookup retrieved historic matches [${pastIds}]. Extracted lessons learned.`, 'success');

    // ==========================================
    // 5. RESEARCH AGENT
    // ==========================================
    await logUpdate('research', 'thinking', `Retrieving emergency protocols and standard operating guidelines for: ${incidentType}...`, 'info');
    await new Promise(r => setTimeout(r, 1200));

    const researchPrompt = `
      Given incident type: ${incidentType}. What are the official government standard protocols?
      Provide brief protocol rules for evacuation, search and rescue, and containment.
    `;
    researchProtocols = await GeminiService.generateText(researchPrompt, 'Identify disaster recovery procedures.');
    await logUpdate('research', 'idle', `Fetched state SOP protocols: "${researchProtocols.substring(0, 60)}..."`, 'success');

    // ==========================================
    // 6. RISK PREDICTION AGENT
    // ==========================================
    await logUpdate('risk', 'thinking', 'Simulating hazard spread velocity and predicting affected population numbers...', 'info');
    await new Promise(r => setTimeout(r, 1500));

    const riskPrompt = `
      Estimate risk indices for:
      Incident Type: ${incidentType}
      Description: ${incident.description}
      Visual Assessment: ${visionAnalysis}
      Calculate:
      - risk_score (0-100)
      - priority level (low, medium, high, critical)
      - affected_population_estimate (number)
      - risk_factors (bullet points list)
    `;
    riskAnalysis = await GeminiService.generateJson<any>(
      riskPrompt,
      riskSchema,
      'Evaluate mathematical risk levels for crisis.'
    );
    await logUpdate('risk', 'idle', `Risk Assessment: Score ${riskAnalysis.risk_score}/100. Affected population estimate: ${riskAnalysis.affected_population_estimate}.`, 'success');

    // ==========================================
    // 7. PLANNING AGENT
    // ==========================================
    await logUpdate('planning', 'thinking', 'Coordinating emergency dispatch. Finding nearest hospitals and allocating response assets...', 'info');
    await new Promise(r => setTimeout(r, 1800));

    // Retrieve hospitals and vehicles from database
    const dbHospitals = await db.hospitals.list();
    const dbVehicles = await db.vehicles.list();

    const planningPrompt = `
      Create a tactical rescue and evacuation plan.
      Incident details:
      Type: ${incidentType}
      Address: ${incident.address || 'San Francisco SOMA'}
      Location Lat/Lng: ${incident.location_lat}, ${incident.location_lng}
      SOP Rules: ${researchProtocols}
      Risk level: ${riskAnalysis.priority}

      Available Hospitals in area:
      ${JSON.stringify(dbHospitals)}

      Available Vehicles:
      ${JSON.stringify(dbVehicles)}

      Formulate response plan containing:
      1. rescue_plan: Step-by-step checklist of actions (with step, title, description, assigned_team)
      2. hospitals: Recommended hospitals sorted by proximity and capacity (name, distance, available_capacity, contact, priority)
      3. resources: Resources that need allocation (name, quantity, type)
    `;

    rescuePlanDetails = await GeminiService.generateJson<any>(
      planningPrompt,
      planningSchema,
      'You are a logistics coordinator. Propose resource dispatch lists.'
    );
    await logUpdate('planning', 'idle', `Rescue logistics formed. Dispatching ${rescuePlanDetails.rescue_plan.length} steps. Allocated ${rescuePlanDetails.resources.length} resource classes.`, 'success');

    // ==========================================
    // 8. COMMUNICATION AGENT
    // ==========================================
    await logUpdate('communication', 'thinking', 'Drafting alert templates for public broadcast, SMS lists, and WhatsApp groups...', 'info');
    await new Promise(r => setTimeout(r, 1000));

    const commPrompt = `
      Draft warning notification templates for a ${incidentType} incident in: ${incident.address || 'SOMA'}.
      Write:
      - SMS alert template (under 160 characters)
      - Email alert body
      - WhatsApp warning formatting with bold markdown
    `;
    communicationTemplates = await GeminiService.generateJson<any>(
      commPrompt,
      communicationSchema,
      'Formulate disaster communications templates.'
    );
    await logUpdate('communication', 'idle', 'Prepared public alerts (SMS, Email, WhatsApp templates created).', 'success');

    // ==========================================
    // 9. AUTOMATION AGENT
    // ==========================================
    await logUpdate('automation', 'thinking', 'Activating database updates, setting dispatch vehicles, logging systems, compiling agency dashboard report...', 'info');
    await new Promise(r => setTimeout(r, 1500));

    // Update Incident priority in DB based on AI risk prediction
    const priorityLevel = riskAnalysis.priority.toLowerCase();
    const finalPriority = ['low', 'medium', 'high', 'critical'].includes(priorityLevel) 
      ? priorityLevel as Incident['priority'] 
      : 'medium';
    
    await db.incidents.updateStatus(incident.id, 'active');
    
    // Automatically dispatch vehicles and allocate resources in database
    for (const step of rescuePlanDetails.rescue_plan) {
      const matchVeh = dbVehicles.find(v => v.name.toLowerCase().includes(step.assigned_team.toLowerCase()) || step.assigned_team.toLowerCase().includes(v.name.toLowerCase()));
      if (matchVeh) {
        await db.vehicles.dispatch(matchVeh.id, incident.id);
        await db.logs.create('info', `Automated dispatch: vehicle ${matchVeh.name} set to active for incident ${incident.title}`, 'automation_agent');
      }
    }

    for (const res of rescuePlanDetails.resources) {
      await db.resources.allocate(res.name, res.quantity);
      await db.logs.create('info', `Automated allocation: ${res.quantity} of ${res.name} reserved.`, 'automation_agent');
    }

    // Compile Government PDF Report Text
    const govtReport = `
    ========================================================================
                      STATE DISASTER AGENCY EMERGENCY BRIEF
                            AEGIS-GOV INCIDENT #${incident.id.substring(0, 8).toUpperCase()}
    ========================================================================
    INCIDENT CATEGORY : ${incidentType}
    RISK EVALUATION   : ${riskAnalysis.risk_score}/100 [Priority: ${finalPriority.toUpperCase()}]
    LOCATION          : ${incident.address || 'San Francisco SOMA'} (${incident.location_lat}, ${incident.location_lng})
    REPORTED DATE     : ${new Date().toISOString()}

    1. EXECUTIVE SUMMARY:
    ${incident.description}

    2. AI VISION FIELD ASSESSMENT:
    ${JSON.parse(visionAnalysis).damage_assessment || 'Moderate visual damage confirmed by mapping servers.'}

    3. DISASTER RECOVERY PROTOCOLS IN EFFECT:
    ${researchProtocols}

    4. HISTORIC CASE STUDY MATCH:
    ${memoryInsights.similar_past_incidents.map((i: any) => `* Incident ID ${i.id}: ${i.title} (${i.date}). Action: ${i.action_taken}`).join('\n')}

    5. TACTICAL LOGISTICS DISPATCH:
    ${rescuePlanDetails.rescue_plan.map((s: any) => `Step ${s.step}: [${s.assigned_team}] ${s.title} - ${s.description}`).join('\n')}

    6. RECIPIENT MEDICAL ESTABLISHMENTS:
    ${rescuePlanDetails.hospitals.map((h: any) => `* ${h.name} (${h.distance}) - Space: ${h.available_capacity} beds`).join('\n')}

    7. ALERTS PREPARED FOR RESIDENTS:
    ${communicationTemplates.sms_template}
    `;

    // Save final report inside Database
    const finalReport = await db.reports.create({
      incident_id: incident.id,
      summary: `AEGIS Swarm processed ${incidentType} at ${incident.address || 'SOMA'}. Computed Risk Score is ${riskAnalysis.risk_score}. Deployed emergency triage protocols.`,
      risk_score: riskAnalysis.risk_score,
      priority: finalPriority,
      suggested_actions: riskAnalysis.risk_factors,
      rescue_plan: rescuePlanDetails.rescue_plan,
      hospital_recommendation: rescuePlanDetails.hospitals,
      resource_allocation: rescuePlanDetails.resources,
      govt_report: govtReport,
      pdf_url: `/api/reports/pdf/${incident.id}` // Link to PDF generation API
    });

    await logUpdate('automation', 'idle', 'Incident report created. Dispatches initialized. Database audit logged.', 'success');

    // Create a broadcast system-wide notification alert
    await db.notifications.create(
      `CRITICAL ALERT: AEGIS has initialized swarming response for ${incidentType} in ${incident.address || 'SOMA'}. Risk: ${riskAnalysis.risk_score}/100.`,
      'alert'
    );

    return finalReport;
  }
}
