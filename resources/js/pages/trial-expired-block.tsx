import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    schoolName: string;
    contactEmail: string;
}

export default function TrialExpiredBlock({ schoolName, contactEmail }: Props) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <Head title="Access Unavailable" />

            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
            >
                <Card className="w-full max-w-sm text-center">
                    <CardContent className="px-6 pt-8 pb-6">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                            <ShieldOff className="size-6 text-muted-foreground" />
                        </div>
                        <h1 className="text-lg font-semibold text-foreground">
                            System Unavailable
                        </h1>
                        <p className="mt-2 mb-6 text-sm text-muted-foreground">
                            <strong>{schoolName}</strong>'s subscription has
                            ended. Please contact your school administrator to
                            restore access.
                        </p>
                        <Button variant="outline" className="w-full" asChild>
                            <a href={`mailto:${contactEmail}`}>
                                Contact Administrator
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
