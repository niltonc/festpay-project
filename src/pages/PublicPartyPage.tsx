import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PartyPopper } from "lucide-react";
import { getPartyByShareToken } from "../services/firebase/party.service";
import type { PublicParty } from "../types/database";

// Public, read-only page reachable via /festa/{share_token}. Only shows
// non-sensitive party info (no admin_id, no participant/payment data).
export const PublicPartyPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [party, setParty] = useState<PublicParty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareToken) return;
    setLoading(true);
    getPartyByShareToken(shareToken)
      .then((data) => {
        setParty(data);
        if (!data) setError("Link inválido ou festa não encontrada.");
      })
      .catch((err) => setError(err.message || "Erro ao carregar a festa."))
      .finally(() => setLoading(false));
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Carregando...
      </div>
    );
  }

  if (error || !party) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        {error || "Festa não encontrada."}
      </div>
    );
  }

  const perInstallment =
    party.number_of_months > 0
      ? party.total_amount / party.number_of_months
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 text-white p-6 flex items-center space-x-3">
          <PartyPopper className="h-8 w-8 text-indigo-200" />
          <h1 className="text-xl font-extrabold">{party.name}</h1>
        </div>
        <div className="p-6 space-y-3 text-sm text-slate-700">
          <p>
            <span className="font-semibold">Data do evento:</span>{" "}
            {new Date(`${party.event_date}T00:00:00`).toLocaleDateString(
              "pt-BR",
            )}
          </p>
          <p>
            <span className="font-semibold">Valor total:</span> R${" "}
            {party.total_amount.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p>
            <span className="font-semibold">Parcelas:</span>{" "}
            {party.number_of_months}x de R${" "}
            {perInstallment.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
