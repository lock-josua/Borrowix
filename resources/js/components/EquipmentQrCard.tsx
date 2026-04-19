import { useForm } from '@inertiajs/react';
import { Download, QrCode, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    equipmentId: number;
    equipmentName: string;
    qrToken: string | null;
}

export default function EquipmentQrCard({
    equipmentId,
    equipmentName,
    qrToken,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { post, processing } = useForm({});

    const canDownload = qrToken !== null;

    useEffect(() => {
        if (!qrToken || !canvasRef.current) {
            return;
        }
        QRCode.toCanvas(canvasRef.current, qrToken, {
            width: 200,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
        });
    }, [qrToken]);

    function handleGenerate() {
        post(`/admin/equipment/${equipmentId}/qr-code/generate`);
    }

    function handleDownload() {
        if (!canvasRef.current || !canDownload) return;
        const link = document.createElement('a');
        link.download = `qr-${equipmentName.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                    <QrCode className="size-4 text-muted-foreground" />
                    QR Code
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                {qrToken ? (
                    <>
                        <div className="rounded-lg border bg-white p-3 shadow-sm">
                            <canvas ref={canvasRef} className="block" />
                        </div>

                        <div className="text-center">
                            <p className="text-xs font-medium text-foreground">
                                {equipmentName}
                            </p>
                            <p className="mt-0.5 max-w-[200px] font-mono text-[10px] break-all text-muted-foreground">
                                {qrToken}
                            </p>
                        </div>

                        <div className="flex w-full gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={handleDownload}
                                disabled={!canDownload}
                            >
                                <Download className="mr-1.5 size-3.5" />
                                Download PNG
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={handleGenerate}
                                disabled={processing}
                            >
                                <RefreshCw
                                    className={`mr-1.5 size-3.5 ${processing ? 'animate-spin' : ''}`}
                                />
                                Regenerate
                            </Button>
                        </div>

                        <p className="text-center text-[10px] text-muted-foreground">
                            Regenerating creates a new token. Print the new QR
                            and replace any physical stickers.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                            <QrCode className="mb-3 size-10 opacity-20" />
                            <p className="text-sm">No QR code yet</p>
                            <p className="mt-1 text-xs">
                                Generate one to enable QR scanning for this
                                equipment.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            className="w-full"
                            onClick={handleGenerate}
                            disabled={processing}
                        >
                            <QrCode className="mr-1.5 size-3.5" />
                            {processing ? 'Generating...' : 'Generate QR Code'}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
