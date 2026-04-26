import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export interface Column<T> {
    key: string;
    label: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    emptyMessage?: string;
    keyExtractor: (row: T) => string | number;
}

export function DataTable<T>({
    columns,
    data,
    emptyMessage = 'No records found.',
    keyExtractor,
}: DataTableProps<T>) {
    return (
        <div className="w-full overflow-x-auto">
            <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                        {columns.map((col) => (
                            <TableHead
                                key={col.key}
                                style={{ width: col.width }}
                                className={`px-4 py-3 text-xs font-medium tracking-wider text-muted-foreground uppercase ${
                                    col.align === 'center'
                                        ? 'text-center'
                                        : col.align === 'right'
                                          ? 'text-right'
                                          : 'text-left'
                                }`}
                            >
                                {col.label}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="py-12 text-center text-sm text-muted-foreground"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row, i) => (
                            <motion.tr
                                key={keyExtractor(row)}
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: 0.18,
                                    ease: 'easeOut',
                                    delay: i * 0.035,
                                }}
                                className="border-b border-border transition-colors duration-100 last:border-0 hover:bg-muted/40"
                            >
                                {columns.map((col) => (
                                    <TableCell
                                        key={col.key}
                                        className={`px-4 py-3 text-sm ${
                                            col.align === 'center'
                                                ? 'text-center'
                                                : col.align === 'right'
                                                  ? 'text-right'
                                                  : ''
                                        }`}
                                        style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {col.render(row)}
                                    </TableCell>
                                ))}
                            </motion.tr>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
