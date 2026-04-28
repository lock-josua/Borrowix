<?php

namespace App\Exports;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ReportExport
{
    // Modern Palette (Indigo & Slate)
    protected const BRAND_COLOR = '6366F1'; // Indigo 500

    protected const BRAND_COLOR_DARK = '4338CA'; // Indigo 700

    protected const SLATE_50 = 'F8FAFC';

    protected const SLATE_100 = 'F1F5F9';

    protected const SLATE_200 = 'E2E8F0';

    protected const SLATE_300 = 'CBD5E1';

    protected const SLATE_600 = '475569';

    protected const SLATE_800 = '1E293B';

    protected const STATUS_ACTIVE = '3B82F6'; // Blue

    protected const STATUS_RETURNED = '10B981'; // Emerald

    protected const STATUS_OVERDUE = 'EF4444'; // Red

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
        $props->setLastModifiedBy('Borrowix');
        $props->setTitle('Equipment Usage Analytics');
        $props->setSubject('Inventory Report');

        $this->buildSummarySheet($spreadsheet);
        $this->buildTransactionsSheet($spreadsheet);
        $this->buildTopEquipmentSheet($spreadsheet);
        $this->buildTopBorrowersSheet($spreadsheet);

        // Remove default empty sheet
        $defaultSheet = $spreadsheet->getSheetByName('Worksheet');
        if ($defaultSheet) {
            $spreadsheet->removeSheetByIndex(0);
        }

        $spreadsheet->setActiveSheetIndexByName('Dashboard');

