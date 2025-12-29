import React, { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

const API_BASE = 'http://localhost:5000/api';

const ReportExporter = ({ title = "Investment Tracker Report", data = null, includeCharts = false }) => {
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState(null);

  const generatePDF = async () => {
    try {
      setExporting(true);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      // Header
      pdf.setFontSize(18);
      pdf.setTextColor(79, 70, 229); // Indigo
      pdf.text(title, margin, yPos);
      yPos += 12;

      // Date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${new Date().toLocaleString('es-CO')}`, margin, yPos);
      yPos += 10;

      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      // Content
      if (data) {
        // Summary Section
        if (data.summary) {
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 0);
          pdf.text('Portfolio Summary', margin, yPos);
          yPos += 8;

          pdf.setFontSize(11);
          const summaryData = [
            [`Total Value:`, `$${data.summary.totalValue.toLocaleString('es-CO')}`],
            [`Total Invested:`, `$${data.summary.totalInvested.toLocaleString('es-CO')}`],
            [`Profit/Loss:`, `$${(data.summary.totalValue - data.summary.totalInvested).toLocaleString('es-CO')}`],
            [`Return %:`, `${(((data.summary.totalValue - data.summary.totalInvested) / data.summary.totalInvested) * 100).toFixed(2)}%`],
            [`Active Investments:`, `${data.summary.investmentCount}`],
          ];

          summaryData.forEach(([label, value]) => {
            pdf.text(`${label} ${value}`, margin + 5, yPos);
            yPos += 6;
          });

          yPos += 6;
        }

        // Investments Table
        if (data.investments && data.investments.length > 0) {
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 0);
          pdf.text('Detailed Investments', margin, yPos);
          yPos += 8;

          pdf.setFontSize(9);
          const tableData = data.investments.map(inv => [
            inv.name,
            inv.type,
            `$${inv.amountInvested.toFixed(2)}`,
            `$${inv.currentValue.toFixed(2)}`,
            `${(((inv.currentValue - inv.amountInvested) / inv.amountInvested) * 100).toFixed(2)}%`,
            inv.status,
          ]);

          pdf.autoTable({
            startY: yPos,
            head: [['Name', 'Type', 'Invested', 'Current', 'Return %', 'Status']],
            body: tableData,
            margin: { top: yPos },
            styles: { fontSize: 9 },
            headStyles: { fillColor: [79, 70, 229], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 250] },
          });

          yPos = pdf.internal.pageSize.getHeight() - margin;
        }

        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page 1 of 1`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
      setExporting(false);
      setExportType(null);
    } catch (error) {
      console.error('PDF export error:', error);
      setExporting(false);
      setExportType(null);
    }
  };

  const generateExcel = async () => {
    try {
      setExporting(true);

      const workbook = XLSX.utils.book_new();

      // Summary Sheet
      if (data && data.summary) {
        const summaryData = [
          ['Portfolio Summary'],
          [],
          ['Metric', 'Value'],
          ['Total Value', data.summary.totalValue],
          ['Total Invested', data.summary.totalInvested],
          ['Profit/Loss', data.summary.totalValue - data.summary.totalInvested],
          ['Return %', (((data.summary.totalValue - data.summary.totalInvested) / data.summary.totalInvested) * 100).toFixed(2)],
          ['Active Investments', data.summary.investmentCount],
        ];

        const ws = XLSX.utils.aoa_to_sheet(summaryData);
        ws['!cols'] = [{ wch: 25 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, ws, 'Summary');
      }

      // Investments Sheet
      if (data && data.investments && data.investments.length > 0) {
        const invData = [
          ['Name', 'Type', 'Amount Invested', 'Current Value', 'Return %', 'Status', 'Risk Level'],
          ...data.investments.map(inv => [
            inv.name,
            inv.type,
            inv.amountInvested,
            inv.currentValue,
            (((inv.currentValue - inv.amountInvested) / inv.amountInvested) * 100).toFixed(2),
            inv.status,
            inv.riskLevel,
          ]),
        ];

        const ws = XLSX.utils.aoa_to_sheet(invData);
        ws['!cols'] = [
          { wch: 25 },
          { wch: 15 },
          { wch: 18 },
          { wch: 18 },
          { wch: 12 },
          { wch: 12 },
          { wch: 12 },
        ];
        XLSX.utils.book_append_sheet(workbook, ws, 'Investments');
      }

      // Composition Sheets
      if (data && data.byType && data.byType.length > 0) {
        const typeData = [
          ['Type', 'Value'],
          ...data.byType.map(item => [item.name, item.value]),
        ];
        const ws = XLSX.utils.aoa_to_sheet(typeData);
        ws['!cols'] = [{ wch: 25 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(workbook, ws, 'By Type');
      }

      if (data && data.byRisk && data.byRisk.length > 0) {
        const riskData = [
          ['Risk Level', 'Value'],
          ...data.byRisk.map(item => [item.name, item.value]),
        ];
        const ws = XLSX.utils.aoa_to_sheet(riskData);
        ws['!cols'] = [{ wch: 25 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(workbook, ws, 'By Risk');
      }

      // Save Excel
      XLSX.writeFile(workbook, `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`);
      setExporting(false);
      setExportType(null);
    } catch (error) {
      console.error('Excel export error:', error);
      setExporting(false);
      setExportType(null);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={generatePDF}
        disabled={exporting && exportType === 'pdf'}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition font-medium"
      >
        <FileText size={18} />
        {exporting && exportType === 'pdf' ? 'Exporting...' : 'PDF'}
      </button>

      <button
        onClick={generateExcel}
        disabled={exporting && exportType === 'excel'}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition font-medium"
      >
        <Table size={18} />
        {exporting && exportType === 'excel' ? 'Exporting...' : 'Excel'}
      </button>
    </div>
  );
};

export default ReportExporter;
