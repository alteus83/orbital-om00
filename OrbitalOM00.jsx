import React, { useState, useMemo, useEffect } from "react";
import { Home, Rocket, BookOpen, User, ChevronRight, ChevronLeft, X, Scale, Zap, Users, Box, Gauge, Package, MapPin, Clock, Sparkles, Mail, Lock, LogOut, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// DATI NAVI (segnaposto / indicativi — da verificare e aggiornare in Fase 2)
// ---------------------------------------------------------------------------
const SHIPS = [
  { id: "aurora", name: "Aurora MR", manufacturer: "RSI", role: "Starter", size: "Small", crew: "1", cargo: 3, speedSCM: 155, price: "20 (USD)", note: "Nave di partenza, ottima per iniziare a fare cargo leggero." },
  { id: "avenger", name: "Avenger Titan", manufacturer: "Aegis", role: "Combattimento", size: "Small", crew: "1", cargo: 4, speedSCM: 170, price: "70 (USD)", note: "Caccia leggero versatile, buon punto d'ingresso nel combattimento." },
  { id: "cutlass", name: "Cutlass Black", manufacturer: "Drake", role: "Multiruolo", size: "Medium", crew: "2", cargo: 46, speedSCM: 165, price: "115 (USD)", note: "Il coltellino svizzero: cargo, scorta, abbordaggio." },
  { id: "freelancer", name: "Freelancer MAX", manufacturer: "MISC", role: "Cargo", size: "Medium", crew: "2", cargo: 120, speedSCM: 150, price: "150 (USD)", note: "Variante cargo pura della Freelancer, ottimo SCU/prezzo." },
  { id: "constellation", name: "Constellation Andromeda", manufacturer: "RSI", role: "Multiruolo", size: "Large", crew: "4", cargo: 96, speedSCM: 145, price: "225 (USD)", note: "Nave da equipaggio classica, combatte e trasporta bene." },
  { id: "carrack", name: "Carrack", manufacturer: "Anvil", role: "Esplorazione", size: "Large", crew: "4-6", cargo: 456, speedSCM: 140, price: "600 (USD)", note: "Base mobile per esplorazione a lungo raggio, porta un rover." },
  { id: "reclaimer", name: "Reclaimer", manufacturer: "Aegis", role: "Industriale", size: "Large", crew: "4", cargo: 4416, speedSCM: 130, price: "425 (USD)", note: "Recupero relitti su larga scala, lenta ma specializzata." },
  { id: "cutter", name: "Cutter", manufacturer: "Drake", role: "Starter", size: "Small", crew: "1", cargo: 8, speedSCM: 160, price: "55 (USD)", note: "Starter orientato al trasporto leggero, molto SCU per la taglia." },
];

const ROLES = ["Tutti", ...Array.from(new Set(SHIPS.map((s) => s.role)))];

// ---------------------------------------------------------------------------
// GUIDE (contenuto esistente, riportato in questa versione)
// ---------------------------------------------------------------------------
const GUIDES = [
  {
    id: "mining",
    title: "Mining — le basi",
    body: "Equipaggia un laser adatto al minerale target, scansiona i roccioni con lo scanner nave, spacca con estrazione controllata (non superare la soglia di instabilità) e trasferisci il minerale in un container di raffineria per venderlo raffinato invece che grezzo, se possibile.",
  },
  {
    id: "selling",
    title: "Dove vendere il carico",
    body: "I prezzi delle commodity oscillano per location e nel tempo. Controlla sempre uno strumento esterno di tracciamento prezzi prima di un viaggio lungo, invece di fidarti del prezzo dell'ultima volta.",
  },
  {
    id: "missions",
    title: "Missioni — tipologie",
    body: "Consegna, box delivery, bounty hunting, ricerca e soccorso, investigazione: ogni tipo ha rischio e ricompensa diversi. Le missioni a catena (chain) danno reputazione più velocemente ma richiedono più tempo di sessione.",
  },
  {
    id: "earning",
    title: "Guadagnare aUEC",
    body: "Le fonti più stabili restano trading di commodity legali, mining e missioni di consegna. Le fonti più rischiose (pirateria, contrabbando) rendono di più ma espongono a perdita nave e reputazione.",
  },
];

const UPGRADE_GUIDE = {
  ccu: "Un CCU (Cross Chassis Upgrade) ti permette di passare da una nave a un'altra pagando solo la differenza di prezzo, mantenendo il LTI se la nave di partenza ce l'ha. Comprali quando li vedi in offerta (prezzo di upgrade basso) anche se non ti servono subito: puoi rivenderli o usarli dopo.",
  warbond: "I pacchetti Warbond costano meno ma il pagamento è immediato e non rimborsabile in credito negozio: usali solo per navi che sei sicuro di voler tenere a lungo termine.",
  melt: "Il 'melt' converte una nave o un pacchetto in credito negozio (Store Credit), utile per riorganizzare la flotta senza spendere soldi reali aggiuntivi. Nota che il credito negozio non è rimborsabile in denaro reale.",
  paths: "Per iniziare: 1 nave starter versatile + eventuali CCU accantonati durante le offerte. Aggiorna verso una nave dedicata al tuo ruolo preferito solo dopo aver testato quel gameplay con navi noleggiate in-game.",
};

// ---------------------------------------------------------------------------
// LOOT — location indicative (contenuto generale, verificare in gioco)
// ---------------------------------------------------------------------------
const LOOT_LOCATIONS = [
  {
    id: "salvage",
    title: "Rottami spaziali (cinture asteroidi, es. Yela)",
    body: "Buona fonte di componenti riciclabili tramite salvage (RSP o navi dedicate come la Reclaimer). I relitti nelle cinture di asteroidi sono spesso meno affollati di quelli vicino alle stazioni.",
  },
  {
    id: "surface-mining",
    title: "Superfici lunari (es. Daymar, Cellin, Yela)",
    body: "Giacimenti di minerale in superficie raggiungibili con ROC o a piedi con scanner portatile: buon punto di partenza per il mining senza dover usare una nave mineraria dedicata.",
  },
  {
    id: "bunkers",
    title: "Bunker abbandonati",
    body: "Fonte di armi, armature e componenti FPS. Spesso presidiati da NPC ostili o altri giocatori: valuta il rischio prima di entrare senza equipaggiamento da combattimento.",
  },
  {
    id: "wrecks",
    title: "Relitti navali nelle missioni",
    body: "I container a bordo dei relitti generati dalle missioni contengono spesso loot vario. Controlla sempre lo stato dell'atmosfera/gravità della nave relitto prima di procedere senza tuta.",
  },
];

// ---------------------------------------------------------------------------
// CARGO — pianificazione missioni (consigli generali)
// ---------------------------------------------------------------------------
const CARGO_TIPS = [
  {
    id: "margin",
    title: "Calcola il margine prima di partire",
    body: "Controlla la differenza tra prezzo di acquisto e di vendita per SCU con uno strumento esterno di tracciamento prezzi: un margine che sembra buono su carta può non coprire il tempo di volo.",
  },
  {
    id: "capacity",
    title: "Verifica la capacità reale della nave",
    body: "Conferma gli SCU disponibili sulla tua nave (non solo il valore 'da scheda tecnica') e confrontali con il carico richiesto dalla missione prima di accettarla.",
  },
  {
    id: "fuel",
    title: "Pianifica le soste per il carburante",
    body: "Su tratte lunghe controlla i livelli di idrogeno e quantum fuel: meglio una sosta programmata che rimanere bloccati a metà rotta.",
  },
  {
    id: "traffic",
    title: "Occhio al traffico ai jump point",
    body: "Nelle ore di punta i jump point possono avere code: se la missione ha una scadenza stretta, calcola un margine di tempo extra.",
  },
  {
    id: "timing",
    title: "Margine extra per missioni a tempo",
    body: "Per le consegne con timer, parti sempre con più tempo del minimo calcolato: un imprevisto (interdizione, decesso, traffico) è comune quanto basta da pianificarlo.",
  },
];

// ---------------------------------------------------------------------------
// CHANGELOG — segnaposto, in attesa di collegamento ai dati ufficiali
// ---------------------------------------------------------------------------
const CHANGELOG = [
  {
    id: "novita",
    title: "Novità (esempio)",
    body: "Sezione segnaposto: qui comparirà l'elenco reale delle novità della patch quando collegheremo la fonte dati ufficiale (Fase 3 — automazione).",
  },
  {
    id: "bilanciamento",
    title: "Bilanciamento (esempio)",
    body: "Sezione segnaposto per le modifiche di bilanciamento (navi, armi, economia) della patch corrente.",
  },
  {
    id: "bugfix",
    title: "Bug fix principali (esempio)",
    body: "Sezione segnaposto per i bug fix più rilevanti segnalati nelle patch notes ufficiali.",
  },
];

// ---------------------------------------------------------------------------
// USCITE NAVI — segnaposto, in attesa di collegamento ai dati ufficiali
// ---------------------------------------------------------------------------
const UPCOMING_SHIPS = [
  {
    id: "example-1",
    name: "Nave Concept (esempio)",
    manufacturer: "Da definire",
    status: "Segnaposto",
    note: "Questa scheda è un esempio di struttura: sarà sostituita da dati reali sulle prossime uscite quando colleghiamo la fonte ufficiale.",
  },
  {
    id: "example-2",
    name: "Nave In Vendita (esempio)",
    manufacturer: "Da definire",
    status: "Segnaposto",
    note: "Anche questa è una scheda di esempio, utile solo a mostrare come apparirà il layout finale.",
  },
];

// ---------------------------------------------------------------------------
// SUPABASE — connessione (URL e chiave pubblica: sicuri da avere qui,
// sono pensati per stare nel codice frontend. La chiave segreta service_role
// NON va MAI messa in questo file.)
// ---------------------------------------------------------------------------
const SUPABASE_URL = "https://rjmktgahgvvqvdtynmfb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ReTTWIXINY4SALUBse5tUQ_IuJX2Rnf";

async function supabaseSelect(table, query = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_ANON_KEY },
  });
  if (!res.ok) throw new Error(`Errore lettura ${table}`);
  return res.json();
}

