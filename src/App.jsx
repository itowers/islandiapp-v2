import React, { useState, useMemo, createContext, useContext } from "react";
import linkGroups from "../data/links.json";
import {
  dias,
  riscos,
  voos,
  emergencia,
  notasCamping,
  reservasAntecipadas,
  checklistReservas,
  banhosTermaisNaturais,
  banhosPerigosos,
  checagemDiariaObrigatoria,
  equipamentos,
  pendenciasGerais,
  notasContexto,
  meta,
  RISK_LABEL,
  drivingLabel,
  regionLabel,
  triggerLabel,
} from "./engine/roteiroLoader.ts";

/* ──────────────────────────────────────────────────────────────
   Islandiapp — roteiro de camper van pela Islândia
   Os dados da viagem vivem em /data/roteiro-2026.json (contrato em
   src/data/types.ts, resolvido por src/engine/roteiroLoader.ts) e
   /data/links.json — edite lá, não aqui.
   ────────────────────────────────────────────────────────────── */

const ThemeCtx = createContext("dark");
const ThemeSetterCtx = createContext({ setTheme: () => {} });

const KIND_DARK = {
  town: { label: "Cidade", color: "#6E7681", icon: "building" },
  tour: { label: "Tour", color: "#8B5CF6", icon: "star" },
  canyon: { label: "Cânion", color: "#2FB35C", icon: "mountain" },
  hotspring: { label: "Termal", color: "#F5A524", icon: "flame" },
  crater: { label: "Cratera", color: "#DB6D28", icon: "circle-dot" },
  lagoon: { label: "Lagoa", color: "#3B82F6", icon: "wave" },
  waterfall: { label: "Cachoeira", color: "#3B82F6", icon: "drop" },
  beach: { label: "Praia", color: "#F5A524", icon: "wave" },
  volcano: { label: "Vulcão", color: "#FF6B4A", icon: "mountain" },
  museum: { label: "Museu", color: "#8B5CF6", icon: "camera" },
  glacier: { label: "Geleira", color: "#58A6FF", icon: "mountain" },
};
const KIND_LIGHT = {
  town: { label: "Cidade", color: "#8B8B92", icon: "building" },
  tour: { label: "Tour", color: "#7C5CE0", icon: "star" },
  canyon: { label: "Cânion", color: "#1F9D55", icon: "mountain" },
  hotspring: { label: "Termal", color: "#E08A00", icon: "flame" },
  crater: { label: "Cratera", color: "#B85A1E", icon: "circle-dot" },
  lagoon: { label: "Lagoa", color: "#2F7BE0", icon: "wave" },
  waterfall: { label: "Cachoeira", color: "#2F7BE0", icon: "drop" },
  beach: { label: "Praia", color: "#E08A00", icon: "wave" },
  volcano: { label: "Vulcão", color: "#E85D3A", icon: "mountain" },
  museum: { label: "Museu", color: "#7C5CE0", icon: "camera" },
  glacier: { label: "Geleira", color: "#2F7BE0", icon: "mountain" },
};
const RISK_DARK = { low: "#2FB35C", medium: "#F5A524", high: "#FF6B4A" };
const RISK_LIGHT = { low: "#1F9D55", medium: "#E08A00", high: "#E85D3A" };
const CAMP_COLOR = { dark: { open: "#2FB35C", season: "#DB6D28" }, light: { open: "#1F9D55", season: "#E08A00" } };
const LINK_COLOR = {
  dark: { compass: "#3B82F6", tent: "#2FB35C", coin: "#F5A524", alert: "#FF6B4A" },
  light: { compass: "#2F7BE0", tent: "#1F9D55", coin: "#E08A00", alert: "#E85D3A" },
};

const CHECK_META = {
  road: { label: "Estradas", pattern: /road/i },
  safetravel: { label: "SafeTravel", pattern: /safetravel/i },
  ferry: { label: "Ferry", pattern: /ferry/i },
  volcano: { label: "Vulcânico", pattern: /safetravel/i },
};

