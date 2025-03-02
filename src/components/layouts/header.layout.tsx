import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { LockKeyhole, LogOut, User } from 'lucide-react';
import { type ComponentProps, Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useAuth } from '@/common/hooks';
import { localStorageService } from '@/common/services';
import { LocalStorageKey } from '@/common/types';
import {
  type ChangePasswordSchema,
  changePasswordSchema,
} from '@/common/types/api/auth';
import { getBreadcrumbItems } from '@/common/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { PasswordInput } from '@/components/ui/password-input';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggler } from '@/components/ui/theme-toggler';
import { authHttpClient } from '@/lib/http';

export function HeaderLayout() {
  const location = useLocation();

  const breadcrumbItems = getBreadcrumbItems(location.pathname);

  return (
    <header className="sticky top-0 flex h-16 justify-between border-b bg-background px-4">
      <div className="flex h-full shrink-0 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <Fragment key={index}>
                <BreadcrumbItem>
                  <BreadcrumbPage>{item}</BreadcrumbPage>
                </BreadcrumbItem>
                {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex h-full items-center justify-end gap-4">
        <ThemeToggler />
        <UserMenu />
      </div>
    </header>
  );
}

function UserMenu() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { mutateAsync: triggerLogout, isError } = useMutation({
    mutationFn: () => authHttpClient.logout(),
  });

  const [isChangePasswordDialogOpne, setIsChangePasswordDialogOpen] =
    useState(false);

  const handleLogout = async () => {
    await triggerLogout();

    if (!isError) {
      localStorageService.remove(LocalStorageKey.ACCESS_TOKEN);
      localStorageService.remove(LocalStorageKey.REFRESH_TOKEN);
      navigate({ to: '/login' });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarFallback>
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex gap-10">
            <DropdownMenuLabel>
              {user?.firstName} {user?.lastName}
            </DropdownMenuLabel>
            <Badge variant="danger">{user?.role}</Badge>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setIsChangePasswordDialogOpen(true)}
          >
            <LockKeyhole className="size-4" /> Change password
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onSelect={handleLogout}>
            <LogOut className="size-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangePasswordDialog
        open={isChangePasswordDialogOpne}
        onOpenChange={setIsChangePasswordDialogOpen}
      />
    </>
  );
}

function ChangePasswordDialog({
  onOpenChange,
  ...props
}: ComponentProps<typeof Dialog>) {
  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const { mutateAsync: triggerChangePassword, isPending } = useMutation({
    mutationFn: (payload: ChangePasswordSchema) =>
      authHttpClient.changePassword(payload),
    onSuccess: () => {
      toast.success('Password changed successfully');
      handleOpenChange(false);
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }

    onOpenChange?.(open);
  };

  const onSubmit = async (payload: ChangePasswordSchema) => {
    await triggerChangePassword(payload);
  };

  return (
    <Dialog onOpenChange={isPending ? undefined : handleOpenChange} {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel required>Current password</FormLabel>
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
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel required>New password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        autoComplete="new-password"
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
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel required>Confirm new password</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <LoadingIndicator /> : 'Save'}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
