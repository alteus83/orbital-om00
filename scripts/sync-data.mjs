// ============================================================
// Orbital OM 00 — Sincronizzazione dati automatica
// Eseguito periodicamente da GitHub Actions (vedi .github/workflows/sync-data.yml)
// Fonti: Star Citizen Wiki (changelog) e Ship Matrix ufficiale RSI (navi in uscita)
// ============================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Mancano le variabili d'ambiente SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

// ------------------------------------------------------------
// CHANGELOG — da Star Citizen Wiki
// ------------------------------------------------------------
async function fetchChangelog() {
  const res = await fetch("https://starcitizen.tools/Patch_notes");
  if (!res.ok) throw new Error(`Star Citizen Wiki: risposta ${res.status}`);
  const html = await res.text();

  // Isoliamo la tabella "List of patch notes"
  const tableMatch = html.match(/<table class="wikitable[^"]*"[\s\S]*?<\/table>/);
  if (!tableMatch) throw new Error("Tabella patch notes non trovata nella pagina wiki.");
  const tableHtml = tableMatch[0];

  const rowRegex = /<tr>\s*<td>\s*<a href="([^"]+)"[^>]*>([^<]+)<\/a>\s*<\/td>\s*<td>([^<]*)<\/td>\s*<td>([^<]*)<\/td>\s*<\/tr>/g;

  const entries = [];
  let match;
  while ((match = rowRegex.exec(tableHtml)) !== null && entries.length < 15) {
    const [, href, title, build, date] = match;
    const url = href.startsWith("http") ? href : `https://starcitizen.tools${href}`;
    entries.push({
      title: title.trim(),
      build: build.trim() || null,
      url,
      published_at: date.trim() || null,
      source: "Star Citizen Wiki",
    });
  }

  if (entries.length === 0) {
    throw new Error("Nessuna riga di changelog estratta: la struttura della pagina wiki potrebbe essere cambiata.");
  }

  return entries;
}

// ------------------------------------------------------------
// NAVI IN USCITA — dallo Ship Matrix ufficiale di RSI
// -----------------------------------------------------------
async function fetchUpcomingShips() {
  const res = await fetch("https://robertsspaceindustries.com/ship-matrix/index");
  if (!res.ok) throw new Error(`RSI Ship Matrix: risposta ${res.status}`);
  const json = await res.json();
  const models = json.data;

  if (!Array.isArray(models)) {
    throw new Error("Risposta Ship Matrix inattesa (manca il campo 'data').");
  }

  const upcoming = models.filter((m) => {
    const status = String(m.production_status || "").toLowerCase();
    return status && status !== "flight-ready";
  });

  return upcoming.slice(0, 60).map((m) => ({
    slug: String(m.id),
    name: m.name || "Nave sconosciuta",
    manufacturer: m.manufacturer?.name || null,
    production_status: m.production_status || "Sconosciuto",
    store_url: m.url ? `https://robertsspaceindustries.com${m.url}` : null,
    scm_speed: m.scm_speed ?? null,
    cargo: m.cargocapacity ?? null,
    min_crew: m.min_crew ?? null,
    max_crew: m.max_crew ?? null,
    size: m.size || null,
    focus: m.focus || null,
  }));
}

// ------------------------------------------------------------
// SALVATAGGIO SU SUPABASE (upsert = aggiorna se esiste, crea se nuovo)
// ------------------------------------------------------------
async function upsert(table, rows, conflictColumn) {
  if (rows.length === 0) return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${conflictColumn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Errore salvataggio su ${table}: ${res.status} ${text}`);
  }
  console.log(`✓ ${rows.length} righe salvate in "${table}"`);
}

// ------------------------------------------------------------
// ESECUZIONE
// ------------------------------------------------------------
async function main() {
  console.log("Raccolgo il changelog da Star Citizen Wiki...");
  const changelog = await fetchChangelog();
  await upsert("changelog_entries", changelog, "url");

  console.log("Raccolgo le navi in uscita dallo Ship Matrix RSI...");
  try {
    const ships = await fetchUpcomingShips();
    await upsert("upcoming_ships", ships, "slug");
  } catch (e) {
    // Non blocchiamo l'intera sincronizzazione se solo questa parte fallisce:
    // il changelog è comunque stato aggiornato con successo.
    console.error("Attenzione — navi in uscita non aggiornate:", e.message);
  }

  console.log("Sincronizzazione completata.");
}

main().catch((err) => {
  console.error("Sincronizzazione fallita:", err.message);
  process.exit(1);
});
