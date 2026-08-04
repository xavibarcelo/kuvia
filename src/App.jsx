import { useState, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabaseClient";
import {
  Plane, TrainFront, Bus, Ship, Car, Bike, MapPin, Receipt,
  FileText, Compass, Plus, ArrowLeft, Copy, Check, X, LogIn, Luggage,
  Fuel, BedDouble, Link2, Trash2, Mail, Upload, LogOut, Paperclip, Pencil, Grid3x3
} from "lucide-react";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

const COLORS = {
  ink: "#16262A", inkLight: "#3E5C55", paper: "#EFE6CE", paperDim: "#E3D8B8",
  ocean: "#2E6E8E", oceanDeep: "#204E68", mustard: "#D6A537", rust: "#B24A2E", moss: "#6F8A5E",
};

const LANGS = ["es", "ca", "en"];
const LANG_LABEL = { es: "ES", ca: "CA", en: "EN" };

const TRANSLATIONS = {
  es: {
    tagline: "Organiza el viaje, entre todos.", email_label: "Correo electrónico", email_placeholder: "tucorreo@ejemplo.com",
    send_link: "Enviarme un enlace de acceso", sending: "Enviando...", magic_hint: "Sin contraseña: te enviamos un enlace mágico a tu correo para entrar.",
    check_email_title: "Revisa tu correo", check_email_body: "Te hemos enviado un enlace de acceso a {{email}}. Ábrelo desde este mismo dispositivo para entrar.",
    name_label: "Tu nombre", name_placeholder: "Xavi", continue: "Continuar", name_question: "¿Cómo te llamas?",
    hello: "Hola, {{name}}", new_trip: "Nuevo viaje", join: "Unirme", empty_trips: "Aún no tienes ningún viaje. Crea uno o únete con un código.",
    field_trip_name: "Nombre del viaje", trip_name_placeholder: "Escapada a Lisboa", field_destination: "Destino", destination_placeholder: "Lisboa, Portugal",
    field_days: "Número de días", field_transport: "Medio de transporte", field_people: "Número de personas (incluido tú)",
    create_trip: "Crear panel de viaje", creating: "Creando...", modal_new_trip: "Nuevo viaje", modal_join_trip: "Unirme a un viaje",
    field_join_code: "Código del viaje", joining: "Uniendo...", join_error: "No encuentro ningún viaje con ese código.",
    back_to_trips: "Todos los viajes", back_to_menu: "Menú del viaje", code_copied: "Código {{code}} copiado — compártelo con el grupo",
    nav_summary: "Resumen", nav_transport: "Transporte", nav_accommodation: "Alojamiento", nav_documents: "Documentos y reservas", nav_costs: "Costes",
    summary_body: "{{count}} persona{{plural}} organizando {{name}} a {{destination}}, {{days}} días en {{transport}}.",
    summary_hint: "Usa el menú del viaje para organizar el transporte, el alojamiento, los documentos y repartir los gastos entre el grupo.",
    none_transport_text: "Con \"{{transport}}\" ya vais organizados por vuestra cuenta — no hace falta nada aquí.",
    add_your_doc: "Añadir tu {{noun}}", doc_field_placeholder: "Ej: Vuelo IB1234, enlace o nº de reserva", attach_receipt_optional: "Adjuntar foto (opcional)",
    no_entries_yet: "Nadie ha añadido su {{noun}} todavía.", fuel_total: "Gasto total en gasolina", add_refuel: "Añadir repostaje",
    fuel_place_placeholder: "Gasolinera / lugar", no_refuels_yet: "Ningún repostaje registrado todavía.", fuel_expense_concept: "Gasolina · {{place}}",
    field_accommodation_place: "Alojamiento", accommodation_place_placeholder: "Nombre del hotel / apartamento", field_accommodation_dates: "Fechas",
    accommodation_dates_placeholder: "Ej: 12–15 de septiembre", field_accommodation_roommates: "Reparto de habitaciones (quién va con quién)",
    accommodation_roommates_placeholder: "Ej: Xavi y Marta / Laia y Pol", field_accommodation_voucher: "Voucher / enlace de reserva",
    add_accommodation: "Añadir alojamiento", no_accommodation_yet: "Ningún alojamiento añadido todavía.",
    documents_intro: "Carpeta común del viaje: subid aquí tarjetas de embarque, bouchers, seguros o cualquier documento importante, para tenerlo todo centralizado.",
    upload_file: "Subir un archivo (foto, PDF...)", uploading: "Subiendo...", doc_title_placeholder: "O añade un enlace: título", doc_url_placeholder: "Enlace",
    no_documents_yet: "Ningún documento añadido todavía.", added_by: "Añadido por {{name}}", settle_up_title: "Para saldar cuentas",
    settle_line: "{{from}} paga {{amount}} a {{to}}", label_owed: "le deben", label_owes: "debe", field_concept: "Concepto", concept_placeholder: "Ej: Cena del sábado",
    field_amount: "Importe", field_paid_by: "Pagado por", field_split_between: "Dividir entre", add_expense: "Añadir gasto", no_expenses_yet: "Ningún gasto registrado todavía.",
    paid_between: "{{payer}} pagó · entre {{count}}", view_receipt: "Ver ticket", save_changes: "Guardar cambios", cancel: "Cancelar", delete_confirm: "¿Eliminar esto?",
    linked_to_transport: "Vinculado a Transporte",
    transport_avion: "Avión", transport_tren: "Tren", transport_autobus: "Autobús", transport_barco: "Barco", transport_coche: "Coche compartido",
    transport_moto: "Moto", transport_bici: "Bicicleta", transport_individual: "Cada uno por su cuenta",
    noun_boarding_pass: "tarjeta de embarque", noun_ticket: "billete", noun_fuel_receipt: "ticket de gasolina",
  },
  ca: {
    tagline: "Organitza el viatge, entre tots.", email_label: "Correu electrònic", email_placeholder: "elteucorreu@exemple.com",
    send_link: "Envia'm un enllaç d'accés", sending: "Enviant...", magic_hint: "Sense contrasenya: t'enviem un enllaç màgic al correu per entrar.",
    check_email_title: "Revisa el teu correu", check_email_body: "T'hem enviat un enllaç d'accés a {{email}}. Obre'l des d'aquest mateix dispositiu per entrar.",
    name_label: "El teu nom", name_placeholder: "Xavi", continue: "Continuar", name_question: "Com et dius?",
    hello: "Hola, {{name}}", new_trip: "Nou viatge", join: "Unir-me", empty_trips: "Encara no tens cap viatge. Crea'n un o uneix-te amb un codi.",
    field_trip_name: "Nom del viatge", trip_name_placeholder: "Escapada a Lisboa", field_destination: "Destinació", destination_placeholder: "Lisboa, Portugal",
    field_days: "Nombre de dies", field_transport: "Mitjà de transport", field_people: "Nombre de persones (inclòs tu)",
    create_trip: "Crear panell de viatge", creating: "Creant...", modal_new_trip: "Nou viatge", modal_join_trip: "Unir-me a un viatge",
    field_join_code: "Codi del viatge", joining: "Unint...", join_error: "No trobo cap viatge amb aquest codi.",
    back_to_trips: "Tots els viatges", back_to_menu: "Menú del viatge", code_copied: "Codi {{code}} copiat — comparteix-lo amb el grup",
    nav_summary: "Resum", nav_transport: "Transport", nav_accommodation: "Allotjament", nav_documents: "Documents i reserves", nav_costs: "Costos",
    summary_body: "{{count}} persona{{plural}} organitzant {{name}} a {{destination}}, {{days}} dies en {{transport}}.",
    summary_hint: "Fes servir el menú del viatge per organitzar el transport, l'allotjament, els documents i repartir les despeses entre el grup.",
    none_transport_text: "Amb \"{{transport}}\" ja aneu organitzats pel vostre compte — no cal res aquí.",
    add_your_doc: "Afegeix el teu {{noun}}", doc_field_placeholder: "Ex: Vol IB1234, enllaç o núm. de reserva", attach_receipt_optional: "Adjuntar foto (opcional)",
    no_entries_yet: "Ningú ha afegit el seu {{noun}} encara.", fuel_total: "Despesa total en gasolina", add_refuel: "Afegir repostatge",
    fuel_place_placeholder: "Gasolinera / lloc", no_refuels_yet: "Cap repostatge registrat encara.", fuel_expense_concept: "Gasolina · {{place}}",
    field_accommodation_place: "Allotjament", accommodation_place_placeholder: "Nom de l'hotel / apartament", field_accommodation_dates: "Dates",
    accommodation_dates_placeholder: "Ex: 12–15 de setembre", field_accommodation_roommates: "Repartiment d'habitacions (qui va amb qui)",
    accommodation_roommates_placeholder: "Ex: Xavi i Marta / Laia i Pol", field_accommodation_voucher: "Voucher / enllaç de reserva",
    add_accommodation: "Afegir allotjament", no_accommodation_yet: "Cap allotjament afegit encara.",
    documents_intro: "Carpeta comuna del viatge: pugeu aquí targetes d'embarcament, vouchers, assegurances o qualsevol document important, per tenir-ho tot centralitzat.",
    upload_file: "Pujar un arxiu (foto, PDF...)", uploading: "Pujant...", doc_title_placeholder: "O afegeix un enllaç: títol", doc_url_placeholder: "Enllaç",
    no_documents_yet: "Cap document afegit encara.", added_by: "Afegit per {{name}}", settle_up_title: "Per saldar comptes",
    settle_line: "{{from}} paga {{amount}} a {{to}}", label_owed: "li deuen", label_owes: "deu", field_concept: "Concepte", concept_placeholder: "Ex: Sopar de dissabte",
    field_amount: "Import", field_paid_by: "Pagat per", field_split_between: "Dividir entre", add_expense: "Afegir despesa", no_expenses_yet: "Cap despesa registrada encara.",
    paid_between: "{{payer}} va pagar · entre {{count}}", view_receipt: "Veure tiquet", save_changes: "Desar canvis", cancel: "Cancel·lar", delete_confirm: "Vols eliminar-ho?",
    linked_to_transport: "Vinculat a Transport",
    transport_avion: "Avió", transport_tren: "Tren", transport_autobus: "Autobús", transport_barco: "Vaixell", transport_coche: "Cotxe compartit",
    transport_moto: "Moto", transport_bici: "Bicicleta", transport_individual: "Cadascú pel seu compte",
    noun_boarding_pass: "targeta d'embarcament", noun_ticket: "bitllet", noun_fuel_receipt: "tiquet de gasolina",
  },
  en: {
    tagline: "Plan the trip, together.", email_label: "Email", email_placeholder: "you@example.com",
    send_link: "Send me a login link", sending: "Sending...", magic_hint: "No password: we'll email you a magic link to sign in.",
    check_email_title: "Check your inbox", check_email_body: "We've sent a login link to {{email}}. Open it on this same device to sign in.",
    name_label: "Your name", name_placeholder: "Xavi", continue: "Continue", name_question: "What's your name?",
    hello: "Hi, {{name}}", new_trip: "New trip", join: "Join", empty_trips: "No trips yet. Create one or join with a code.",
    field_trip_name: "Trip name", trip_name_placeholder: "Weekend in Lisbon", field_destination: "Destination", destination_placeholder: "Lisbon, Portugal",
    field_days: "Number of days", field_transport: "Mode of transport", field_people: "Number of people (including you)",
    create_trip: "Create trip panel", creating: "Creating...", modal_new_trip: "New trip", modal_join_trip: "Join a trip",
    field_join_code: "Trip code", joining: "Joining...", join_error: "Couldn't find a trip with that code.",
    back_to_trips: "All trips", back_to_menu: "Trip menu", code_copied: "Code {{code}} copied — share it with the group",
    nav_summary: "Summary", nav_transport: "Transport", nav_accommodation: "Stay", nav_documents: "Documents & bookings", nav_costs: "Costs",
    summary_body: "{{count}} people{{plural}} planning {{name}} to {{destination}}, {{days}} days by {{transport}}.",
    summary_hint: "Use the trip menu to organize transport, accommodation, documents and split costs across the group.",
    none_transport_text: "With \"{{transport}}\" you're already sorted on your own — nothing needed here.",
    add_your_doc: "Add your {{noun}}", doc_field_placeholder: "E.g. Flight IB1234, link or booking ref.", attach_receipt_optional: "Attach a photo (optional)",
    no_entries_yet: "Nobody has added their {{noun}} yet.", fuel_total: "Total fuel spend", add_refuel: "Add fuel stop",
    fuel_place_placeholder: "Gas station / place", no_refuels_yet: "No fuel stops logged yet.", fuel_expense_concept: "Fuel · {{place}}",
    field_accommodation_place: "Accommodation", accommodation_place_placeholder: "Hotel / apartment name", field_accommodation_dates: "Dates",
    accommodation_dates_placeholder: "E.g. Sept 12-15", field_accommodation_roommates: "Room split (who's with whom)",
    accommodation_roommates_placeholder: "E.g. Xavi & Marta / Laia & Pol", field_accommodation_voucher: "Voucher / booking link",
    add_accommodation: "Add accommodation", no_accommodation_yet: "No accommodation added yet.",
    documents_intro: "Shared trip folder: upload boarding passes, vouchers, insurance or any important document here, all in one place.",
    upload_file: "Upload a file (photo, PDF...)", uploading: "Uploading...", doc_title_placeholder: "Or add a link: title", doc_url_placeholder: "Link",
    no_documents_yet: "No documents added yet.", added_by: "Added by {{name}}", settle_up_title: "To settle up",
    settle_line: "{{from}} pays {{amount}} to {{to}}", label_owed: "is owed", label_owes: "owes", field_concept: "Concept", concept_placeholder: "E.g. Saturday dinner",
    field_amount: "Amount", field_paid_by: "Paid by", field_split_between: "Split between", add_expense: "Add expense", no_expenses_yet: "No expenses logged yet.",
    paid_between: "{{payer}} paid · split {{count}}", view_receipt: "View receipt", save_changes: "Save changes", cancel: "Cancel", delete_confirm: "Delete this?",
    linked_to_transport: "Linked to Transport",
    transport_avion: "Plane", transport_tren: "Train", transport_autobus: "Bus", transport_barco: "Ferry", transport_coche: "Shared car",
    transport_moto: "Motorbike", transport_bici: "Bicycle", transport_individual: "Everyone on their own",
    noun_boarding_pass: "boarding pass", noun_ticket: "ticket", noun_fuel_receipt: "fuel receipt",
  },
};

function t(lang, key, vars) {
  let s = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.es[key] || key;
  if (vars) Object.entries(vars).forEach(([k, v]) => { s = s.split(`{{${k}}}`).join(v); });
  return s;
}

const TRANSPORT_OPTIONS = [
  { id: "avion", icon: Plane, category: "ticket", labelKey: "transport_avion", nounKey: "noun_boarding_pass" },
  { id: "tren", icon: TrainFront, category: "ticket", labelKey: "transport_tren", nounKey: "noun_ticket" },
  { id: "autobus", icon: Bus, category: "ticket", labelKey: "transport_autobus", nounKey: "noun_ticket" },
  { id: "barco", icon: Ship, category: "ticket", labelKey: "transport_barco", nounKey: "noun_ticket" },
  { id: "coche", icon: Car, category: "fuel", labelKey: "transport_coche", nounKey: "noun_fuel_receipt" },
  { id: "moto", icon: Car, category: "fuel", labelKey: "transport_moto", nounKey: "noun_fuel_receipt" },
  { id: "bici", icon: Bike, category: "none", labelKey: "transport_bici" },
  { id: "individual", icon: MapPin, category: "none", labelKey: "transport_individual" },
];

const AVATAR_PALETTE = [COLORS.ocean, COLORS.rust, COLORS.moss, COLORS.mustard, COLORS.oceanDeep, "#8A5A83"];
const colorForMember = (name, members) => AVATAR_PALETTE[Math.max(members.indexOf(name), 0) % AVATAR_PALETTE.length];
const initials = (name) => (name || "?").trim().slice(0, 2).toUpperCase();
const genCode = () => Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
const fmtMoney = (n) => `${Number(n).toFixed(2).replace(".", ",")} €`;

async function uploadReceipt(tripId, file) {
  const path = `${tripId}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from("documents").upload(path, file);
  if (error) return null;
  const { data } = supabase.storage.from("documents").getPublicUrl(path);
  return { url: data.publicUrl, path };
}

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

function Avatar({ name, members, size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: colorForMember(name, members), color: COLORS.paper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: size * 0.38, flexShrink: 0, border: `2px solid ${COLORS.paper}` }}>
      {initials(name)}
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: COLORS.ink, color: COLORS.paper, padding: "10px 18px", borderRadius: 999, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, boxShadow: "0 6px 20px rgba(0,0,0,0.35)", zIndex: 999, display: "flex", alignItems: "center", gap: 8 }}>
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
  const base = { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14.5, padding: "10px 18px", borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", border: "none", display: "inline-flex", alignItems: "center", gap: 8, opacity: disabled ? 0.5 : 1, transition: "transform 0.15s ease" };
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

function IconBtn({ icon: Icon, onClick, color, title }) {
  return (
    <button type="button" onClick={onClick} title={title} style={{ background: "none", border: "none", cursor: "pointer", color: color || COLORS.inkLight, padding: 4, display: "flex" }}>
      <Icon size={15} />
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, fontWeight: 600, letterSpacing: 0.4, color: COLORS.inkLight, textTransform: "uppercase" }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = { fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.inkLight}55`, background: COLORS.paper, color: COLORS.ink, outline: "none", width: "100%" };

function LanguageSwitch({ lang, onChange, dark }) {
  return (
    <div style={{ display: "flex", gap: 4, background: dark ? "transparent" : COLORS.paperDim, borderRadius: 999, padding: 3 }}>
      {LANGS.map((l) => (
        <button key={l} type="button" onClick={() => onChange(l)} style={{
          border: dark ? `1.5px solid ${lang === l ? COLORS.paper : COLORS.paper + "55"}` : "none", borderRadius: 999, padding: "5px 10px", cursor: "pointer",
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 11.5, fontWeight: 700,
          background: dark ? "transparent" : (lang === l ? COLORS.ink : "transparent"), color: dark ? COLORS.paper : (lang === l ? COLORS.paper : COLORS.inkLight),
        }}>{LANG_LABEL[l]}</button>
      ))}
    </div>
  );
}

function LoginScreen({ lang, setLang, onSent }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault(); setSending(true); setError("");
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setSending(false);
    if (error) setError(error.message); else onSent(email.trim());
  };
  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <form onSubmit={submit} style={{ maxWidth: 380, width: "100%", background: COLORS.paper, borderRadius: 20, padding: "36px 30px", boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Luggage size={26} color={COLORS.rust} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, letterSpacing: 2, color: COLORS.inkLight, textTransform: "uppercase" }}>Kuvia</span>
          </div>
          <LanguageSwitch lang={lang} onChange={setLang} />
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, margin: "6px 0 22px", color: COLORS.ink, fontWeight: 600 }}>{t(lang, "tagline")}</h1>
        <Field label={t(lang, "email_label")}>
          <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t(lang, "email_placeholder")} required />
        </Field>
        {error && <p style={{ color: COLORS.rust, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif" }}>{error}</p>}
        <Btn type="submit" disabled={sending} style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
          <Mail size={16} /> {sending ? t(lang, "sending") : t(lang, "send_link")}
        </Btn>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11.5, color: COLORS.inkLight, marginTop: 14, lineHeight: 1.5 }}>{t(lang, "magic_hint")}</p>
      </form>
    </div>
  );
}