/* ── ícones ────────────────────────────────────────────────── */
function Icon({ name, size = 20 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "chevron-left": return <svg {...p}><path d="M15 5l-7 7 7 7" /></svg>;
    case "chevron-right": return <svg {...p}><path d="M9 5l7 7-7 7" /></svg>;
    case "chevron-down": return <svg {...p}><path d="M5 9l7 7 7-7" /></svg>;
    case "search": return <svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>;
    case "x": return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case "drop": return <svg {...p}><path d="M12 3s7 7.5 7 12a7 7 0 1 1-14 0c0-4.5 7-12 7-12z" /></svg>;
    case "hike": return <svg {...p}><circle cx="15.5" cy="5" r="1.8" fill="currentColor" stroke="none" /><path d="M9 21l2.2-6L8 12l1.5-4.5 4-1 2 3.2 3 1.3M11 15l3.2 2L16 21" /></svg>;
    case "star": return <svg {...p}><path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L12 16.9 6.4 20l1.4-6.2-4.8-4.3 6.4-.6L12 3z" /></svg>;
    case "flame": return <svg {...p}><path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c1.2 1 2 2.6 2 4.2A5.2 5.2 0 0 1 12 22a5.2 5.2 0 0 1-5-6.8C7.8 12 12 9 12 2z" /></svg>;
    case "tent": return <svg {...p}><path d="M4 20L12 5l8 15M8 20l4-8 4 8M2 20h20" /></svg>;
    case "fuel": return <svg {...p}><path d="M4 21V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15M4 21h10M15 9h2l3 3v6a1.5 1.5 0 0 1-3 0v-2a1 1 0 0 0-1-1h-1" /><path d="M6 6h6v5H6z" /></svg>;
    case "compass": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M15 9l-2 6-6 2 2-6 6-2z" /></svg>;
    case "coin": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M9.5 15.2c.5.7 1.4 1.1 2.5 1.1 1.7 0 3-1 3-2.3 0-3-5.5-1.5-5.5-4.3 0-1.3 1.3-2.2 3-2.2 1 0 1.9.4 2.4 1.1M12 7v10" /></svg>;
    case "alert": return <svg {...p}><path d="M12 3L2 20h20L12 3z" /><path d="M12 10v4" /><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" /></svg>;
    case "up-right": return <svg {...p}><path d="M7 17L17 7M8 7h9v9" /></svg>;
    case "map": return <svg {...p}><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" /></svg>;
    case "swap": return <svg {...p}><path d="M4 8h13l-3-3M20 16H7l3 3" /></svg>;
    case "link": return <svg {...p}><path d="M9 15l6-6M8 12l-3 3a3.5 3.5 0 0 0 5 5l3-3M16 12l3-3a3.5 3.5 0 0 0-5-5l-3 3" /></svg>;
    case "bolt": return <svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" /></svg>;
    case "sun": return <svg {...p}><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.4M12 19v2.4M21.5 12h-2.4M4.9 12H2.5M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3 5.6 5.6" /></svg>;
    case "moon": return <svg {...p}><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" /></svg>;
    case "mountain": return <svg {...p}><path d="M3 20L9 8l4 6 2-3 6 9H3z" /></svg>;
    case "wave": return <svg {...p}><path d="M2 15c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M2 20c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" /></svg>;
    case "camera": return <svg {...p}><path d="M4 8h3l2-2h6l2 2h3v11H4z" /><circle cx="12" cy="13.5" r="3.3" /></svg>;
    case "circle-dot": return <svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" /></svg>;
    case "building": return <svg {...p}><path d="M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12" /><path d="M3 21h18M8 8h.01M8 12h.01M8 16h.01" /></svg>;
    case "plane": return <svg {...p}><path d="M3 13l7-2 5-8 2 1-3 8 6 1v2l-6 1 3 8-2 1-5-8-7-2v-2z" /></svg>;
    case "shirt": return <svg {...p}><path d="M8 4l4 2 4-2 4 4-3 3v11H7V11L4 8l4-4z" /></svg>;
    case "info": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v6" /><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" /></svg>;
    case "cart": return <svg {...p}><circle cx="9" cy="20" r="1.3" fill="currentColor" stroke="none" /><circle cx="17" cy="20" r="1.3" fill="currentColor" stroke="none" /><path d="M3 4h2l2.4 12h9.6l2-8H6" /></svg>;
    default: return null;
  }
}

/* ── componentes reutilizáveis ─────────────────────────────── */
function Badge({ color, icon, size = 44 }) {
  return (
    <div className="badge" style={{ background: color, width: size, height: size, borderRadius: size * 0.27 }}>
      <Icon name={icon} size={size * 0.5} />
    </div>
  );
}

function GroupCard({ title, count, children }) {
  return (
    <section className="group">
      {title && (
        <div className="group-head">
          <h3>{title}</h3>
          {count != null && <span className="count">{count}</span>}
        </div>
      )}
      <div className="group-card">{children}</div>
    </section>
  );
}

function TipCard({ title = "Fique atento", note }) {
  const [open, setOpen] = useState(true);
  if (!open || !note) return null;
  return (
    <div className="tip">
      <div className="tip-top">
        <div className="tip-icon"><Icon name="alert" size={17} /></div>
        <button className="tip-x" onClick={() => setOpen(false)} aria-label="dispensar"><Icon name="x" size={15} /></button>
      </div>
      <h4>{title}</h4>
      <p>{note}</p>
    </div>
  );
}

function ThemeToggle() {
  const theme = useContext(ThemeCtx);
  const { setTheme } = useContext(ThemeSetterCtx);
  return (
    <button className="circle-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="alternar tema">
      <Icon name={theme === "dark" ? "sun" : "moon"} size={17} />
    </button>
  );
}

function TopBar({ icon, title }) {
  return (
    <div className="topline">
      <div className="wordmark">
        <div className="logo"><Icon name={icon} size={18} /></div>
        <span>{title}</span>
      </div>
      <ThemeToggle />
    </div>
  );
}

/* ── linha de amenidade de camping (não clicável) ────────────── */
function Amenity({ ok, icon, label }) {
  return (
    <span className={ok ? "amenity on" : "amenity"}>
      <Icon name={icon} size={13} /> {label}
    </span>
  );
}

