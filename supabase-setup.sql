-- ============================================================
-- Orbital OM 00 — Tabelle per l'automazione dati
-- Da eseguire UNA VOLTA nel SQL Editor di Supabase
-- ============================================================

-- Tabella changelog (patch notes)
create table if not exists changelog_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  build text,
  url text unique not null,
  published_at date,
  source text default 'Star Citizen Wiki',
  created_at timestamptz default now()
);

-- Tabella navi in uscita / roadmap
create table if not exists upcoming_ships (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  manufacturer text,
  production_status text,
  store_url text,
  updated_at timestamptz default now()
);

-- Sicurezza: entrambe le tabelle sono leggibili da chiunque (dati pubblici
-- di gioco), ma nessuno può scrivere tramite l'app — solo lo scraper
-- automatico (che usa una chiave separata, mai esposta nel sito) può farlo.
alter table changelog_entries enable row level security;
alter table upcoming_ships enable row level security;

create policy "Lettura pubblica changelog"
  on changelog_entries for select
  using (true);

create policy "Lettura pubblica navi in uscita"
  on upcoming_ships for select
  using (true);