function CheckEmailScreen({ lang, email }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ maxWidth: 380, background: COLORS.paper, borderRadius: 20, padding: "36px 30px" }}>
        <Mail size={30} color={COLORS.ocean} />
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, margin: "14px 0 8px", color: COLORS.ink }}>{t(lang, "check_email_title")}</h2>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: COLORS.inkLight }}>
          {t(lang, "check_email_body", { email: "" }).split("{{email}}").join("")}
          <strong>{email}</strong>
        </p>
      </div>
    </div>
  );
}

function NameScreen({ lang, onSet }) {
  const [name, setName] = useState("");
  const submit = async (e) => {
    e.preventDefault(); if (!name.trim()) return;
    await supabase.auth.updateUser({ data: { display_name: name.trim() } });
    onSet(name.trim());
  };
  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <form onSubmit={submit} style={{ maxWidth: 380, width: "100%", background: COLORS.paper, borderRadius: 20, padding: "36px 30px" }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, margin: "0 0 18px", color: COLORS.ink }}>{t(lang, "name_question")}</h2>
        <Field label={t(lang, "name_label")}>
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder={t(lang, "name_placeholder")} required autoFocus />
        </Field>
        <Btn type="submit" style={{ width: "100%", justifyContent: "center" }}>{t(lang, "continue")}</Btn>
      </form>
    </div>
  );
}