function CampsiteCard({ campsite, tag }) {
  const theme = useContext(ThemeCtx);
  const camp = theme === "light" ? CAMP_COLOR.light : CAMP_COLOR.dark;
  if (!campsite) return null;
  const open = !campsite.seasonEnd;
  return (
    <a className="row" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(campsite.name + ", Iceland")}`} target="_blank" rel="noreferrer">
      <Badge color={open ? camp.open : camp.season} icon="tent" />
      <div className="row-body">
        <div className="row-top"><h4>{campsite.name}</h4>{tag && <span className="dist">{tag}</span>}</div>
        {campsite.notes && <p>{campsite.notes}</p>}
        <div className="amenities">
          <Amenity ok={campsite.dumpStation} icon="fuel" label="descarte" />
          <Amenity ok={campsite.electricity} icon="bolt" label="energia" />
          <Amenity ok={campsite.hotShower} icon="drop" label="chuveiro" />
          <Amenity ok={campsite.laundry} icon="shirt" label="lavanderia" />
        </div>
        <div className="row-tags">
          <i style={{ background: open ? camp.open : camp.season }} />
          {campsite.seasonEnd ? `abre até ${campsite.seasonEnd}` : "ano todo"}
          <span className="sep">·</span>vento {campsite.windExposure}
          <span className="sep">·</span>poluição luminosa {campsite.lightPollution}/3
        </div>
      </div>
      <Icon name="chevron-right" size={16} />
    </a>
  );
}

function RiskRow({ risk }) {
  return (
    <div className="risk-row">
      <div className="risk-row-top">
        <h4>{risk.label}</h4>
        {risk.isAnchor && <span className="anchor-tag">âncora</span>}
      </div>
      <p className="risk-trigger">{triggerLabel(risk.trigger)}</p>
      {risk.operator && (
        <a className="risk-op" href={risk.operator.url} target="_blank" rel="noreferrer">
          {risk.operator.name} <Icon name="up-right" size={12} />
        </a>
      )}
      {risk.rescheduleWindow && (
        <p className="risk-line"><b>Janela de remarcação:</b> Dia {risk.rescheduleWindow.dayN} · {risk.rescheduleWindow.period === "morning" ? "manhã" : risk.rescheduleWindow.period === "afternoon" ? "tarde" : "noite"}</p>
      )}
      <p className="risk-line"><b>Plano B:</b> {risk.planB.description}</p>
      <p className="risk-line"><b>Plano C:</b> {risk.planC.description}</p>
    </div>
  );
}

/* ── tela: roteiro ─────────────────────────────────────────── */
function Roteiro() {
  const theme = useContext(ThemeCtx);
  const KIND = theme === "light" ? KIND_LIGHT : KIND_DARK;
  const RISKCOLOR = theme === "light" ? RISK_LIGHT : RISK_DARK;

  const [d, setD] = useState(0);
  const [tab, setTab] = useState("dest");
  const day = dias[d];

  const tipNote = useMemo(() => {
    const bits = [];
    if (day.mandatoryChecks.length) {
      bits.push(`Checar antes de sair: ${day.mandatoryChecks.map((c) => CHECK_META[c].label).join(", ")}.`);
    }
    if (day.risks.length) {
      bits.push(`Atenção: ${day.risks.map((r) => r.label).join("; ")}.`);
    }
    return bits.join(" ");
  }, [day]);

  return (
    <>
      <div className="topline">
        <div className="wordmark">
          <div className="logo"><Icon name="map" size={18} /></div>
          <span>Islandiapp</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="daynav">
        <button className="circle-btn" onClick={() => setD((v) => Math.max(0, v - 1))} disabled={d === 0} aria-label="dia anterior"><Icon name="chevron-left" size={18} /></button>
        <div className="daynav-mid" key={d}>
          <h1>Dia {day.n} <span>· {regionLabel(day.region)}</span></h1>
          <p>{day.narrativa.diaSemana} {day.date} — {drivingLabel(day.drivingMinutes)} ao volante</p>
          <div className="daynav-tags">
            <span className="risk-chip" style={{ color: RISKCOLOR[day.risk] }}><i style={{ background: RISKCOLOR[day.risk] }} />{RISK_LABEL[day.risk]}</span>
            {day.isAnchor && <span className="anchor-tag">dia âncora</span>}
          </div>
        </div>
        <button className="circle-btn" onClick={() => setD((v) => Math.min(dias.length - 1, v + 1))} disabled={d === dias.length - 1} aria-label="próximo dia"><Icon name="chevron-right" size={18} /></button>
      </div>

      <div className="scroll" key={d}>
        <TipCard note={tipNote} />

        <div className="segs">
          <button className={tab === "dest" ? "seg on" : "seg"} onClick={() => setTab("dest")}>Destaques</button>
          <button className={tab === "cmp" ? "seg on" : "seg"} onClick={() => setTab("cmp")}>Camping</button>
          <button className={tab === "risk" ? "seg on" : "seg"} onClick={() => setTab("risk")}>Riscos</button>
        </div>

        {tab === "dest" && (
          day.highlights.length === 0 ? (
            <GroupCard><div className="empty-row"><p>Nenhum destaque marcado pra esse dia.</p></div></GroupCard>
          ) : (
            <GroupCard title="Destaques" count={day.highlights.length}>
              {day.highlights.map((h) => (
                <a key={h.id} className="row" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + ", Iceland")}`} target="_blank" rel="noreferrer">
                  <Badge color={KIND[h.kind].color} icon={KIND[h.kind].icon} />
                  <div className="row-body">
                    <div className="row-top"><h4>{h.name}</h4><span className="dist">~{h.visitMinutes}min</span></div>
                    {h.note && <p>{h.note}</p>}
                    <div className="row-tags">
                      <i style={{ background: KIND[h.kind].color }} />{KIND[h.kind].label}
                      <span className="sep">·</span>{h.free ? "grátis" : "pago"}
                      {h.needsBooking && <><span className="sep">·</span>reserva</>}
                      {h.weatherSensitive && <><span className="sep">·</span>sensível ao tempo</>}
                    </div>
                  </div>
                  <Icon name="chevron-right" size={16} />
                </a>
              ))}
            </GroupCard>
          )
        )}

        {tab === "cmp" && (
          <>
            <GroupCard title="Plano A">
              <CampsiteCard campsite={day.campsiteA} />
            </GroupCard>
            {day.campsiteB && (
              <GroupCard title="Plano B">
                <CampsiteCard campsite={day.campsiteB} />
              </GroupCard>
            )}
            <GroupCard title="Plano C">
              <div className="empty-row" style={{ textAlign: "left" }}>
                <p style={{ margin: 0 }}>{day.narrativa.campingPlanoCTexto}</p>
              </div>
            </GroupCard>
          </>
        )}

        {tab === "risk" && (
          day.risks.length === 0 ? (
            <GroupCard><div className="empty-row"><p>Nenhum risco mapeado para esse dia.</p></div></GroupCard>
          ) : (
            <GroupCard title="Riscos do dia" count={day.risks.length}>
              {day.risks.map((r) => <RiskRow key={r.id} risk={r} />)}
            </GroupCard>
          )
        )}
      </div>
    </>
  );
}

