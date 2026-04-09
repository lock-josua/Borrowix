import { Head } from '@inertiajs/react';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

interface Props {
    schoolName: string;
    tenantUrl: string;
    loginUrl: string;
    adminEmail: string;
}

export default function RegisterSuccess({
    schoolName,
    tenantUrl,
    loginUrl,
    adminEmail,
}: Props) {
    return (
        <AuthLayout
            title="School registered!"
            description={`${schoolName} is ready to go.`}
        >
            <Head title="Registration Successful" />

            <div className="flex flex-col gap-6">
                {/* Success icon + message */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
                        <CheckCircle className="size-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            A confirmation email has been sent to{' '}
                            <strong className="text-foreground">
                                {adminEmail}
                            </strong>
                            .
                        </p>
                    </div>
                </div>

                {/* School portal details */}
                <div className="space-y-3 rounded-lg border bg-muted/40 p-4 text-sm">
                    <div>
                        <p className="mb-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                            School Name
                        </p>
                        <p className="font-semibold text-foreground">
                            {schoolName}
                        </p>
                    </div>
                    <div>
                        <p className="mb-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                            Your School Portal
                        </p>
                        <a
                            href={tenantUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-medium break-all text-primary hover:underline"
                        >
                            {tenantUrl}
                            <ExternalLink className="size-3 shrink-0" />
                        </a>
                    </div>
                </div>

                {/* Primary CTA */}
                <a href={loginUrl} className="w-full">
                    <Button className="w-full">
                        Go to your school login →
                    </Button>
                </a>

                {/* Footer hint */}
                <p className="text-center text-xs text-muted-foreground">
                    Bookmark{' '}
                    <a
                        href={loginUrl}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        your login page
                    </a>{' '}
                    — it's different from this page.
                </p>
            </div>
        </AuthLayout>
    );
}
