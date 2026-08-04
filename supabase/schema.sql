-- Ejecuta este archivo completo en Supabase → SQL Editor → New query → Run

create extension if not exists "pgcrypto";

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  destination text not null,
  days int not null,
  transport_id text not null,
  num_people int not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists trip_members (
  trip_id uuid references trips(id) on delete cascade,
  user_id uuid references auth.users(id),
  display_name text not null,
  joined_at timestamptz default now(),
  primary key (trip_id, user_id)
);

create table if not exists transport_entries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  member text not null,
  info text not null,
  created_at timestamptz default now()
);

create table if not exists fuel_entries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  member text not null,
  place text not null,
  amount numeric not null,
  created_at timestamptz default now()
);

create table if not exists accommodations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  place text not null,
  dates text,
  roommates text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  title text not null,
  url text,
  storage_path text,
  added_by text not null,
  created_at timestamptz default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  concept text not null,
  amount numeric not null,
  payer text not null,
  split text[] not null,
  created_at timestamptz default now()
);

-- Seguridad (RLS): política simple para el MVP.
-- Cualquier persona registrada (con sesión iniciada) puede leer y escribir.
-- El código de viaje de 6 caracteres actúa como la "llave" para entrar a un panel,
-- igual que un enlace de invitación. Es suficiente para probarlo con gente de confianza;
-- si más adelante quieres reforzarlo (que solo los miembros de un viaje vean sus datos),
-- se puede afinar cambiando estas políticas.

alter table trips enable row level security;
alter table trip_members enable row level security;
alter table transport_entries enable row level security;
alter table fuel_entries enable row level security;
alter table accommodations enable row level security;
alter table documents enable row level security;
alter table expenses enable row level security;

create policy "usuarios registrados: acceso total" on trips
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "usuarios registrados: acceso total" on trip_members
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "usuarios registrados: acceso total" on transport_entries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "usuarios registrados: acceso total" on fuel_entries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "usuarios registrados: acceso total" on accommodations
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "usuarios registrados: acceso total" on documents
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "usuarios registrados: acceso total" on expenses
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Almacenamiento de archivos (tarjetas de embarque, bouchers, tickets...)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

create policy "usuarios registrados: subir documentos"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "cualquiera puede ver los documentos (enlace público)"
  on storage.objects for select
  using (bucket_id = 'documents');
