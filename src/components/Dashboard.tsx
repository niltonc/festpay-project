import React from "react";
import { Party, ParticipantSummary } from "../types/database";
import {
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { EditableField } from "./EditableField";

interface DashboardProps {
  party: Party;
  summaries: ParticipantSummary[];
  installmentSchedule: number[];
  onUpdateParty: (updates: Partial<Party>) => void;
  readOnly?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  party,
  summaries,
  installmentSchedule,
  onUpdateParty,
  readOnly = false,
}) => {
  const participantCount = summaries.length;
  const individualTotal =
    participantCount > 0 ? party.total_amount / participantCount : 0;

  const totalCollected = summaries.reduce((acc, s) => acc + s.total_paid, 0);
  const totalPending = Math.max(0, party.total_amount - totalCollected);
  const progressPercent =
    party.total_amount > 0
      ? Math.min(100, (totalCollected / party.total_amount) * 100)
      : 0;

  const currentMonth = 1;
  const pendingThisMonthCount = summaries.filter((s) => {
    const payment = s.payments[currentMonth];
    return !payment || payment.amount_paid < (installmentSchedule[0] || 0);
  }).length;

  return (
    <div className="space-y-6">
      {pendingThisMonthCount > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="text-amber-600 h-5 w-5 flex-shrink-0" />
            <p className="text-sm text-amber-800 font-medium">
              <span className="font-bold">{pendingThisMonthCount} pessoas</span>{" "}
              ainda não quitaram a parcela do Mês {currentMonth}.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total de Participantes
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {participantCount}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              R$ {individualTotal.toFixed(2)} por pessoa
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Meta do Evento
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              R${" "}
              <EditableField
                value={party.total_amount}
                type="number"
                onSave={(value) =>
                  onUpdateParty({ total_amount: Number(value) })
                }
                displayFormatter={(value) =>
                  Number(value).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })
                }
                readOnly={readOnly}
              />
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              parcelas mensais:{" "}
              <EditableField
                value={party.number_of_months}
                type="number"
                onSave={(value) =>
                  onUpdateParty({ number_of_months: Number(value) })
                }
                readOnly={readOnly}
              />
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Arrecadado
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              R${" "}
              {totalCollected.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </h3>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              {progressPercent.toFixed(1)}% concluído
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Pendente
            </p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">
              R${" "}
              {totalPending.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              A arrecadar até a data
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Data do Evento
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              <EditableField
                value={party.event_date}
                type="date"
                onSave={(value) => onUpdateParty({ event_date: String(value) })}
                readOnly={readOnly}
                displayFormatter={(value) =>
                  new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR")
                }
              />
            </h3>
            <p className="text-xs text-slate-500 mt-1">Contagem regressiva</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Calendar className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-slate-700">
            Progresso Geral
          </span>
          <span className="text-sm font-bold text-slate-900">
            R$ {totalCollected.toFixed(2)} de R$ {party.total_amount.toFixed(2)}{" "}
            ({progressPercent.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
          <div
            className="bg-emerald-500 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
