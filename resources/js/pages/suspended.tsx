import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    suspensionReason: string | null;
    contactEmail: string;
}

export default function Suspended({ suspensionReason, contactEmail }: Props) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <Head title="Account Suspended" />

            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
            >
                <Card className="w-full max-w-sm text-center">
                    <CardContent className="px-6 pt-8 pb-6">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <ShieldAlert className="size-6 text-destructive" />
                        </div>
                        <h1 className="text-lg font-semibold text-foreground">
                            Account Suspended
                        </h1>
                        <p className="mt-2 mb-6 text-sm text-muted-foreground">
                            Your school's account has been suspended. Contact
                            support to restore access.
                        </p>
                        {suspensionReason && (
                            <div className="mb-6 rounded-lg border bg-muted p-3 text-left text-xs text-muted-foreground italic">
                                "{suspensionReason}"
                            </div>
                        )}
                        <Button variant="outline" className="w-full" asChild>
                            <a
                                href={`mailto:${contactEmail || 'support@borrowix.com'}`}
                            >
                                Contact Support
                            </a>
                        </Button>
                        <div className="mt-4">
                            <Link
                                href="/login"
                                className="text-xs text-muted-foreground hover:underline"
                            >
                                Return to Login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
