import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { 
  User, Incident, Report, Chat, Resource, Hospital, Vehicle, Agent, SystemLog, Notification 
} from '../models/types';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export let supabase: SupabaseClient | null = null;
export let isUsingMockDB = true;

// Attempt to initialize Supabase
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isUsingMockDB = false;
    console.log('🔗 Connected to Supabase Database successfully.');
  } catch (err) {
    console.warn('⚠️ Supabase connection failed. Falling back to In-Memory DB.');
    isUsingMockDB = true;
  }
} else {
  console.log('ℹ️ Supabase credentials missing. Bootstrapping with In-Memory Database.');
  isUsingMockDB = true;
}

// In-Memory Database Store for Graceful Fallback
class InMemoryDatabase {
  public users: Map<string, User> = new Map();
  public incidents: Map<string, Incident> = new Map();
  public reports: Map<string, Report> = new Map();
  public chats: Map<string, Chat> = new Map();
  public resources: Map<string, Resource> = new Map();
  public hospitals: Map<string, Hospital> = new Map();
  public vehicles: Map<string, Vehicle> = new Map();
  public agents: Map<string, Agent> = new Map();
  public logs: SystemLog[] = [];
  public notifications: Notification[] = [];
  public settings: Map<string, any> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed initial agents
    const roles: Agent['role'][] = [
      'coordinator', 'vision', 'research', 'planning', 'risk', 'voice', 'communication', 'automation', 'memory'
    ];
    const names = [
      'Aegis Coordinator', 'Vision Sentinel', 'Protocol Researcher', 'Logistics Planner', 
      'Risk Analyzer', 'Aegis Voice Assistant', 'Alert Communicator', 'Action Automator', 'Experience Memory Agent'
    ];

    roles.forEach((role, index) => {
      const id = (index + 1).toString();
      this.agents.set(id, {
        id,
        name: names[index],
        role,
        status: 'idle',
        last_active: new Date().toISOString(),
        logs: [],
        created_at: new Date().toISOString()
      });
    });

    // Seed mock hospitals
    const mockHospitals: Hospital[] = [
      {
        id: 'h1',
        name: 'Saint Sebastian General Hospital',
        location_lat: 37.7749,
        location_lng: -122.4194,
        capacity_total: 250,
        capacity_available: 42,
        contact_number: '+1-555-0199',
        specialties: ['Trauma Care', 'Burn Unit', 'Emergency Surgery'],
        created_at: new Date().toISOString()
      },
      {
        id: 'h2',
        name: 'Pacific Emergency Medical Center',
        location_lat: 37.7833,
        location_lng: -122.4167,
        capacity_total: 180,
        capacity_available: 18,
        contact_number: '+1-555-0188',
        specialties: ['Critical Care', 'Internal Medicine'],
        created_at: new Date().toISOString()
      },
      {
        id: 'h3',
        name: 'City Health Clinic & ICU',
        location_lat: 37.7689,
        location_lng: -122.4294,
        capacity_total: 100,
        capacity_available: 5,
        contact_number: '+1-555-0177',
        specialties: ['Pediatrics', 'Triage Outpost'],
        created_at: new Date().toISOString()
      }
    ];
    mockHospitals.forEach(h => this.hospitals.set(h.id, h));

    // Seed mock vehicles
    const mockVehicles: Vehicle[] = [
      {
        id: 'v1',
        name: 'Rescue Unit Alpha',
        type: 'ambulance',
        status: 'available',
        current_lat: 37.7720,
        current_lng: -122.4150,
        created_at: new Date().toISOString()
      },
      {
        id: 'v2',
        name: 'Rescue Unit Beta',
        type: 'ambulance',
        status: 'available',
        current_lat: 37.7810,
        current_lng: -122.4220,
        created_at: new Date().toISOString()
      },
      {
        id: 'v3',
        name: 'Fire Engine 14',
        type: 'fire_truck',
        status: 'available',
        current_lat: 37.7780,
        current_lng: -122.4110,
        created_at: new Date().toISOString()
      },
      {
        id: 'v4',
        name: 'Helicopter Lifesaver 1',
        type: 'helicopter',
        status: 'available',
        current_lat: 37.7620,
        current_lng: -122.4080,
        created_at: new Date().toISOString()
      },
      {
        id: 'v5',
        name: 'Inflatable Boat Taskforce',
        type: 'rescue_boat',
        status: 'available',
        current_lat: 37.7950,
        current_lng: -122.4020,
        created_at: new Date().toISOString()
      }
    ];
    mockVehicles.forEach(v => this.vehicles.set(v.id, v));

