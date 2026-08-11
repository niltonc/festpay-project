import React, { useState } from "react";
import { ParticipantSummary, Payment } from "../types/database";
import { Search, Plus, Trash2, Eye, Download } from "lucide-react";

interface MonthlyMatrixTableProps {
  summaries: ParticipantSummary[];
  numberOfMonths: number;
  installmentSchedule: number[];
  isAdmin: boolean;
  onOpenPaymentModal: (participantId: string, monthNumber: number) => void;
  onOpenDetailModal: (summary: ParticipantSummary) => void;
  onAddParticipant: () => void;
  onDeleteParticipant: (id: string, name: string) => void;
  onExportCSV: () => void;
}

export const MonthlyMatrixTable: React.FC<MonthlyMatrixTableProps> = ({
  summaries,
  numberOfMonths,
  installmentSchedule,
  isAdmin,
  onOpenPaymentModal,
  onOpenDetailModal,
  onAddParticipant,
  onDeleteParticipant,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");

  const filteredSummaries = summaries.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "Todos" || item.overall_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "Pago":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Parcial":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Adiantado":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-rose-100 text-rose-800 border-rose-200";
    }
  };

  const getCellContent = (payment?: Payment, expectedAmount: number = 0) => {
    if (!payment || payment.amount_paid === 0) {
      return (
        <span className="text-slate-300 text-base" title="Pendente">
          ⬜
        </span>
      );
    }
    if (payment.amount_paid >= expectedAmount) {
      return <span className="text-emerald-600 font-bold">✅</span>;
    }
    return (
      <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-1.5 py-0.5 rounded">
        🟡 R$ {payment.amount_paid.toFixed(0)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 mt-6">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar amigo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Pago">Pago</option>
            <option value="Parcial">Parcial</option>
            <option value="Pendente">Pendente</option>
            <option value="Adiantado">Adiantado</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={onExportCSV}
            className="flex items-center space-x-1 px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
          {isAdmin && (
            <button
              onClick={onAddParticipant}
              className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Amigo</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg border-slate-200">
        <table className="w-full text-left text-sm text-slate-700 border-collapse min-w-[700px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="p-3">Participante</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-right">Pago</th>
              {Array.from({ length: numberOfMonths }).map((_, i) => (
                <th key={i} className="p-3 text-center min-w-[65px]">
                  Mês {i + 1}
                </th>
              ))}
              <th className="p-3 text-right">Saldo</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSummaries.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition">
                <td className="p-3 font-medium text-slate-900 cursor-pointer">
                  {item.name}
                </td>
                <td className="p-3 text-right">
                  R$ {item.total_due.toFixed(2)}
                </td>
                <td className="p-3 text-right font-bold text-emerald-600">
                  R$ {item.total_paid.toFixed(2)}
                </td>
                {Array.from({ length: numberOfMonths }).map((_, monthIdx) => {
                  const monthNum = monthIdx + 1;
                  return (
                    <td
                      key={monthNum}
                      onClick={() =>
                        isAdmin && onOpenPaymentModal(item.id, monthNum)
                      }
                      className={`p-3 text-center select-none ${isAdmin ? "cursor-pointer hover:bg-slate-100" : ""}`}
                    >
                      {getCellContent(
                        item.payments[monthNum],
                        installmentSchedule[monthIdx] || 0,
                      )}
                    </td>
                  );
                })}
                <td className="p-3 text-right font-semibold text-rose-600">
                  R$ {item.remaining_balance.toFixed(2)}
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(item.overall_status)}`}
                  >
                    {item.overall_status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center items-center space-x-2">
                    {isAdmin && (
                      <button
                        onClick={() => onDeleteParticipant(item.id, item.name)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
