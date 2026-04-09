import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        school_name: '',
        admin_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/register', {
            onSuccess: () => {
                // Password fields will be reset due to resetOnSuccess
            },
        });
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
            <Head title="Register" />
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full max-w-sm"
            >
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                <LayoutDashboard className="size-4" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground">
                                Borrowix
                            </span>
                        </Link>
                    </div>

                    <Card className="overflow-hidden rounded-xl">
                        <CardHeader className="pb-2 text-center">
                            <CardTitle className="text-xl font-semibold">
                                Register your school
                            </CardTitle>
                            <CardDescription>
                                Enter your school details and admin information
                                below
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="school_name">
                                        School Name
                                    </Label>
                                    <Input
                                        id="school_name"
                                        type="text"
                                        required
                                        autoFocus
                                        autoComplete="organization"
                                        name="school_name"
                                        value={data.school_name}
                                        onChange={(e) =>
                                            setData(
                                                'school_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Your school name"
                                        className="h-10"
                                    />
                                    {errors.school_name && (
                                        <p className="mt-1 text-xs font-medium text-destructive">
                                            {errors.school_name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="admin_name">
                                        Admin Full Name
                                    </Label>
                                    <Input
                                        id="admin_name"
                                        type="text"
                                        required
                                        autoComplete="name"
                                        name="admin_name"
                                        value={data.admin_name}
                                        onChange={(e) =>
                                            setData(
                                                'admin_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="John Doe"
                                        className="h-10"
                                    />
                                    {errors.admin_name && (
                                        <p className="mt-1 text-xs font-medium text-destructive">
                                            {errors.admin_name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="email">Admin Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="admin@school.edu"
                                        className="h-10"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-xs font-medium text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        autoComplete="new-password"
                                        name="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        placeholder="••••••••"
                                        className="h-10"
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-xs font-medium text-destructive">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="••••••••"
                                        className="h-10"
                                    />
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-xs font-medium text-destructive">
                                            {errors.password_confirmation}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="h-10 w-full font-medium"
                                    disabled={processing}
                                >
                                    {processing && (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    )}
                                    Register School
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-center border-t bg-muted/20 py-4">
                            <div className="text-center text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link
                                    href="/login"
                                    className="font-medium text-primary hover:underline"
                                >
                                    Log in
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
}