    // Seed mock resources
    const mockResources: Resource[] = [
      {
        id: 'r1',
        name: 'Emergency Trauma Kits',
        type: 'medical',
        quantity: 500,
        unit: 'kits',
        status: 'available',
        location_lat: 37.7749,
        location_lng: -122.4194,
        created_at: new Date().toISOString()
      },
      {
        id: 'r2',
        name: 'Clean Drinking Water',
        type: 'water',
        quantity: 10000,
        unit: 'liters',
        status: 'available',
        location_lat: 37.7833,
        location_lng: -122.4167,
        created_at: new Date().toISOString()
      },
      {
        id: 'r3',
        name: 'High-Calorie MRE Packs',
        type: 'food',
        quantity: 3000,
        unit: 'boxes',
        status: 'available',
        location_lat: 37.7689,
        location_lng: -122.4294,
        created_at: new Date().toISOString()
      },
      {
        id: 'r4',
        name: 'Rapid Deployment Tents',
        type: 'shelter',
        quantity: 150,
        unit: 'tents',
        status: 'available',
        location_lat: 37.7749,
        location_lng: -122.4194,
        created_at: new Date().toISOString()
      },
      {
        id: 'r5',
        name: 'Heavy Hydraulic Cutters',
        type: 'equipment',
        quantity: 25,
        unit: 'units',
        status: 'available',
        location_lat: 37.7780,
        location_lng: -122.4110,
        created_at: new Date().toISOString()
      }
    ];
    mockResources.forEach(r => this.resources.set(r.id, r));
  }
}

export const inMemoryDB = new InMemoryDatabase();

