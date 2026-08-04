import { useState, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabaseClient";
import {
  Plane, TrainFront, Bus, Ship, Car, Bike, MapPin, Receipt,
  FileText, Compass, Plus, ArrowLeft, Copy, Check, X, LogIn, Luggage,
  Fuel, BedDouble, Link2, Trash2, Mail, Upload, LogOut
} from "lucide-react";

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

const COLORS = {
  ink: "#16262A",
  inkLight: "#3E5C55",
  paper: "#EFE6CE",
  paperDim: "#E3D8B8",
  ocean: "#2E6E8E",
  oceanDeep: "#204E68",
  mustard: "#D6A537",
  rust: "#B24A2E",
  moss: "#6F8A5E",
};

const TRANSPORT_OPTIONS = [
  { id: "avion", label: "Avión", icon: Plane, category: "ticket", noun: "tarjeta de embarque" },
  { id: "tren", label: "Tren", icon: TrainFront, category: "ticket", noun: "billete" },
  { id: "autobus", label: "Autobús", icon: Bus, category: "ticket", noun: "billete" },
  { id: "barco", label: "Barco", icon: Ship, category: "ticket", noun: "billete" },
  { id: "coche", label: "Coche compartido", icon: Car, category: "fuel", noun: "ticket de gasolina" },
  { id: "moto", label: "Moto", icon: Car, category: "fuel", noun: "ticket de gasolina" },
  { id: "bici", label: "Bicicleta", icon: Bike, category: "none", noun: "" },
  { id: "individual", label: "Cada uno por su cuenta", icon: MapPin, category: "none", noun: "" },
];

const AVATAR_PALETTE = [COLORS.ocean, COLORS.rust, COLORS.moss, COLORS.mustard, COLORS.oceanDeep, "#8A5A83"];
const colorForMember = (name, members) => AVATAR_PALETTE[Math.max(members.indexOf(name), 0) % AVATAR_PALETTE.length];
const initials = (name) => (name || "?").trim().slice(0, 2).toUpperCase();
const genCode = () => Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
const fmtMoney = (n) => `${Number(n).toFixed(2).replace(".", ",")} €`;

function computeBalances(members, expenses) {
  const balances = {};
  members.forEach((m) => (balances[m] = 0));
  expenses.forEach((e) => {
    balances[e.payer] = (balances[e.payer] || 0) + Number(e.amount);
    const share = Number(e.amount) / e.split.length;
    e.split.forEach((m) => (balances[m] = (balances[m] || 0) - share));
  });
  return balances;
}

function computeSettlements(balances) {
  const creditors = Object.entries(balances).filter(([, v]) => v > 0.005).map(([n, v]) => ({ n, v }));
  const debtors = Object.entries(balances).filter(([, v]) => v < -0.005).map(([n, v]) => ({ n, v: -v }));
  const moves = [];
  let ci = 0, di = 0;
  creditors.sort((a, b) => b.v - a.v);
  debtors.sort((a, b) => b.v - a.v);
  while (ci < creditors.length && di < debtors.length) {
    const amt = Math.min(creditors[ci].v, debtors[di].v);
    moves.push({ from: debtors[di].n, to: creditors[ci].n, amount: amt });
    creditors[ci].v -= amt;
    debtors[di].v -= amt;
    if (creditors[ci].v < 0.01) ci++;
    if (debtors[di].v < 0.01) di++;
  }
  return moves;
}

// ---------------------------------------------------------------------------
// UI building blocks
// ---------------------------------------------------------------------------
function Avatar({ name, members, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: colorForMember(name, members),
      color: COLORS.paper, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
      border: `2px solid ${COLORS.paper}`,
    }}>
      {initials(name)}
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      background: COLORS.ink, color: COLORS.paper, padding: "10px 18px", borderRadius: 999,
      fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
      zIndex: 999, display: "flex", alignItems: "center", gap: 8,
    }}>
      <Check size={15} /> {message}
    </div>
  );
}

function TicketDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "22px 0", opacity: 0.6 }}>
      <div style={{ flex: 1, borderTop: `1.5px dashed ${COLORS.inkLight}` }} />
      <Plane size={14} color={COLORS.inkLight} style={{ transform: "rotate(90deg)" }} />
      <div style={{ flex: 1, borderTop: `1.5px dashed ${COLORS.inkLight}` }} />
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", style, type = "button", disabled }) {
  const base = {
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14.5,
    padding: "10px 18px", borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer",
    border: "none", display: "inline-flex", alignItems: "center", gap: 8,
    opacity: disabled ? 0.5 : 1, transition: "transform 0.15s ease",
  };
  const variants = {
    primary: { background: COLORS.ocean, color: COLORS.paper },
    ghost: { background: "transparent", color: COLORS.ink, border: `1.5px solid ${COLORS.ink}` },
    danger: { background: "transparent", color: COLORS.rust, border: `1.5px solid ${COLORS.rust}` },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = "translateY(-1px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, fontWeight: 600, letterSpacing: 0.4, color: COLORS.inkLight, textTransform: "uppercase" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle = {
  fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, padding: "10px 12px",
  borderRadius: 8, border: `1.5px solid ${COLORS.inkLight}55`, background: COLORS.paper, color: COLORS.ink,
  outline: "none", width: "100%",
};

// ---------------------------------------------------------------------------
// Auth screens
// ---------------------------------------------------------------------------
function LoginScreen({ onSent }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setSending(false);
    if (error) setError(error.message);
    else onSent(email.trim());
  };

  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <form onSubmit={submit} style={{ maxWidth: 380, width: "100%", background: COLORS.paper, borderRadius: 20, padding: "36px 30px", boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <Luggage size={26} color={COLORS.rust} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, letterSpacing: 2, color: COLORS.inkLight, textTransform: "uppercase" }}>Juntos</span>
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, margin: "6px 0 22px", color: COLORS.ink, fontWeight: 600 }}>
          Organiza el viaje, entre todos.
        </h1>
        <Field label="Correo electrónico">
          <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" required />
        </Field>
        {error && <p style={{ color: COLORS.rust, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif" }}>{error}</p>}
        <Btn type="submit" disabled={sending} style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
          <Mail size={16} /> {sending ? "Enviando..." : "Enviarme un enlace de acceso"}
        </Btn>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11.5, color: COLORS.inkLight, marginTop: 14, lineHeight: 1.5 }}>
          Sin contraseña: te enviamos un enlace mágico a tu correo para entrar.
        </p>
      </form>
    </div>
  );
}

function CheckEmailScreen({ email }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ maxWidth: 380, background: COLORS.paper, borderRadius: 20, padding: "36px 30px" }}>
        <Mail size={30} color={COLORS.ocean} />
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, margin: "14px 0 8px", color: COLORS.ink }}>Revisa tu correo</h2>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: COLORS.inkLight }}>
          Te hemos enviado un enlace de acceso a <strong>{email}</strong>. Ábrelo desde este mismo dispositivo para entrar.
        </p>
      </div>
    </div>
  );
}

function NameScreen({ onSet }) {
  const [name, setName] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await supabase.auth.updateUser({ data: { display_name: name.trim() } });
    onSet(name.trim());
  };
  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <form onSubmit={submit} style={{ maxWidth: 380, width: "100%", background: COLORS.paper, borderRadius: 20, padding: "36px 30px" }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, margin: "0 0 18px", color: COLORS.ink }}>¿Cómo te llamas?</h2>
        <Field label="Tu nombre">
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Xavi" required autoFocus />
        </Field>
        <Btn type="submit" style={{ width: "100%", justifyContent: "center" }}>Continuar</Btn>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
