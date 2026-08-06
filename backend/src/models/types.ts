export type UserRole = 'admin' | 'operator' | 'field_responder' | 'citizen';
export type IncidentStatus = 'reported' | 'analyzing' | 'active' | 'resolved';
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';
export type ResourceType = 'food' | 'medical' | 'shelter' | 'water' | 'equipment';
export type ResourceStatus = 'available' | 'deployed' | 'low';
export type VehicleType = 'ambulance' | 'fire_truck' | 'rescue_boat' | 'helicopter';
export type VehicleStatus = 'available' | 'active' | 'maintenance';
export type AgentRole = 'coordinator' | 'vision' | 'research' | 'planning' | 'risk' | 'voice' | 'communication' | 'automation' | 'memory';
export type AgentStatus = 'idle' | 'thinking' | 'active' | 'error';
export type LogLevel = 'info' | 'warn' | 'error';
export type NotificationType = 'alert' | 'system' | 'info';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  created_at: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  location_lat: number;
  location_lng: number;
  address?: string;
  media_url?: string;
  voice_url?: string;
  document_url?: string;
  created_at: string;
  updated_at: string;
  reporter_id?: string;
}

export interface RescuePlanStep {
  step: number;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  assigned_team: string;
}

export interface RecommendedHospital {
  name: string;
  distance: string;
  available_capacity: number;
  contact: string;
  priority: number;
}

export interface AllocatedResource {
  name: string;
  quantity: number;
  type: string;
}

export interface Report {
  id: string;
  incident_id: string;
  summary: string;
  risk_score: number;
  priority: IncidentPriority;
  suggested_actions: string[];
  rescue_plan: RescuePlanStep[];
  hospital_recommendation: RecommendedHospital[];
  resource_allocation: AllocatedResource[];
  govt_report?: string;
  pdf_url?: string;
  created_at: string;
}

export interface ChatMessage {
  sender: string;
  role: 'system' | 'user' | 'coordinator' | string;
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  incident_id: string;
  messages: ChatMessage[];
  created_at: string;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  quantity: number;
  unit: string;
  status: ResourceStatus;
  location_lat: number;
  location_lng: number;
  created_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  location_lat: number;
  location_lng: number;
  capacity_total: number;
  capacity_available: number;
  contact_number?: string;
  specialties: string[];
  created_at: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  status: VehicleStatus;
  current_lat: number;
  current_lng: number;
  assigned_incident_id?: string;
  created_at: string;
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  last_active: string;
  logs: { timestamp: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[];
  created_at: string;
}

export interface SystemLog {
  id: string;
  level: LogLevel;
  message: string;
  component: string;
  details?: any;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id?: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}
