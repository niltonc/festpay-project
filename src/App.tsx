import React, { useState, useMemo } from "react";
import { Dashboard } from "./components/Dashboard";
import { MonthlyMatrixTable } from "./components/MonthlyMatrixTable";
import { PaymentModal } from "./components/PaymentModal";
import {
  calculateInstallmentSchedule,
  computeParticipantSummary,
} from "./utils/calculations";
import { exportToCSV } from "./utils/exportCsv";
import { Party, Participant, Payment } from "./types/database";
import { PartyPopper } from "lucide-react";

// DADOS MOCKADOS INICIAIS
const initialParty: Party = {
  id: "1",
  admin_id: "admin",
  name: "Festa de Final de Ano - Turma 2026",
  event_date: "2026-12-20",
  total_amount: 1617,
  number_of_months: 4,
  start_date: "2026-09-15",
  due_day: 10,
  share_token: "123",
};

const initialParticipants: Participant[] = [
  { id: "p1", party_id: "1", name: "João Silva", phone: "11999999999" },
  { id: "p2", party_id: "1", name: "Maria Oliveira", phone: "11888888888" },
  { id: "p3", party_id: "1", name: "Pedro Santos" },
];

const initialPayments: Payment[] = [
  {
    id: "pm1",
    participant_id: "p1",
    month_number: 1,
    amount_due: 1000,
    amount_paid: 1000,
    status: "Pago",
  },
  {
    id: "pm2",
    participant_id: "p2",
    month_number: 1,
    amount_due: 1000,
    amount_paid: 1000,
    status: "Pago",
  },
  {
    id: "pm3",
    participant_id: "p2",
    month_number: 2,
    amount_due: 1000,
    amount_paid: 1000,
    status: "Pago",
  },
  {
    id: "pm4",
    participant_id: "p3",
    month_number: 1,
    amount_due: 1000,
    amount_paid: 500,
    status: "Parcial",
  },
];

function App() {
  const [party] = useState<Party>(initialParty);
  const [participants, setParticipants] =
    useState<Participant[]>(initialParticipants);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);

  const [paymentModalData, setPaymentModalData] = useState<{
    participantId: string;
    monthNumber: number;
  } | null>(null);

  const installmentSchedule = useMemo(() => {
    return calculateInstallmentSchedule(
      party.total_amount,
      participants.length,
      party.number_of_months,
    );
  }, [party, participants]);

  const summaries = useMemo(() => {
    return participants.map((p) => {
      const pPayments = payments.filter(
        (payment) => payment.participant_id === p.id,
      );
      return computeParticipantSummary(p, pPayments, installmentSchedule);
    });
  }, [participants, payments, installmentSchedule]);

  const handleSavePayment = (data: Omit<Payment, "id" | "status">) => {
    setPayments((prev) => {
      const existing = prev.find(
        (p) =>
          p.participant_id === data.participant_id &&
          p.month_number === data.month_number,
      );
      if (existing) {
        return prev.map((p) =>
          p.id === existing.id ? { ...p, ...data, status: "Pago" } : p,
        );
      }
      return [
        ...prev,
        { ...data, id: Math.random().toString(), status: "Pago" } as Payment,
      ];
    });
  };

  const handleAddParticipant = () => {
    const name = prompt("Nome do novo amigo:");
    if (name) {
      setParticipants((prev) => [
        ...prev,
        { id: Math.random().toString(), party_id: party.id, name },
      ]);
    }
  };

  const handleDeleteParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setPayments((prev) => prev.filter((p) => p.participant_id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center space-x-3 mb-8 bg-indigo-600 text-white p-6 rounded-2xl shadow-md">
          <PartyPopper className="h-10 w-10 text-indigo-200" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {party.name}
            </h1>
            <p className="text-indigo-200 mt-1">
              Gestão Financeira Descomplicada - FestPay
            </p>
          </div>
        </header>

        <Dashboard
          party={party}
          summaries={summaries}
          installmentSchedule={installmentSchedule}
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
          onAddParticipant={handleAddParticipant}
          onDeleteParticipant={handleDeleteParticipant}
          onExportCSV={() => exportToCSV(summaries, party.number_of_months)}
        />

        {paymentModalData && (
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
            onSavePayment={handleSavePayment}
          />
        )}
      </div>
    </div>
  );
}

export default App;
