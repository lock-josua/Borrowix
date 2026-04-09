<?php

namespace App\Exports;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

class ReportExport
{
    protected const BRAND_COLOR = '4F46E5';

    protected const BRAND_COLOR_DARK = '3730A3';

    protected const HEADER_BG = 'F8FAFC';

    protected const BORDER_COLOR = 'E2E8F0';

    protected const ZEBRA_BG = 'F8FAFC';

    protected const STATUS_ACTIVE = '3B82F6';

    protected const STATUS_RETURNED = '22C55E';

    protected const STATUS_OVERDUE = 'EF4444';

    protected const METRIC_TOTAL_BG = 'F1F5F9';

    protected const METRIC_RETURNED_BG = 'F0FDF4';

    protected const METRIC_ACTIVE_BG = 'EFF6FF';

    protected const METRIC_OVERDUE_BG = 'FEF2F2';

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

        // Document properties
        $props = $spreadsheet->getProperties();
        $props->setCreator('HUWAM');
        $props->setTitle('Equipment Borrowing Report');
        $props->setDescription('Report generated from '.$this->from.' to '.$this->to);

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
        $sheet->getTabColor()->setRGB(self::BRAND_COLOR);

        // Brand header block
        $sheet->mergeCells('A1:D1');
        $sheet->setCellValue('A1', 'Equipment Borrowing Report');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 18, 'color' => ['rgb' => self::BRAND_COLOR_DARK]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        ]);

        $sheet->mergeCells('A2:D2');
        $sheet->setCellValue('A2', 'Period: '.$this->from.' to '.$this->to);
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['size' => 11, 'color' => ['rgb' => '64748B'], 'italic' => true],
        ]);

        // Separator line
        $sheet->getStyle('A3:D3')->applyFromArray([
            'borders' => ['bottom' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => self::BRAND_COLOR]]],
        ]);

        // Metrics header
        $sheet->setCellValue('A5', 'Metric');
        $sheet->setCellValue('B5', 'Count');
        $sheet->setCellValue('C5', '');
        $this->styleHeaderRow($sheet, 'A5:B5');

        $metrics = [
            ['Total Transactions', $this->summary['total_transactions'], self::METRIC_TOTAL_BG, '64748B'],
            ['Returned', $this->summary['returned'], self::METRIC_RETURNED_BG, self::STATUS_RETURNED],
            ['Active', $this->summary['active'], self::METRIC_ACTIVE_BG, self::STATUS_ACTIVE],
            ['Overdue', $this->summary['overdue'], self::METRIC_OVERDUE_BG, self::STATUS_OVERDUE],
        ];

        $row = 6;
        foreach ($metrics as [$label, $count, $bgColor, $accentColor]) {
            $sheet->mergeCells("A{$row}:A{$row}");
            $sheet->setCellValue("A{$row}", $label);
            $sheet->setCellValue("B{$row}", $count);

            // Accent bar on left
            $sheet->getStyle("A{$row}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $bgColor]],
                'borders' => [
                    'left' => ['borderStyle' => Border::BORDER_THICK, 'color' => ['rgb' => $accentColor]],
                    'top' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                    'bottom' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                    'right' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                ],
                'font' => ['size' => 11, 'color' => ['rgb' => '334155']],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            $sheet->getStyle("B{$row}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $bgColor]],
                'borders' => [
                    'top' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                    'bottom' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                    'right' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                ],
                'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => $accentColor]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ]);

            $sheet->getRowDimension($row)->setRowHeight(32);
            $row++;
        }

        $sheet->getColumnDimension('A')->setWidth(24);
        $sheet->getColumnDimension('B')->setWidth(14);

        // Print setup
        $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_PORTRAIT);
        $sheet->getPageSetup()->setFitToPage(true);
        $sheet->getPageSetup()->setFitToWidth(1);
        $sheet->getPageSetup()->setFitToHeight(1);
        $sheet->setShowGridlines(false);
    }

    protected function buildTransactionsSheet(Spreadsheet $spreadsheet): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Transactions');
        $sheet->getTabColor()->setRGB(self::STATUS_ACTIVE);

        // Title row
        $sheet->mergeCells('A1:G1');
        $sheet->setCellValue('A1', 'Transaction Log');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => self::BRAND_COLOR_DARK]],
        ]);

        $sheet->mergeCells('A2:G2');
        $sheet->setCellValue('A2', 'Period: '.$this->from.' to '.$this->to);
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['size' => 10, 'color' => ['rgb' => '64748B'], 'italic' => true],
        ]);

        // Separator
        $sheet->getStyle('A3:G3')->applyFromArray([
            'borders' => ['bottom' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => self::BRAND_COLOR]]],
        ]);

        // Data headers
        $headers = ['Borrower', 'Equipment', 'Issued At', 'Due Date', 'Returned At', 'Status', 'Fine'];
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col.'4', $header);
            $col++;
        }

        $this->styleHeaderRow($sheet, 'A4:G4');
        $sheet->freezePane('A5');

        $row = 5;
        foreach ($this->transactions as $t) {
            $this->setCellWithStyle($sheet, 'A'.$row, $t['borrower']['name'] ?? '—');
            $this->setCellWithStyle($sheet, 'B'.$row, $t['equipment']['name'] ?? '—');
            $this->setCellWithStyle($sheet, 'C'.$row, $t['issued_at']);
            $this->setCellWithStyle($sheet, 'D'.$row, $t['due_date'] ?? '—');
            $this->setCellWithStyle($sheet, 'E'.$row, $t['returned_at'] ?? '—');

            // Status with color
            $status = $t['status'] ?? '—';
            $statusColor = match ($status) {
                'active' => self::STATUS_ACTIVE,
                'returned' => self::STATUS_RETURNED,
                'overdue' => self::STATUS_OVERDUE,
                default => '64748B',
            };
            $sheet->setCellValue('F'.$row, ucfirst($status));
            $sheet->getStyle('F'.$row)->applyFromArray([
                'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $statusColor]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);

            // Fine amount
            $fine = ($t['fine_amount'] ?? 0) > 0 ? '₱'.number_format($t['fine_amount'], 2) : '—';
            $fineColor = ($t['fine_amount'] ?? 0) > 0 ? self::STATUS_OVERDUE : '64748B';
            $sheet->setCellValue('G'.$row, $fine);
            $sheet->getStyle('G'.$row)->applyFromArray([
                'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $fineColor]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);

            // Zebra striping + borders
            $bgColor = ($row % 2 === 0) ? self::ZEBRA_BG : 'FFFFFF';
            foreach (range('A', 'G') as $c) {
                $sheet->getStyle($c.$row)->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $bgColor]],
                    'borders' => [
                        'top' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                        'bottom' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                        'left' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                        'right' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                    ],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                    'font' => ['size' => 10],
                ]);
            }

            $row++;
        }

        // Column widths
        $sheet->getColumnDimension('A')->setWidth(28);
        $sheet->getColumnDimension('B')->setWidth(28);
        $sheet->getColumnDimension('C')->setWidth(22);
        $sheet->getColumnDimension('D')->setWidth(14);
        $sheet->getColumnDimension('E')->setWidth(14);
        $sheet->getColumnDimension('F')->setWidth(12);
        $sheet->getColumnDimension('G')->setWidth(14);

        // Print setup
        $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
        $sheet->getPageSetup()->setFitToPage(true);
        $sheet->getPageSetup()->setFitToWidth(1);
        $sheet->getPageSetup()->setFitToHeight(0);
        $sheet->setShowGridlines(false);
    }

    protected function buildTopEquipmentSheet(Spreadsheet $spreadsheet): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Top Equipment');
        $sheet->getTabColor()->setRGB('F59E0B');

        // Title
        $sheet->mergeCells('A1:C1');
        $sheet->setCellValue('A1', 'Most Borrowed Equipment');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => self::BRAND_COLOR_DARK]],
        ]);

        $sheet->mergeCells('A2:C2');
        $sheet->setCellValue('A2', 'Period: '.$this->from.' to '.$this->to);
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['size' => 10, 'color' => ['rgb' => '64748B'], 'italic' => true],
        ]);

        $sheet->getStyle('A3:C3')->applyFromArray([
            'borders' => ['bottom' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => self::BRAND_COLOR]]],
        ]);

        // Headers
        $headers = ['#', 'Equipment', 'Times Borrowed'];
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col.'4', $header);
            $col++;
        }

        $this->styleHeaderRow($sheet, 'A4:C4');
        $sheet->freezePane('A5');

        $row = 5;
        foreach ($this->topEquipment as $index => $e) {
            // Rank with badge styling
            $rank = $index + 1;
            $rankColor = match ($rank) {
                1 => 'F59E0B',
                2 => '94A3B8',
                3 => 'CD7F32',
                default => '64748B',
            };

            $sheet->setCellValue('A'.$row, $rank);
            $sheet->getStyle('A'.$row)->applyFromArray([
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rankColor]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ]);

            $this->setCellWithStyle($sheet, 'B'.$row, $e['equipment']['name'] ?? '—');
            $sheet->setCellValue('C'.$row, $e['total']);
            $sheet->getStyle('C'.$row)->applyFromArray([
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => self::BRAND_COLOR_DARK]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);

            $bgColor = ($row % 2 === 0) ? self::ZEBRA_BG : 'FFFFFF';
            foreach (['A', 'B', 'C'] as $c) {
                $sheet->getStyle($c.$row)->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $bgColor]],
                    'borders' => [
                        'top' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                        'bottom' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                        'left' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                        'right' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                    ],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                    'font' => ['size' => 11],
                ]);
            }

            $sheet->getRowDimension($row)->setRowHeight(28);
            $row++;
        }

        $sheet->getColumnDimension('A')->setWidth(8);
        $sheet->getColumnDimension('B')->setWidth(40);
        $sheet->getColumnDimension('C')->setWidth(18);

        $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_PORTRAIT);
        $sheet->getPageSetup()->setFitToPage(true);
        $sheet->getPageSetup()->setFitToWidth(1);
        $sheet->getPageSetup()->setFitToHeight(1);
        $sheet->setShowGridlines(false);
    }

    protected function buildTopBorrowersSheet(Spreadsheet $spreadsheet): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Top Borrowers');
        $sheet->getTabColor()->setRGB('8B5CF6');

        // Title
        $sheet->mergeCells('A1:D1');
        $sheet->setCellValue('A1', 'Most Active Borrowers');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => self::BRAND_COLOR_DARK]],
        ]);

        $sheet->mergeCells('A2:D2');
        $sheet->setCellValue('A2', 'Period: '.$this->from.' to '.$this->to);
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['size' => 10, 'color' => ['rgb' => '64748B'], 'italic' => true],
        ]);

        $sheet->getStyle('A3:D3')->applyFromArray([
            'borders' => ['bottom' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => self::BRAND_COLOR]]],
        ]);

        // Headers
        $headers = ['#', 'Name', 'Email', 'Times Borrowed'];
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col.'4', $header);
            $col++;
        }

        $this->styleHeaderRow($sheet, 'A4:D4');
        $sheet->freezePane('A5');

        $row = 5;
        foreach ($this->topBorrowers as $index => $b) {
            $rank = $index + 1;
            $rankColor = match ($rank) {
                1 => 'F59E0B',
                2 => '94A3B8',
                3 => 'CD7F32',
                default => '64748B',
            };

            $sheet->setCellValue('A'.$row, $rank);
            $sheet->getStyle('A'.$row)->applyFromArray([
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rankColor]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ]);

            $this->setCellWithStyle($sheet, 'B'.$row, $b['borrower']['name'] ?? '—');
            $this->setCellWithStyle($sheet, 'C'.$row, $b['borrower']['email'] ?? '—');

            $sheet->setCellValue('D'.$row, $b['total']);
            $sheet->getStyle('D'.$row)->applyFromArray([
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => self::BRAND_COLOR_DARK]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);

            $bgColor = ($row % 2 === 0) ? self::ZEBRA_BG : 'FFFFFF';
            foreach (['A', 'B', 'C', 'D'] as $c) {
                $sheet->getStyle($c.$row)->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $bgColor]],
                    'borders' => [
                        'top' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                        'bottom' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                        'left' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                        'right' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
                    ],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                    'font' => ['size' => 11],
                ]);
            }

            $sheet->getRowDimension($row)->setRowHeight(28);
            $row++;
        }

        $sheet->getColumnDimension('A')->setWidth(8);
        $sheet->getColumnDimension('B')->setWidth(28);
        $sheet->getColumnDimension('C')->setWidth(35);
        $sheet->getColumnDimension('D')->setWidth(18);

        $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_PORTRAIT);
        $sheet->getPageSetup()->setFitToPage(true);
        $sheet->getPageSetup()->setFitToWidth(1);
        $sheet->getPageSetup()->setFitToHeight(1);
        $sheet->setShowGridlines(false);
    }

    protected function styleHeaderRow($sheet, string $range): void
    {
        $sheet->getStyle($range)->applyFromArray([
            'font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => self::BRAND_COLOR]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::BORDER_COLOR]],
            ],
        ]);
        $sheet->setAutoFilter($range);
        $sheet->getRowDimension((int) substr($range, strpos($range, ':') + 1))->setRowHeight(28);
    }

    protected function setCellWithStyle($sheet, string $cell, string $value): void
    {
        $sheet->setCellValue($cell, $value);
        $sheet->getStyle($cell)->applyFromArray([
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            'font' => ['size' => 10],
        ]);
    }
}
