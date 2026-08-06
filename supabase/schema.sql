-- AEGIS AI Database Schema
-- Compatible with Supabase PostgreSQL

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create ENUM types
create type user_role as enum ('admin', 'operator', 'field_responder', 'citizen');
create type incident_status as enum ('reported', 'analyzing', 'active', 'resolved');
create type incident_priority as enum ('low', 'medium', 'high', 'critical');
create type resource_type as enum ('food', 'medical', 'shelter', 'water', 'equipment');
create type resource_status as enum ('available', 'deployed', 'low');
create type vehicle_type as enum ('ambulance', 'fire_truck', 'rescue_boat', 'helicopter');
create type vehicle_status as enum ('available', 'active', 'maintenance');
create type agent_role as enum ('coordinator', 'vision', 'research', 'planning', 'risk', 'voice', 'communication', 'automation', 'memory');
create type agent_status as enum ('idle', 'thinking', 'active', 'error');
create type log_level as enum ('info', 'warn', 'error');
create type notification_type as enum ('alert', 'system', 'info');

-- 1. Users Table (Linked to Supabase Auth users)
create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    full_name text not null,
    role user_role default 'operator'::user_role,
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Incidents Table
create table if not exists public.incidents (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text not null,
    status incident_status default 'reported'::incident_status not null,
    priority incident_priority default 'medium'::incident_priority not null,
    location_lat double precision not null,
    location_lng double precision not null,
    address text,
    media_url text,
    voice_url text,
    document_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    reporter_id uuid references public.users(id) on delete set null
);

-- 3. Reports Table (Final compiled AI incident reports)
create table if not exists public.reports (
    id uuid default uuid_generate_v4() primary key,
    incident_id uuid references public.incidents(id) on delete cascade not null,
    summary text not null,
    risk_score integer not null check (risk_score >= 0 and risk_score <= 100),
    priority incident_priority not null,
    suggested_actions text[] not null,
    rescue_plan jsonb not null, -- Step-by-step coordinates & instructions
    hospital_recommendation jsonb not null, -- Nearby recommended medical centers
    resource_allocation jsonb not null, -- Allocated vehicles & equipment
    govt_report text, -- Formatted official state document
    pdf_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Chats Table (Incident collaboration chats)
create table if not exists public.chats (
    id uuid default uuid_generate_v4() primary key,
    incident_id uuid references public.incidents(id) on delete cascade not null,
    messages jsonb[] default '{}'::jsonb[] not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Resources Table
create table if not exists public.resources (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    type resource_type not null,
    quantity integer not null default 0,
    unit text not null,
    status resource_status default 'available'::resource_status not null,
    location_lat double precision not null,
    location_lng double precision not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Hospitals Table
create table if not exists public.hospitals (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    location_lat double precision not null,
    location_lng double precision not null,
    capacity_total integer not null,
    capacity_available integer not null,
    contact_number text,
    specialties text[] not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Vehicles Table (Emergency Dispatch Vehicles)
create table if not exists public.vehicles (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    type vehicle_type not null,
    status vehicle_status default 'available'::vehicle_status not null,
    current_lat double precision not null,
    current_lng double precision not null,
    assigned_incident_id uuid references public.incidents(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Agents Table (Active AI Swarm Agents Statuses)
create table if not exists public.agents (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    role agent_role unique not null,
    status agent_status default 'idle'::agent_status not null,
    last_active timestamp with time zone default timezone('utc'::text, now()) not null,
    logs jsonb[] default '{}'::jsonb[] not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Logs Table (System and agent logs)
create table if not exists public.logs (
    id uuid default uuid_generate_v4() primary key,
    level log_level default 'info'::log_level not null,
    message text not null,
    component text not null,
    details jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Settings Table
create table if not exists public.settings (
    key text primary key,
    value jsonb not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Notifications Table
create table if not exists public.notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade, -- Null indicates system-wide broadcast
    message text not null,
    type notification_type default 'info'::notification_type not null,
    is_read boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indices for performance
create index if not exists idx_incidents_status on public.incidents(status);
create index if not exists idx_incidents_priority on public.incidents(priority);
create index if not exists idx_reports_incident_id on public.reports(incident_id);
create index if not exists idx_vehicles_assigned_incident_id on public.vehicles(assigned_incident_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_logs_level on public.logs(level);

-- Trigger to automatically update incident's updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_incidents_updated_at
    before update on public.incidents
    for each row
    execute procedure public.update_updated_at_column();

-- Seed initial data for agents, resources, hospitals, and vehicles
insert into public.agents (name, role, status) values
('Aegis Coordinator', 'coordinator', 'idle'),
('Vision Sentinel', 'vision', 'idle'),
('Protocol Researcher', 'research', 'idle'),
('Logistics Planner', 'planning', 'idle'),
('Risk Analyzer', 'risk', 'idle'),
('Aegis Voice Assistant', 'voice', 'idle'),
('Alert Communicator', 'communication', 'idle'),
('Action Automator', 'automation', 'idle'),
('Experience Memory Agent', 'memory', 'idle')
on conflict (role) do update set status = 'idle';

-- Seed mock hospitals
insert into public.hospitals (name, location_lat, location_lng, capacity_total, capacity_available, contact_number, specialties) values
('Saint Sebastian General Hospital', 37.7749, -122.4194, 250, 42, '+1-555-0199', ARRAY['Trauma Care', 'Burn Unit', 'Emergency Surgery']),
('Pacific Emergency Medical Center', 37.7833, -122.4167, 180, 18, '+1-555-0188', ARRAY['Critical Care', 'Internal Medicine']),
('City Health Clinic & ICU', 37.7689, -122.4294, 100, 5, '+1-555-0177', ARRAY['Pediatrics', 'Triage Outpost'])
on conflict do nothing;

-- Seed mock vehicles
insert into public.vehicles (name, type, status, current_lat, current_lng) values
('Rescue Unit Alpha', 'ambulance', 'available', 37.7720, -122.4150),
('Rescue Unit Beta', 'ambulance', 'available', 37.7810, -122.4220),
('Fire Engine 14', 'fire_truck', 'available', 37.7780, -122.4110),
('Helicopter Lifesaver 1', 'helicopter', 'available', 37.7620, -122.4080),
('Inflatable Boat Taskforce', 'rescue_boat', 'available', 37.7950, -122.4020)
on conflict do nothing;

-- Seed mock resources
insert into public.resources (name, type, quantity, unit, status, location_lat, location_lng) values
('Emergency Trauma Kits', 'medical', 500, 'kits', 'available', 37.7749, -122.4194),
('Clean Drinking Water', 'water', 10000, 'liters', 'available', 37.7833, -122.4167),
('High-Calorie MRE Packs', 'food', 3000, 'boxes', 'available', 37.7689, -122.4294),
('Rapid Deployment Tents', 'shelter', 150, 'tents', 'available', 37.7749, -122.4194),
('Heavy Hydraulic Cutters', 'equipment', 25, 'units', 'available', 37.7780, -122.4110)
on conflict do nothing;
