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
  type Branch,
  type CreateBranchSchema,
  type UpdateBranchSchema,
  branchSearchParamsSchema,
  createBranchSchema,
  updateBranchSchema,
} from '@/common/types/api/branch';
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
import { BranchDataTable } from '@/components/ui/data-table';
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
import { branchHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/branches/');

export function ManageBranchesPage() {
  const searchParams = branchSearchParamsSchema.parse(route.useSearch());
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: res, isLoading } = useQuery({
    queryKey: ['branches', 'all', searchParams],
    queryFn: () => branchHttpClient.getAllBranches(searchParams),
  });

  const [branchesToDelete, setBranchesToDelete] = useState<RowSelectionState>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [branchToUpdate, setBranchToUpdate] = useState<Branch | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === Role.OWNER) {
      document.title = 'Existing branches | Internet Cafe Management';
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== Role.OWNER) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-4">
        {Object.keys(branchesToDelete).length === 0 || (
          <Button variant="danger" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="size-4" /> Delete selected
          </Button>
        )}
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="size-4" /> Add new branch
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: '/branches/deleted' })}>
          <EyeIcon className="size-4" /> View deleted branches
        </Button>
      </div>
      <BranchDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        onRowSelectionChange={setBranchesToDelete}
        state={{
          rowSelection: branchesToDelete,
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
            cell: ({ row }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                title="Select this row"
              />
            ),
            enableSorting: false,
            enableHiding: false,
            enableResizing: false,
          },
          ...existingColumns,
          {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex size-full items-center justify-center">
                    <Ellipsis className="size-6" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => e.stopPropagation()}
                      onSelect={() => {
                        setBranchToUpdate(row.original);
                        setIsUpdateDialogOpen(true);
                      }}
                    >
                      <Edit className="size-4" /> Edit
                    </DropdownMenuItem>
                    {Object.keys(branchesToDelete).length === 0 && (
                      <DropdownMenuItem
                        className="text-danger focus:bg-danger focus:text-danger-foreground"
                        onClick={(e) => e.stopPropagation()}
                        onSelect={() => {
                          setBranchesToDelete({ [row.original.id]: true });
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
      <BranchDeleteDialog
        branchIds={Object.keys(branchesToDelete)}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={() => setBranchesToDelete({})}
      />
      <BranchUpdateDialog
        branch={branchToUpdate!}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
      />
      <BranchCreateDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}

interface BranchDeleteDialogProps extends ComponentProps<typeof AlertDialog> {
  branchIds: string[];
  onDelete?: (deletedBranchIds: string[]) => void;
}

function BranchDeleteDialog({ branchIds, onDelete, ...props }: BranchDeleteDialogProps) {
  const searchParams = branchSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerDeleteBranches, isPending } = useMutation({
    mutationFn: async (branchIds: string[]) => {
      const result = await Promise.allSettled(
        branchIds.map((id) => branchHttpClient.softDeleteBranch(id)),
      );
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({ queryKey: ['branches', 'all'] });
      const res = queryClient.getQueryData<SuccessResponse<Branch[]>>([
        'branches',
        'all',
        searchParams,
      ]);
      if (
        res!.meta.pagination.page > res!.meta.pagination.totalPage &&
        res!.meta.pagination.totalPage > 0
      ) {
        navigate({
          to: '/branches',
          search: { ...searchParams, page: res!.meta.pagination.totalPage },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} deleted, ${rejected?.length || 0} failed`);
      onDelete?.(branchIds);
    },
  });

  const handleDelete = async () => {
    await triggerDeleteBranches(branchIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {branchIds.length === 1
              ? 'Are you sure to delete this branch?'
              : `Are you sure to delete ${branchIds.length} selected branches?`}
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

interface BranchUpdateDialogProps extends ComponentProps<typeof Dialog> {
  branch: Branch | null;
}

function BranchUpdateDialog({ branch, onOpenChange, ...props }: BranchUpdateDialogProps) {
  const form = useForm<UpdateBranchSchema>({
    resolver: zodResolver(updateBranchSchema),
    values: {
      name: !branch ? '' : branch.name,
      address: !branch ? '' : branch.address,
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerUpdateBranch } = useMutation({
    mutationFn: branchHttpClient.updateBranch(branch?.id ?? ''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['branchs', 'all'] });
      toast.success('Branch updated successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (payload: UpdateBranchSchema) => {
    await triggerUpdateBranch(payload);
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
          <DialogTitle>Edit branch info</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="grid grid-cols-2 gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel required>Name</FormLabel>
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

function BranchCreateDialog({ onOpenChange, ...props }: ComponentProps<typeof Dialog>) {
  const form = useForm<CreateBranchSchema>({
    resolver: zodResolver(createBranchSchema),
    values: {
      name: '',
      address: '',
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerUpdateBranch } = useMutation({
    mutationFn: (payload: CreateBranchSchema) => branchHttpClient.createNewBranch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches', 'all'] });
      toast.success('Branch created successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (values: CreateBranchSchema) => {
    await triggerUpdateBranch(values);
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
          <DialogTitle>Add new branch</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="grid grid-cols-2 gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel required>Name</FormLabel>
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
