import React, { useState, useEffect } from "react";
import { ParticipantSummary } from "../types/database";
import { X, CheckCircle } from "lucide-react";

interface PaymentModalProps {
  participant: ParticipantSummary | null;
  monthNumber: number;
  expectedAmount: number;
  isOpen: boolean;
  onClose: () => void;
  onSavePayment: (data: {
    participant_id: string;
    month_number: number;
    amount_due: number;
    amount_paid: number;
    payment_date: string;
    notes: string;
  }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  participant,
  monthNumber,
  expectedAmount,
  isOpen,
  onClose,
  onSavePayment,
}) => {
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (participant && isOpen) {
      const currentPayment = participant.payments[monthNumber];
      setAmountPaid(
        currentPayment ? currentPayment.amount_paid : expectedAmount,
      );
      setPaymentDate(
        currentPayment?.payment_date || new Date().toISOString().split("T")[0],
      );
      setNotes(currentPayment?.notes || "");
    }
  }, [participant, monthNumber, expectedAmount, isOpen]);

  if (!isOpen || !participant) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePayment({
      participant_id: participant.id,
      month_number: monthNumber,
      amount_due: expectedAmount,
      amount_paid: Number(amountPaid),
      payment_date: paymentDate,
      notes,
    });
    onClose();
  };

  const remainingForMonth = Math.max(0, expectedAmount - amountPaid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">
            Registrar Pagamento - Mês {monthNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase">
              Participante
            </label>
            <p className="text-base font-bold text-slate-800">
              {participant.name}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-sm">
            <div>
              <span className="text-slate-500 text-xs">Valor Previsto:</span>
              <p className="font-semibold text-slate-800">
                R$ {expectedAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <span className="text-slate-500 text-xs">
                Restante na Parcela:
              </span>
              <p
                className={`font-semibold ${remainingForMonth > 0 ? "text-amber-600" : "text-emerald-600"}`}
              >
                R$ {remainingForMonth.toFixed(2)}
              </p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Valor Pago (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={amountPaid}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Data
            </label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Observação
            </label>
            <input
              type="text"
              placeholder="Ex: Pago via Pix"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center space-x-1"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Salvar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
