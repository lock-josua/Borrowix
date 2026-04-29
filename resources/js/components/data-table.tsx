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
    hideOnMobile?: boolean;
    render: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    emptyMessage?: string;
    keyExtractor: (row: T, index: number) => string | number;
    mobileCards?: boolean;
}

export function DataTable<T>({
    columns,
    data,
    emptyMessage = 'No records found.',
    keyExtractor,
    mobileCards = false,
}: DataTableProps<T>) {
    return (
        <div className="w-full">
            {/* Desktop Table View */}
            <div
                className={`overflow-x-auto ${mobileCards ? 'hidden md:block' : 'block'}`}
            >
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
                                    } ${col.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
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
                                    key={keyExtractor(row, i)}
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
                                            } ${col.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                                            style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {col.render(row, i)}
                                        </TableCell>
                                    ))}
                                </motion.tr>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            {mobileCards && (
                <div className="flex flex-col divide-y divide-border md:hidden">
                    {data.length === 0 ? (
                        <div className="py-12 text-center text-sm text-muted-foreground">
                            {emptyMessage}
                        </div>
                    ) : (
                        data.map((row, i) => (
                            <motion.div
                                key={keyExtractor(row, i)}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.2,
                                    delay: i * 0.05,
                                }}
                                className="flex flex-col gap-2 p-4"
                            >
                                {columns.map((col) => (
                                    <div
                                        key={col.key}
                                        className="flex items-center justify-between gap-2"
                                    >
                                        <span className="text-xs font-medium tracking-tight text-muted-foreground uppercase">
                                            {col.label}
                                        </span>
                                        <div className="text-sm font-medium">
                                            {col.render(row, i)}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