// DB API Wrapper supporting both live Supabase and Mock In-Memory databases
export const db = {
  // Users
  users: {
    async create(user: User): Promise<User> {
      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('users').insert(user).select().single();
        if (error) throw error;
        return data;
      }
      inMemoryDB.users.set(user.id, user);
      return user;
    },
    async findById(id: string): Promise<User | null> {
      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
        if (error) return null;
        return data;
      }
      return inMemoryDB.users.get(id) || null;
    },
    async findByEmail(email: string): Promise<User | null> {
      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
        if (error) return null;
        return data;
      }
      for (const user of inMemoryDB.users.values()) {
        if (user.email === email) return user;
      }
      return null;
    }
  },

  // Incidents
  incidents: {
    async create(incident: Omit<Incident, 'id' | 'created_at' | 'updated_at'>): Promise<Incident> {
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      const now = new Date().toISOString();
      const newIncident: Incident = {
        ...incident,
        id,
        created_at: now,
        updated_at: now
      };

      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('incidents').insert(newIncident).select().single();
        if (error) throw error;
        return data;
      }

      inMemoryDB.incidents.set(id, newIncident);
      return newIncident;
    },
    async list(): Promise<Incident[]> {
      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('incidents').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      }
      return Array.from(inMemoryDB.incidents.values()).sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    async findById(id: string): Promise<Incident | null> {
      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('incidents').select('*').eq('id', id).single();
        if (error) return null;
        return data;
      }
      return inMemoryDB.incidents.get(id) || null;
    },
    async updateStatus(id: string, status: Incident['status']): Promise<Incident> {
      const now = new Date().toISOString();
      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('incidents').update({ status, updated_at: now }).eq('id', id).select().single();
        if (error) throw error;
        return data;
      }
      const existing = inMemoryDB.incidents.get(id);
      if (!existing) throw new Error('Incident not found');
      const updated = { ...existing, status, updated_at: now };
      inMemoryDB.incidents.set(id, updated);
      return updated;
    }
  },

  // Reports
  reports: {
    async create(report: Omit<Report, 'id' | 'created_at'>): Promise<Report> {
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      const newReport: Report = {
        ...report,
        id,
        created_at: new Date().toISOString()
      };

      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('reports').insert(newReport).select().single();
        if (error) throw error;
        return data;
      }

      inMemoryDB.reports.set(id, newReport);
      return newReport;
    },
    async findByIncidentId(incidentId: string): Promise<Report | null> {
      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('reports').select('*').eq('incident_id', incidentId).single();
        if (error) return null;
        return data;
      }
      for (const report of inMemoryDB.reports.values()) {
        if (report.incident_id === incidentId) return report;
      }
      return null;
    },
    async list(): Promise<Report[]> {
      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      }
      return Array.from(inMemoryDB.reports.values()).sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
  },

  // Chats
  chats: {
    async getOrCreate(incidentId: string): Promise<Chat> {
      if (!isUsingMockDB && supabase) {
        const { data: existing, error: findError } = await supabase.from('chats').select('*').eq('incident_id', incidentId).single();
        if (!findError && existing) return existing;

        const newChat = {
          incident_id: incidentId,
          messages: []
        };
        const { data, error } = await supabase.from('chats').insert(newChat).select().single();
        if (error) throw error;
        return data;
      }

      for (const chat of inMemoryDB.chats.values()) {
        if (chat.incident_id === incidentId) return chat;
      }

      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      const newChat: Chat = {
        id,
        incident_id: incidentId,
        messages: [],
        created_at: new Date().toISOString()
      };
      inMemoryDB.chats.set(id, newChat);
      return newChat;
    },
    async appendMessage(incidentId: string, message: Chat['messages'][0]): Promise<Chat> {
      const chat = await this.getOrCreate(incidentId);
      const updatedMessages = [...chat.messages, message];

      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('chats').update({ messages: updatedMessages }).eq('id', chat.id).select().single();
        if (error) throw error;
        return data;
      }

      chat.messages = updatedMessages;
      inMemoryDB.chats.set(chat.id, chat);
      return chat;
    }
  },

  // Resources
  resources: {
    async list(): Promise<Resource[]> {
      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('resources').select('*');
        if (error) throw error;
        return data || [];
      }
      return Array.from(inMemoryDB.resources.values());
    },
    async allocate(name: string, quantity: number): Promise<boolean> {
      const resources = await this.list();
      const match = resources.find(r => r.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(r.name.toLowerCase()));
      if (!match) return false;

      const newQty = Math.max(0, match.quantity - quantity);
      const newStatus = newQty === 0 ? 'deployed' : (newQty < 20 ? 'low' : 'available');

      if (!isUsingMockDB && supabase) {
        const { error } = await supabase.from('resources').update({ quantity: newQty, status: newStatus }).eq('id', match.id);
        if (error) return false;
        return true;
      }

      match.quantity = newQty;
      match.status = newStatus as any;
      inMemoryDB.resources.set(match.id, match);
      return true;
    }
  },

  // Hospitals
  hospitals: {
    async list(): Promise<Hospital[]> {
      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('hospitals').select('*');
        if (error) throw error;
        return data || [];
      }
      return Array.from(inMemoryDB.hospitals.values());
    },
    async updateCapacity(id: string, count: number): Promise<boolean> {
      if (!isUsingMockDB && supabase) {
        const { error } = await supabase.from('hospitals').update({ capacity_available: count }).eq('id', id);
        if (error) return false;
        return true;
      }
      const hosp = inMemoryDB.hospitals.get(id);
      if (!hosp) return false;
      hosp.capacity_available = Math.max(0, count);
      inMemoryDB.hospitals.set(id, hosp);
      return true;
    }
  },

  // Vehicles
  vehicles: {
    async list(): Promise<Vehicle[]> {
      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('vehicles').select('*');
        if (error) throw error;
        return data || [];
      }
      return Array.from(inMemoryDB.vehicles.values());
    },
    async dispatch(id: string, incidentId: string): Promise<boolean> {
      if (!isUsingMockDB && supabase) {
        const { error } = await supabase.from('vehicles').update({ status: 'active', assigned_incident_id: incidentId }).eq('id', id);
        if (error) return false;
        return true;
      }
      const veh = inMemoryDB.vehicles.get(id);
      if (!veh) return false;
      veh.status = 'active';
      veh.assigned_incident_id = incidentId;
      inMemoryDB.vehicles.set(id, veh);
      return true;
    }
  },

  // Agents
  agents: {
    async list(): Promise<Agent[]> {
      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('agents').select('*');
        if (error) throw error;
        return data || [];
      }
      return Array.from(inMemoryDB.agents.values());
    },
    async updateStatus(role: Agent['role'], status: Agent['status'], logMessage?: string): Promise<Agent> {
      const now = new Date().toISOString();
      const agents = await this.list();
      const agent = agents.find(a => a.role === role);
      if (!agent) throw new Error(`Agent with role ${role} not found`);

      let logs = agent.logs || [];
      if (logMessage) {
        logs = [...logs, { timestamp: now, message: logMessage, type: status === 'error' ? 'error' : 'info' }];
      }

      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('agents').update({ status, last_active: now, logs }).eq('id', agent.id).select().single();
        if (error) throw error;
        return data;
      }

      const updatedAgent: Agent = {
        ...agent,
        status,
        last_active: now,
        logs
      };
      inMemoryDB.agents.set(agent.id, updatedAgent);
      return updatedAgent;
    },
    async appendLog(role: Agent['role'], message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): Promise<Agent> {
      const now = new Date().toISOString();
      const agents = await this.list();
      const agent = agents.find(a => a.role === role);
      if (!agent) throw new Error(`Agent with role ${role} not found`);

      const logs = [...(agent.logs || []), { timestamp: now, message, type }];

      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('agents').update({ logs }).eq('id', agent.id).select().single();
        if (error) throw error;
        return data;
      }

      const updatedAgent: Agent = { ...agent, logs };
      inMemoryDB.agents.set(agent.id, updatedAgent);
      return updatedAgent;
    }
  },

  // Logs
  logs: {
    async create(level: SystemLog['level'], message: string, component: string, details?: any): Promise<SystemLog> {
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      const newLog: SystemLog = {
        id,
        level,
        message,
        component,
        details,
        created_at: new Date().toISOString()
      };

      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('logs').insert(newLog).select().single();
        if (error) throw error;
        return data;
      }

      inMemoryDB.logs.push(newLog);
      return newLog;
    },
    async list(limit = 100): Promise<SystemLog[]> {
      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('logs').select('*').order('created_at', { ascending: false }).limit(limit);
        if (error) throw error;
        return data || [];
      }
      return [...inMemoryDB.logs].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
    }
  },

  // Notifications
  notifications: {
    async create(message: string, type: Notification['type'] = 'info', userId?: string): Promise<Notification> {
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      const newNotification: Notification = {
        id,
        user_id: userId,
        message,
        type,
        is_read: false,
        created_at: new Date().toISOString()
      };

      if (!isUsingMockDB && supabase) {
        const { data, error } = await supabase.from('notifications').insert(newNotification).select().single();
        if (error) throw error;
        return data;
      }

      inMemoryDB.notifications.push(newNotification);
      return newNotification;
    },
    async list(userId?: string): Promise<Notification[]> {
      if (!isUsingMockDB && supabase) {
        let query = supabase.from('notifications').select('*');
        if (userId) {
          query = query.or(`user_id.eq.${userId},user_id.is.null`);
        } else {
          query = query.is('user_id', null);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      }

      return inMemoryDB.notifications
        .filter(n => !n.user_id || n.user_id === userId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    async markAsRead(id: string): Promise<boolean> {
      if (!isUsingMockDB && supabase) {
        const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        if (error) return false;
        return true;
      }
      const notif = inMemoryDB.notifications.find(n => n.id === id);
      if (!notif) return false;
      notif.is_read = true;
      return true;
    }
  }
};
