import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, ShieldAlert } from 'lucide-react';

interface Props {
    schoolName: string;
    suspensionReason: string | null;
    contactEmail: string;
}

export default function Suspended({
    schoolName,
    suspensionReason,
    contactEmail,
}: Props) {
    return (
        <>
            <Head title="Account Suspended" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
                <div className="w-full max-w-md">
                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-red-500/10">
                            <ShieldAlert className="size-8 text-red-500" />
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Account Suspended
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Access to{' '}
                            <span className="font-medium text-foreground">
                                {schoolName}
                            </span>{' '}
                            has been temporarily suspended by the platform
                            administrator.
                        </p>
                    </div>

                    {/* Suspension reason card */}
                    {suspensionReason && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
                            <p className="text-xs font-medium tracking-wide text-red-600 uppercase dark:text-red-400">
                                Reason
                            </p>
                            <p className="mt-1 text-sm text-foreground">
                                {suspensionReason}
                            </p>
                        </div>
                    )}

                    {/* Contact support */}
                    <div className="mb-8 rounded-lg border bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground">
                            If you believe this is a mistake or need assistance,
                            please contact the platform support team.
                        </p>
                        {contactEmail && (
                            <a
                                href={`mailto:${contactEmail}`}
                                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                            >
                                <Mail className="size-4" />
                                {contactEmail}
                            </a>
                        )}
                    </div>

                    {/* Back to login */}
                    <div className="flex justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
