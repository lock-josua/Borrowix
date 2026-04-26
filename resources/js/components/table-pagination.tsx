import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    nextUrl: string | null;
    prevUrl: string | null;
}

export function TablePagination({
    currentPage,
    lastPage,
    nextUrl,
    prevUrl,
}: PaginationProps) {
    return (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
                Page {currentPage} of {lastPage}
            </span>
            <div className="flex gap-2">
                {prevUrl ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={prevUrl}>Previous</Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        Previous
                    </Button>
                )}
                {nextUrl ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={nextUrl}>Next</Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        Next
                    </Button>
                )}
            </div>
        </div>
    );
}
