import React, { useState, useMemo, createContext, useContext } from "react";
import roteiro from "../data/roteiro.json";
import linkGroups from "../data/links.json";

/* ──────────────────────────────────────────────────────────────
   Islandiapp — roteiro de camper van pela Islândia
   Os dados da viagem (dias, atividades, campings, links) vivem em
   /data/roteiro.json e /data/links.json — edite lá, não aqui.
   ────────────────────────────────────────────────────────────── */

const ThemeCtx = createContext("dark");
const ThemeSetterCtx = createContext({ setTheme: () => {} });

const CAT_DARK = {
  C: { label: "Cachoeira", color: "#3B82F6", icon: "drop" },
  H: { label: "Hike", color: "#2FB35C", icon: "hike" },
  A: { label: "Atração", color: "#8B5CF6", icon: "star" },
  T: { label: "Termal", color: "#F5A524", icon: "flame" },
};
const CAT_LIGHT = {
  C: { label: "Cachoeira", color: "#2F7BE0", icon: "drop" },
  H: { label: "Hike", color: "#1F9D55", icon: "hike" },
  A: { label: "Atração", color: "#7C5CE0", icon: "star" },
  T: { label: "Termal", color: "#E08A00", icon: "flame" },
};
const CLS_DARK = {
  1: { label: "Imperdível", color: "#FF6B4A" },
  2: { label: "Legal", color: "#58A6FF" },
  3: { label: "Passável", color: "#6E7681" },
};
const CLS_LIGHT = {
  1: { label: "Imperdível", color: "#E85D3A" },
  2: { label: "Legal", color: "#2F7BE0" },
  3: { label: "Passável", color: "#8B8B92" },
};
const CAMP_COLOR = { dark: { open: "#2FB35C", season: "#DB6D28" }, light: { open: "#1F9D55", season: "#E08A00" } };
const LINK_COLOR = {
  dark: { compass: "#3B82F6", tent: "#2FB35C", coin: "#F5A524", alert: "#FF6B4A" },
  light: { compass: "#2F7BE0", tent: "#1F9D55", coin: "#E08A00", alert: "#E85D3A" },
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

function TipCard({ note }) {
  const [open, setOpen] = useState(true);
  if (!open || !note) return null;
  return (
    <div className="tip">
      <div className="tip-top">
        <div className="tip-icon"><Icon name="alert" size={17} /></div>
        <button className="tip-x" onClick={() => setOpen(false)} aria-label="dispensar"><Icon name="x" size={15} /></button>
      </div>
      <h4>Fique atento</h4>
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

/* ── tela: roteiro ─────────────────────────────────────────── */
function Roteiro() {
  const theme = useContext(ThemeCtx);
  const CAT = theme === "light" ? CAT_LIGHT : CAT_DARK;
  const CLS = theme === "light" ? CLS_LIGHT : CLS_DARK;
  const camp = theme === "light" ? CAMP_COLOR.light : CAMP_COLOR.dark;

  const [d, setD] = useState(0);
  const [tab, setTab] = useState("act");
  const [sort, setSort] = useState("prox");
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const day = roteiro[d];
  const toggle = (c) => setCats((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const list = useMemo(() => {
    let l = day.atividades.map((x, i) => ({ ...x, i }));
    if (cats.length) l = l.filter((x) => cats.includes(x.categoria));
    if (q.trim()) l = l.filter((x) => x.nome.toLowerCase().includes(q.trim().toLowerCase()));
    if (sort === "class") l = [...l].sort((a, b) => a.classificacao - b.classificacao || a.i - b.i);
    return l;
  }, [d, cats, sort, q, day]);

  const here = ["C", "H", "A", "T"].filter((c) => day.atividades.some((x) => x.categoria === c));

  return (
    <>
      <div className="topline">
        <div className="wordmark">
          <div className="logo"><Icon name="map" size={18} /></div>
          <span>Islandiapp</span>
        </div>
        <div className="toprow-actions">
          <ThemeToggle />
          <button className="circle-btn" onClick={() => { setSearching((s) => !s); setQ(""); }} aria-label="buscar atividade">
            <Icon name={searching ? "x" : "search"} size={18} />
          </button>
        </div>
      </div>

      {searching && (
        <div className="searchbar">
          <Icon name="search" size={16} />
          <input autoFocus placeholder="Buscar uma parada..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      )}

      <div className="daynav">
        <button className="circle-btn" onClick={() => setD((v) => Math.max(0, v - 1))} disabled={d === 0} aria-label="dia anterior"><Icon name="chevron-left" size={18} /></button>
        <div className="daynav-mid" key={d}>
          <h1>Dia {day.dia} <span>· {day.regiao}</span></h1>
          <p>{day.data} — {day.km} km · {day.duracao} ao volante</p>
        </div>
        <button className="circle-btn" onClick={() => setD((v) => Math.min(roteiro.length - 1, v + 1))} disabled={d === roteiro.length - 1} aria-label="próximo dia"><Icon name="chevron-right" size={18} /></button>
      </div>

      <div className="scroll" key={d}>
        <TipCard note={day.nota} />

        <div className="segs">
          <button className={tab === "act" ? "seg on" : "seg"} onClick={() => setTab("act")}>Atividades</button>
          <button className={tab === "cmp" ? "seg on" : "seg"} onClick={() => setTab("cmp")}>Campings</button>
        </div>

        {tab === "act" && (
          <div className="pills">
            <button className="pill dropdown" onClick={() => setSort(sort === "prox" ? "class" : "prox")}>
              {sort === "prox" ? "Proximidade" : "Classificação"} <Icon name="chevron-down" size={13} />
            </button>
            {here.map((c) => (
              <button key={c} className={cats.includes(c) ? "pill on" : "pill"} onClick={() => toggle(c)} aria-pressed={cats.includes(c)}>{CAT[c].label}</button>
            ))}
            {cats.length > 0 && <button className="pill ghost" onClick={() => setCats([])}>Limpar</button>}
          </div>
        )}

        {tab === "act" ? (
          list.length === 0 ? (
            <GroupCard>
              <div className="empty-row">
                <p>Nenhuma parada encontrada.</p>
                <button className="cta-ghost" onClick={() => { setCats([]); setQ(""); }}>Ver todas</button>
              </div>
            </GroupCard>
          ) : (
            <GroupCard title="Atividades" count={list.length}>
              {list.map((x) => (
                <a key={x.nome} className="row" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(x.nome + ", Iceland")}`} target="_blank" rel="noreferrer">
                  <Badge color={CAT[x.categoria].color} icon={CAT[x.categoria].icon} />
                  <div className="row-body">
                    <div className="row-top"><h4>{x.nome}</h4><span className="dist">{x.distancia}</span></div>
                    <p>{x.descricao}</p>
                    <div className="row-tags"><i style={{ background: CLS[x.classificacao].color }} />{CLS[x.classificacao].label}<span className="sep">·</span>{CAT[x.categoria].label}</div>
                  </div>
                  <Icon name="chevron-right" size={16} />
                </a>
              ))}
            </GroupCard>
          )
        ) : day.campings.length === 0 ? (
          <GroupCard title="Campings">
            <div className="empty-row">
              <p>Sem pernoite marcado pra esse dia.</p>
            </div>
          </GroupCard>
        ) : (
          <GroupCard title="Campings" count={day.campings.length}>
            {day.campings.map((c) => (
              <a key={c.nome} className="row" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.nome + ", Iceland")}`} target="_blank" rel="noreferrer">
                <Badge color={c.disponibilidade === "ano todo" ? camp.open : camp.season} icon="tent" />
                <div className="row-body">
                  <div className="row-top"><h4>{c.nome}</h4><span className="dist">{c.preco}</span></div>
                  <p>{c.descricao}</p>
                  <div className="row-tags"><i style={{ background: c.disponibilidade === "ano todo" ? camp.open : camp.season }} />{c.disponibilidade}</div>
                </div>
                <Icon name="chevron-right" size={16} />
              </a>
            ))}
          </GroupCard>
        )}
      </div>
    </>
  );
}

/* ── tela: conversor ───────────────────────────────────────── */
function Conversor() {
  const theme = useContext(ThemeCtx);
  const [rate, setRate] = useState(0.043);
  const [isk, setIsk] = useState(5000);
  const [litro, setLitro] = useState(320);
  const [cons, setCons] = useState(9);
  const km = roteiro.reduce((s, x) => s + x.km, 0);
  const num = (v) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const combustivel = (km / cons) * litro;
  const c1 = theme === "light" ? "#2F7BE0" : "#58A6FF";
  const c2 = theme === "light" ? "#8B8B92" : "#6E7681";
  const c3 = theme === "light" ? "#E08A00" : "#F5A524";
  const c4 = theme === "light" ? "#1F9D55" : "#2FB35C";

  return (
    <>
      <div className="topline">
        <div className="wordmark"><div className="logo"><Icon name="swap" size={18} /></div><span>Conversor</span></div>
        <ThemeToggle />
      </div>

      <div className="hero">
        <p className="hero-sub">{isk.toLocaleString("pt-BR")} ISK equivalem a</p>
        <h1 className="hero-num">R$ {num(isk * rate)}</h1>
      </div>

      <div className="scroll">
        <div className="pills">
          {[500, 1000, 2500, 5000, 12000].map((v) => (
            <button key={v} className={isk === v ? "pill on" : "pill"} onClick={() => setIsk(v)}>{v.toLocaleString("pt-BR")}</button>
          ))}
        </div>

        <GroupCard title="Ajustar">
          <div className="field-row">
            <Badge color={c1} icon="swap" size={40} />
            <div className="field-body"><span>Valor em ISK</span><input type="number" value={isk} onChange={(e) => setIsk(+e.target.value || 0)} /></div>
          </div>
          <div className="field-row">
            <Badge color={c2} icon="coin" size={40} />
            <div className="field-body"><span>Cotação · 1 ISK em R$</span><input type="number" step="0.001" value={rate} onChange={(e) => setRate(+e.target.value || 0)} /></div>
          </div>
        </GroupCard>

        <GroupCard title="Combustível dos 14 dias">
          <div className="field-row">
            <Badge color={c3} icon="fuel" size={40} />
            <div className="field-body"><span>Diesel · ISK/litro</span><input type="number" value={litro} onChange={(e) => setLitro(+e.target.value || 0)} /></div>
          </div>
          <div className="field-row">
            <Badge color={c4} icon="bolt" size={40} />
            <div className="field-body"><span>Consumo · km/litro</span><input type="number" value={cons} onChange={(e) => setCons(+e.target.value || 1)} /></div>
          </div>
          <div className="total-row"><span>{km.toLocaleString("pt-BR")} km de roteiro</span><b>R$ {num(combustivel)}</b></div>
        </GroupCard>

        <GroupCard title="Referência rápida">
          {[["Camping por pessoa", 2800], ["Noite pros dois", 5500], ["Cerveja no bar", 1400], ["Prato no restaurante", 4500], ["Mercado por dia", 4000], ["Piscina municipal", 1200]].map(([k, v]) => (
            <div className="ref-row" key={k}>
              <span>{k}</span>
              <div className="ref-vals"><b>{v.toLocaleString("pt-BR")} ISK</b><em>R$ {num(v * rate)}</em></div>
            </div>
          ))}
        </GroupCard>
      </div>
    </>
  );
}

/* ── tela: links úteis ─────────────────────────────────────── */
function Links() {
  const theme = useContext(ThemeCtx);
  const colors = theme === "light" ? LINK_COLOR.light : LINK_COLOR.dark;
  return (
    <>
      <div className="topline">
        <div className="wordmark"><div className="logo"><Icon name="link" size={18} /></div><span>Links úteis</span></div>
        <ThemeToggle />
      </div>
      <div className="scroll">
        <p className="page-sub">Salve offline antes de sair de Reykjavík — a estrada 1 tem sinal fraco.</p>
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
    ["conversor", "Conversor", "swap"],
    ["links", "Links úteis", "link"],
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
                {nav === "conversor" && <Conversor />}
                {nav === "links" && <Links />}
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

.daynav{flex:none;display:flex;align-items:center;gap:8px;padding:14px 14px 6px}
.daynav-mid{flex:1;text-align:center;min-width:0;animation:rise .22s ease}
@keyframes rise{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.daynav-mid h1{font-family:var(--sd);font-weight:800;font-size:25px;letter-spacing:-.02em;margin:0;line-height:1.1;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.daynav-mid h1 span{font-weight:700;color:var(--text2)}
.daynav-mid p{margin:3px 0 0;font-size:12px;color:var(--text2)}

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
.row-tags{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--text2);font-weight:500}
.row-tags i{width:7px;height:7px;border-radius:50%;display:block}
.row-tags .sep{color:var(--text3)}
.row>svg{flex:none;color:var(--text3);margin-top:12px}

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
