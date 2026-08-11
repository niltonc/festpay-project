import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Copy, Check, PartyPopper } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getPartyByShareToken } from "../services/firebase/party.service";
import { subscribeToParticipants } from "../services/firebase/participant.service";
import { subscribeToPayments } from "../services/firebase/payment.service";
import { Dashboard } from "../components/Dashboard";
import { MonthlyMatrixTable } from "../components/MonthlyMatrixTable";
import {
  calculateInstallmentSchedule,
  computeParticipantSummary,
} from "../utils/calculations";
import { buildPixPayload } from "../utils/pix";
import { exportToCSV } from "../utils/exportCsv";
import type {
  Party,
  Participant,
  Payment,
  PublicParty,
} from "../types/database";

// Public, read-only page reachable via /festa/{share_token}. Shows the same
// dashboard/matrix the admin sees, but with no editing affordances.
export const PublicPartyPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [party, setParty] = useState<PublicParty | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [paymentsByParticipant, setPaymentsByParticipant] = useState<
    Record<string, Payment[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    if (!party) return;
    return subscribeToParticipants(party.party_id, setParticipants, (err) =>
      setError(err.message),
    );
  }, [party]);

  useEffect(() => {
    if (!party) return;
    const unsubscribers = participants.map((participant) =>
      subscribeToPayments(party.party_id, participant.id, (payments) => {
        setPaymentsByParticipant((prev) => ({
          ...prev,
          [participant.id]: payments,
        }));
      }),
    );
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [party, participants]);

  const installmentSchedule = useMemo(() => {
    if (!party) return [];
    return calculateInstallmentSchedule(
      party.total_amount,
      participants.length,
      party.number_of_months,
    );
  }, [party, participants]);

  const summaries = useMemo(() => {
    return participants.map((participant) =>
      computeParticipantSummary(
        participant,
        paymentsByParticipant[participant.id] || [],
        installmentSchedule,
      ),
    );
  }, [participants, paymentsByParticipant, installmentSchedule]);

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

  // Dashboard/MonthlyMatrixTable expect a full Party; this public page never
  // writes, so the missing admin-only fields (admin_id) are never accessed.
  const partyForDisplay = party as unknown as Party;

  const pixPayload = party.pix_key
    ? buildPixPayload(party.pix_key, party.name)
    : null;

  function handleCopyPix() {
    if (!party?.pix_key) return;
    navigator.clipboard.writeText(party.pix_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center space-x-3 bg-indigo-600 text-white p-6 rounded-2xl shadow-md">
          <PartyPopper className="h-10 w-10 text-indigo-200" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {party.name}
            </h1>
            <p className="text-indigo-200 mt-1">
              Consulta pública - somente leitura
            </p>
          </div>
        </header>

        {party.pix_key && pixPayload && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-center">
            <QRCodeSVG value={pixPayload} size={160} />
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pagar via Pix
              </p>
              <p className="text-sm text-slate-700 break-all">
                {party.pix_key}
              </p>
              <button
                onClick={handleCopyPix}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>{copied ? "Chave copiada!" : "Copiar chave Pix"}</span>
              </button>
            </div>
          </div>
        )}

        <Dashboard
          party={partyForDisplay}
          summaries={summaries}
          installmentSchedule={installmentSchedule}
          onUpdateParty={() => {}}
          readOnly
        />

        <MonthlyMatrixTable
          summaries={summaries}
          numberOfMonths={party.number_of_months}
          installmentSchedule={installmentSchedule}
          isAdmin={false}
          onOpenPaymentModal={() => {}}
          onOpenDetailModal={() => {}}
          onAddParticipant={() => {}}
          onDeleteParticipant={() => {}}
          onExportCSV={() => exportToCSV(summaries, party.number_of_months)}
        />
      </div>
    </div>
  );
};
