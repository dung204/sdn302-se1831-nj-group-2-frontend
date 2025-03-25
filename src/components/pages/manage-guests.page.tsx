import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, getRouteApi, useNavigate } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { Edit, Ellipsis, EyeIcon, Plus, Trash2 } from 'lucide-react';
import { type ComponentProps, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useAuth } from '@/common/hooks';
import { type SuccessResponse } from '@/common/types';
import {
  type CreateUserSchema,
  Role,
  type UpdateUserSchema,
  type User,
  createUserSchema,
  updateUserSchema,
  userSearchParamsSchema,
} from '@/common/types/api/user';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { UserDataTable } from '@/components/ui/data-table';
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
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { userHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/guests/');

export function ManageGuestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // default search params object for GUEST
  const defaultSearchParams = {
    role: [Role.GUEST],
  };

  const searchParams = userSearchParamsSchema.parse({
    ...route.useSearch(),
    ...defaultSearchParams,
  });

  const { data: res, isLoading } = useQuery({
    queryKey: ['users', 'all', searchParams],
    queryFn: () => userHttpClient.getAllUsers(searchParams),
  });

  const [usersToDelete, setUsersToDelete] = useState<RowSelectionState>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<User | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === Role.OWNER) {
      document.title = 'Existing users | Internet Cafe Management';
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== Role.BRANCH_ADMIN) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-4">
        {Object.keys(usersToDelete).length === 0 || (
          <Button variant="danger" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="size-4" /> Delete selected
          </Button>
        )}
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="size-4" /> Add new guest
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: '/guests/deleted' })}>
          <EyeIcon className="size-4" /> View deleted branches
        </Button>
      </div>
      <UserDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        enableRowSelection={(row) => row.original.id !== user.id}
        onRowSelectionChange={setUsersToDelete}
        state={{
          rowSelection: usersToDelete,
        }}
        renderColumns={(existingColumns) => [
          {
            id: 'select',
            header: ({ table }) => (
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                title="Select all rows"
              />
            ),
            cell: ({ row }) => {
              if (row.original.id === user.id) {
                return <></>;
              }

              return (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  title="Select this row"
                />
              );
            },
            enableSorting: false,
            enableHiding: false,
            enableResizing: false,
          },
          ...existingColumns,
          {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
              if (row.original.id === user.id) {
                return <></>;
              }

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex size-full items-center justify-center">
                    <Ellipsis className="size-6" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => e.stopPropagation()}
                      onSelect={() => {
                        setUserToUpdate(row.original);
                        setIsUpdateDialogOpen(true);
                      }}
                    >
                      <Edit className="size-4" /> Edit
                    </DropdownMenuItem>
                    {Object.keys(usersToDelete).length === 0 && (
                      <DropdownMenuItem
                        className="text-danger focus:bg-danger focus:text-danger-foreground"
                        onClick={(e) => e.stopPropagation()}
                        onSelect={() => {
                          setUsersToDelete({ [row.original.id]: true });
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="size-4" /> Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            },
            enableSorting: false,
            enableHiding: false,
            enableResizing: false,
          },
        ]}
      />
      <UserDeleteDialog
        userIds={Object.keys(usersToDelete)}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={() => setUsersToDelete({})}
      />
      <UserUpdateDialog
        user={userToUpdate!}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
      />
      <UserCreateDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}

interface UserDeleteDialogProps extends ComponentProps<typeof AlertDialog> {
  userIds: string[];
  onDelete?: (deletedUserIds: string[]) => void;
}

function UserDeleteDialog({ userIds, onDelete, ...props }: UserDeleteDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // default search params object for GUEST
  const defaultSearchParams = {
    role: [Role.GUEST],
    branch: user?.branch?.id, // Assuming branch has an _id property
  };

  const searchParams = userSearchParamsSchema.parse({
    ...route.useSearch(),
    ...defaultSearchParams,
  });

  const { mutateAsync: triggerDeleteUsers, isPending } = useMutation({
    mutationFn: async (userIds: string[]) => {
      const result = await Promise.allSettled(
        userIds.map((id) => userHttpClient.softDeleteUser(id)),
      );
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
      const res = queryClient.getQueryData<SuccessResponse<User[]>>(['users', 'all', searchParams]);
      if (
        res!.meta.pagination.page > res!.meta.pagination.totalPage &&
        res!.meta.pagination.totalPage > 0
      ) {
        navigate({
          to: '/guests',
          search: { ...searchParams, page: res!.meta.pagination.totalPage },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} deleted, ${rejected?.length || 0} failed`);
      onDelete?.(userIds);
    },
  });

  const handleDelete = async () => {
    await triggerDeleteUsers(userIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {userIds.length === 1
              ? 'Are you sure to delete this user?'
              : `Are you sure to delete ${userIds.length} selected users?`}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="danger" disabled={isPending} onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface UserUpdateDialogProps extends ComponentProps<typeof Dialog> {
  user: User | null;
}

function UserUpdateDialog({ user, onOpenChange, ...props }: UserUpdateDialogProps) {
  const form = useForm<UpdateUserSchema>({
    resolver: zodResolver(updateUserSchema),
    values: {
      firstName: !user ? '' : user.firstName,
      lastName: !user ? '' : user.lastName,
      address: !user ? '' : user.address,
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerUpdateUser } = useMutation({
    mutationFn: userHttpClient.updateUser(user?.id ?? ''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
      toast.success('User updated successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (payload: UpdateUserSchema) => {
    await triggerUpdateUser(payload);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }

    onOpenChange?.(open);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user info</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="grid grid-cols-2 gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              name="firstName"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel required>First name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="lastName"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel required>Last name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="address"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="col-span-2">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function UserCreateDialog({ onOpenChange, ...props }: ComponentProps<typeof Dialog>) {
  const form = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
    values: {
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      address: '',
      role: Role.GUEST,
      branch: undefined, // auto select branch for branch admin
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerUpdateUser } = useMutation({
    mutationFn: (payload: CreateUserSchema) => userHttpClient.createNewUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
      toast.success('Guest created successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (values: CreateUserSchema) => {
    console.log(values);
    await triggerUpdateUser(values);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }

    onOpenChange?.(open);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new guest</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="grid grid-cols-2 gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              name="username"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel required>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel required>Password</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="firstName"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel required>First name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="lastName"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel required>Last name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="address"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="col-span-2">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
