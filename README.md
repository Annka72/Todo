# Dynamisk Helse — delt oppgaveliste

Sanntids oppgaveliste for Ann-Kristin og Henrik med Claude-sparring innebygd.

---

## Oppsett (ca. 15 minutter)

### Steg 1 — Supabase (database)

1. Gå til [supabase.com](https://supabase.com) og logg inn
2. Klikk **New project** — gi det et navn, f.eks. `dh-todo`
3. Vent til prosjektet er klart (1–2 min)
4. Gå til **SQL Editor** i venstremenyen
5. Lim inn hele innholdet fra `supabase-setup.sql` og klikk **Run**
6. Gå til **Project Settings → API**
7. Kopier:
   - **Project URL** → dette er `REACT_APP_SUPABASE_URL`
   - **anon / public key** → dette er `REACT_APP_SUPABASE_ANON_KEY`

### Steg 2 — GitHub (kildekode)

1. Gå til [github.com](https://github.com) og logg inn
2. Klikk **New repository** — navn: `dh-todo`, sett til **Private**
3. Last opp alle filene fra denne mappen til repoet
   - Enklest: dra og slipp mappen i GitHub-grensesnittet, eller bruk GitHub Desktop

### Steg 3 — Vercel (publisering)

1. Gå til [vercel.com](https://vercel.com) og logg inn
2. Klikk **Add New → Project**
3. Velg GitHub-repoet `dh-todo`
4. Under **Environment Variables**, legg til:
   - `REACT_APP_SUPABASE_URL` = Project URL fra Supabase
   - `REACT_APP_SUPABASE_ANON_KEY` = anon key fra Supabase
5. Klikk **Deploy**

Etter noen minutter får du en URL som `dh-todo.vercel.app` — del denne med Henrik!

---

## Bruk

- **Legg til oppgave**: Skriv i feltet øverst og velg kategori
- **Underpunkter og dokumenter**: Klikk "Detaljer" på en oppgave
- **Sparre med Claude**: Klikk "Spør ↗" — Claude kjenner konteksten til Dynamisk Helse
- **Sanntid**: Endringer vises automatisk hos begge parter

---

## Teknisk stack

- React (Create React App)
- Supabase (PostgreSQL + Realtime)
- Vercel (hosting)
- Anthropic Claude API (innebygd i appen)