/* ── tela: riscos (visão geral) ────────────────────────────── */
function Riscos() {
  return (
    <>
      <TopBar icon="alert" title="Riscos" />
      <div className="scroll">
        <p className="page-sub">Gatilhos, planos B e C de cada risco mapeado na viagem.</p>
        <GroupCard title="Todos os riscos" count={riscos.length}>
          {riscos.map((r) => (
            <div key={r.id} className="risk-block">
              <p className="risk-days">Dia{r.dayNumbers.length > 1 ? "s" : ""} {r.dayNumbers.join(", ")}</p>
              <RiskRow risk={r} />
            </div>
          ))}
        </GroupCard>
      </div>
    </>
  );
}

/* ── tela: reservas ────────────────────────────────────────── */
function Reservas() {
  const byId = useMemo(() => Object.fromEntries(reservasAntecipadas.map((r) => [r.id, r])), []);
  return (
    <>
      <TopBar icon="cart" title="Reservas" />
      <div className="scroll">
        <GroupCard title="Reservas antecipadas" count={reservasAntecipadas.length}>
          {reservasAntecipadas.map((r) => (
            <div key={r.id} className="risk-row">
              <div className="risk-row-top">
                <h4>{r.nome}</h4>
                <span className={r.tipoRisco === "ancora" ? "anchor-tag" : "flex-tag"}>{r.tipoRisco === "ancora" ? "âncora" : "flexível"}</span>
              </div>
              <p className="risk-trigger">Dia {r.dia} · {r.data}{r.horario ? ` · ${r.horario}` : ""} — {r.site}</p>
              {r.observacao && <p className="risk-line">{r.observacao}</p>}
              {r.planoB && <p className="risk-line"><b>Plano B:</b> {r.planoB.descricao} (Dia {r.planoB.dia} · {r.planoB.data})</p>}
              {r.planoC && <p className="risk-line"><b>Plano C:</b> {r.planoC}</p>}
            </div>
          ))}
        </GroupCard>

        <GroupCard title="Comprar esta semana">
          {checklistReservas.estaSemana.map((id) => (
            <div key={id} className="row" style={{ textDecoration: "none" }}>
              <Badge color="#FF6B4A" icon="alert" size={36} />
              <div className="row-body"><h4>{byId[id]?.nome ?? id}</h4></div>
            </div>
          ))}
        </GroupCard>
        <GroupCard title="Próximas semanas">
          {checklistReservas.proximasSemanas.map((id) => (
            <div key={id} className="row" style={{ textDecoration: "none" }}>
              <Badge color="#F5A524" icon="cart" size={36} />
              <div className="row-body"><h4>{byId[id]?.nome ?? id}</h4></div>
            </div>
          ))}
        </GroupCard>
        <GroupCard title="Mais perto da viagem">
          {checklistReservas.maisPertoDaViagem.map((it) => (
            <div key={it.item} className="row" style={{ textDecoration: "none" }}>
              <Badge color="#3B82F6" icon="info" size={36} />
              <div className="row-body"><h4>{it.item}</h4>{(it.dias || it.onde) && <p>{[it.dias, it.onde].filter(Boolean).join(" · ")}</p>}</div>
            </div>
          ))}
        </GroupCard>
        <GroupCard title="Já resolvido">
          {checklistReservas.jaResolvido.map((it) => (
            <div key={it.item} className="row" style={{ textDecoration: "none" }}>
              <Badge color="#2FB35C" icon="star" size={36} />
              <div className="row-body"><h4>{it.item}</h4><p>{it.status}</p></div>
            </div>
          ))}
        </GroupCard>
      </div>
    </>
  );
}

