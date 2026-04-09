import { Form, Head } from '@inertiajs/react';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import SettingsLayout from '@/layouts/settings/layout';
import { disable, enable } from '@/routes/two-factor';

type Props = {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function TwoFactor({ requiresConfirmation = false, twoFactorEnabled = false }: Props) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    return (
        <SettingsLayout>
            <Head title="Two-Factor Auth" />

            <Card>
                <CardHeader className="border-b">
                    <CardTitle className="text-sm font-semibold">Two-Factor Authentication</CardTitle>
                    <CardDescription className="text-xs">Add additional security to your account using two-factor authentication.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {twoFactorEnabled ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-600">Enabled</Badge>
                                <span className="text-xs text-muted-foreground">Your account is secured.</span>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                                With two-factor authentication enabled, you will be prompted for a secure, random pin during login.
                            </p>

                            <div className="rounded-lg border p-4 bg-muted/20">
                                <TwoFactorRecoveryCodes
                                    recoveryCodesList={recoveryCodesList}
                                    fetchRecoveryCodes={fetchRecoveryCodes}
                                    errors={errors}
                                />
                            </div>

                            <Form {...disable.form()}>
                                {({ processing }) => (
                                    <Button variant="destructive" size="sm" type="submit" disabled={processing}>
                                        <ShieldBan className="size-3.5 mr-1.5" /> Disable 2FA
                                    </Button>
                                )}
                            </Form>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Badge variant="outline">Disabled</Badge>
                            <p className="text-sm text-muted-foreground">
                                When enabled, you will be prompted for a secure pin from your phone's authenticator app during login.
                            </p>

                            {hasSetupData ? (
                                <Button onClick={() => setShowSetupModal(true)} size="sm">
                                    Continue Setup
                                </Button>
                            ) : (
                                <Form {...enable.form()} onSuccess={() => setShowSetupModal(true)}>
                                    {({ processing }) => (
                                        <Button type="submit" disabled={processing} size="sm">
                                            Enable 2FA
                                        </Button>
                                    )}
                                </Form>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />
        </SettingsLayout>
    );
}
