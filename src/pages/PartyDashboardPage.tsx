import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PartyPopper, Link2 } from "lucide-react";
import { AddParticipantModal } from "../components/AddParticipantModal";
import { Dashboard } from "../components/Dashboard";
import { EditableField } from "../components/EditableField";
import { MonthlyMatrixTable } from "../components/MonthlyMatrixTable";
import { PaymentModal } from "../components/PaymentModal";
import { useParty } from "../hooks/useParty";
import { useParticipants } from "../hooks/useParticipants";
import {
  subscribeToPayments,
  upsertPayment,
} from "../services/firebase/payment.service";
import {
  calculateInstallmentSchedule,
  computeParticipantSummary,
} from "../utils/calculations";
import { exportToCSV } from "../utils/exportCsv";
import type { Payment, ParticipantSummary } from "../types/database";

export const PartyDashboardPage: React.FC = () => {
  const { partyId } = useParams<{ partyId: string }>();
  const navigate = useNavigate();
  const {
    party,
    loading: partyLoading,
    error: partyError,
    editParty,
  } = useParty(partyId);
  const {
    participants,
    loading: participantsLoading,
    addParticipant,
    removeParticipant,
  } = useParticipants(partyId);

  const [paymentsByParticipant, setPaymentsByParticipant] = useState<
    Record<string, Payment[]>
  >({});
  const [paymentModalData, setPaymentModalData] = useState<{
    participantId: string;
    monthNumber: number;
  } | null>(null);
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] =
    useState(false);

  // Real-time payments per participant; keep listeners in sync with the roster.
  useEffect(() => {
    if (!partyId) return;
    const unsubscribers = participants.map((participant) =>
      subscribeToPayments(partyId, participant.id, (payments) => {
        setPaymentsByParticipant((prev) => ({
          ...prev,
          [participant.id]: payments,
        }));
      }),
    );
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [partyId, participants]);

  const installmentSchedule = useMemo(() => {
    if (!party) return [];
    return calculateInstallmentSchedule(
      party.total_amount,
      participants.length,
      party.number_of_months,
    );
  }, [party, participants]);

  const summaries: ParticipantSummary[] = useMemo(() => {
    return participants.map((participant) =>
      computeParticipantSummary(
        participant,
        paymentsByParticipant[participant.id] || [],
        installmentSchedule,
      ),
    );
  }, [participants, paymentsByParticipant, installmentSchedule]);

  if (partyLoading || participantsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Carregando festa...
      </div>
    );
  }

  if (partyError || !party) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-500">
        <p>{partyError || "Festa não encontrada."}</p>
        <button
          onClick={() => navigate("/parties")}
          className="text-indigo-600 font-semibold"
        >
          Voltar
        </button>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/festa/${party.share_token}`;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-indigo-600 text-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/parties")}
              className="text-indigo-200 hover:text-white"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <PartyPopper className="h-10 w-10 text-indigo-200" />
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                <EditableField
                  value={party.name}
                  onSave={(value) => editParty({ name: String(value) })}
                  className="text-white"
                  inputClassName="text-2xl font-extrabold bg-white"
                />
              </h1>
              <p className="text-indigo-200 mt-1">
                Gestão Financeira Descomplicada - FestPay
              </p>
            </div>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="flex items-center space-x-2 bg-indigo-500/40 hover:bg-indigo-500/60 px-4 py-2 rounded-lg text-sm font-semibold self-start md:self-auto"
            title={shareUrl}
          >
            <Link2 className="h-4 w-4" />
            <span>Copiar link de compartilhamento</span>
          </button>
        </header>

        <Dashboard
          party={party}
          summaries={summaries}
          installmentSchedule={installmentSchedule}
          onUpdateParty={editParty}
        />

        <MonthlyMatrixTable
          summaries={summaries}
          numberOfMonths={party.number_of_months}
          installmentSchedule={installmentSchedule}
          isAdmin={true}
          onOpenPaymentModal={(participantId, monthNumber) =>
            setPaymentModalData({ participantId, monthNumber })
          }
          onOpenDetailModal={() => {}}
          onAddParticipant={() => setIsAddParticipantModalOpen(true)}
          onDeleteParticipant={(id) => removeParticipant(id)}
          onExportCSV={() => exportToCSV(summaries, party.number_of_months)}
        />

        <AddParticipantModal
          isOpen={isAddParticipantModalOpen}
          onClose={() => setIsAddParticipantModalOpen(false)}
          onAddParticipant={(data) => addParticipant(data)}
        />

        {paymentModalData && partyId && (
          <PaymentModal
            isOpen={true}
            onClose={() => setPaymentModalData(null)}
            participant={
              summaries.find((s) => s.id === paymentModalData.participantId) ||
              null
            }
            monthNumber={paymentModalData.monthNumber}
            expectedAmount={
              installmentSchedule[paymentModalData.monthNumber - 1] || 0
            }
            onSavePayment={(data) => {
              upsertPayment(partyId, data.participant_id, {
                month_number: data.month_number,
                amount_due: data.amount_due,
                amount_paid: data.amount_paid,
                payment_date: data.payment_date,
                notes: data.notes,
              }).catch((err) =>
                alert(err.message || "Erro ao salvar pagamento."),
              );
            }}
          />
        )}
      </div>
    </div>
  );
};
