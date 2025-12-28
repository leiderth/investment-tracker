import * as XLSX from 'xlsx';

export const exportToExcel = (investments) => {
  // Preparar datos
  const data = investments.map(inv => ({
    'Tipo': inv.type,
    'Plataforma': inv.platform,
    'Inversión Inicial': inv.initialAmount,
    'Valor Actual': inv.currentAmount,
    'Ganancia/Pérdida': inv.profitLoss,
    'Rendimiento (%)': inv.actualReturn,
    'Estado': inv.status === 'active' ? 'Activa' : 'Cerrada',
    'Fecha Inicio': new Date(inv.start_date).toLocaleDateString('es-CO'),
    'Notas': inv.notes || ''
  }));

  // Crear libro
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Agregar hoja
  XLSX.utils.book_append_sheet(wb, ws, 'Inversiones');

  // Descargar
  const fecha = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `inversiones_${fecha}.xlsx`);
};