import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { AlertCircle, Camera, QrCode } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import BorrowRequestModal from '@/components/BorrowRequestModal';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StudentLayout from '@/layouts/StudentLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/student/dashboard' },
    { title: 'Scan Equipment', href: '/student/scan' },
];

interface ScannedEquipment {
    id: number;
    name: string;
    brand: string | null;
    model: string | null;
    available_quantity: number;
    image_url: string | null;
    category: { name: string } | null;
}

type ScanState = 'idle' | 'scanning' | 'resolving' | 'success' | 'error';

export default function ScanPage() {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [scanState, setScanState] = useState<ScanState>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [scannedEquipment, setScannedEquipment] =
        useState<ScannedEquipment | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        return () => {
            scannerRef.current?.clear().catch(() => {});
        };
    }, []);

    function startScanner() {
        setScanState('scanning');
        setErrorMessage(null);

        setTimeout(() => {
            scannerRef.current = new Html5QrcodeScanner(
                'qr-reader',
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                    showTorchButtonIfSupported: true,
                    rememberLastUsedCamera: true,
                },
                false,
            );

            scannerRef.current.render(
                async (decodedText) => {
                    scannerRef.current?.pause(true);
                    setScanState('resolving');

                    try {
                        const csrfToken = (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content;

                        const response = await fetch('/student/scan/resolve', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Accept: 'application/json',
                                'X-CSRF-TOKEN': csrfToken ?? '',
                            },
                            body: JSON.stringify({ qr_token: decodedText }),
                        });

                        const data = await response.json();

                        if (!response.ok) {
                            setErrorMessage(
                                data.error ??
                                    'Something went wrong. Please try again.',
                            );
                            setScanState('error');
                            setTimeout(() => {
                                setScanState('scanning');
                                setErrorMessage(null);
                                scannerRef.current?.resume();
                            }, 2500);
                            return;
                        }

                        scannerRef.current?.clear().catch(() => {});
                        setScannedEquipment(data.equipment);
                        setScanState('success');
                        setModalOpen(true);
                    } catch {
                        setErrorMessage(
                            'Network error. Please check your connection and try again.',
                        );
                        setScanState('error');
                        setTimeout(() => {
                            setScanState('scanning');
                            setErrorMessage(null);
                            scannerRef.current?.resume();
                        }, 2500);
                    }
                },
                () => {},
            );
        }, 100);
    }

    function handleModalClose() {
        setModalOpen(false);
        setScannedEquipment(null);
        setScanState('idle');
    }

    function handleScanAnother() {
        setModalOpen(false);
        setScannedEquipment(null);
        setScanState('idle');
    }

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Scan Equipment" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="mx-auto flex max-w-lg flex-col gap-6 p-6"
            >
                <PageHeader
                    title="Scan Equipment"
                    description="Point your camera at an equipment QR code to start a borrow request."
                />

                <Card>
                    <CardContent className="flex flex-col gap-4 p-4">
                        {scanState === 'idle' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center gap-4 py-10 text-center"
                            >
                                <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                                    <QrCode className="size-8 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">
                                        Ready to scan
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Make sure you allow camera access when
                                        prompted.
                                    </p>
                                </div>
                                <Button onClick={startScanner} className="mt-2">
                                    <Camera className="mr-2 size-4" />
                                    Start Camera
                                </Button>
                            </motion.div>
                        )}


                        {(scanState === 'scanning' || scanState === 'resolving' || scanState === 'error') && (
                            <div className="relative flex flex-col items-center justify-center">
                                <div className="relative w-full max-w-xs aspect-square mx-auto">
                                    <div
                                        id="qr-reader"
                                        className="w-full h-full overflow-hidden rounded-2xl border-4 border-primary/60 shadow-lg bg-black/80"
                                    />
                                    {/* Overlay for scan area corners */}
                                    <div className="pointer-events-none absolute inset-0 z-10">
                                        <div className="absolute left-0 top-0 h-8 w-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                                        <div className="absolute right-0 top-0 h-8 w-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                                        <div className="absolute left-0 bottom-0 h-8 w-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                                        <div className="absolute right-0 bottom-0 h-8 w-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {scanState === 'resolving' && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground"
                                        >
                                            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                            Looking up equipment...
                                        </motion.div>
                                    )}

                                    {scanState === 'error' && errorMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                                        >
                                            <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                            <span>{errorMessage}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {scanState === 'success' && !modalOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center gap-4 py-8 text-center"
                            >
                                <p className="text-sm text-muted-foreground">
                                    Scan complete. Request submitted or closed.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={handleScanAnother}
                                >
                                    Scan Another
                                </Button>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>

                {scanState === 'idle' && (
                    <Card className="border-dashed">
                        <CardContent className="space-y-1.5 p-4 text-xs text-muted-foreground">
                            <p className="text-sm font-medium text-foreground">
                                How it works
                            </p>
                            <p>
                                1. Tap <strong>Start Camera</strong> and allow
                                camera access.
                            </p>
                            <p>
                                2. Point the camera at the QR code sticker on
                                the equipment.
                            </p>
                            <p>
                                3. A borrow request form will appear
                                automatically.
                            </p>
                            <p>
                                4. Fill in the purpose and dates, then submit.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </motion.div>

            {scannedEquipment && (
                <BorrowRequestModal
                    equipment={scannedEquipment}
                    isOpen={modalOpen}
                    onClose={handleModalClose}
                />
            )}
        </StudentLayout>
    );
}