function TripTag({ trip, onOpen }) {
  const opt = TRANSPORT_OPTIONS.find((t) => t.id === trip.transport_id) || TRANSPORT_OPTIONS[0];
  const Icon = opt.icon;
  return (
    <button onClick={onOpen} style={{
      textAlign: "left", background: COLORS.paper, border: "none", borderRadius: 14, padding: "20px 20px 18px",
      cursor: "pointer", position: "relative", boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
      transition: "transform 0.18s ease", fontFamily: "inherit",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(-0.6deg) translateY(-3px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "rotate(0deg) translateY(0)")}>
      <div style={{ position: "absolute", top: 14, right: 14, width: 14, height: 14, borderRadius: "50%", background: COLORS.ink, opacity: 0.15 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.rust, marginBottom: 10 }}>
        <Icon size={16} />
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, letterSpacing: 1, textTransform: "uppercase" }}>{trip.code}</span>
      </div>
      <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 21, margin: "0 0 4px", color: COLORS.ink }}>{trip.name}</h3>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: COLORS.inkLight, margin: 0 }}>{trip.destination} · {trip.days} días</p>
    </button>
  );
}

function Dashboard({ displayName, trips, onOpenTrip, onCreateTrip, onJoinTrip, onSignOut }) {
  const [mode, setMode] = useState(null);
  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 30, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.mustard, marginBottom: 6 }}>
            <Luggage size={20} /><span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>Juntos</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, color: COLORS.paper, margin: 0 }}>Hola, {displayName.split(" ")[0]}</h1>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Btn variant="ghost" style={{ color: COLORS.paper, borderColor: COLORS.paper }} onClick={() => setMode("join")}><LogIn size={16} /> Unirme</Btn>
          <Btn onClick={() => setMode("create")}><Plus size={16} /> Nuevo viaje</Btn>
          <Btn variant="ghost" style={{ color: COLORS.paper, borderColor: COLORS.paper }} onClick={onSignOut}><LogOut size={16} /></Btn>
        </div>
      </div>

      {trips.length === 0 && (
        <div style={{ border: `1.5px dashed ${COLORS.paper}66`, borderRadius: 16, padding: 40, textAlign: "center" }}>
          <Compass size={28} color={COLORS.paper} style={{ opacity: 0.7 }} />
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.paper, opacity: 0.75, marginTop: 12 }}>
            Aún no tienes ningún viaje. Crea uno o únete con un código.
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 22 }}>
        {trips.map((t) => <TripTag key={t.code} trip={t} onOpen={() => onOpenTrip(t.code)} />)}
      </div>

      {mode === "create" && <CreateTripModal onClose={() => setMode(null)} onCreate={onCreateTrip} />}
      {mode === "join" && <JoinTripModal onClose={() => setMode(null)} onJoin={onJoinTrip} />}
    </div>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,18,20,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 200 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: COLORS.paper, borderRadius: 18, padding: "28px 26px", maxWidth: 440, width: "100%", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: COLORS.ink, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.inkLight }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CreateTripModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", destination: "", days: 5, transportId: "avion", numPeople: 2 });
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onCreate(form);
    setSaving(false);
  };
  return (
    <ModalShell title="Nuevo viaje" onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Nombre del viaje">
          <input style={inputStyle} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Escapada a Lisboa" />
        </Field>
        <Field label="Destino">
          <input style={inputStyle} required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Lisboa, Portugal" />
        </Field>
        <Field label="Número de días">
          <input style={inputStyle} type="number" min={1} required value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} />
        </Field>
        <Field label="Medio de transporte">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {TRANSPORT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = form.transportId === opt.id;
              return (
                <button type="button" key={opt.id} onClick={() => setForm({ ...form, transportId: opt.id })}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                    border: `1.5px solid ${active ? COLORS.ocean : COLORS.inkLight + "55"}`,
                    background: active ? COLORS.ocean : "transparent", color: active ? COLORS.paper : COLORS.ink,
                    fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5,
                  }}>
                  <Icon size={15} /> {opt.label}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Número de personas (incluido tú)">
          <input style={inputStyle} type="number" min={1} required value={form.numPeople} onChange={(e) => setForm({ ...form, numPeople: Number(e.target.value) })} />
        </Field>
        <Btn type="submit" disabled={saving} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
          {saving ? "Creando..." : "Crear panel de viaje"}
        </Btn>
      </form>
    </ModalShell>
  );
}

