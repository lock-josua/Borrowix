<?php

namespace App\Exports;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ReportExport
{
    protected array $transactions;

    protected array $topEquipment;

    protected array $topBorrowers;

    protected array $summary;

    protected string $from;

    protected string $to;

    public function __construct(array $transactions, array $topEquipment, array $topBorrowers, array $summary, string $from, string $to)
    {
        $this->transactions = $transactions;
        $this->topEquipment = $topEquipment;
        $this->topBorrowers = $topBorrowers;
        $this->summary = $summary;
        $this->from = $from;
        $this->to = $to;
    }

    public function spreadsheet(): Spreadsheet
    {
        $spreadsheet = new Spreadsheet;

        $this->buildSummarySheet($spreadsheet);
        $this->buildTransactionsSheet($spreadsheet);
        $this->buildTopEquipmentSheet($spreadsheet);
        $this->buildTopBorrowersSheet($spreadsheet);

        // Remove default empty sheet
        $defaultSheet = $spreadsheet->getSheetByName('Worksheet');
        if ($defaultSheet) {
            $spreadsheet->removeSheetByIndex(0);
        }

        $spreadsheet->setActiveSheetIndexByName('Summary');

        return $spreadsheet;
    }

    protected function buildSummarySheet(Spreadsheet $spreadsheet): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Summary');

        $sheet->setCellValue('A1', 'Report Period');
        $sheet->setCellValue('B1', $this->from.' to '.$this->to);

        $sheet->setCellValue('A3', 'Metric');
        $sheet->setCellValue('B3', 'Count');

        $metrics = [
            ['Total Transactions', $this->summary['total_transactions']],
            ['Returned', $this->summary['returned']],
            ['Active', $this->summary['active']],
            ['Overdue', $this->summary['overdue']],
        ];

        $row = 4;
        foreach ($metrics as [$metric, $count]) {
            $sheet->setCellValue('A'.$row, $metric);
            $sheet->setCellValue('B'.$row, $count);
            $row++;
        }

        $this->styleHeader($sheet, 'A3:B3');
        $sheet->getColumnDimension('A')->setWidth(22);
        $sheet->getColumnDimension('B')->setWidth(12);
    }

    protected function buildTransactionsSheet(Spreadsheet $spreadsheet): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Transactions');

        $headers = ['Borrower', 'Equipment', 'Issued At', 'Due Date', 'Returned At', 'Status', 'Fine'];
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col.'1', $header);
            $col++;
        }

        $row = 2;
        foreach ($this->transactions as $t) {
            $sheet->setCellValue('A'.$row, $t['borrower']['name'] ?? '—');
            $sheet->setCellValue('B'.$row, $t['equipment']['name'] ?? '—');
            $sheet->setCellValue('C'.$row, $t['issued_at']);
            $sheet->setCellValue('D'.$row, $t['due_date'] ?? '—');
            $sheet->setCellValue('E'.$row, $t['returned_at'] ?? '—');
            $sheet->setCellValue('F'.$row, $t['status']);
            $sheet->setCellValue('G'.$row, ($t['fine_amount'] ?? 0) > 0 ? '₱'.$t['fine_amount'] : '—');
            $row++;
        }

        $this->styleHeader($sheet, 'A1:G1');
        $sheet->getColumnDimension('A')->setWidth(25);
        $sheet->getColumnDimension('B')->setWidth(25);
        $sheet->getColumnDimension('C')->setWidth(22);
        $sheet->getColumnDimension('D')->setWidth(15);
        $sheet->getColumnDimension('E')->setWidth(15);
        $sheet->getColumnDimension('F')->setWidth(12);
        $sheet->getColumnDimension('G')->setWidth(12);
    }

    protected function buildTopEquipmentSheet(Spreadsheet $spreadsheet): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Top Equipment');

        $headers = ['#', 'Equipment', 'Times Borrowed'];
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col.'1', $header);
            $col++;
        }

        $row = 2;
        foreach ($this->topEquipment as $index => $e) {
            $sheet->setCellValue('A'.$row, $index + 1);
            $sheet->setCellValue('B'.$row, $e['equipment']['name'] ?? '—');
            $sheet->setCellValue('C'.$row, $e['total']);
            $row++;
        }

        $this->styleHeader($sheet, 'A1:C1');
        $sheet->getColumnDimension('A')->setWidth(6);
        $sheet->getColumnDimension('B')->setWidth(35);
        $sheet->getColumnDimension('C')->setWidth(16);
    }

    protected function buildTopBorrowersSheet(Spreadsheet $spreadsheet): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Top Borrowers');

        $headers = ['#', 'Name', 'Email', 'Times Borrowed'];
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col.'1', $header);
            $col++;
        }

        $row = 2;
        foreach ($this->topBorrowers as $index => $b) {
            $sheet->setCellValue('A'.$row, $index + 1);
            $sheet->setCellValue('B'.$row, $b['borrower']['name'] ?? '—');
            $sheet->setCellValue('C'.$row, $b['borrower']['email'] ?? '—');
            $sheet->setCellValue('D'.$row, $b['total']);
            $row++;
        }

        $this->styleHeader($sheet, 'A1:D1');
        $sheet->getColumnDimension('A')->setWidth(6);
        $sheet->getColumnDimension('B')->setWidth(25);
        $sheet->getColumnDimension('C')->setWidth(30);
        $sheet->getColumnDimension('D')->setWidth(16);
    }

    protected function styleHeader($sheet, string $range): void
    {
        $style = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4F46E5']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']],
            ],
        ];

        $sheet->getStyle($range)->applyFromArray($style);
        $sheet->setAutoFilter($range);
    }
}
