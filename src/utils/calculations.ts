import { Payment, ParticipantSummary } from '../types/database';

export function calculateInstallmentSchedule(
  totalPartyAmount: number,
  participantCount: number,
  numberOfMonths: number
): number[] {
  if (participantCount <= 0 || numberOfMonths <= 0) return [];

  const individualTotal = Math.round((totalPartyAmount / participantCount) * 100) / 100;
  const baseInstallment = Math.floor((individualTotal / numberOfMonths) * 100) / 100;
  
  let remainderCents = Math.round((individualTotal - baseInstallment * numberOfMonths) * 100);
  
  const schedule: number[] = [];
  for (let i = 0; i < numberOfMonths; i++) {
    let installment = baseInstallment;
    if (remainderCents > 0) {
      installment = Math.round((installment + 0.01) * 100) / 100;
      remainderCents--;
    }
    schedule.push(installment);
  }
  return schedule;
}

export function getInstallmentStatus(
  amountDue: number,
  amountPaid: number
): 'Pago' | 'Parcial' | 'Pendente' | 'Adiantado' {
  if (amountPaid >= amountDue && amountDue > 0) return 'Pago';
  if (amountPaid > 0 && amountPaid < amountDue) return 'Parcial';
  if (amountPaid > amountDue) return 'Adiantado';
  return 'Pendente';
}

export function computeParticipantSummary(
  participant: { id: string; party_id: string; name: string; phone?: string },
  payments: Payment[],
  installmentSchedule: number[]
): ParticipantSummary {
  const totalDue = installmentSchedule.reduce((a, b) => a + b, 0);
  const totalPaid = payments.reduce((acc, p) => acc + (p.amount_paid || 0), 0);
  const remainingBalance = Math.max(0, totalDue - totalPaid);

  let overall_status: 'Pago' | 'Parcial' | 'Pendente' | 'Adiantado' = 'Pendente';
  if (totalPaid >= totalDue && totalDue > 0) {
    overall_status = totalPaid > totalDue ? 'Adiantado' : 'Pago';
  } else if (totalPaid > 0) {
    overall_status = 'Parcial';
  }

  const paymentsMap: Record<number, Payment> = {};
  payments.forEach((p) => {
    paymentsMap[p.month_number] = p;
  });

  return {
    ...participant,
    total_due: totalDue,
    total_paid: totalPaid,
    remaining_balance: remainingBalance,
    overall_status,
    payments: paymentsMap,
  };
}
