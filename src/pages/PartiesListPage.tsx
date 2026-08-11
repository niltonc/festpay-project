import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, PartyPopper, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useParties } from "../hooks/useParties";
import { signOutUser } from "../services/firebase/auth.service";

export const PartiesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { parties, loading, error, addParty, removeParty } = useParties();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [dueDay, setDueDay] = useState(10);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    try {
      const party = await addParty({
        name,
        event_date: eventDate,
        total_amount: totalAmount,
        number_of_months: numberOfMonths,
        start_date: startDate,
        due_day: dueDay,
      });
      setCreating(false);
      navigate(`/parties/${party.id}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao criar festa.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between bg-indigo-600 text-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center space-x-3">
            <PartyPopper className="h-9 w-9 text-indigo-200" />
            <div>
              <h1 className="text-2xl font-extrabold">Minhas Festas</h1>
              <p className="text-indigo-200 text-sm">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOutUser().then(() => navigate("/login"))}
            className="flex items-center space-x-2 text-indigo-100 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </header>

        <div className="flex justify-end">
          <button
            onClick={() => setCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Festa</span>
          </button>
        </div>

        {loading && <p className="text-slate-500">Carregando festas...</p>}
        {error && <p className="text-rose-600">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parties.map((party) => (
            <div
              key={party.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex justify-between items-center hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/parties/${party.id}`)}
            >
              <div>
                <h3 className="font-bold text-slate-800">{party.name}</h3>
                <p className="text-sm text-slate-500">
                  R${" "}
                  {party.total_amount.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  · {party.number_of_months} parcelas
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    confirm(
                      `Excluir a festa "${party.name}"? Esta ação não pode ser desfeita.`,
                    )
                  ) {
                    removeParty(party.id);
                  }
                }}
                className="p-2 text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {!loading && parties.length === 0 && (
            <p className="text-slate-500">Nenhuma festa cadastrada ainda.</p>
          )}
        </div>

        {creating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <h3 className="font-bold text-slate-800 text-lg">Nova Festa</h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <input
                  required
                  placeholder="Nome da festa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">
                      Data do evento
                    </label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">
                      Início das parcelas
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">
                      Valor total (R$)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      required
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">
                      Nº de parcelas
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={numberOfMonths}
                      onChange={(e) =>
                        setNumberOfMonths(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Dia venc.</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      required
                      value={dueDay}
                      onChange={(e) => setDueDay(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                {formError && (
                  <p className="text-sm text-rose-600">{formError}</p>
                )}
                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                  >
                    Criar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
