import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { type AxiosError, HttpStatusCode } from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { localStorageService } from '@/common/services';
import { LocalStorageKey } from '@/common/types';
import { type LoginSchema, loginSchema } from '@/common/types/api/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { PasswordInput } from '@/components/ui/password-input';
import { ThemeToggler } from '@/components/ui/theme-toggler';
import { cn } from '@/lib/cn';
import { authHttpClient } from '@/lib/http';

export function LoginPage() {
  return (
    <div className="relative h-svh w-full">
      <ThemeToggler className="absolute right-6 top-6 z-20" />
      <div className="absolute z-10 flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const navigate = useNavigate();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { mutateAsync: triggerLogin, isPending } = useMutation({
    mutationFn: (payload: LoginSchema) => authHttpClient.login(payload),
    onSuccess: ({ data }) => {
      const { accessToken, refreshToken } = data;
      localStorageService.set(LocalStorageKey.ACCESS_TOKEN, accessToken);
      localStorageService.set(LocalStorageKey.REFRESH_TOKEN, refreshToken);
      navigate({ to: '/' });
    },
    onError: (error: AxiosError) => {
      if (error.status === HttpStatusCode.Unauthorized) {
        toast.error('Username or password is incorrect.');
      }
    },
  });

  const onSubmit = async (payload: LoginSchema) => {
    await triggerLogin(payload);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your username & password below to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel required>Username</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="username"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel required>Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          autoComplete="current-password"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? <LoadingIndicator /> : 'Login'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
