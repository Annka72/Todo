-- Kjør dette i Supabase SQL Editor (supabase.com → ditt prosjekt → SQL Editor)

create table tasks (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  category text not null default 'annet',
  done boolean default false,
  position integer default 0,
  created_at timestamptz default now()
);

create table subtasks (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade,
  text text not null,
  done boolean default false,
  position integer default 0,
  created_at timestamptz default now()
);

create table documents (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade,
  name text not null,
  size text,
  url text,
  created_at timestamptz default now()
);

-- Aktiver realtime for alle tabeller
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table subtasks;
alter publication supabase_realtime add table documents;

-- Tillat anonym lesing og skriving (juster etter behov)
alter table tasks enable row level security;
alter table subtasks enable row level security;
alter table documents enable row level security;

create policy "Alle kan lese og skrive tasks" on tasks for all using (true) with check (true);
create policy "Alle kan lese og skrive subtasks" on subtasks for all using (true) with check (true);
create policy "Alle kan lese og skrive documents" on documents for all using (true) with check (true);

-- Sett inn startdata
insert into tasks (text, category, position) values
  ('Oppdatere investordekk – Drops Health', 'investor', 0),
  ('Ferdigstille UPMB MOU Uganda-partnerskap', 'investor', 1),
  ('Teknotassen – demo klar for pilot', 'produkt', 2),
  ('Veilederen – compliance-sjekk Q2', 'produkt', 3),
  ('Planlegge neste fagdag / keynote', 'marked', 4);