/* ── tela: info (voos, emergência, equipamentos, links, conversor) ── */
function Info() {
  const theme = useContext(ThemeCtx);
  const colors = theme === "light" ? LINK_COLOR.light : LINK_COLOR.dark;

  const defaultKm = Math.round((dias.reduce((s, d) => s + d.drivingMinutes, 0) / 60) * 70 / 10) * 10;
  const [rate, setRate] = useState(0.043);
  const [isk, setIsk] = useState(5000);
  const [litro, setLitro] = useState(320);
  const [cons, setCons] = useState(9);
  const [km, setKm] = useState(defaultKm);
  const num = (v) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const combustivel = (km / cons) * litro;

  return (
    <>
      <TopBar icon="info" title="Info" />
      <div className="scroll">
        <p className="page-sub">{meta.viagem.inicio} a {meta.viagem.fim} · {meta.viagem.dias} dias · {meta.viagem.transporte}</p>

        <GroupCard title="Voos · ida">
          {voos.ida.map((v) => (
            <div key={v.trecho} className="row" style={{ textDecoration: "none" }}>
              <Badge color={colors.compass} icon="plane" size={36} />
              <div className="row-body">
                <h4>{v.trecho}</h4>
                <p>{v.partida ? `Partida ${v.partida}` : v.chegada ? `Chegada ${v.chegada}` : v.duracaoHoras ? `${v.duracaoHoras}h` : ""}{v.observacao ? ` — ${v.observacao}` : ""}</p>
              </div>
            </div>
          ))}
        </GroupCard>
        <GroupCard title="Voos · volta">
          {voos.volta.map((v) => (
            <div key={v.trecho} className="row" style={{ textDecoration: "none" }}>
              <Badge color={colors.compass} icon="plane" size={36} />
              <div className="row-body">
                <h4>{v.trecho}</h4>
                <p>{v.partida ? `Partida ${v.partida}` : ""}{v.chegadaBrasil ? ` — chegada Brasil ${v.chegadaBrasil}` : ""}</p>
              </div>
            </div>
          ))}
        </GroupCard>

        <GroupCard title="Emergência">
          <a className="row" href={`tel:${emergencia.numero}`}>
            <Badge color={colors.alert} icon="alert" size={40} />
            <div className="row-body"><h4>{emergencia.numero}</h4><p>Número único de emergência</p></div>
          </a>
          <a className="row" href={emergencia.app.url} target="_blank" rel="noreferrer">
            <Badge color={colors.alert} icon="alert" size={40} />
            <div className="row-body"><h4>{emergencia.app.nome}</h4><p>App de emergência</p></div>
          </a>
          <a className="row" href={emergencia.planoDeViagem} target="_blank" rel="noreferrer">
            <Badge color={colors.compass} icon="compass" size={40} />
            <div className="row-body"><h4>Registrar plano de viagem</h4><p>{emergencia.planoDeViagem}</p></div>
          </a>
          <a className="row" href={`tel:${emergencia.campervan.telefone}`}>
            <Badge color={colors.tent} icon="tent" size={40} />
            <div className="row-body"><h4>{emergencia.campervan.nome}</h4><p>{emergencia.campervan.telefone}</p></div>
          </a>
        </GroupCard>

        <GroupCard title="Checagem diária obrigatória">
          <div className="empty-row" style={{ textAlign: "left" }}>
            <p style={{ margin: 0 }}>{checagemDiariaObrigatoria.quando}: {checagemDiariaObrigatoria.sites.join(", ")}</p>
          </div>
        </GroupCard>

        {linkGroups.map((g) => (
          <GroupCard key={g.grupo} title={g.grupo} count={g.itens.length}>
            {g.itens.map((it) => (
              <a key={it.titulo} className="row" href={it.url} target="_blank" rel="noreferrer">
                <Badge color={colors[g.icone]} icon={g.icone} />
                <div className="row-body"><h4>{it.titulo}</h4><p>{it.descricao}</p></div>
                <Icon name="up-right" size={15} />
              </a>
            ))}
          </GroupCard>
        ))}

        <GroupCard title="Banhos termais naturais" count={banhosTermaisNaturais.length}>
          {banhosTermaisNaturais.map((b) => (
            <div key={b.nome} className="row" style={{ textDecoration: "none" }}>
              <Badge color={colors.tent} icon="flame" size={36} />
              <div className="row-body">
                <h4>{b.nome}</h4>
                <p>Dia {Array.isArray(b.dia) ? b.dia.join("-") : b.dia} · {b.regiao} — {b.tipo} · {b.precoReserva}</p>
              </div>
            </div>
          ))}
        </GroupCard>
        <GroupCard title="Banhos perigosos — não entrar" count={banhosPerigosos.length}>
          {banhosPerigosos.map((b) => (
            <div key={b.nome} className="row" style={{ textDecoration: "none" }}>
              <Badge color={colors.alert} icon="alert" size={36} />
              <div className="row-body"><h4>{b.nome}</h4><p>{b.regiao} — {b.motivo}</p></div>
            </div>
          ))}
        </GroupCard>

        <GroupCard title="Equipamentos comprados">
          {equipamentos.comprados.map((e) => (
            <div key={e} className="row" style={{ textDecoration: "none" }}>
              <Badge color={colors.tent} icon="shirt" size={32} />
              <div className="row-body"><h4>{e}</h4></div>
            </div>
          ))}
        </GroupCard>
        <GroupCard title="Equipamentos pendentes">
          {equipamentos.pendentes.map((e) => (
            <div key={e} className="row" style={{ textDecoration: "none" }}>
              <Badge color={colors.coin} icon="shirt" size={32} />
              <div className="row-body"><h4>{e}</h4></div>
            </div>
          ))}
        </GroupCard>

        <GroupCard title="Notas de camping">
          {notasCamping.map((n, i) => (
            <div key={i} className="row" style={{ textDecoration: "none" }}>
              <Badge color={colors.tent} icon="tent" size={32} />
              <div className="row-body"><p style={{ margin: 0 }}>{n}</p></div>
            </div>
          ))}
        </GroupCard>
        <GroupCard title="Pendências gerais">
          {pendenciasGerais.map((n, i) => (
            <div key={i} className="row" style={{ textDecoration: "none" }}>
              <Badge color={colors.coin} icon="info" size={32} />
              <div className="row-body"><p style={{ margin: 0 }}>{n}</p></div>
            </div>
          ))}
        </GroupCard>
        <GroupCard title="Notas de contexto">
          {notasContexto.map((n, i) => (
            <div key={i} className="row" style={{ textDecoration: "none" }}>
              <Badge color={colors.compass} icon="compass" size={32} />
              <div className="row-body"><p style={{ margin: 0 }}>{n}</p></div>
            </div>
          ))}
        </GroupCard>

        <div className="hero">
          <p className="hero-sub">{isk.toLocaleString("pt-BR")} ISK equivalem a</p>
          <h1 className="hero-num">R$ {num(isk * rate)}</h1>
        </div>
        <div className="pills">
          {[500, 1000, 2500, 5000, 12000].map((v) => (
            <button key={v} className={isk === v ? "pill on" : "pill"} onClick={() => setIsk(v)}>{v.toLocaleString("pt-BR")}</button>
          ))}
        </div>
        <GroupCard title="Ajustar">
          <div className="field-row">
            <Badge color="#58A6FF" icon="swap" size={40} />
            <div className="field-body"><span>Valor em ISK</span><input type="number" value={isk} onChange={(e) => setIsk(+e.target.value || 0)} /></div>
          </div>
          <div className="field-row">
            <Badge color="#6E7681" icon="coin" size={40} />
            <div className="field-body"><span>Cotação · 1 ISK em R$</span><input type="number" step="0.001" value={rate} onChange={(e) => setRate(+e.target.value || 0)} /></div>
          </div>
        </GroupCard>
        <GroupCard title="Combustível da viagem">
          <div className="field-row">
            <Badge color="#F5A524" icon="fuel" size={40} />
            <div className="field-body"><span>Diesel · ISK/litro</span><input type="number" value={litro} onChange={(e) => setLitro(+e.target.value || 0)} /></div>
          </div>
          <div className="field-row">
            <Badge color="#2FB35C" icon="bolt" size={40} />
            <div className="field-body"><span>Consumo · km/litro</span><input type="number" value={cons} onChange={(e) => setCons(+e.target.value || 1)} /></div>
          </div>
          <div className="field-row">
            <Badge color="#8B5CF6" icon="compass" size={40} />
            <div className="field-body"><span>Km total estimado (ajuste se souber o real)</span><input type="number" value={km} onChange={(e) => setKm(+e.target.value || 0)} /></div>
          </div>
          <div className="total-row"><span>{km.toLocaleString("pt-BR")} km de roteiro</span><b>R$ {num(combustivel)}</b></div>
        </GroupCard>
      </div>
    </>
  );
}

