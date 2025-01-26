import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { Edit, Ellipsis, Plus, Trash2 } from 'lucide-react';
import { type ComponentProps, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Role, type SuccessResponse } from '@/common/types';
import {
  type CreateUserSchema,
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
import { UserForm } from '@/components/ui/form/user-form';
import { userHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/users/');

export function ManageUsersPage() {
  const searchParams = userSearchParamsSchema.parse(route.useSearch());

  const { data: res, isLoading } = useQuery({
    queryKey: ['users', searchParams],
    queryFn: () => userHttpClient.getAllUsers(searchParams),
  });

  const [usersToDelete, setUsersToDelete] = useState<RowSelectionState>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<User | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-4">
        {Object.keys(usersToDelete).length === 0 || (
          <Button variant="danger" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="size-4" /> Delete selected
          </Button>
        )}
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="size-4" /> Add new user
        </Button>
      </div>
      <UserDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        onRowSelectionChange={setUsersToDelete}
        state={{
          rowSelection: usersToDelete,
        }}
        renderColumns={(existingColumns) => [
          ...existingColumns,
          {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
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
            ),
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
        onSuccessUpdate={() => setIsUpdateDialogOpen(false)}
      />
      <UserCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccessCreate={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
}

interface UserDeleteDialogProps extends ComponentProps<typeof AlertDialog> {
  userIds: string[];
  onDelete?: (deletedUserIds: string[]) => void;
}

function UserDeleteDialog({
  userIds,
  onDelete,
  ...props
}: UserDeleteDialogProps) {
  const searchParams = userSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerDeleteUser } = useMutation({
    mutationFn: (id: string) => userHttpClient.softDeleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      const res = queryClient.getQueryData<SuccessResponse<User[]>>([
        'users',
        searchParams,
      ]);
      if (res!.meta.pagination.page > res!.meta.pagination.totalPage) {
        navigate({
          to: '/users',
          search: { ...searchParams, page: res!.meta.pagination.totalPage },
        });
      }
    },
  });

  const handleDelete = async () => {
    const result = await Promise.allSettled(
      userIds.map((id) => triggerDeleteUser(id)),
    );
    const { fulfilled, rejected } = Object.groupBy(result, (r) => r.status);
    toast.info(
      `Result: ${fulfilled?.length || 0} deleted, ${rejected?.length || 0} failed`,
    );
    onDelete?.(userIds);
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="danger" onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface UserUpdateDialogProps extends ComponentProps<typeof Dialog> {
  user: User | null;
  onSuccessUpdate?: (updatedUser: User) => void;
}

function UserUpdateDialog({
  user,
  onSuccessUpdate,
  onOpenChange,
  ...props
}: UserUpdateDialogProps) {
  const form = useForm<UpdateUserSchema>({
    resolver: zodResolver(updateUserSchema),
    values: {
      firstName: !user ? '' : user.firstName,
      lastName: !user ? '' : user.lastName,
      address: !user ? '' : user.address,
      role: !user ? Role.USER : user.role,
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerUpdateUser } = useMutation({
    mutationFn: userHttpClient.updateUser(user?.id ?? ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleSubmit = async (values: UpdateUserSchema) => {
    const { data } = await triggerUpdateUser(values);
    onSuccessUpdate?.(data);
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
        <UserForm form={form} onValidSubmit={handleSubmit}>
          <DialogFooter className="col-span-2">
            <Button type="submit">Save</Button>
          </DialogFooter>
        </UserForm>
      </DialogContent>
    </Dialog>
  );
}

interface UserCreateDialogProps extends ComponentProps<typeof Dialog> {
  onSuccessCreate?: (createdUser: User) => void;
}

function UserCreateDialog({
  onSuccessCreate,
  onOpenChange,
  ...props
}: UserCreateDialogProps) {
  const form = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
    values: {
      firstName: '',
      lastName: '',
      address: '',
      role: Role.USER,
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerUpdateUser, error } = useMutation({
    mutationFn: (payload: CreateUserSchema) =>
      userHttpClient.createNewUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleSubmit = async (values: CreateUserSchema) => {
    const { data } = await triggerUpdateUser(values);
    if (!error) {
      toast.success('User created successfully!');
      onSuccessCreate?.(data);
    }
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
          <DialogTitle>Add new user</DialogTitle>
        </DialogHeader>
        <UserForm form={form} onValidSubmit={handleSubmit}>
          <DialogFooter className="col-span-2">
            <Button type="submit">Add</Button>
          </DialogFooter>
        </UserForm>
      </DialogContent>
    </Dialog>
  );
}
