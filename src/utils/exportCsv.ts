import { ParticipantSummary } from '../types/database';

export function exportToCSV(summaries: ParticipantSummary[], numberOfMonths: number, fileName: string = 'pagamentos_festa.csv') {
  const headers = [
    'Participante',
    'Telefone',
    'Total A Pagar',
    'Total Pago',
    'Saldo Restante',
    ...Array.from({ length: numberOfMonths }, (_, i) => `Mes ${i + 1}`),
    'Status Geral'
  ];

  const rows = summaries.map((s) => {
    const monthColumns = Array.from({ length: numberOfMonths }, (_, i) => {
      const p = s.payments[i + 1];
      return p ? p.amount_paid.toFixed(2) : '0.00';
    });

    return [
      `"${s.name}"`,
      `"${s.phone || ''}"`,
      s.total_due.toFixed(2),
      s.total_paid.toFixed(2),
      s.remaining_balance.toFixed(2),
      ...monthColumns,
      s.overall_status
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,﻿' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
