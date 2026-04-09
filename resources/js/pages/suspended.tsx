import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    schoolName: string;
    suspensionReason: string | null;
    contactEmail: string;
}

export default function Suspended({ schoolName, suspensionReason, contactEmail }: Props) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <Head title="Account Suspended" />

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
                <Card className="max-w-sm w-full text-center">
                    <CardContent className="pt-8 pb-6 px-6">
                        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert className="size-6 text-destructive" />
                        </div>
                        <h1 className="text-lg font-semibold text-foreground">Account Suspended</h1>
                        <p className="text-sm text-muted-foreground mt-2 mb-6">
                            Your school's account has been suspended. Contact support to restore access.
                        </p>
                        {suspensionReason && (
                            <div className="mb-6 p-3 rounded-lg bg-muted text-left border text-xs italic text-muted-foreground">
                                "{suspensionReason}"
                            </div>
                        )}
                        <Button variant="outline" className="w-full" asChild>
                            <a href={`mailto:${contactEmail || 'support@borrowix.com'}`}>Contact Support</a>
                        </Button>
                        <div className="mt-4">
                            <Link href="/login" className="text-xs text-muted-foreground hover:underline">
                                Return to Login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