function TripTag({ trip, lang, onOpen }) {
  const opt = TRANSPORT_OPTIONS.find((o) => o.id === trip.transport_id) || TRANSPORT_OPTIONS[0];
  const Icon = opt.icon;
  return (
    <button onClick={onOpen} style={{ textAlign: "left", background: COLORS.paper, border: "none", borderRadius: 14, padding: "20px 20px 18px", cursor: "pointer", position: "relative", boxShadow: "0 10px 24px rgba(0,0,0,0.25)", transition: "transform 0.18s ease", fontFamily: "inherit" }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(-0.6deg) translateY(-3px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "rotate(0deg) translateY(0)")}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.rust, marginBottom: 10 }}>
        <Icon size={16} />
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, letterSpacing: 1, textTransform: "uppercase" }}>{trip.code}</span>
      </div>
      <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 21, margin: "0 0 4px", color: COLORS.ink }}>{trip.name}</h3>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: COLORS.inkLight, margin: 0 }}>{trip.destination} · {trip.days} {lang === "en" ? "days" : "días"}</p>
    </button>
  );
}

function Dashboard({ lang, setLang, displayName, trips, onOpenTrip, onCreateTrip, onJoinTrip, onSignOut }) {
  const [mode, setMode] = useState(null);
  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 30, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.mustard, marginBottom: 6 }}>
            <Luggage size={20} /><span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>Kuvia</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, color: COLORS.paper, margin: 0 }}>{t(lang, "hello", { name: displayName.split(" ")[0] })}</h1>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <LanguageSwitch lang={lang} onChange={setLang} dark />
          <Btn variant="ghost" style={{ color: COLORS.paper, borderColor: COLORS.paper }} onClick={() => setMode("join")}><LogIn size={16} /> {t(lang, "join")}</Btn>
          <Btn onClick={() => setMode("create")}><Plus size={16} /> {t(lang, "new_trip")}</Btn>
          <Btn variant="ghost" style={{ color: COLORS.paper, borderColor: COLORS.paper }} onClick={onSignOut}><LogOut size={16} /></Btn>
        </div>
      </div>
      {trips.length === 0 && (
        <div style={{ border: `1.5px dashed ${COLORS.paper}66`, borderRadius: 16, padding: 40, textAlign: "center" }}>
          <Compass size={28} color={COLORS.paper} style={{ opacity: 0.7 }} />
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.paper, opacity: 0.75, marginTop: 12 }}>{t(lang, "empty_trips")}</p>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 22 }}>
        {trips.map((tr) => <TripTag key={tr.code} trip={tr} lang={lang} onOpen={() => onOpenTrip(tr.code)} />)}
      </div>
      {mode === "create" && <CreateTripModal lang={lang} onClose={() => setMode(null)} onCreate={onCreateTrip} />}
      {mode === "join" && <JoinTripModal lang={lang} onClose={() => setMode(null)} onJoin={onJoinTrip} />}
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