function JoinTripModal({ onClose, onJoin }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const ok = await onJoin(code.trim().toUpperCase());
    setSaving(false);
    if (!ok) setError("No encuentro ningún viaje con ese código.");
  };
  return (
    <ModalShell title="Unirme a un viaje" onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Código del viaje">
          <input style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2, textTransform: "uppercase" }} required value={code} onChange={(e) => setCode(e.target.value)} placeholder="AB12CD" maxLength={6} />
        </Field>
        {error && <p style={{ color: COLORS.rust, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif" }}>{error}</p>}
        <Btn type="submit" disabled={saving} style={{ width: "100%", justifyContent: "center" }}>{saving ? "Uniendo..." : "Unirme"}</Btn>
      </form>
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Trip detail
// ---------------------------------------------------------------------------
const TABS = [
  { id: "resumen", label: "Resumen", icon: Compass },
  { id: "transporte", label: "Transporte", icon: Plane },
  { id: "alojamiento", label: "Alojamiento", icon: BedDouble },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "costes", label: "Costes", icon: Receipt },
];

function TripDetail({ tripId, displayName, onBack, onToast }) {
  const [tab, setTab] = useState("resumen");
  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [transportEntries, setTransportEntries] = useState([]);
  const [fuelEntries, setFuelEntries] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const load = useCallback(async () => {
    const [{ data: tripRow }, { data: memberRows }, { data: te }, { data: fe }, { data: ac }, { data: doc }, { data: ex }] = await Promise.all([
      supabase.from("trips").select("*").eq("id", tripId).single(),
      supabase.from("trip_members").select("display_name, joined_at").eq("trip_id", tripId).order("joined_at"),
      supabase.from("transport_entries").select("*").eq("trip_id", tripId).order("created_at"),
      supabase.from("fuel_entries").select("*").eq("trip_id", tripId).order("created_at"),
      supabase.from("accommodations").select("*").eq("trip_id", tripId).order("created_at"),
      supabase.from("documents").select("*").eq("trip_id", tripId).order("created_at"),
      supabase.from("expenses").select("*").eq("trip_id", tripId).order("created_at"),
    ]);
    setTrip(tripRow || null);
    setMembers((memberRows || []).map((m) => m.display_name));
    setTransportEntries(te || []);
    setFuelEntries(fe || []);
    setAccommodations(ac || []);
    setDocuments(doc || []);
    setExpenses((ex || []).map((e) => ({ ...e, split: e.split || [] })));
  }, [tripId]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`trip-${tripId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "trip_members", filter: `trip_id=eq.${tripId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "transport_entries", filter: `trip_id=eq.${tripId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "fuel_entries", filter: `trip_id=eq.${tripId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "accommodations", filter: `trip_id=eq.${tripId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "documents", filter: `trip_id=eq.${tripId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "expenses", filter: `trip_id=eq.${tripId}` }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [tripId, load]);

  if (!trip) return <div style={{ padding: 40, textAlign: "center", color: COLORS.paper, fontFamily: "'Space Grotesk', sans-serif" }}>Cargando viaje...</div>;

  const opt = TRANSPORT_OPTIONS.find((t) => t.id === trip.transport_id) || TRANSPORT_OPTIONS[0];

  const copyCode = () => {
    navigator.clipboard?.writeText(trip.code);
    onToast(`Código ${trip.code} copiado — compártelo con el grupo`);
  };

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "30px 24px 90px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: COLORS.paper, opacity: 0.8, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, marginBottom: 18 }}>
        <ArrowLeft size={15} /> Todos los viajes
      </button>

      <div style={{ background: COLORS.paper, borderRadius: 18, padding: "26px 26px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.rust, marginBottom: 6 }}>
              <opt.icon size={16} /><span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, textTransform: "uppercase", letterSpacing: 0.6 }}>{opt.label}</span>
            </div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, margin: "0 0 4px", color: COLORS.ink }}>{trip.name}</h1>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.inkLight, margin: 0 }}>{trip.destination} · {trip.days} días</p>
          </div>
          <button onClick={copyCode} style={{ display: "flex", alignItems: "center", gap: 8, background: COLORS.ink, color: COLORS.paper, border: "none", borderRadius: 10, padding: "10px 14px", cursor: "pointer", height: "fit-content", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
            {trip.code} <Copy size={14} />
          </button>
        </div>
        <div style={{ display: "flex", marginTop: 16 }}>
          {members.map((m, i) => (
            <div key={m} style={{ marginLeft: i === 0 ? 0 : -8 }} title={m}><Avatar name={m} members={members} /></div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "9px 15px", borderRadius: 999, whiteSpace: "nowrap",
              border: `1.5px solid ${active ? COLORS.mustard : COLORS.paper + "55"}`,
              background: active ? COLORS.mustard : "transparent", color: active ? COLORS.ink : COLORS.paper,
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
            }}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ background: COLORS.paper, borderRadius: 18, padding: 26 }}>
        {tab === "resumen" && <ResumenTab trip={trip} opt={opt} members={members} />}
        {tab === "transporte" && (
          <TransporteTab tripId={tripId} opt={opt} displayName={displayName}
            transportEntries={transportEntries} fuelEntries={fuelEntries} members={members} onReload={load} />
        )}
        {tab === "alojamiento" && <AlojamientoTab tripId={tripId} accommodations={accommodations} onReload={load} />}
        {tab === "documentos" && <DocumentosTab tripId={tripId} displayName={displayName} documents={documents} onReload={load} />}
        {tab === "costes" && (
          <CostesTab tripId={tripId} displayName={displayName} members={members} expenses={expenses} onReload={load} />
        )}
      </div>
    </div>
  );
}