/* ── app raiz ──────────────────────────────────────────────── */
export default function App() {
  const [theme, setTheme] = useState("dark");
  const [nav, setNav] = useState("roteiro");
  const tabs = [
    ["roteiro", "Roteiro", "map"],
    ["riscos", "Riscos", "alert"],
    ["reservas", "Reservas", "cart"],
    ["info", "Info", "info"],
  ];
  return (
    <div className="stage">
      <style>{CSS}</style>
      <ThemeCtx.Provider value={theme}>
        <ThemeSetterCtx.Provider value={{ setTheme }}>
          <div className="phone">
            <div className="screen" data-theme={theme}>
              <div className="app">
                {nav === "roteiro" && <Roteiro />}
                {nav === "riscos" && <Riscos />}
                {nav === "reservas" && <Reservas />}
                {nav === "info" && <Info />}
              </div>
              <div className="tabbar-wrap">
                <nav className="tabbar">
                  {tabs.map(([k, l, ic]) => (
                    <button key={k} className={nav === k ? "on" : ""} onClick={() => setNav(k)} aria-current={nav === k}>
                      <Icon name={ic} size={21} /><span>{l}</span>
                    </button>
                  ))}
                </nav>
              </div>
              <div className="home-indicator" />
            </div>
          </div>
        </ThemeSetterCtx.Provider>
      </ThemeCtx.Provider>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap');

*{box-sizing:border-box}
html,body,#root{height:100%;margin:0}
body{background:#E7E7E9;font-family:'Inter',system-ui,sans-serif}

.stage{--sd:'Manrope',system-ui,sans-serif;--sb:'Inter',system-ui,sans-serif;
  min-height:100vh;display:flex;align-items:center;justify-content:center;padding:22px 12px;-webkit-font-smoothing:antialiased}
.stage button,.stage input{font-family:inherit}

.phone{width:100%;max-width:398px;height:min(864px,calc(100vh - 44px));background:#0B0B0C;border-radius:52px;padding:12px;
  box-shadow:0 30px 70px rgba(0,0,0,.30),0 0 0 1.5px #1B1B1D inset}

.screen{
  --bg:#000;--card:rgba(255,255,255,.055);--card-border:rgba(255,255,255,.09);--divider:rgba(255,255,255,.08);
  --text:#F5F5F7;--text2:#98989F;--text3:#606066;--blue:#4C8DFF;
  --surface:#1C1C1E;--surface-hover:#2A2A2D;--surface-border:transparent;
  --tip-x-bg:#26262A;
  --seg-track:#151517;--seg-active-bg:#2C2C30;--seg-active-fg:#fff;--seg-active-shadow:none;
  --pill-border:transparent;--pill-active-bg:#2C2C30;--pill-active-border:#3A3A3F;
  --cta-bg:#2C2C30;--cta-fg:#fff;--cta-border:transparent;
  --row-hover:rgba(255,255,255,.03);
  --tabbar-bg:rgba(28,28,30,.86);--tabbar-border:rgba(255,255,255,.08);--tabbar-shadow:none;--tabbar-active-bg:rgba(76,141,255,.14);
  --home-ind:#fff;--home-ind-op:.85;
  --total-bg:rgba(76,141,255,.1);--card-shadow:none;--logo-bg:#1C1C1E;
  --amenity-bg:#232326;--amenity-fg:#606066;--amenity-on-fg:#F5F5F7;
  position:relative;height:100%;background:var(--bg);border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:var(--text);
  transition:background .25s ease,color .25s ease}

.screen[data-theme="light"]{
  --bg:#F3F3F5;--card:#FFFFFF;--card-border:#E3E4E8;--divider:#ECEDF0;
  --text:#1C1C1E;--text2:#6B6B70;--text3:#9A9AA0;--blue:#2F6FE0;
  --surface:#FFFFFF;--surface-hover:#F3F4F6;--surface-border:#E3E4E8;
  --tip-x-bg:#F0F1F3;
  --seg-track:#EAEBEE;--seg-active-bg:#FFFFFF;--seg-active-fg:#1C1C1E;--seg-active-shadow:0 1px 3px rgba(20,20,30,.12);
  --pill-border:#E3E4E8;--pill-active-bg:#1C1C1E;--pill-active-border:#1C1C1E;
  --cta-bg:#FFFFFF;--cta-fg:#1C1C1E;--cta-border:#E3E4E8;
  --row-hover:#F7F8FA;
  --tabbar-bg:rgba(255,255,255,.86);--tabbar-border:#E3E4E8;--tabbar-shadow:0 10px 28px rgba(20,20,30,.10);--tabbar-active-bg:rgba(47,111,224,.12);
  --home-ind:#1C1C1E;--home-ind-op:.8;
  --total-bg:rgba(47,111,224,.08);--card-shadow:0 1px 2px rgba(20,20,30,.04);--logo-bg:#EAF1FF;
  --amenity-bg:#F0F1F3;--amenity-fg:#9A9AA0;--amenity-on-fg:#1C1C1E;
}

.app{flex:1;min-height:0;display:flex;flex-direction:column}

.topline{flex:none;display:flex;align-items:center;justify-content:space-between;padding:22px 18px 2px}
.toprow-actions{display:flex;gap:8px}
.wordmark{display:flex;align-items:center;gap:9px}
.logo{width:30px;height:30px;border-radius:9px;background:var(--logo-bg);display:flex;align-items:center;justify-content:center;color:var(--blue)}
.wordmark span{font-family:var(--sd);font-weight:800;font-size:16px;letter-spacing:-.01em}
.circle-btn{width:38px;height:38px;border-radius:50%;border:1px solid var(--surface-border);background:var(--surface);color:var(--text);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.12s;flex:none}
.circle-btn:hover:not(:disabled){background:var(--surface-hover)}
.circle-btn:disabled{opacity:.35;cursor:default}

.searchbar{margin:8px 18px 0;display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--surface-border);border-radius:12px;padding:10px 12px;color:var(--text2)}
.searchbar input{flex:1;background:transparent;border:0;outline:0;color:var(--text);font-size:14px}

.daynav{flex:none;display:flex;align-items:flex-start;gap:8px;padding:14px 14px 6px}
.daynav-mid{flex:1;text-align:center;min-width:0;animation:rise .22s ease}
@keyframes rise{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.daynav-mid h1{font-family:var(--sd);font-weight:800;font-size:25px;letter-spacing:-.02em;margin:0;line-height:1.1;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.daynav-mid h1 span{font-weight:700;color:var(--text2)}
.daynav-mid p{margin:3px 0 0;font-size:12px;color:var(--text2)}
.daynav-tags{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:7px}
.risk-chip{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700}
.risk-chip i{width:7px;height:7px;border-radius:50%;display:block}
.anchor-tag{font-size:10.5px;font-weight:700;color:#fff;background:#8B5CF6;padding:2px 8px;border-radius:999px;flex:none}
.flex-tag{font-size:10.5px;font-weight:700;color:var(--text2);background:var(--surface);border:1px solid var(--card-border);padding:2px 8px;border-radius:999px;flex:none}

.scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 18px 100px;animation:fade .2s ease}
@keyframes fade{from{opacity:0}to{opacity:1}}
.page-sub{font-size:12.5px;color:var(--text2);margin:2px 0 16px;line-height:1.5}

.tip{background:var(--card);border:1px solid var(--card-border);border-radius:16px;padding:14px 15px 15px;margin:6px 0 16px;box-shadow:var(--card-shadow)}
.tip-top{display:flex;align-items:center;justify-content:space-between}
.tip-icon{width:32px;height:32px;border-radius:50%;background:#FF6B4A;display:flex;align-items:center;justify-content:center;color:#fff}
.tip-x{width:26px;height:26px;border-radius:50%;border:none;background:var(--tip-x-bg);color:var(--text2);display:flex;align-items:center;justify-content:center;cursor:pointer}
.tip h4{font-family:var(--sd);font-weight:800;font-size:16.5px;margin:11px 0 5px;letter-spacing:-.01em}
.tip p{font-size:13px;line-height:1.5;color:var(--text2);margin:0}

.segs{display:flex;background:var(--seg-track);border-radius:11px;padding:3px;gap:3px;margin-bottom:12px}
.segs .seg{flex:1;border:0;background:transparent;padding:9px;border-radius:8px;cursor:pointer;font-weight:700;font-size:13.5px;color:var(--text2)}
.segs .seg.on{background:var(--seg-active-bg);color:var(--seg-active-fg);box-shadow:var(--seg-active-shadow)}

.pills{display:flex;gap:7px;overflow-x:auto;padding-bottom:14px;margin-top:2px}
.pill{flex:none;border:1px solid var(--pill-border);background:var(--surface);color:var(--text2);border-radius:999px;padding:8px 14px;
  font-size:12.5px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;white-space:nowrap}
.pill.on{background:var(--pill-active-bg);color:#fff;border-color:var(--pill-active-border)}
.pill.ghost{border:1px dashed var(--text3);color:var(--text3);background:transparent}
.pill.dropdown{color:var(--text)}

.group{margin-bottom:18px}
.group-head{display:flex;align-items:baseline;justify-content:space-between;padding:0 2px 9px}
.group-head h3{font-family:var(--sd);font-weight:800;font-size:19px;letter-spacing:-.01em;margin:0}
.count{font-size:12px;color:var(--text3);font-weight:600}
.group-card{background:var(--card);border:1px solid var(--card-border);border-radius:16px;overflow:hidden;box-shadow:var(--card-shadow)}

.row{display:flex;align-items:flex-start;gap:12px;padding:13px 14px;text-decoration:none;color:inherit;border-bottom:1px solid var(--divider);transition:.12s}
.row:last-child{border-bottom:0}
.row:hover{background:var(--row-hover)}
.row:focus-visible{outline:2px solid var(--blue);outline-offset:-2px}
.badge{flex:none;display:flex;align-items:center;justify-content:center;color:#fff}
.row-body{flex:1;min-width:0}
.row-top{display:flex;align-items:baseline;gap:8px}
.row-top h4{font-family:var(--sb);font-weight:700;font-size:15px;margin:0;letter-spacing:-.005em;flex:1;min-width:0}
.row .dist{font-size:11px;color:var(--text3);flex:none}
.row-body p{font-size:12.5px;line-height:1.42;color:var(--text2);margin:3px 0 6px}
.row-tags{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--text2);font-weight:500;flex-wrap:wrap}
.row-tags i{width:7px;height:7px;border-radius:50%;display:block}
.row-tags .sep{color:var(--text3)}
.row>svg{flex:none;color:var(--text3);margin-top:12px}

.amenities{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 6px}
.amenity{display:flex;align-items:center;gap:4px;font-size:10.5px;font-weight:600;color:var(--amenity-fg);background:var(--amenity-bg);border-radius:999px;padding:3px 8px 3px 6px}
.amenity.on{color:var(--amenity-on-fg)}

.risk-row{padding:13px 14px;border-bottom:1px solid var(--divider)}
.risk-row:last-child{border-bottom:0}
.risk-row-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.risk-row-top h4{font-family:var(--sb);font-weight:700;font-size:14.5px;margin:0}
.risk-trigger{font-size:12.5px;color:var(--text2);margin:3px 0 6px}
.risk-line{font-size:12px;color:var(--text2);line-height:1.5;margin:2px 0}
.risk-line b{color:var(--text)}
.risk-op{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;color:var(--blue);text-decoration:none;margin-bottom:4px}
.risk-block{border-bottom:1px solid var(--divider)}
.risk-block:last-child{border-bottom:0}
.risk-days{font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.04em;padding:12px 14px 0}

.empty-row{padding:22px 4px;text-align:center}
.empty-row p{font-size:13px;color:var(--text2);margin:0 0 10px}
.cta-ghost{border:1px solid var(--cta-border);background:var(--cta-bg);color:var(--cta-fg);font-weight:700;font-size:13px;padding:9px 16px;border-radius:10px;cursor:pointer}

.hero{padding:2px 18px 14px}
.hero-sub{font-size:12.5px;color:var(--text2);margin:0 0 4px}
.hero-num{font-family:var(--sd);font-weight:800;font-size:38px;letter-spacing:-.03em;margin:0;font-variant-numeric:tabular-nums}
.field-row{display:flex;align-items:center;gap:12px;padding:11px 14px;border-bottom:1px solid var(--divider)}
.group-card .field-row:last-child{border-bottom:0}
.field-body{flex:1;display:flex;flex-direction:column}
.field-body span{font-size:11.5px;color:var(--text2);margin-bottom:3px}
.field-body input{background:transparent;border:0;outline:0;color:var(--text);font-family:var(--sb);font-weight:700;font-size:18px;padding:0;font-variant-numeric:tabular-nums}
.total-row{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--total-bg)}
.total-row span{font-size:12px;color:var(--text2)}
.total-row b{font-family:var(--sd);font-weight:800;font-size:17px;color:var(--blue)}
.ref-row{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;border-bottom:1px solid var(--divider);font-size:13px}
.group-card .ref-row:last-child{border-bottom:0}
.ref-vals{display:flex;flex-direction:column;align-items:flex-end}
.ref-vals b{font-size:12.5px;font-weight:600;color:var(--text)}
.ref-vals em{font-style:normal;font-size:11px;color:var(--blue)}

.tabbar-wrap{position:absolute;left:0;right:0;bottom:0;padding:0 14px 8px;pointer-events:none}
.tabbar{pointer-events:auto;display:flex;gap:2px;background:var(--tabbar-bg);backdrop-filter:blur(20px);border:1px solid var(--tabbar-border);
  border-radius:22px;padding:6px;box-shadow:var(--tabbar-shadow)}
.tabbar button{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;border:0;background:transparent;color:var(--text3);
  padding:9px 4px 8px;border-radius:16px;cursor:pointer;transition:.14s}
.tabbar button span{font-size:10.5px;font-weight:600}
.tabbar button.on{color:var(--blue);background:var(--tabbar-active-bg)}
.home-indicator{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);width:120px;height:5px;border-radius:3px;background:var(--home-ind);opacity:var(--home-ind-op)}

@media (prefers-reduced-motion:reduce){.scroll,.daynav-mid{animation:none}}
@media (max-width:430px){.stage{padding:0}.phone{max-width:none;height:100vh;border-radius:0;padding:0}.screen{border-radius:0}}
`;