function CreateTripModal({ lang, onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", destination: "", days: 5, transportId: "avion", numPeople: 2 });
  const [saving, setSaving] = useState(false);
  const submit = async (e) => { e.preventDefault(); setSaving(true); await onCreate(form); setSaving(false); };
  return (
    <ModalShell title={t(lang, "modal_new_trip")} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label={t(lang, "field_trip_name")}><input style={inputStyle} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t(lang, "trip_name_placeholder")} /></Field>
        <Field label={t(lang, "field_destination")}><input style={inputStyle} required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder={t(lang, "destination_placeholder")} /></Field>
        <Field label={t(lang, "field_days")}><input style={inputStyle} type="number" min={1} required value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} /></Field>
        <Field label={t(lang, "field_transport")}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {TRANSPORT_OPTIONS.map((opt) => {
              const Icon = opt.icon; const active = form.transportId === opt.id;
              return (
                <button type="button" key={opt.id} onClick={() => setForm({ ...form, transportId: opt.id })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, cursor: "pointer", border: `1.5px solid ${active ? COLORS.ocean : COLORS.inkLight + "55"}`, background: active ? COLORS.ocean : "transparent", color: active ? COLORS.paper : COLORS.ink, fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5 }}>
                  <Icon size={15} /> {t(lang, opt.labelKey)}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label={t(lang, "field_people")}><input style={inputStyle} type="number" min={1} required value={form.numPeople} onChange={(e) => setForm({ ...form, numPeople: Number(e.target.value) })} /></Field>
        <Btn type="submit" disabled={saving} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>{saving ? t(lang, "creating") : t(lang, "create_trip")}</Btn>
      </form>
    </ModalShell>
  );
}

function JoinTripModal({ lang, onClose, onJoin }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (e) => { e.preventDefault(); setError(""); setSaving(true); const ok = await onJoin(code.trim().toUpperCase()); setSaving(false); if (!ok) setError(t(lang, "join_error")); };
  return (
    <ModalShell title={t(lang, "modal_join_trip")} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label={t(lang, "field_join_code")}>
          <input style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2, textTransform: "uppercase" }} required value={code} onChange={(e) => setCode(e.target.value)} placeholder="AB12CD" maxLength={6} />
        </Field>
        {error && <p style={{ color: COLORS.rust, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif" }}>{error}</p>}
        <Btn type="submit" disabled={saving} style={{ width: "100%", justifyContent: "center" }}>{saving ? t(lang, "joining") : t(lang, "join")}</Btn>
      </form>
    </ModalShell>
  );
}

const SECTIONS = [
  { id: "resumen", labelKey: "nav_summary", icon: Compass },
  { id: "transporte", labelKey: "nav_transport", icon: Plane },
  { id: "alojamiento", labelKey: "nav_accommodation", icon: BedDouble },
  { id: "documentos", labelKey: "nav_documents", icon: FileText },
  { id: "costes", labelKey: "nav_costs", icon: Receipt },
];

function SectionTile({ section, lang, onOpen }) {
  const Icon = section.icon;
  return (
    <button onClick={onOpen} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: COLORS.paper, border: "none", borderRadius: 16, padding: "26px 14px", cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,0.2)", transition: "transform 0.15s ease" }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
      <div style={{ width: 46, height: 46, borderRadius: "50%", background: COLORS.mustard, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={22} color={COLORS.ink} />
      </div>
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: COLORS.ink, textAlign: "center" }}>{t(lang, section.labelKey)}</span>
    </button>
  );
}

function SectionDock({ lang, current, onSelect, onHome }) {
  return (
    <div style={{
      position: "fixed", bottom: 18, left: "50%", transform: "translateX(-50%)", zIndex: 150,
      display: "flex", gap: 4, background: COLORS.ink, borderRadius: 999, padding: 6,
      boxShadow: "0 10px 30px rgba(0,0,0,0.4)", maxWidth: "94vw", overflowX: "auto",
    }}>
      <button onClick={onHome} title={t(lang, "back_to_menu")} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", cursor: "pointer", background: "transparent", color: COLORS.paper, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Grid3x3 size={17} />
      </button>
      {SECTIONS.map((s) => {
        const Icon = s.icon; const active = current === s.id;
        return (
          <button key={s.id} onClick={() => onSelect(s.id)} title={t(lang, s.labelKey)} style={{
            width: 40, height: 40, borderRadius: "50%", border: "none", cursor: "pointer", flexShrink: 0,
            background: active ? COLORS.mustard : "transparent", color: active ? COLORS.ink : COLORS.paper,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={17} />
          </button>
        );
      })}
    </div>
  );
}

function TripDetail({ tripId, lang, displayName, onBack, onToast }) {
  const [section, setSection] = useState(null);
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
    const channel = supabase.channel(`trip-${tripId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "trip_members", filter: `trip_id=eq.${tripId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "transport_entries", filter: `trip_id=eq.${tripId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "fuel_entries", filter: `trip_id=eq.${tripId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "accommodations", filter: `trip_id=eq.${tripId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "documents", filter: `trip_id=eq.${tripId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "expenses", filter: `trip_id=eq.${tripId}` }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [tripId, load]);

  if (!trip) return <div style={{ padding: 40, textAlign: "center", color: COLORS.paper, fontFamily: "'Space Grotesk', sans-serif" }}>...</div>;

  const opt = TRANSPORT_OPTIONS.find((o) => o.id === trip.transport_id) || TRANSPORT_OPTIONS[0];
  const copyCode = () => { navigator.clipboard?.writeText(trip.code); onToast(t(lang, "code_copied", { code: trip.code })); };

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "26px 24px 110px" }}>
      <button onClick={section ? () => setSection(null) : onBack} style={{ background: "none", border: "none", color: COLORS.paper, opacity: 0.8, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, marginBottom: 16 }}>
        <ArrowLeft size={15} /> {section ? t(lang, "back_to_menu") : t(lang, "back_to_trips")}
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.mustard, marginBottom: 4 }}>
            <opt.icon size={15} /><span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6 }}>{t(lang, opt.labelKey)}</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, margin: "0 0 4px", color: COLORS.paper }}>{trip.name}</h1>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.paper, opacity: 0.75, margin: 0, fontSize: 13.5 }}>{trip.destination} · {trip.days} {lang === "en" ? "days" : "días"}</p>
          <div style={{ display: "flex", marginTop: 10 }}>
            {members.map((m, i) => (<div key={m} style={{ marginLeft: i === 0 ? 0 : -8 }} title={m}><Avatar name={m} members={members} size={28} /></div>))}
          </div>
        </div>
        <button onClick={copyCode} style={{ display: "flex", alignItems: "center", gap: 8, background: COLORS.paper, color: COLORS.ink, border: "none", borderRadius: 10, padding: "9px 13px", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
          {trip.code} <Copy size={14} />
        </button>
      </div>

      {!section ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 14 }}>
          {SECTIONS.map((s) => <SectionTile key={s.id} section={s} lang={lang} onOpen={() => setSection(s.id)} />)}
        </div>
      ) : (
        <div style={{ background: COLORS.paper, borderRadius: 18, padding: 26 }}>
          {section === "resumen" && <ResumenTab trip={trip} opt={opt} members={members} lang={lang} />}
          {section === "transporte" && <TransporteTab tripId={tripId} opt={opt} displayName={displayName} lang={lang} transportEntries={transportEntries} fuelEntries={fuelEntries} members={members} onReload={load} />}
          {section === "alojamiento" && <AlojamientoTab tripId={tripId} lang={lang} accommodations={accommodations} onReload={load} />}
          {section === "documentos" && <DocumentosTab tripId={tripId} lang={lang} displayName={displayName} documents={documents} onReload={load} />}
          {section === "costes" && <CostesTab tripId={tripId} lang={lang} displayName={displayName} members={members} expenses={expenses} onReload={load} />}
        </div>
      )}

      {section && <SectionDock lang={lang} current={section} onSelect={setSection} onHome={() => setSection(null)} />}
    </div>
  );
}