        return $spreadsheet;
    }

    protected function buildSummarySheet(Spreadsheet $spreadsheet): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Dashboard');
        $sheet->getTabColor()->setRGB(self::BRAND_COLOR);

        // Hide gridlines for a clean dashboard look
        $sheet->setShowGridlines(false);

        // Header Title
        $sheet->mergeCells('B2:G2');
        $sheet->setCellValue('B2', 'BORROWIX ANALYTICS REPORT');
        $sheet->getStyle('B2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 20, 'color' => ['rgb' => self::SLATE_800]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        ]);

        $sheet->mergeCells('B3:G3');
        $sheet->setCellValue('B3', 'Report Period: '.date('M d, Y', strtotime($this->from)).' — '.date('M d, Y', strtotime($this->to)));
        $sheet->getStyle('B3')->applyFromArray([
            'font' => ['size' => 12, 'color' => ['rgb' => self::SLATE_600]],
        ]);

        // Dashboard Metric Cards (Horizontal Layout)
        $metrics = [
            ['Total Activity', $this->summary['total_transactions'], 'Total volume of requests', self::BRAND_COLOR],
            ['Returned Items', $this->summary['returned'], 'Successfully completed', self::STATUS_RETURNED],
            ['Active Loans', $this->summary['active'], 'Currently in possession', self::STATUS_ACTIVE],
            ['Overdue Items', $this->summary['overdue'], 'Pending immediate action', self::STATUS_OVERDUE],
        ];

        $startCol = 'B';
        foreach ($metrics as $index => [$label, $value, $sub, $color]) {
            $col1 = $startCol;
            $col2 = chr(ord($startCol) + 1);

            // Card Container
            $range = "{$col1}5:{$col2}8";
            $sheet->mergeCells($range);
            $sheet->getStyle($range)->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFFFFF']],
                'borders' => [
                    'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::SLATE_200]],
                    'left' => ['borderStyle' => Border::BORDER_THICK, 'color' => ['rgb' => $color]],
                ],
            ]);

            // Label
            $sheet->setCellValue("{$col1}5", strtoupper($label));
            $sheet->getStyle("{$col1}5")->applyFromArray([
                'font' => ['bold' => true, 'size' => 9, 'color' => ['rgb' => self::SLATE_600]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ]);

            // Value
            $sheet->setCellValue("{$col1}6", $value);
            $sheet->getStyle("{$col1}6")->applyFromArray([
                'font' => ['bold' => true, 'size' => 24, 'color' => ['rgb' => $color]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ]);

            // Subtext
            $sheet->setCellValue("{$col1}7", $sub);
            $sheet->getStyle("{$col1}7")->applyFromArray([
                'font' => ['size' => 8, 'color' => ['rgb' => self::SLATE_600], 'italic' => true],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ]);

            $startCol = chr(ord($col2) + 1);
        }

        // Set Column Widths for Cards
        foreach (range('B', 'I') as $col) {
            $sheet->getColumnDimension($col)->setWidth(18);
        }

        // Quick Stats Table Below
        $sheet->setCellValue('B10', 'Performance Indicators');
        $sheet->getStyle('B10')->applyFromArray([
            'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => self::SLATE_800]],
        ]);

        $sheet->setCellValue('B11', 'KPI Metric');
        $sheet->setCellValue('C11', 'Value');
        $this->styleModernHeader($sheet, 'B11:C11');

        $rows = [
            ['Completion Rate', ($this->summary['total_transactions'] > 0 ? round(($this->summary['returned'] / $this->summary['total_transactions']) * 100, 1) : 0).'%'],
            ['Overdue Ratio', ($this->summary['total_transactions'] > 0 ? round(($this->summary['overdue'] / $this->summary['total_transactions']) * 100, 1) : 0).'%'],
            ['Report Generated', now()->format('Y-m-d H:i')],
        ];

        $currRow = 12;
        foreach ($rows as $data) {
            $sheet->setCellValue("B{$currRow}", $data[0]);
            $sheet->setCellValue("C{$currRow}", $data[1]);
            $this->styleModernRow($sheet, "B{$currRow}:C{$currRow}", $currRow % 2 === 0);
            $currRow++;
        }

        // Branding at bottom
        $sheet->setCellValue('B20', 'Generated by Borrowix System v2.0');
        $sheet->getStyle('B20')->applyFromArray([
            'font' => ['italic' => true, 'size' => 9, 'color' => ['rgb' => self::SLATE_300]],
        ]);
    }

    protected function buildTransactionsSheet(Spreadsheet $spreadsheet): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Transaction Log');
        $sheet->getTabColor()->setRGB(self::STATUS_ACTIVE);
        $sheet->setShowGridlines(false);

        // Header
        $sheet->setCellValue('A2', 'DETAILED TRANSACTION LOG');
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => self::SLATE_800]],
        ]);

        $headers = ['BORROWER', 'EQUIPMENT', 'ISSUED AT', 'DUE DATE', 'RETURNED AT', 'STATUS', 'FINE'];
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col.'4', $header);
            $col++;
        }
        $this->styleModernHeader($sheet, 'A4:G4');
        $sheet->freezePane('A5');

        $row = 5;
        foreach ($this->transactions as $t) {
            $sheet->setCellValue('A'.$row, $t['borrower']['name'] ?? '—');
            $sheet->setCellValue('B'.$row, $t['equipment']['name'] ?? '—');
            $sheet->setCellValue('C'.$row, $t['issued_at']);
            $sheet->setCellValue('D'.$row, $t['due_date'] ?? '—');
            $sheet->setCellValue('E'.$row, $t['returned_at'] ?? '—');

            // Status Indicator
            $status = strtolower($t['status'] ?? 'pending');
            $statusLabel = match ($status) {
                'active' => '● ACTIVE',
                'returned' => '✓ RETURNED',
                'overdue' => '! OVERDUE',
                default => '—'
            };
            $statusColor = match ($status) {
                'active' => self::STATUS_ACTIVE,
                'returned' => self::STATUS_RETURNED,
                'overdue' => self::STATUS_OVERDUE,
                default => self::SLATE_600
            };
            $sheet->setCellValue('F'.$row, $statusLabel);
            $sheet->getStyle('F'.$row)->applyFromArray([
                'font' => ['bold' => true, 'size' => 9, 'color' => ['rgb' => $statusColor]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);

            // Fine
            $fineVal = $t['fine_amount'] ?? 0;
            $sheet->setCellValue('G'.$row, $fineVal > 0 ? '₱ '.number_format($fineVal, 2) : '—');
            $sheet->getStyle('G'.$row)->applyFromArray([
                'font' => ['bold' => $fineVal > 0, 'color' => ['rgb' => $fineVal > 0 ? self::STATUS_OVERDUE : self::SLATE_600]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
            ]);

            $this->styleModernRow($sheet, "A{$row}:E{$row}", $row % 2 === 0);
            $this->styleModernRow($sheet, "G{$row}", $row % 2 === 0);

            $row++;
        }

        // Auto-width columns
        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }

    protected function buildTopEquipmentSheet(Spreadsheet $spreadsheet): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Top Equipment');
        $sheet->setShowGridlines(false);

        $sheet->setCellValue('B2', 'MOST BORROWED EQUIPMENT');
        $sheet->getStyle('B2')->applyFromArray(['font' => ['bold' => true, 'size' => 14]]);

        $headers = ['RANK', 'EQUIPMENT', 'BORROW COUNT'];
        $col = 'B';
        foreach ($headers as $header) {
            $sheet->setCellValue($col.'4', $header);
            $col++;
        }
        $this->styleModernHeader($sheet, 'B4:D4');

        $row = 5;
        foreach ($this->topEquipment as $index => $e) {
            $rank = $index + 1;
            $sheet->setCellValue('B'.$row, '#'.$rank);
            $sheet->setCellValue('C'.$row, $e['equipment']['name'] ?? '—');
            $sheet->setCellValue('D'.$row, $e['total']);

            $this->styleModernRow($sheet, "B{$row}:D{$row}", $row % 2 === 0);
            $sheet->getStyle('B'.$row)->applyFromArray(['font' => ['bold' => true]]);
            $sheet->getStyle('D'.$row)->applyFromArray(['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]]);

            $row++;
        }
        $sheet->getColumnDimension('C')->setWidth(40);
        $sheet->getColumnDimension('D')->setWidth(20);
    }

    protected function buildTopBorrowersSheet(Spreadsheet $spreadsheet): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Top Borrowers');
        $sheet->setShowGridlines(false);

        $sheet->setCellValue('B2', 'MOST ACTIVE BORROWERS');
        $sheet->getStyle('B2')->applyFromArray(['font' => ['bold' => true, 'size' => 14]]);

        $headers = ['RANK', 'NAME', 'EMAIL', 'TOTAL REQUESTS'];
        $col = 'B';
        foreach ($headers as $header) {
            $sheet->setCellValue($col.'4', $header);
            $col++;
        }
        $this->styleModernHeader($sheet, 'B4:E4');

        $row = 5;
        foreach ($this->topBorrowers as $index => $b) {
            $rank = $index + 1;
            $sheet->setCellValue('B'.$row, '#'.$rank);
            $sheet->setCellValue('C'.$row, $b['borrower']['name'] ?? '—');
            $sheet->setCellValue('D'.$row, $b['borrower']['email'] ?? '—');
            $sheet->setCellValue('E'.$row, $b['total']);

            $this->styleModernRow($sheet, "B{$row}:E{$row}", $row % 2 === 0);
            $sheet->getStyle('B'.$row)->applyFromArray(['font' => ['bold' => true]]);
            $sheet->getStyle('E'.$row)->applyFromArray(['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]]);

            $row++;
        }
        $sheet->getColumnDimension('C')->setWidth(30);
        $sheet->getColumnDimension('D')->setWidth(40);
        $sheet->getColumnDimension('E')->setWidth(20);
    }

    protected function styleModernHeader($sheet, string $range): void
    {
        $sheet->getStyle($range)->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => self::SLATE_800]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension((int) substr($range, strpos($range, ':') + 2))->setRowHeight(25);
    }

    protected function styleModernRow($sheet, string $range, bool $isZebra): void
    {
        $sheet->getStyle($range)->applyFromArray([
            'font' => ['size' => 10, 'color' => ['rgb' => self::SLATE_800]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $isZebra ? self::SLATE_50 : 'FFFFFF']],
            'borders' => [
                'bottom' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::SLATE_100]],
            ],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
        ]);

        // Extract row number from range (e.g. "A5:G5" -> 5)
        if (preg_match('/\d+/', $range, $matches)) {
            $sheet->getRowDimension($matches[0])->setRowHeight(22);
        }
    }
}
