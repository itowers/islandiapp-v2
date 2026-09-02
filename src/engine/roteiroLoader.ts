import rawData from "../../data/roteiro-2026.json";
import type {
  RoteiroData,
  Day,
  ResolvedDay,
  Risk,
  Campsite,
  RiskTrigger,
  RiskLevel,
} from "../data/types";

const data = rawData as unknown as RoteiroData;

const campsiteById = new Map<string, Campsite>(data.campings.map((c) => [c.id, c]));
const riskById = new Map<string, Risk>(data.riscos.map((r) => [r.id, r]));

export function getCampsite(id?: string): Campsite | undefined {
  return id ? campsiteById.get(id) : undefined;
}

export function getRisk(id: string): Risk | undefined {
  return riskById.get(id);
}

function resolveDay(day: Day): ResolvedDay {
  return {
    ...day,
    campsiteA: getCampsite(day.campsitePlanA),
    campsiteB: getCampsite(day.campsitePlanB),
    risks: day.riskIds.map((id) => riskById.get(id)).filter((r): r is Risk => Boolean(r)),
  };
}

export const meta = data.meta;
export const voos = data.voos;
export const campings = data.campings;
export const riscos = data.riscos;
export const dias: ResolvedDay[] = data.dias.map(resolveDay);
export const emergencia = data.emergencia;
export const notasCamping = data.notasCamping;
export const reservasAntecipadas = [...data.reservasAntecipadas].sort(
  (a, b) => a.ordemCompra - b.ordemCompra || a.dia - b.dia
);
export const checklistReservas = data.checklistReservas;
export const banhosTermaisNaturais = data.banhosTermaisNaturais;
export const banhosPerigosos = data.banhosPerigosos;
export const checagemDiariaObrigatoria = data.checagemDiariaObrigatoria;
export const equipamentos = data.equipamentos;
export const pendenciasGerais = data.pendenciasGerais;
export const notasContexto = data.notasContexto;
export const descobertasCandidatas = data.descobertasCandidatas;
export const recursosMapa = data.recursosMapa;
export const reservaById = new Map(reservasAntecipadas.map((r) => [r.id, r]));

export const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Risco baixo",
  medium: "Risco médio",
  high: "Risco alto",
};

export function drivingLabel(minutes: number): string {
  if (!minutes) return "sem deslocamento";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

export function regionLabel(region: string): string {
  return region
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function triggerLabel(trigger: RiskTrigger): string {
  switch (trigger.kind) {
    case "wind":
      return `Vento acima de ${trigger.maxMs} m/s`;
    case "roadClosed":
      return `Estradas fechadas: ${trigger.roadCodes.join(", ")}`;
    case "ferry":
      return `Ferry ${trigger.route} cancelado`;
    case "visibility":
      return `Visibilidade abaixo de ${trigger.minMeters} m`;
    case "rainAccum":
      return `Chuva acumulada acima de ${trigger.minMm}mm em ${trigger.hours}h`;
    case "manual":
      return "Checagem manual";
    default:
      return "";
  }
}

export function dayByNumber(n: number): ResolvedDay | undefined {
  return dias.find((d) => d.n === n);
}
