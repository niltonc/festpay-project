import { getParty } from "./party.service";
import { getParticipants } from "./participant.service";
import { getPayments } from "./payment.service";
import { getExpenses } from "./expense.service";
import {
  calculateInstallmentSchedule,
  computeParticipantSummary,
} from "../../utils/calculations";
import type { PartySummary } from "../../types/database";
import { wrapError } from "./errors";

// Computes the party financial summary on the fly from existing
// participants/payments/expenses documents (no duplicated aggregate collection).
export async function getPartySummary(partyId: string): Promise<PartySummary> {
  try {
    const party = await getParty(partyId);
    if (!party) throw new Error("Festa não encontrada.");

    const participants = await getParticipants(partyId);
    const schedule = calculateInstallmentSchedule(
      party.total_amount,
      participants.length,
      party.number_of_months,
    );

    const summaries = await Promise.all(
      participants.map(async (participant) => {
        const payments = await getPayments(partyId, participant.id);
        return computeParticipantSummary(participant, payments, schedule);
      }),
    );

    const expenses = await getExpenses(partyId);

    const total_collected = summaries.reduce((acc, s) => acc + s.total_paid, 0);
    const total_pending = Math.max(0, party.total_amount - total_collected);
    const total_expenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const expenses_paid = expenses
      .filter((e) => e.is_paid)
      .reduce((acc, e) => acc + e.amount, 0);
    const expenses_pending = total_expenses - expenses_paid;

    return {
      total_amount: party.total_amount,
      total_collected,
      total_pending,
      total_expenses,
      expenses_paid,
      expenses_pending,
      balance: total_collected - expenses_paid,
      participant_count: participants.length,
      participants_paid: summaries.filter((s) => s.overall_status === "Pago")
        .length,
      participants_partial: summaries.filter(
        (s) => s.overall_status === "Parcial",
      ).length,
      participants_pending: summaries.filter(
        (s) => s.overall_status === "Pendente",
      ).length,
    };
  } catch (error) {
    throw wrapError(error);
  }
}
