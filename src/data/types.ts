/* ──────────────────────────────────────────────────────────────
   Contrato de dados do roteiro (data/roteiro-2026.json).
   O loader (src/engine/roteiroLoader.ts) lê o JSON bruto contra
   estes tipos e resolve as referências (campsitePlanA/B -> Campsite,
   riskIds -> Risk[]).
   ────────────────────────────────────────────────────────────── */

export type Coords = [lat: number, lng: number];
export type WindExposure = "low" | "med" | "high";
export type RiskLevel = "low" | "medium" | "high";
export type HighlightKind =
  | "town"
  | "tour"
  | "canyon"
  | "hotspring"
  | "crater"
  | "lagoon"
  | "waterfall"
  | "beach"
  | "volcano"
  | "museum"
  | "glacier";

export interface Meta {
  versao: string;
  data: string;
  fonteOriginal: string;
  viagem: {
    inicio: string;
    fim: string;
    dias: number;
    noites: number;
    transporte: string;
  };
  contrato: string;
}

export interface FlightLeg {
  trecho: string;
  partida?: string;
  chegada?: string;
  chegadaBrasil?: string;
  duracaoHoras?: number;
  observacao?: string;
}

export interface Voos {
  ida: FlightLeg[];
  volta: FlightLeg[];
}

export interface Campsite {
  id: string;
  name: string;
  coords: Coords;
  dumpStation: boolean;
  electricity: boolean;
  hotShower: boolean;
  laundry: boolean;
  lightPollution: number;
  windExposure: WindExposure;
  phone?: string;
  seasonEnd?: string;
  notes?: string;
}

export type RiskTrigger =
  | { kind: "wind"; maxMs: number }
  | { kind: "roadClosed"; roadCodes: string[] }
  | { kind: "ferry"; route: string }
  | { kind: "visibility"; minMeters: number }
  | { kind: "rainAccum"; hours: number; minMm: number }
  | { kind: "manual" };

export interface RiskOperator {
  name: string;
  url: string;
}

export interface RiskPlan {
  description: string;
  newCampsite?: string;
  newDrivingMinutes?: number;
  addHighlights?: string[];
  dropHighlights?: string[];
}

export interface RescheduleWindow {
  dayN: number;
  period: "morning" | "afternoon" | "evening";
}

export interface Risk {
  id: string;
  label: string;
  dayNumbers: number[];
  trigger: RiskTrigger;
  isAnchor: boolean;
  operator?: RiskOperator;
  rescheduleWindow?: RescheduleWindow;
  planB: RiskPlan;
  planC: RiskPlan;
}

export interface Highlight {
  id: string;
  name: string;
  kind: HighlightKind;
  coords: Coords;
  free: boolean;
  needsBooking: boolean;
  visitMinutes: number;
  weatherSensitive?: boolean;
  note?: string;
}

export type MandatoryCheck = "road" | "safetravel" | "ferry" | "volcano";

export interface DayNarrativa {
  diaSemana: string;
  trecho: string;
  tempoDirecaoTexto: string;
  destaquesResumo: string[];
  campingPlanoCTexto: string;
}

export interface Day {
  n: number;
  date: string;
  title: string;
  drivingMinutes: number;
  risk: RiskLevel;
  isAnchor: boolean;
  region: string;
  highlights: Highlight[];
  campsitePlanA: string;
  campsitePlanB?: string;
  riskIds: string[];
  mandatoryChecks: MandatoryCheck[];
  narrativa: DayNarrativa;
}

/** Day com as referências já resolvidas para os objetos completos. */
export interface ResolvedDay extends Day {
  campsiteA?: Campsite;
  campsiteB?: Campsite;
  risks: Risk[];
}

export interface Emergencia {
  numero: string;
  app: { nome: string; url: string };
  planoDeViagem: string;
  campervan: { nome: string; telefone: string; url: string };
  links: { nome: string; url: string }[];
}

export type TipoRiscoReserva = "ancora" | "flexivel";

export interface ReservaAntecipada {
  id: string;
  nome: string;
  site: string;
  dia: number;
  data: string;
  horario?: string;
  tipoRisco: TipoRiscoReserva;
  planoB?: { descricao: string; dia: number; data: string };
  planoC?: string;
  observacao?: string;
  ordemCompra: number;
}

export interface ChecklistItemDetalhado {
  item: string;
  dias?: string;
  onde?: string;
  status?: string;
}

export interface ChecklistReservas {
  estaSemana: string[];
  proximasSemanas: string[];
  maisPertoDaViagem: ChecklistItemDetalhado[];
  jaResolvido: ChecklistItemDetalhado[];
}

export interface BanhoTermalNatural {
  dia: number | number[];
  regiao: string;
  nome: string;
  tipo: string;
  precoReserva: string;
}

export interface BanhoPerigoso {
  nome: string;
  regiao: string;
  motivo: string;
}

export interface ChecagemDiariaObrigatoria {
  sites: string[];
  quando: string;
}

export interface Equipamentos {
  comprados: string[];
  pendentes: string[];
  avaliadosNaoComprados: string[];
}

export interface RoteiroData {
  meta: Meta;
  voos: Voos;
  campings: Campsite[];
  riscos: Risk[];
  dias: Day[];
  emergencia: Emergencia;
  notasCamping: string[];
  reservasAntecipadas: ReservaAntecipada[];
  checklistReservas: ChecklistReservas;
  banhosTermaisNaturais: BanhoTermalNatural[];
  banhosPerigosos: BanhoPerigoso[];
  checagemDiariaObrigatoria: ChecagemDiariaObrigatoria;
  equipamentos: Equipamentos;
  pendenciasGerais: string[];
  notasContexto: string[];
}

export interface LinkItem {
  titulo: string;
  descricao: string;
  url: string;
}

export interface LinkGroup {
  grupo: string;
  icone: "compass" | "tent" | "coin" | "alert";
  itens: LinkItem[];
}
