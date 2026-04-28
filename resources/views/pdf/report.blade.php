<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Transaction Report</title>
    <style>
        body {
            font-family: 'Helvetica', sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.5;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #1a1a1a;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0 0;
            color: #666;
        }
        .summary {
            margin-bottom: 30px;
            width: 100%;
        }
        .summary-card {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .summary-grid {
            width: 100%;
        }
        .summary-item {
            text-align: center;
            width: 25%;
        }
        .summary-item .label {
            display: block;
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .summary-item .value {
            display: block;
            font-size: 18px;
            font-weight: bold;
            color: #1a1a1a;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1a1a1a;
            border-left: 4px solid #3b82f6;
            padding-left: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background: #f4f4f5;
            text-align: left;
            padding: 10px;
            font-weight: bold;
            border-bottom: 1px solid #e4e4e7;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #f4f4f5;
        }
        .status {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-returned { background: #dcfce7; color: #166534; }
        .status-overdue { background: #fee2e2; color: #991b1b; }
        .status-active { background: #dbeafe; color: #1e40af; }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #999;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Borrowix Transaction Report</h1>
        <p>Period: {{ $from }} to {{ $to }}</p>
    </div>

    <div class="summary-card">
        <table class="summary-grid">
            <tr>
                <td class="summary-item">
                    <span class="label">Total Transactions</span>
                    <span class="value">{{ $summary['total_transactions'] }}</span>
                </td>
                <td class="summary-item">
                    <span class="label">Returned</span>
                    <span class="value">{{ $summary['returned'] }}</span>
                </td>
                <td class="summary-item">
                    <span class="label">Active Loans</span>
                    <span class="value">{{ $summary['active'] }}</span>
                </td>
                <td class="summary-item">
                    <span class="label">Overdue</span>
                    <span class="value">{{ $summary['overdue'] }}</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="section-title">Detailed Transaction Log</div>
    <table>
        <thead>
            <tr>
                <th>Borrower</th>
                <th>Equipment</th>
                <th>Issued</th>
                <th>Returned</th>
                <th>Status</th>
                <th>Fine</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $t)
            <tr>
                <td>{{ $t['borrower']['name'] }}</td>
                <td>{{ $t['equipment']['name'] }}</td>
                <td>{{ $t['issued_at'] }}</td>
                <td>{{ $t['returned_at'] ?? '—' }}</td>
                <td>
                    <span class="status status-{{ strtolower($t['status']) }}">
                        {{ $t['status'] }}
                    </span>
                </td>
                <td>{{ $t['fine_amount'] > 0 ? '₱' . $t['fine_amount'] : '—' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="page-break"></div>

    <div class="section-title">Most Borrowed Equipment</div>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Equipment</th>
                <th style="text-align: right;">Total Borrowed</th>
            </tr>
        </thead>
        <tbody>
            @foreach($topEquipment as $index => $e)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $e['equipment']['name'] }}</td>
                <td style="text-align: right;">{{ $e['total'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">Most Active Borrowers</div>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Student</th>
                <th>Email</th>
                <th style="text-align: right;">Total Borrowed</th>
            </tr>
        </thead>
        <tbody>
            @foreach($topBorrowers as $index => $b)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $b['borrower']['name'] }}</td>
                <td>{{ $b['borrower']['email'] }}</td>
                <td style="text-align: right;">{{ $b['total'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Generated on {{ now()->format('M d, Y h:i A') }} | Borrowix Management System
    </div>
</body>
</html>
