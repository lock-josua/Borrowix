import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import SettingsLayout from '@/layouts/settings/layout';

export default function Appearance() {
    return (
        <SettingsLayout>
            <Head title="Appearance" />

            <Card>
                <CardHeader className="border-b">
                    <CardTitle className="text-sm font-semibold">
                        Appearance
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Customize the look and feel of your Borrowix dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <AppearanceTabs />
                </CardContent>
            </Card>
        </SettingsLayout>
    );
}
