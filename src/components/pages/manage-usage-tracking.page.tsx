import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, getRouteApi, useNavigate } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { Edit, Ellipsis, Plus, Trash2 } from 'lucide-react';
import { type ComponentProps, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useAuth } from '@/common/hooks';
import type { SuccessResponse } from '@/common/types';
import {
  type CreateUsageTrackingSchema,
  type UpdateUsageTrackingSchema,
  type UsageTracking,
  createUsageTrackingSchema,
  updateUsageTrackingSchema,
} from '@/common/types/api/usage-tracking';
import { usageTrackingSearchParamsSchema } from '@/common/types/api/usage-tracking/usage-tracking-search-params.type';
import { Role } from '@/common/types/api/user';
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
import { UsageTrackingDataTable } from '@/components/ui/data-table';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { computerHttpClient, usageTrackingHttpClient, userHttpClient } from '@/lib/http';

// import { Checkbox } from '@/components/ui/checkbox';

const route = getRouteApi('/_non-auth-layout/usage-tracking/');

export function ManageUsageTrackingPage() {
  const { user } = useAuth();
  const searchParams = usageTrackingSearchParamsSchema.parse(route.useSearch());

  const { data: res, isLoading } = useQuery({
    queryKey: ['usage-tracking', 'all', searchParams],
    queryFn: () => usageTrackingHttpClient.getAllUsageTrackings(searchParams),
  });

  const [usageTrackingToDelete, setUsageTrackingToDelete] = useState<RowSelectionState>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [usageTrackingToUpdate, setUsageToUpdate] = useState<UsageTracking | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // incorrect role
  if (user?.role === Role.GUEST) {
    return <Navigate to="/" />;
  }

  // correct role => return the page
  return (
    <>
      <div className="flex flex-col gap-4">
        {/* button add new */}
        <div className="flex items-center justify-end gap-4">
          {Object.keys(usageTrackingToDelete).length === 0 || (
            <Button variant="danger" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="size-4" /> Delete selected
            </Button>
          )}
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="size-4" /> Add new usage tracking
          </Button>
        </div>

        {/* table */}
        <UsageTrackingDataTable
          data={res?.data ?? []}
          loading={isLoading}
          pagination={res?.meta.pagination}
          sorting={res?.meta.sorting}
          filter={res?.meta.filter}
          enableRowSelection={(row) => row.original.id !== user?.id}
          onRowSelectionChange={setUsageTrackingToDelete}
          state={{
            rowSelection: usageTrackingToDelete,
          }}
          //
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
                if (row.original.id === user?.id) {
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
                if (row.original.id === user?.id) {
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
                          setUsageToUpdate(row.original);
                          setIsUpdateDialogOpen(true);
                        }}
                      >
                        <Edit className="size-4" /> Edit
                      </DropdownMenuItem>
                      {Object.keys(usageTrackingToDelete).length === 0 && (
                        <DropdownMenuItem
                          className="text-danger focus:bg-danger focus:text-danger-foreground"
                          onClick={(e) => e.stopPropagation()}
                          onSelect={() => {
                            setUsageTrackingToDelete({ [row.original.id]: true });
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
      </div>

      {/*  */}
      <UserDeleteDialog
        userIds={Object.keys(usageTrackingToDelete)}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={() => setUsageTrackingToDelete({})}
      />
      <UsageUpdateDialog
        usageTracking={usageTrackingToUpdate!}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
      />
      <UsageCreateDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </>
  );
}

interface UsageTrackingDeleteDialogProps extends ComponentProps<typeof AlertDialog> {
  userIds: string[];
  onDelete?: (deletedUserIds: string[]) => void;
}

function UserDeleteDialog({ userIds, onDelete, ...props }: UsageTrackingDeleteDialogProps) {
  const searchParams = usageTrackingSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerDeleteUsage, isPending } = useMutation({
    mutationFn: async (userIds: string[]) => {
      const result = await Promise.allSettled(
        userIds.map((id) => usageTrackingHttpClient.softDeleteUsageTracking(id)),
      );
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({ queryKey: ['usage-tracking', 'all'] });
      const res = queryClient.getQueryData<SuccessResponse<UsageTracking[]>>([
        'usage-tracking',
        'all',
        searchParams,
      ]);
      if (
        res!.meta.pagination.page > res!.meta.pagination.totalPage &&
        res!.meta.pagination.totalPage > 0
      ) {
        navigate({
          to: '/usage-tracking',
          search: { ...searchParams, page: res!.meta.pagination.totalPage },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} deleted, ${rejected?.length || 0} failed`);
      onDelete?.(userIds);
    },
  });

  const handleDelete = async () => {
    await triggerDeleteUsage(userIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {userIds.length === 1
              ? 'Are you sure to delete this usage tracking?'
              : `Are you sure to delete ${userIds.length} selected  usage tracking?`}
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

interface UsageUpdateDialogProps extends ComponentProps<typeof Dialog> {
  usageTracking: UsageTracking | null;
}

function UsageUpdateDialog({ usageTracking, onOpenChange, ...props }: UsageUpdateDialogProps) {
  const form = useForm<UpdateUsageTrackingSchema>({
    resolver: zodResolver(updateUsageTrackingSchema),
    values: {
      user: !usageTracking ? '' : usageTracking.user?.id,
      computer: !usageTracking ? '' : usageTracking.computer?.id,
      startTimeStamp: !usageTracking ? '' : usageTracking.startTimeStamp,
      endTimeStamp: !usageTracking ? '' : usageTracking.endTimeStamp,
    },
  });

  const { data: users } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => userHttpClient.getAllUsers(),
  });

  const { data: computers } = useQuery({
    queryKey: ['computers', 'all'],
    queryFn: () => computerHttpClient.getAllComputer(),
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerUpdateUser } = useMutation({
    mutationFn: usageTrackingHttpClient.updateUsageTracking(usageTracking?.id ?? ''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usage-tracking', 'all'] });
      toast.success('Usage tracking updated successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (payload: UpdateUsageTrackingSchema) => {
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
          <DialogTitle>Edit new usage tracking</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="grid grid-cols-2 gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              name="user"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>User</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(users?.data ?? []).map((user) => (
                        <SelectItem key={user?.id} value={user?.id}>
                          {user?.firstName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="computer"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Computer</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(computers?.data ?? []).map((computer) => (
                        <SelectItem key={computer?.id} value={computer?.id}>
                          {computer?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/*  */}
            <FormField
              name="startTimeStamp"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel required>Start time stamp</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/*  */}
            <FormField
              name="endTimeStamp"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel required>End time stamp</FormLabel>
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

function UsageCreateDialog({ onOpenChange, ...props }: ComponentProps<typeof Dialog>) {
  const form = useForm<CreateUsageTrackingSchema>({
    resolver: zodResolver(createUsageTrackingSchema),
    values: {
      user: '',
      computer: '',
      startTimeStamp: '',
      endTimeStamp: '',
    },
  });

  const { data: users } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => userHttpClient.getAllUsers(),
  });

  const { data: computers } = useQuery({
    queryKey: ['computers', 'all'],
    queryFn: () => computerHttpClient.getAllComputer(),
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerUpdateUser } = useMutation({
    mutationFn: (payload: CreateUsageTrackingSchema) =>
      usageTrackingHttpClient.createNewUsageTracking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
      toast.success('User created successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (values: CreateUsageTrackingSchema) => {
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
          <DialogTitle>Add new usage tracking</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="grid grid-cols-2 gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              name="user"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>User</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(users?.data ?? []).map((user) => (
                        <SelectItem key={user?.id} value={user?.id}>
                          {user?.firstName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="computer"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Computer</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(computers?.data ?? []).map((computer) => (
                        <SelectItem key={computer?.id} value={computer?.id}>
                          {computer?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/*  */}
            <FormField
              name="startTimestamp"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel required>Start time stamp</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/*  */}
            <FormField
              name="endTimestamp"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel required>End time stamp</FormLabel>
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