async function supabaseAuthRequest(path, body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.msg || "Errore di connessione a Supabase");
  }
  return data;
}

// ---------------------------------------------------------------------------
// STILE — tema "Orbital OM 00"
// ---------------------------------------------------------------------------
const theme = {
  bg: "#071018",
  bgElevated: "#0A1620",
  card: "#0E1A22",
  cardBorder: "#1E3A4A",
  violet: "#0E7C9E",
  violetSoft: "#35C7F0",
  pink: "#FF4FA3",
  cyan: "#35C7F0",
  textPrimary: "#F4F1FF",
  textMuted: "#6E93A3",
};

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800&family=Share+Tech+Mono&family=Inter:wght@400;500;600&display=swap');

    .om-root { font-family: 'Inter', sans-serif; background: ${theme.bg}; color: ${theme.textPrimary}; }
    .om-display { font-family: 'Orbitron', sans-serif; letter-spacing: 0.02em; }
    .om-mono { font-family: 'Share Tech Mono', monospace; letter-spacing: 0.03em; }

    .om-scanlock {
      position: relative;
    }
    .om-scanlock::before, .om-scanlock::after {
      content: '';
      position: absolute;
      width: 14px;
      height: 14px;
      border: 2px solid ${theme.violetSoft};
      opacity: 0.55;
      transition: opacity 0.2s ease, border-color 0.2s ease;
      pointer-events: none;
    }
    .om-scanlock::before { top: -1px; left: -1px; border-right: none; border-bottom: none; }
    .om-scanlock::after { bottom: -1px; right: -1px; border-left: none; border-top: none; }
    .om-scanlock:hover::before, .om-scanlock:hover::after,
    .om-scanlock.active::before, .om-scanlock.active::after {
      opacity: 1;
      border-color: ${theme.pink};
    }

    .om-pill {
      border-radius: 999px;
    }

    .om-scroll::-webkit-scrollbar { display: none; }
    .om-scroll { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

// ---------------------------------------------------------------------------
// COMPONENTI UI
// ---------------------------------------------------------------------------
function TopBar({ title, subtitle }) {
  return (
    <div className="flex items-center gap-3 px-5 pt-6 pb-4">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${theme.violet}, ${theme.violetSoft})` }}
      >
        <Rocket size={20} color="#fff" />
      </div>
      <div>
        <h1 className="om-display text-lg font-bold leading-tight">{title}</h1>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{subtitle}</p>}
      </div>
    </div>
  );
}

function BottomNav({ active, setActive }) {
  const tabs = [
    { id: "home", label: "Home", Icon: Home },
    { id: "fleet", label: "Flotta", Icon: Rocket },
    { id: "cargo", label: "Cargo", Icon: Package },
    { id: "guides", label: "Guide", Icon: BookOpen },
    { id: "profile", label: "Profilo", Icon: User },
  ];
  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex justify-around items-center pt-2 pb-6"
      style={{ background: theme.bgElevated, borderTop: `1px solid ${theme.cardBorder}` }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => setActive(id)}
            className="flex flex-col items-center gap-1 px-4 py-1"
            style={{ color: isActive ? theme.pink : theme.textMuted }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <h2 className="om-display text-sm font-bold uppercase tracking-wide px-5 mb-3" style={{ color: theme.textPrimary }}>
      {children}
    </h2>
  );
}

function Card({ children, className = "", active = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`om-scanlock rounded-2xl p-4 ${active ? "active" : ""} ${className}`}
      style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, cursor: onClick ? "pointer" : "default" }}
    >
      {children}
    </div>
  );
}

function Pill({ children, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className="om-pill px-4 py-2 text-sm font-semibold flex-shrink-0"
      style={{
        background: selected ? theme.violet : "transparent",
        color: selected ? "#fff" : theme.textMuted,
        border: `1px solid ${selected ? theme.violet : theme.cardBorder}`,
      }}
    >
      {children}
    </button>
  );
}

function AdSlot({ label = "Spazio pubblicitario", size = "320×100" }) {
  return (
    <div className="px-5 mb-6">
      <div
        className="rounded-2xl flex flex-col items-center justify-center py-6"
        style={{ border: `1px dashed ${theme.cardBorder}` }}
      >
        <span className="text-[10px] om-mono uppercase tracking-wide" style={{ color: theme.textMuted }}>
          {label}
        </span>
        <span className="text-[10px] mt-1 om-mono" style={{ color: theme.textMuted, opacity: 0.6 }}>
          {size}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HOME
// ---------------------------------------------------------------------------
function HomeScreen({ setActive }) {
  return (
    <div className="pb-28">
      <TopBar title="Bentornato, Cittadino" subtitle="Patch attuale: Alpha 4.9 — Frontier Tensions" />

      <div className="px-5 mb-6">
        <Card className="om-scanlock" onClick={() => setActive("guides")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs mb-1" style={{ color: theme.cyan }}>PATCH NOTES</p>
              <p className="font-semibold text-sm">Frontier Tensions — cosa è cambiato</p>
              <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Riepilogo nella sezione Guide</p>
            </div>
            <ChevronRight size={20} style={{ color: theme.textMuted }} />
          </div>
        </Card>
      </div>

      <SectionLabel>Accesso rapido</SectionLabel>
      <div className="px-5 grid grid-cols-2 gap-3 mb-6">
        <Card onClick={() => setActive("fleet")}>
          <Rocket size={20} style={{ color: theme.cyan }} className="mb-2" />
          <p className="font-semibold text-sm">Statistiche navi</p>
          <p className="text-xs mt-1" style={{ color: theme.textMuted }}>{SHIPS.length} navi, filtri e confronto</p>
        </Card>
        <Card onClick={() => setActive("cargo")}>
          <Package size={20} style={{ color: theme.cyan }} className="mb-2" />
          <p className="font-semibold text-sm">Cargo</p>
          <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Pianificazione missioni trasporto</p>
        </Card>
        <Card onClick={() => setActive("guides")}>
          <BookOpen size={20} style={{ color: theme.cyan }} className="mb-2" />
          <p className="font-semibold text-sm">Guide</p>
          <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Mining, loot, CCU e upgrade</p>
        </Card>
        <Card onClick={() => setActive("fleet")}>
          <Sparkles size={20} style={{ color: theme.cyan }} className="mb-2" />
          <p className="font-semibold text-sm">Uscite navi</p>
          <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Dentro la sezione Flotta</p>
        </Card>
      </div>

      <AdSlot />
    </div>
  );
}

// ---------------------------------------------------------------------------
// FLOTTA (statistiche + confronto)
// ---------------------------------------------------------------------------
function FleetScreen() {
  const [view, setView] = useState("catalogo");
  const [role, setRole] = useState("Tutti");
  const [compareIds, setCompareIds] = useState([]);
  const [detailShip, setDetailShip] = useState(null);
  const [upcoming, setUpcoming] = useState(null); // null = ancora in caricamento

  useEffect(() => {
    supabaseSelect("upcoming_ships", "select=*&order=updated_at.desc&limit=40")
      .then((rows) => setUpcoming(rows.length > 0 ? rows : UPCOMING_SHIPS))
      .catch(() => setUpcoming(UPCOMING_SHIPS));
  }, []);

  const filtered = useMemo(
    () => (role === "Tutti" ? SHIPS : SHIPS.filter((s) => s.role === role)),
    [role]
  );

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const compareShips = SHIPS.filter((s) => compareIds.includes(s.id));

  if (detailShip) {
    const s = SHIPS.find((sh) => sh.id === detailShip);
    return (
      <div className="pb-28">
        <div className="px-5 pt-6 pb-2 flex items-center gap-3">
          <button onClick={() => setDetailShip(null)}>
            <ChevronLeft size={22} />
          </button>
          <h1 className="om-display text-lg font-bold">{s.name}</h1>
        </div>
        <div className="px-5 mt-4">
          <Card className="om-scanlock active mb-4">
            <p className="text-xs" style={{ color: theme.cyan }}>{s.manufacturer.toUpperCase()}</p>
            <p className="om-display text-2xl font-bold mt-1">{s.name}</p>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>{s.role} · {s.size}</p>
          </Card>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatBox icon={<Users size={16} />} label="Equipaggio" value={s.crew} />
            <StatBox icon={<Box size={16} />} label="Cargo" value={`${s.cargo} SCU`} />
            <StatBox icon={<Gauge size={16} />} label="Velocità SCM" value={`${s.speedSCM} m/s`} />
            <StatBox icon={<Zap size={16} />} label="Prezzo std." value={s.price} />
          </div>

          <Card>
            <p className="text-xs font-semibold mb-2" style={{ color: theme.cyan }}>NOTE</p>
            <p className="text-sm" style={{ color: theme.textMuted }}>{s.note}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <TopBar title="Flotta" subtitle={`${SHIPS.length} navi in catalogo`} />

      <div className="flex gap-2 px-5 mb-4">
        <Pill selected={view === "catalogo"} onClick={() => setView("catalogo")}>Catalogo</Pill>
        <Pill selected={view === "uscite"} onClick={() => setView("uscite")}>Prossime uscite</Pill>
      </div>

      {view === "uscite" ? (
        <div className="px-5 flex flex-col gap-3">
          {upcoming === UPCOMING_SHIPS && (
            <Card className="mb-1">
              <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>
                Contenuto segnaposto: la sincronizzazione automatica non ha ancora dati (o è ancora in corso il primo caricamento).
              </p>
            </Card>
          )}
          {(upcoming || []).map((s) => {
            const status = s.status || s.production_status || "Sconosciuto";
            const hasSpecs = s.scm_speed || s.cargo || s.min_crew || s.max_crew;
            const crewLabel =
              s.min_crew && s.max_crew && s.min_crew !== s.max_crew
                ? `${s.min_crew}-${s.max_crew}`
                : s.min_crew || s.max_crew || null;
            return (
              <Card key={s.id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-[11px]" style={{ color: theme.cyan }}>
                      {(s.manufacturer || "N/D").toUpperCase()} · {status}
                    </p>
                    <p className="font-semibold text-sm mt-0.5">{s.name}</p>
                    {s.note && <p className="text-xs mt-1" style={{ color: theme.textMuted }}>{s.note}</p>}
                    {hasSpecs && (
                      <p className="om-mono text-[11px] mt-1.5" style={{ color: theme.textMuted }}>
                        {s.size && `${s.size} · `}
                        {s.cargo ? `${s.cargo} SCU · ` : ""}
                        {crewLabel ? `${crewLabel} crew · ` : ""}
                        {s.scm_speed ? `${s.scm_speed} m/s` : ""}
                      </p>
                    )}
                  </div>
                  {s.store_url ? (
                    <a
                      href={s.store_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] flex-shrink-0 ml-2"
                      style={{ color: theme.cyan }}
                    >
                      Apri ↗
                    </a>
                  ) : (
                    <Sparkles size={18} style={{ color: theme.textMuted }} className="flex-shrink-0 ml-2" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
      <>
      <div className="flex gap-2 px-5 mb-4 overflow-x-auto om-scroll">
        {ROLES.map((r) => (
          <Pill key={r} selected={role === r} onClick={() => setRole(r)}>{r}</Pill>
        ))}
      </div>

      {compareIds.length > 0 && (
        <div className="px-5 mb-4">
          <Card className="om-scanlock active">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold flex items-center gap-1" style={{ color: theme.pink }}>
                <Scale size={14} /> CONFRONTO ({compareIds.length}/3)
              </p>
              <button onClick={() => setCompareIds([])}>
                <X size={16} style={{ color: theme.textMuted }} />
              </button>
            </div>
            <div className="overflow-x-auto om-scroll">
              <table className="w-full text-xs om-mono">
                <thead>
                  <tr style={{ color: theme.textMuted }}>
                    <td className="pr-3 pb-1"></td>
                    {compareShips.map((s) => (
                      <td key={s.id} className="px-2 pb-1 font-semibold" style={{ color: theme.textPrimary }}>{s.name}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Equipaggio", (s) => s.crew],
                    ["Cargo", (s) => `${s.cargo} SCU`],
                    ["Velocità", (s) => `${s.speedSCM} m/s`],
                    ["Prezzo", (s) => s.price],
                  ].map(([label, getter]) => (
                    <tr key={label} style={{ borderTop: `1px solid ${theme.cardBorder}` }}>
                      <td className="py-2 pr-3" style={{ color: theme.textMuted }}>{label}</td>
                      {compareShips.map((s) => (
                        <td key={s.id} className="px-2 py-2">{getter(s)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      <div className="px-5 flex flex-col gap-3">
        {filtered.map((s) => (
          <Card key={s.id} className={compareIds.includes(s.id) ? "active" : ""}>
            <div className="flex items-center justify-between">
              <div className="flex-1 cursor-pointer" onClick={() => setDetailShip(s.id)}>
                <p className="text-[11px]" style={{ color: theme.textMuted }}>{s.manufacturer} · {s.role}</p>
                <p className="font-semibold text-sm mt-0.5">{s.name}</p>
                <p className="om-mono text-[11px] mt-1" style={{ color: theme.cyan }}>{s.cargo} SCU · {s.crew} crew</p>
              </div>
              <button
                onClick={() => toggleCompare(s.id)}
                className="om-pill w-9 h-9 flex items-center justify-center flex-shrink-0"
                style={{
                  background: compareIds.includes(s.id) ? theme.violet : "transparent",
                  border: `1px solid ${compareIds.includes(s.id) ? theme.violet : theme.cardBorder}`,
                }}
              >
                <Scale size={15} color={compareIds.includes(s.id) ? "#fff" : theme.textMuted} />
              </button>
            </div>
          </Card>
        ))}
      </div>
      </>
      )}
    </div>
  );
}

function StatBox({ icon, label, value }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
      <div className="flex items-center gap-1.5 mb-1" style={{ color: theme.textMuted }}>
        {icon}
        <span className="text-[11px]">{label}</span>
      </div>
      <p className="om-mono text-base font-semibold">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CARGO — pianificazione missioni
// ---------------------------------------------------------------------------
function CargoScreen() {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="pb-28">
      <TopBar title="Cargo" subtitle="Pianificazione missioni di trasporto" />

      <SectionLabel>Prima di partire</SectionLabel>
      <div className="px-5 flex flex-col gap-3">
        {CARGO_TIPS.map((tip) => (
          <Card key={tip.id} onClick={() => setOpenId(openId === tip.id ? null : tip.id)}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">{tip.title}</p>
              <ChevronRight
                size={18}
                style={{ color: theme.textMuted, transform: openId === tip.id ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}
              />
            </div>
            {openId === tip.id && (
              <p className="text-xs mt-3 leading-relaxed" style={{ color: theme.textMuted }}>{tip.body}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GUIDE
// ---------------------------------------------------------------------------
function GuidesScreen() {
  const [openId, setOpenId] = useState(null);
  const [openUpgrade, setOpenUpgrade] = useState(null);
  const [openLoot, setOpenLoot] = useState(null);
  const [openChangelog, setOpenChangelog] = useState(null);
  const [changelog, setChangelog] = useState(null); // null = ancora in caricamento

  useEffect(() => {
    supabaseSelect("changelog_entries", "select=*&order=published_at.desc&limit=10")
      .then((rows) => setChangelog(rows.length > 0 ? rows : CHANGELOG))
      .catch(() => setChangelog(CHANGELOG)); // ripiego sul placeholder se qualcosa va storto
  }, []);

  return (
    <div className="pb-28">
      <TopBar title="Guide" subtitle="Mining, loot, missioni, CCU e upgrade" />

      <SectionLabel>Dove trovare loot</SectionLabel>
      <div className="px-5 flex flex-col gap-3 mb-6">
        {LOOT_LOCATIONS.map((l) => (
          <Card key={l.id} onClick={() => setOpenLoot(openLoot === l.id ? null : l.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={15} style={{ color: theme.cyan }} />
                <p className="font-semibold text-sm">{l.title}</p>
              </div>
              <ChevronRight
                size={18}
                style={{ color: theme.textMuted, transform: openLoot === l.id ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}
              />
            </div>
            {openLoot === l.id && (
              <p className="text-xs mt-3 leading-relaxed" style={{ color: theme.textMuted }}>{l.body}</p>
            )}
          </Card>
        ))}
      </div>

      <SectionLabel>Guide di gioco</SectionLabel>
      <div className="px-5 flex flex-col gap-3 mb-6">
        {GUIDES.map((g) => (
          <Card key={g.id} onClick={() => setOpenId(openId === g.id ? null : g.id)}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">{g.title}</p>
              <ChevronRight
                size={18}
                style={{ color: theme.textMuted, transform: openId === g.id ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}
              />
            </div>
            {openId === g.id && (
              <p className="text-xs mt-3 leading-relaxed" style={{ color: theme.textMuted }}>{g.body}</p>
            )}
          </Card>
        ))}
      </div>

      <AdSlot />

      <SectionLabel>Acquisti, CCU e upgrade</SectionLabel>
      <div className="px-5 flex flex-col gap-3 mb-6">
        {[
          { id: "ccu", title: "Strategia CCU", body: UPGRADE_GUIDE.ccu },
          { id: "warbond", title: "Warbond vs Standard", body: UPGRADE_GUIDE.warbond },
          { id: "melt", title: "Come funziona il melt", body: UPGRADE_GUIDE.melt },
          { id: "paths", title: "Percorso di upgrade consigliato", body: UPGRADE_GUIDE.paths },
        ].map((item) => (
          <Card key={item.id} onClick={() => setOpenUpgrade(openUpgrade === item.id ? null : item.id)}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">{item.title}</p>
              <ChevronRight
                size={18}
                style={{ color: theme.textMuted, transform: openUpgrade === item.id ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}
              />
            </div>
            {openUpgrade === item.id && (
              <p className="text-xs mt-3 leading-relaxed" style={{ color: theme.textMuted }}>{item.body}</p>
            )}
          </Card>
        ))}
      </div>

      <SectionLabel>Changelog patch</SectionLabel>
      <div className="px-5 flex flex-col gap-3">
        {changelog === CHANGELOG && (
          <Card className="mb-1">
            <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>
              Contenuto segnaposto: la sincronizzazione automatica non ha ancora dati (o è ancora in corso il primo caricamento).
            </p>
          </Card>
        )}
        {(changelog || []).map((c) => {
          const isReal = Boolean(c.url);
          return (
            <Card
              key={c.id}
              onClick={() => !isReal && setOpenChangelog(openChangelog === c.id ? null : c.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={15} style={{ color: theme.cyan }} />
                  <div>
                    <p className="font-semibold text-sm">{c.title}</p>
                    {isReal && (
                      <p className="text-[11px] mt-0.5 om-mono" style={{ color: theme.textMuted }}>
                        {c.build ? `${c.build} · ` : ""}{c.published_at || ""}
                      </p>
                    )}
                  </div>
                </div>
                {isReal ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] flex-shrink-0"
                    style={{ color: theme.cyan }}
                  >
                    Apri ↗
                  </a>
                ) : (
                  <ChevronRight
                    size={18}
                    style={{ color: theme.textMuted, transform: openChangelog === c.id ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}
                  />
                )}
              </div>
              {!isReal && openChangelog === c.id && (
                <p className="text-xs mt-3 leading-relaxed" style={{ color: theme.textMuted }}>{c.body}</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PROFILO (placeholder — account arriveranno in Fase 3)
// ---------------------------------------------------------------------------
function ProfileScreen() {
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    if (!email || !password) {
      setError("Inserisci email e password.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        await supabaseAuthRequest("/signup", { email, password });
        setMessage("Registrazione avvenuta! Controlla la tua email per confermare l'account prima di accedere.");
        setMode("login");
      } else {
        const data = await supabaseAuthRequest("/token?grant_type=password", { email, password });
        setSession(data);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
    setEmail("");
    setPassword("");
    setMessage("");
  };

  if (session) {
    return (
      <div className="pb-28">
        <TopBar title="Profilo" subtitle="Account e contributi community" />
        <div className="px-5">
          <Card className="om-scanlock active mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${theme.violet}, ${theme.violetSoft})` }}
              >
                <User size={20} color="#fff" />
              </div>
              <div>
                <p className="font-semibold text-sm">{session.user?.email}</p>
                <p className="text-[11px]" style={{ color: theme.textMuted }}>Cittadino registrato</p>
              </div>
            </div>
          </Card>

          <Card className="mb-4">
            <p className="text-xs font-semibold mb-1" style={{ color: theme.cyan }}>I TUOI CONTRIBUTI</p>
            <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>
              La possibilità di proporre e modificare informazioni (loot, guide, dati navi) arriverà nella Fase 4, quando costruiremo il sistema di contributi tipo wiki.
            </p>
          </Card>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold"
            style={{ border: `1px solid ${theme.cardBorder}`, color: theme.textMuted }}
          >
            <LogOut size={16} /> Esci
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <TopBar title="Profilo" subtitle="Accedi o registrati" />
      <div className="px-5">
        <div className="flex gap-2 mb-5">
          <Pill selected={mode === "login"} onClick={() => { setMode("login"); setError(""); setMessage(""); }}>Accedi</Pill>
          <Pill selected={mode === "signup"} onClick={() => { setMode("signup"); setError(""); setMessage(""); }}>Registrati</Pill>
        </div>

        <Card className="mb-4">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] flex items-center gap-1.5 mb-1.5" style={{ color: theme.textMuted }}>
                <Mail size={13} /> EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cittadino@esempio.com"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ background: theme.bgElevated, border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary }}
              />
            </div>
            <div>
              <label className="text-[11px] flex items-center gap-1.5 mb-1.5" style={{ color: theme.textMuted }}>
                <Lock size={13} /> PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ background: theme.bgElevated, border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary }}
              />
            </div>

            {error && <p className="text-xs" style={{ color: theme.pink }}>{error}</p>}
            {message && <p className="text-xs" style={{ color: theme.cyan }}>{message}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold mt-1"
              style={{ background: theme.violet, color: "#fff", opacity: loading ? 0.7 : 1 }}
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {mode === "login" ? "Accedi" : "Crea account"}
            </button>
          </div>
        </Card>

        <p className="text-[11px] text-center leading-relaxed" style={{ color: theme.textMuted }}>
          Dopo la registrazione, Supabase invia un'email di conferma: dovrai cliccare il link prima di poter accedere.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// APP
// ---------------------------------------------------------------------------
export default function OrbitalOM00() {
  const [active, setActive] = useState("home");

  return (
    <div className="om-root min-h-screen w-full max-w-md mx-auto relative" style={{ background: theme.bg }}>
      <GlobalStyle />
      {active === "home" && <HomeScreen setActive={setActive} />}
      {active === "fleet" && <FleetScreen />}
      {active === "cargo" && <CargoScreen />}
      {active === "guides" && <GuidesScreen />}
      {active === "profile" && <ProfileScreen />}
      <BottomNav active={active} setActive={setActive} />
    </div>
  );
}
