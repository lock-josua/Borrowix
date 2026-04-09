import { Form, Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/login', {
            onSuccess: () => {
                // Password is automatically reset due to Fortify
            },
        });
    }

    return (
        <div className="flex min-h-screen flex-col bg-background lg:flex-row">
            <Head title="Log in" />

            <div className="order-2 flex flex-1 items-center justify-center p-6 sm:p-10 lg:order-1">
                <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="w-full max-w-sm"
                >
                    <Card className="border-0 shadow-none sm:border sm:shadow-sm">
                        <CardHeader className="space-y-1 px-0 sm:px-6">
                            <div className="mb-4 flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                <LayoutDashboard className="size-4" />
                            </div>
                            <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                Welcome back
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Sign in to your Borrowix account
                            </p>
                        </CardHeader>
                        <CardContent className="px-0 pt-4 sm:px-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                        ) => setData('email', e.target.value)}
                                        required
                                        autoFocus
                                        autoComplete="email"
                                        placeholder="m@example.com"
                                        className="h-10"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-xs font-medium text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                        {canResetPassword && (
                                            <Link
                                                href={request()}
                                                className="text-sm font-medium text-primary hover:underline"
                                            >
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                        ) =>
                                            setData('password', e.target.value)
                                        }
                                        required
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="h-10"
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-xs font-medium text-destructive">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked: boolean) =>
                                            setData('remember', checked)
                                        }
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="cursor-pointer text-sm font-medium"
                                    >
                                        Remember me
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    className="h-10 w-full font-medium"
                                    disabled={processing}
                                >
                                    {processing && (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    )}
                                    Sign In
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 px-0 sm:px-6">
                            {canRegister && (
                                <div className="w-full text-center text-sm text-muted-foreground">
                                    Don't have an account?{' '}
                                    <Link
                                        href="/register"
                                        className="font-medium text-primary hover:underline"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </CardFooter>
                    </Card>

                    {status && (
                        <div className="mt-4 text-center text-sm font-medium text-emerald-600">
                            {status}
                        </div>
                    )}
                </motion.div>
            </div>

            <div className="relative order-1 hidden flex-1 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:order-2 lg:flex">
                <div className="relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                            <LayoutDashboard className="size-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">
                            Borrowix
                        </span>
                    </div>
                </div>

                <div className="relative z-10 max-w-md">
                    <h2 className="mb-4 text-3xl leading-tight font-semibold">
                        Manage ICT equipment borrowing across your school.
                    </h2>
                    <p className="text-lg leading-relaxed text-primary-foreground/70">
                        Simple, trackable, and fair equipment management for
                        students and staff.
                    </p>
                </div>

                <div className="relative z-10 flex flex-col gap-4">
                    <div className="h-16 w-64 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm" />
                    <div className="ml-8 h-16 w-56 rounded-2xl border border-white/10 bg-white/10 opacity-60 backdrop-blur-sm" />
                    <div className="ml-16 h-16 w-48 rounded-2xl border border-white/10 bg-white/10 opacity-30 backdrop-blur-sm" />
                </div>

                <div className="absolute top-[-10%] right-[-10%] h-96 w-96 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute bottom-[-5%] left-[-5%] h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            </div>
        </div>
    );
}