function ResumenTab({ trip, opt, members }) {
  return (
    <div>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.ink, lineHeight: 1.7 }}>
        {members.length} persona{members.length !== 1 ? "s" : ""} organizando <strong>{trip.name}</strong> a {trip.destination}, {trip.days} días en {opt.label.toLowerCase()}.
      </p>
      <TicketDivider />
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: COLORS.inkLight }}>
        Usa las pestañas de arriba para organizar el transporte, el alojamiento, los documentos del viaje y repartir los gastos entre el grupo.
      </p>
    </div>
  );
}

function EmptyState({ text }) {
  return <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: COLORS.inkLight, fontStyle: "italic" }}>{text}</p>;
}

function TransporteTab({ tripId, opt, displayName, transportEntries, fuelEntries, members, onReload }) {
  const [info, setInfo] = useState("");
  const [fuel, setFuel] = useState({ place: "", amount: "" });

  if (opt.category === "none") {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <opt.icon size={26} color={COLORS.moss} />
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.ink, marginTop: 10 }}>
          Con "{opt.label.toLowerCase()}" ya vais organizados por vuestra cuenta — no hace falta nada aquí.
        </p>
      </div>
    );
  }

  if (opt.category === "ticket") {
    const addEntry = async () => {
      if (!info.trim()) return;
      await supabase.from("transport_entries").insert({ trip_id: tripId, member: displayName, info: info.trim() });
      setInfo("");
      onReload();
    };
    return (
      <div>
        <Field label={`Añadir tu ${opt.noun}`}>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...inputStyle, flex: 1 }} value={info} onChange={(e) => setInfo(e.target.value)} placeholder="Ej: Vuelo IB1234, enlace o nº de reserva" />
            <Btn onClick={addEntry}><Plus size={15} /></Btn>
          </div>
        </Field>
        <TicketDivider />
        {transportEntries.length === 0 && <EmptyState text={`Nadie ha añadido su ${opt.noun} todavía.`} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {transportEntries.map((e) => (
            <div key={e.id} style={{ display: "flex", gap: 10, alignItems: "center", background: COLORS.paperDim, borderRadius: 10, padding: "10px 12px" }}>
              <Avatar name={e.member} members={members} size={26} />
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, fontWeight: 600, color: COLORS.ink }}>{e.member}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: COLORS.inkLight }}>{e.info}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const total = fuelEntries.reduce((s, e) => s + Number(e.amount), 0);
  const addFuel = async () => {
    if (!fuel.place.trim() || !fuel.amount) return;
    await supabase.from("fuel_entries").insert({ trip_id: tripId, member: displayName, place: fuel.place.trim(), amount: Number(fuel.amount) });
    setFuel({ place: "", amount: "" });
    onReload();
  };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <Fuel size={20} color={COLORS.rust} />
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: COLORS.inkLight, textTransform: "uppercase", letterSpacing: 0.5 }}>Gasto total en gasolina</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: COLORS.ink }}>{fmtMoney(total)}</div>
        </div>
      </div>
      <Field label="Añadir repostaje">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input style={{ ...inputStyle, flex: 2, minWidth: 140 }} value={fuel.place} onChange={(e) => setFuel({ ...fuel, place: e.target.value })} placeholder="Gasolinera / lugar" />
          <input style={{ ...inputStyle, flex: 1, minWidth: 90 }} type="number" step="0.01" value={fuel.amount} onChange={(e) => setFuel({ ...fuel, amount: e.target.value })} placeholder="€" />
          <Btn onClick={addFuel}><Plus size={15} /></Btn>
        </div>
      </Field>
      <TicketDivider />
      {fuelEntries.length === 0 && <EmptyState text="Ningún repostaje registrado todavía." />}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {fuelEntries.map((e) => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.paperDim, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Avatar name={e.member} members={members} size={26} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: COLORS.ink }}>{e.place}</span>
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13.5, color: COLORS.rust }}>{fmtMoney(e.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlojamientoTab({ tripId, accommodations, onReload }) {
  const [form, setForm] = useState({ place: "", dates: "", roommates: "", notes: "" });
  const add = async () => {
    if (!form.place.trim()) return;
    await supabase.from("accommodations").insert({ trip_id: tripId, ...form });
    setForm({ place: "", dates: "", roommates: "", notes: "" });
    onReload();
  };
  return (
    <div>
      <Field label="Alojamiento">
        <input style={inputStyle} value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="Nombre del hotel / apartamento" />
      </Field>
      <Field label="Fechas">
        <input style={inputStyle} value={form.dates} onChange={(e) => setForm({ ...form, dates: e.target.value })} placeholder="Ej: 12–15 de septiembre" />
      </Field>
      <Field label="Reparto de habitaciones (quién va con quién)">
        <input style={inputStyle} value={form.roommates} onChange={(e) => setForm({ ...form, roommates: e.target.value })} placeholder="Ej: Xavi y Marta / Laia y Pol" />
      </Field>
      <Field label="Voucher / enlace de reserva">
        <input style={inputStyle} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Enlace o nº de reserva" />
      </Field>
      <Btn onClick={add}><Plus size={15} /> Añadir alojamiento</Btn>
      <TicketDivider />
      {accommodations.length === 0 && <EmptyState text="Ningún alojamiento añadido todavía." />}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {accommodations.map((a) => (
          <div key={a.id} style={{ background: COLORS.paperDim, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <BedDouble size={15} color={COLORS.ocean} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color: COLORS.ink }}>{a.place}</span>
              {a.dates && <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: COLORS.inkLight }}>· {a.dates}</span>}
            </div>
            {a.roommates && <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: COLORS.inkLight, margin: "2px 0" }}>Habitaciones: {a.roommates}</p>}
            {a.notes && <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: COLORS.inkLight, margin: "2px 0" }}>{a.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentosTab({ tripId, displayName, documents, onReload }) {
  const [form, setForm] = useState({ title: "", url: "" });
  const [uploading, setUploading] = useState(false);

  const addLink = async () => {
    if (!form.title.trim()) return;
    await supabase.from("documents").insert({ trip_id: tripId, title: form.title.trim(), url: form.url.trim() || null, added_by: displayName });
    setForm({ title: "", url: "" });
    onReload();
  };

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    const path = `${tripId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("documents").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("documents").getPublicUrl(path);
      await supabase.from("documents").insert({ trip_id: tripId, title: file.name, url: data.publicUrl, storage_path: path, added_by: displayName });
      onReload();
    }
    setUploading(false);
  };

  const remove = async (id) => {
    await supabase.from("documents").delete().eq("id", id);
    onReload();
  };

  return (
    <div>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: COLORS.inkLight, marginBottom: 14 }}>
        Carpeta común del viaje: subid aquí tarjetas de embarque, bouchers, seguros o cualquier documento importante, para tenerlo todo centralizado.
      </p>

      <label style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: `1.5px dashed ${COLORS.inkLight}77`,
        borderRadius: 10, padding: "16px", cursor: "pointer", marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: COLORS.ink,
      }}>
        <Upload size={16} /> {uploading ? "Subiendo..." : "Subir un archivo (foto, PDF...)"}
        <input type="file" style={{ display: "none" }} onChange={(e) => uploadFile(e.target.files?.[0])} disabled={uploading} />
      </label>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        <input style={{ ...inputStyle, flex: 1, minWidth: 140 }} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="O añade un enlace: título" />
        <input style={{ ...inputStyle, flex: 1, minWidth: 140 }} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Enlace" />
        <Btn onClick={addLink}><Plus size={15} /></Btn>
      </div>

      {documents.length === 0 && <EmptyState text="Ningún documento añadido todavía." />}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {documents.map((d) => (
          <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.paperDim, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", overflow: "hidden" }}>
              <Link2 size={15} color={COLORS.ocean} style={{ flexShrink: 0 }} />
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: COLORS.ink, fontWeight: 600 }}>{d.title}</div>
                {d.url && <a href={d.url} target="_blank" rel="noreferrer" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: COLORS.ocean, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", display: "block" }}>{d.url}</a>}
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: COLORS.inkLight }}>Añadido por {d.added_by}</div>
              </div>
            </div>
            <button onClick={() => remove(d.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.rust, flexShrink: 0 }}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostesTab({ tripId, displayName, members, expenses, onReload }) {
  const [form, setForm] = useState({ concept: "", amount: "", payer: displayName, split: members });
  const balances = computeBalances(members, expenses);
  const settlements = computeSettlements(balances);

  const toggleSplit = (m) => {
    setForm((f) => ({ ...f, split: f.split.includes(m) ? f.split.filter((x) => x !== m) : [...f.split, m] }));
  };

  const addExpense = async () => {
    if (!form.concept.trim() || !form.amount || form.split.length === 0) return;
    await supabase.from("expenses").insert({
      trip_id: tripId, concept: form.concept.trim(), amount: Number(form.amount), payer: form.payer, split: form.split,
    });
    setForm({ concept: "", amount: "", payer: displayName, split: members });
    onReload();
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 10, marginBottom: 22 }}>
        {members.map((m) => {
          const bal = balances[m] || 0;
          const positive = bal >= 0;
          return (
            <div key={m} style={{ background: COLORS.paperDim, borderRadius: 10, padding: "12px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Avatar name={m} members={members} size={24} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: COLORS.ink, fontWeight: 600 }}>{m}</span>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: positive ? COLORS.moss : COLORS.rust }}>
                {positive ? "+" : ""}{fmtMoney(bal)}
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10.5, color: COLORS.inkLight, textTransform: "uppercase" }}>{positive ? "le deben" : "debe"}</div>
            </div>
          );
        })}
      </div>

      {settlements.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: COLORS.inkLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Para saldar cuentas</div>
          {settlements.map((s, i) => (
            <div key={i} style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: COLORS.ink, marginBottom: 4 }}>
              <strong>{s.from}</strong> paga <strong style={{ color: COLORS.rust }}>{fmtMoney(s.amount)}</strong> a <strong>{s.to}</strong>
            </div>
          ))}
        </div>
      )}

      <TicketDivider />

      <div style={{ marginBottom: 18 }}>
        <Field label="Concepto">
          <input style={inputStyle} value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} placeholder="Ej: Cena del sábado" />
        </Field>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 100 }}>
            <Field label="Importe">
              <input style={inputStyle} type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0,00" />
            </Field>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <Field label="Pagado por">
              <select style={inputStyle} value={form.payer} onChange={(e) => setForm({ ...form, payer: e.target.value })}>
                {members.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
          </div>
        </div>
        <Field label="Dividir entre">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {members.map((m) => (
              <button type="button" key={m} onClick={() => toggleSplit(m)} style={{
                padding: "6px 12px", borderRadius: 999, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5,
                border: `1.5px solid ${form.split.includes(m) ? COLORS.ocean : COLORS.inkLight + "55"}`,
                background: form.split.includes(m) ? COLORS.ocean : "transparent", color: form.split.includes(m) ? COLORS.paper : COLORS.ink,
              }}>{m}</button>
            ))}
          </div>
        </Field>
        <Btn onClick={addExpense}><Plus size={15} /> Añadir gasto</Btn>
      </div>

      {expenses.length === 0 && <EmptyState text="Ningún gasto registrado todavía." />}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[...expenses].reverse().map((e) => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.paperDim, borderRadius: 10, padding: "10px 12px" }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: COLORS.ink, fontWeight: 600 }}>{e.concept}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11.5, color: COLORS.inkLight }}>{e.payer} pagó · entre {e.split.length}</div>
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: COLORS.ink }}>{fmtMoney(e.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = signed out
  const [pendingEmail, setPendingEmail] = useState(null);
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null); // { id, code }
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2600); };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const displayName = session?.user?.user_metadata?.display_name;

  const loadTrips = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from("trip_members")
      .select("trip_id, trips(*)")
      .eq("user_id", session.user.id);
    setTrips((data || []).map((r) => r.trips).filter(Boolean));
  }, [session]);

  useEffect(() => { loadTrips(); }, [loadTrips]);

  const handleCreateTrip = async (form) => {
    const code = genCode();
    const { data: tripRow, error } = await supabase
      .from("trips")
      .insert({
        code, name: form.name, destination: form.destination, days: form.days,
        transport_id: form.transportId, num_people: form.numPeople, created_by: session.user.id,
      })
      .select()
      .single();
    if (error || !tripRow) { showToast("No se pudo crear el viaje"); return; }
    await supabase.from("trip_members").insert({ trip_id: tripRow.id, user_id: session.user.id, display_name: displayName });
    await loadTrips();
    setActiveTrip({ id: tripRow.id, code: tripRow.code });
    showToast("Viaje creado — comparte el código con el grupo");
  };

  const handleJoinTrip = async (code) => {
    const { data: tripRow } = await supabase.from("trips").select("*").eq("code", code).maybeSingle();
    if (!tripRow) return false;
    await supabase.from("trip_members").upsert(
      { trip_id: tripRow.id, user_id: session.user.id, display_name: displayName },
      { onConflict: "trip_id,user_id" }
    );
    await loadTrips();
    setActiveTrip({ id: tripRow.id, code: tripRow.code });
    showToast(`Te has unido a ${tripRow.name}`);
    return true;
  };

  let body;
  if (session === undefined) {
    body = null;
  } else if (!session) {
    body = pendingEmail ? <CheckEmailScreen email={pendingEmail} /> : <LoginScreen onSent={setPendingEmail} />;
  } else if (!displayName) {
    body = <NameScreen onSet={() => setSession({ ...session })} />;
  } else if (activeTrip) {
    body = (
      <TripDetail tripId={activeTrip.id} displayName={displayName} onBack={() => setActiveTrip(null)} onToast={showToast} />
    );
  } else {
    body = (
      <Dashboard
        displayName={displayName}
        trips={trips}
        onOpenTrip={(code) => {
          const t = trips.find((x) => x.code === code);
          if (t) setActiveTrip({ id: t.id, code: t.code });
        }}
        onCreateTrip={handleCreateTrip}
        onJoinTrip={handleJoinTrip}
        onSignOut={() => supabase.auth.signOut()}
      />
    );
  }

  return (
    <div className="viaje-app" style={{
      minHeight: "100vh", background: `radial-gradient(1200px 600px at 15% -10%, ${COLORS.oceanDeep}, ${COLORS.ink} 55%)`,
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <style>{FONTS}{`
        .viaje-app * { box-sizing: border-box; }
        .viaje-app input:focus, .viaje-app select:focus { border-color: ${COLORS.ocean}; }
        .viaje-app ::selection { background: ${COLORS.mustard}; color: ${COLORS.ink}; }
        body { margin: 0; }
      `}</style>
      {body}
      <Toast message={toast} />
    </div>
  );
}