function ResumenTab({ trip, opt, members, lang }) {
  return (
    <div>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.ink, lineHeight: 1.7 }}>
        {t(lang, "summary_body", { count: members.length, plural: members.length !== 1 ? (lang === "en" ? "" : "s") : "", name: trip.name, destination: trip.destination, days: trip.days, transport: t(lang, opt.labelKey).toLowerCase() })}
      </p>
      <TicketDivider />
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: COLORS.inkLight }}>{t(lang, "summary_hint")}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: COLORS.inkLight, fontStyle: "italic" }}>{text}</p>;
}

function ReceiptPicker({ lang, file, setFile, existingUrl }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: COLORS.inkLight, cursor: "pointer", marginTop: -4, marginBottom: 14 }}>
      <Paperclip size={14} />
      <span>{file ? file.name : existingUrl ? t(lang, "view_receipt") : t(lang, "attach_receipt_optional")}</span>
      <input type="file" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
    </label>
  );
}

function TransporteTab({ tripId, opt, displayName, lang, transportEntries, fuelEntries, members, onReload }) {
  const [info, setInfo] = useState("");
  const [ticketFile, setTicketFile] = useState(null);
  const [editTicketId, setEditTicketId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [fuel, setFuel] = useState({ place: "", amount: "" });
  const [fuelFile, setFuelFile] = useState(null);
  const [editFuelId, setEditFuelId] = useState(null);

  const del = async (table, id) => { if (!window.confirm(t(lang, "delete_confirm"))) return; await supabase.from(table).delete().eq("id", id); onReload(); };

  if (opt.category === "none") {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <opt.icon size={26} color={COLORS.moss} />
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.ink, marginTop: 10 }}>{t(lang, "none_transport_text", { transport: t(lang, opt.labelKey).toLowerCase() })}</p>
      </div>
    );
  }

  if (opt.category === "ticket") {
    const noun = t(lang, opt.nounKey);
    const startEdit = (e) => { setEditTicketId(e.id); setInfo(e.info); setTicketFile(null); };
    const cancelEdit = () => { setEditTicketId(null); setInfo(""); setTicketFile(null); };
    const submit = async () => {
      if (!info.trim()) return;
      setBusy(true);
      let receipt_url;
      if (ticketFile) { const up = await uploadReceipt(tripId, ticketFile); if (up) { receipt_url = up.url; await supabase.from("documents").insert({ trip_id: tripId, title: `${noun} · ${displayName}`, url: up.url, added_by: displayName }); } }
      if (editTicketId) {
        const patch = { info: info.trim() }; if (receipt_url) patch.receipt_url = receipt_url;
        await supabase.from("transport_entries").update(patch).eq("id", editTicketId);
      } else {
        await supabase.from("transport_entries").insert({ trip_id: tripId, member: displayName, info: info.trim(), receipt_url: receipt_url || null });
      }
      cancelEdit(); setBusy(false); onReload();
    };
    return (
      <div>
        <Field label={t(lang, "add_your_doc", { noun })}>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...inputStyle, flex: 1 }} value={info} onChange={(e) => setInfo(e.target.value)} placeholder={t(lang, "doc_field_placeholder")} />
            <Btn onClick={submit} disabled={busy}>{editTicketId ? <Check size={15} /> : <Plus size={15} />}</Btn>
            {editTicketId && <Btn variant="ghost" onClick={cancelEdit}><X size={15} /></Btn>}
          </div>
        </Field>
        <ReceiptPicker lang={lang} file={ticketFile} setFile={setTicketFile} />
        <TicketDivider />
        {transportEntries.length === 0 && <EmptyState text={t(lang, "no_entries_yet", { noun })} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {transportEntries.map((e) => (
            <div key={e.id} style={{ display: "flex", gap: 10, alignItems: "center", background: COLORS.paperDim, borderRadius: 10, padding: "10px 12px" }}>
              <Avatar name={e.member} members={members} size={26} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, fontWeight: 600, color: COLORS.ink }}>{e.member}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: COLORS.inkLight }}>{e.info}</div>
              </div>
              {e.receipt_url && <a href={e.receipt_url} target="_blank" rel="noreferrer" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: COLORS.ocean }}>{t(lang, "view_receipt")}</a>}
              {e.member === displayName && <IconBtn icon={Pencil} onClick={() => startEdit(e)} />}
              {e.member === displayName && <IconBtn icon={Trash2} color={COLORS.rust} onClick={() => del("transport_entries", e.id)} />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const total = fuelEntries.reduce((s, e) => s + Number(e.amount), 0);
  const startEditFuel = (e) => { setEditFuelId(e.id); setFuel({ place: e.place, amount: String(e.amount) }); setFuelFile(null); };
  const cancelEditFuel = () => { setEditFuelId(null); setFuel({ place: "", amount: "" }); setFuelFile(null); };
  const submitFuel = async () => {
    if (!fuel.place.trim() || !fuel.amount) return;
    setBusy(true);
    let receipt_url;
    if (fuelFile) { const up = await uploadReceipt(tripId, fuelFile); if (up) { receipt_url = up.url; await supabase.from("documents").insert({ trip_id: tripId, title: `${t(lang, opt.nounKey)} · ${fuel.place.trim()}`, url: up.url, added_by: displayName }); } }
    if (editFuelId) {
      const patch = { place: fuel.place.trim(), amount: Number(fuel.amount) }; if (receipt_url) patch.receipt_url = receipt_url;
      await supabase.from("fuel_entries").update(patch).eq("id", editFuelId);
      await supabase.from("expenses").update({ concept: t(lang, "fuel_expense_concept", { place: fuel.place.trim() }), amount: Number(fuel.amount) }).eq("source_fuel_id", editFuelId);
    } else {
      const { data: fuelRow } = await supabase.from("fuel_entries").insert({ trip_id: tripId, member: displayName, place: fuel.place.trim(), amount: Number(fuel.amount), receipt_url: receipt_url || null }).select().single();
      if (fuelRow) await supabase.from("expenses").insert({ trip_id: tripId, concept: t(lang, "fuel_expense_concept", { place: fuel.place.trim() }), amount: Number(fuel.amount), payer: displayName, split: members, source_fuel_id: fuelRow.id });
    }
    cancelEditFuel(); setBusy(false); onReload();
  };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <Fuel size={20} color={COLORS.rust} />
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: COLORS.inkLight, textTransform: "uppercase", letterSpacing: 0.5 }}>{t(lang, "fuel_total")}</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: COLORS.ink }}>{fmtMoney(total)}</div>
        </div>
      </div>
      <Field label={t(lang, "add_refuel")}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input style={{ ...inputStyle, flex: 2, minWidth: 140 }} value={fuel.place} onChange={(e) => setFuel({ ...fuel, place: e.target.value })} placeholder={t(lang, "fuel_place_placeholder")} />
          <input style={{ ...inputStyle, flex: 1, minWidth: 90 }} type="number" step="0.01" value={fuel.amount} onChange={(e) => setFuel({ ...fuel, amount: e.target.value })} placeholder="€" />
          <Btn onClick={submitFuel} disabled={busy}>{editFuelId ? <Check size={15} /> : <Plus size={15} />}</Btn>
          {editFuelId && <Btn variant="ghost" onClick={cancelEditFuel}><X size={15} /></Btn>}
        </div>
      </Field>
      <ReceiptPicker lang={lang} file={fuelFile} setFile={setFuelFile} />
      <TicketDivider />
      {fuelEntries.length === 0 && <EmptyState text={t(lang, "no_refuels_yet")} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {fuelEntries.map((e) => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.paperDim, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Avatar name={e.member} members={members} size={26} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: COLORS.ink }}>{e.place}</span>
              {e.receipt_url && <a href={e.receipt_url} target="_blank" rel="noreferrer" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: COLORS.ocean }}>{t(lang, "view_receipt")}</a>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13.5, color: COLORS.rust }}>{fmtMoney(e.amount)}</span>
              {e.member === displayName && <IconBtn icon={Pencil} onClick={() => startEditFuel(e)} />}
              {e.member === displayName && <IconBtn icon={Trash2} color={COLORS.rust} onClick={() => del("fuel_entries", e.id)} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlojamientoTab({ tripId, lang, accommodations, onReload }) {
  const [form, setForm] = useState({ place: "", dates: "", roommates: "", notes: "" });
  const [editId, setEditId] = useState(null);
  const startEdit = (a) => { setEditId(a.id); setForm({ place: a.place, dates: a.dates || "", roommates: a.roommates || "", notes: a.notes || "" }); };
  const cancelEdit = () => { setEditId(null); setForm({ place: "", dates: "", roommates: "", notes: "" }); };
  const submit = async () => {
    if (!form.place.trim()) return;
    if (editId) await supabase.from("accommodations").update(form).eq("id", editId);
    else await supabase.from("accommodations").insert({ trip_id: tripId, ...form });
    cancelEdit(); onReload();
  };
  const del = async (id) => { if (!window.confirm(t(lang, "delete_confirm"))) return; await supabase.from("accommodations").delete().eq("id", id); onReload(); };
  return (
    <div>
      <Field label={t(lang, "field_accommodation_place")}><input style={inputStyle} value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder={t(lang, "accommodation_place_placeholder")} /></Field>
      <Field label={t(lang, "field_accommodation_dates")}><input style={inputStyle} value={form.dates} onChange={(e) => setForm({ ...form, dates: e.target.value })} placeholder={t(lang, "accommodation_dates_placeholder")} /></Field>
      <Field label={t(lang, "field_accommodation_roommates")}><input style={inputStyle} value={form.roommates} onChange={(e) => setForm({ ...form, roommates: e.target.value })} placeholder={t(lang, "accommodation_roommates_placeholder")} /></Field>
      <Field label={t(lang, "field_accommodation_voucher")}><input style={inputStyle} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={submit}>{editId ? <Check size={15} /> : <Plus size={15} />} {editId ? t(lang, "save_changes") : t(lang, "add_accommodation")}</Btn>
        {editId && <Btn variant="ghost" onClick={cancelEdit}>{t(lang, "cancel")}</Btn>}
      </div>
      <TicketDivider />
      {accommodations.length === 0 && <EmptyState text={t(lang, "no_accommodation_yet")} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {accommodations.map((a) => (
          <div key={a.id} style={{ background: COLORS.paperDim, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BedDouble size={15} color={COLORS.ocean} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color: COLORS.ink }}>{a.place}</span>
                {a.dates && <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: COLORS.inkLight }}>· {a.dates}</span>}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <IconBtn icon={Pencil} onClick={() => startEdit(a)} />
                <IconBtn icon={Trash2} color={COLORS.rust} onClick={() => del(a.id)} />
              </div>
            </div>
            {a.roommates && <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: COLORS.inkLight, margin: "2px 0" }}>{a.roommates}</p>}
            {a.notes && <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: COLORS.inkLight, margin: "2px 0" }}>{a.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentosTab({ tripId, lang, displayName, documents, onReload }) {
  const [form, setForm] = useState({ title: "", url: "" });
  const [uploading, setUploading] = useState(false);
  const addLink = async () => {
    if (!form.title.trim()) return;
    await supabase.from("documents").insert({ trip_id: tripId, title: form.title.trim(), url: form.url.trim() || null, added_by: displayName });
    setForm({ title: "", url: "" }); onReload();
  };
  const uploadFile = async (file) => {
    if (!file) return; setUploading(true);
    const up = await uploadReceipt(tripId, file);
    if (up) await supabase.from("documents").insert({ trip_id: tripId, title: file.name, url: up.url, storage_path: up.path, added_by: displayName });
    setUploading(false); onReload();
  };
  const remove = async (id) => { if (!window.confirm(t(lang, "delete_confirm"))) return; await supabase.from("documents").delete().eq("id", id); onReload(); };
  return (
    <div>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: COLORS.inkLight, marginBottom: 14 }}>{t(lang, "documents_intro")}</p>
      <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: `1.5px dashed ${COLORS.inkLight}77`, borderRadius: 10, padding: "16px", cursor: "pointer", marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: COLORS.ink }}>
        <Upload size={16} /> {uploading ? t(lang, "uploading") : t(lang, "upload_file")}
        <input type="file" style={{ display: "none" }} onChange={(e) => uploadFile(e.target.files?.[0])} disabled={uploading} />
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        <input style={{ ...inputStyle, flex: 1, minWidth: 140 }} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t(lang, "doc_title_placeholder")} />
        <input style={{ ...inputStyle, flex: 1, minWidth: 140 }} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder={t(lang, "doc_url_placeholder")} />
        <Btn onClick={addLink}><Plus size={15} /></Btn>
      </div>
      {documents.length === 0 && <EmptyState text={t(lang, "no_documents_yet")} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {documents.map((d) => (
          <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.paperDim, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", overflow: "hidden" }}>
              <Link2 size={15} color={COLORS.ocean} style={{ flexShrink: 0 }} />
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: COLORS.ink, fontWeight: 600 }}>{d.title}</div>
                {d.url && <a href={d.url} target="_blank" rel="noreferrer" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: COLORS.ocean, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", display: "block" }}>{d.url}</a>}
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: COLORS.inkLight }}>{t(lang, "added_by", { name: d.added_by })}</div>
              </div>
            </div>
            <IconBtn icon={Trash2} color={COLORS.rust} onClick={() => remove(d.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function CostesTab({ tripId, lang, displayName, members, expenses, onReload }) {
  const [form, setForm] = useState({ concept: "", amount: "", payer: displayName, split: members });
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const balances = computeBalances(members, expenses);
  const settlements = computeSettlements(balances);

  const toggleSplit = (m) => setForm((f) => ({ ...f, split: f.split.includes(m) ? f.split.filter((x) => x !== m) : [...f.split, m] }));
  const startEdit = (e) => { setEditId(e.id); setForm({ concept: e.concept, amount: String(e.amount), payer: e.payer, split: e.split }); setFile(null); };
  const cancelEdit = () => { setEditId(null); setForm({ concept: "", amount: "", payer: displayName, split: members }); setFile(null); };

  const submit = async () => {
    if (!form.concept.trim() || !form.amount || form.split.length === 0) return;
    let receipt_url;
    if (file) { const up = await uploadReceipt(tripId, file); if (up) { receipt_url = up.url; await supabase.from("documents").insert({ trip_id: tripId, title: form.concept.trim(), url: up.url, added_by: displayName }); } }
    if (editId) {
      const patch = { concept: form.concept.trim(), amount: Number(form.amount), payer: form.payer, split: form.split }; if (receipt_url) patch.receipt_url = receipt_url;
      await supabase.from("expenses").update(patch).eq("id", editId);
    } else {
      await supabase.from("expenses").insert({ trip_id: tripId, concept: form.concept.trim(), amount: Number(form.amount), payer: form.payer, split: form.split, receipt_url: receipt_url || null });
    }
    cancelEdit(); onReload();
  };
  const del = async (id) => { if (!window.confirm(t(lang, "delete_confirm"))) return; await supabase.from("expenses").delete().eq("id", id); onReload(); };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 10, marginBottom: 22 }}>
        {members.map((m) => {
          const bal = balances[m] || 0; const positive = bal >= 0;
          return (
            <div key={m} style={{ background: COLORS.paperDim, borderRadius: 10, padding: "12px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Avatar name={m} members={members} size={24} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: COLORS.ink, fontWeight: 600 }}>{m}</span>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: positive ? COLORS.moss : COLORS.rust }}>{positive ? "+" : ""}{fmtMoney(bal)}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10.5, color: COLORS.inkLight, textTransform: "uppercase" }}>{positive ? t(lang, "label_owed") : t(lang, "label_owes")}</div>
            </div>
          );
        })}
      </div>

      {settlements.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: COLORS.inkLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{t(lang, "settle_up_title")}</div>
          {settlements.map((s, i) => (<div key={i} style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: COLORS.ink, marginBottom: 4 }}>{t(lang, "settle_line", { from: s.from, to: s.to, amount: fmtMoney(s.amount) })}</div>))}
        </div>
      )}

      <TicketDivider />

      <div style={{ marginBottom: 18 }}>
        <Field label={t(lang, "field_concept")}><input style={inputStyle} value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} placeholder={t(lang, "concept_placeholder")} /></Field>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 100 }}><Field label={t(lang, "field_amount")}><input style={inputStyle} type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0,00" /></Field></div>
          <div style={{ flex: 1, minWidth: 120 }}><Field label={t(lang, "field_paid_by")}>
            <select style={inputStyle} value={form.payer} onChange={(e) => setForm({ ...form, payer: e.target.value })}>
              {members.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field></div>
        </div>
        <Field label={t(lang, "field_split_between")}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {members.map((m) => (
              <button type="button" key={m} onClick={() => toggleSplit(m)} style={{ padding: "6px 12px", borderRadius: 999, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, border: `1.5px solid ${form.split.includes(m) ? COLORS.ocean : COLORS.inkLight + "55"}`, background: form.split.includes(m) ? COLORS.ocean : "transparent", color: form.split.includes(m) ? COLORS.paper : COLORS.ink }}>{m}</button>
            ))}
          </div>
        </Field>
        <ReceiptPicker lang={lang} file={file} setFile={setFile} />
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={submit}>{editId ? <Check size={15} /> : <Plus size={15} />} {editId ? t(lang, "save_changes") : t(lang, "add_expense")}</Btn>
          {editId && <Btn variant="ghost" onClick={cancelEdit}>{t(lang, "cancel")}</Btn>}
        </div>
      </div>

      {expenses.length === 0 && <EmptyState text={t(lang, "no_expenses_yet")} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[...expenses].reverse().map((e) => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.paperDim, borderRadius: 10, padding: "10px 12px" }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: COLORS.ink, fontWeight: 600 }}>{e.concept}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11.5, color: COLORS.inkLight }}>{t(lang, "paid_between", { payer: e.payer, count: e.split.length })}{e.source_fuel_id ? ` · ${t(lang, "linked_to_transport")}` : ""}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {e.receipt_url && <a href={e.receipt_url} target="_blank" rel="noreferrer" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: COLORS.ocean }}>{t(lang, "view_receipt")}</a>}
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: COLORS.ink }}>{fmtMoney(e.amount)}</span>
              {!e.source_fuel_id && <IconBtn icon={Pencil} onClick={() => startEdit(e)} />}
              {!e.source_fuel_id && <IconBtn icon={Trash2} color={COLORS.rust} onClick={() => del(e.id)} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [pendingEmail, setPendingEmail] = useState(null);
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [toast, setToast] = useState("");
  const [lang, setLangState] = useState("es");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2600); };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      if (data.session?.user?.user_metadata?.locale) setLangState(data.session.user.user_metadata.locale);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user?.user_metadata?.locale) setLangState(s.user.user_metadata.locale);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const setLang = async (l) => { setLangState(l); if (session) await supabase.auth.updateUser({ data: { locale: l } }); };
  const displayName = session?.user?.user_metadata?.display_name;

  const loadTrips = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase.from("trip_members").select("trip_id, trips(*)").eq("user_id", session.user.id);
    setTrips((data || []).map((r) => r.trips).filter(Boolean));
  }, [session]);

  useEffect(() => { loadTrips(); }, [loadTrips]);

  const handleCreateTrip = async (form) => {
    const code = genCode();
    const { data: tripRow, error } = await supabase.from("trips").insert({ code, name: form.name, destination: form.destination, days: form.days, transport_id: form.transportId, num_people: form.numPeople, created_by: session.user.id }).select().single();
    if (error || !tripRow) { showToast("!"); return; }
    await supabase.from("trip_members").insert({ trip_id: tripRow.id, user_id: session.user.id, display_name: displayName });
    await loadTrips();
    setActiveTrip({ id: tripRow.id, code: tripRow.code });
  };

  const handleJoinTrip = async (code) => {
    const { data: tripRow } = await supabase.from("trips").select("*").eq("code", code).maybeSingle();
    if (!tripRow) return false;
    await supabase.from("trip_members").upsert({ trip_id: tripRow.id, user_id: session.user.id, display_name: displayName }, { onConflict: "trip_id,user_id" });
    await loadTrips();
    setActiveTrip({ id: tripRow.id, code: tripRow.code });
    return true;
  };

  let body;
  if (session === undefined) body = null;
  else if (!session) body = pendingEmail ? <CheckEmailScreen lang={lang} email={pendingEmail} /> : <LoginScreen lang={lang} setLang={setLang} onSent={setPendingEmail} />;
  else if (!displayName) body = <NameScreen lang={lang} onSet={() => setSession({ ...session })} />;
  else if (activeTrip) body = <TripDetail tripId={activeTrip.id} lang={lang} displayName={displayName} onBack={() => setActiveTrip(null)} onToast={showToast} />;
  else body = (
    <Dashboard lang={lang} setLang={setLang} displayName={displayName} trips={trips}
      onOpenTrip={(code) => { const tr = trips.find((x) => x.code === code); if (tr) setActiveTrip({ id: tr.id, code: tr.code }); }}
      onCreateTrip={handleCreateTrip} onJoinTrip={handleJoinTrip} onSignOut={() => supabase.auth.signOut()} />
  );

  return (
    <div className="viaje-app" style={{ minHeight: "100vh", background: `radial-gradient(1200px 600px at 15% -10%, ${COLORS.oceanDeep}, ${COLORS.ink} 55%)`, fontFamily: "'Space Grotesk', sans-serif" }}>
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
