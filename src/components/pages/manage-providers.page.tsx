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
  type CreateProviderSchema,
  type Provider,
  type UpdateProviderSchema,
  createProviderSchema,
  providerSearchParamsSchema,
  updateProviderSchema,
} from '@/common/types/api/provider';
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
import { ProviderDataTable } from '@/components/ui/data-table';
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
import { providerHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/providers/');

export function ManageProvidersPage() {
  const searchParams = providerSearchParamsSchema.parse(route.useSearch());
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: res, isLoading } = useQuery({
    queryKey: ['providers', 'all', searchParams],
    queryFn: () => providerHttpClient.getAllProviders(searchParams),
  });

  const [providersToDelete, setProvidersToDelete] = useState<RowSelectionState>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [providerToUpdate, setProviderToUpdate] = useState<Provider | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === Role.OWNER) {
      document.title = 'Existing providers | Internet Cafe Management';
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
        {Object.keys(providersToDelete).length === 0 || (
          <Button variant="danger" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="size-4" /> Delete selected
          </Button>
        )}
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="size-4" /> Add new provider
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: '/providers/deleted' })}>
          <EyeIcon className="size-4" /> View deleted providers
        </Button>
      </div>
      <ProviderDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        onRowSelectionChange={setProvidersToDelete}
        state={{
          rowSelection: providersToDelete,
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
                        setProviderToUpdate(row.original);
                        setIsUpdateDialogOpen(true);
                      }}
                    >
                      <Edit className="size-4" /> Edit
                    </DropdownMenuItem>
                    {Object.keys(providersToDelete).length === 0 && (
                      <DropdownMenuItem
                        className="text-danger focus:bg-danger focus:text-danger-foreground"
                        onClick={(e) => e.stopPropagation()}
                        onSelect={() => {
                          setProvidersToDelete({ [row.original.id]: true });
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
      <ProviderDeleteDialog
        providerIds={Object.keys(providersToDelete)}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={() => setProvidersToDelete({})}
      />
      <ProviderUpdateDialog
        provider={providerToUpdate!}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
      />
      <ProviderCreateDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}

interface ProviderDeleteDialogProps extends ComponentProps<typeof AlertDialog> {
  providerIds: string[];
  onDelete?: (deletedProviderIds: string[]) => void;
}

function ProviderDeleteDialog({ providerIds, onDelete, ...props }: ProviderDeleteDialogProps) {
  const searchParams = providerSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerDeleteProviders, isPending } = useMutation({
    mutationFn: async (providerIds: string[]) => {
      const result = await Promise.allSettled(
        providerIds.map((id) => providerHttpClient.softDeleteProvider(id)),
      );
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({ queryKey: ['providers', 'all'] });
      const res = queryClient.getQueryData<SuccessResponse<Provider[]>>([
        'providers',
        'all',
        searchParams,
      ]);
      if (
        res!.meta.pagination.page > res!.meta.pagination.totalPage &&
        res!.meta.pagination.totalPage > 0
      ) {
        navigate({
          to: '/providers',
          search: { ...searchParams, page: res!.meta.pagination.totalPage },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} deleted, ${rejected?.length || 0} failed`);
      onDelete?.(providerIds);
    },
  });

  const handleDelete = async () => {
    await triggerDeleteProviders(providerIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {providerIds.length === 1
              ? 'Are you sure to delete this provider?'
              : `Are you sure to delete ${providerIds.length} selected providers?`}
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

interface ProviderUpdateDialogProps extends ComponentProps<typeof Dialog> {
  provider: Provider | null;
}

function ProviderUpdateDialog({ provider, onOpenChange, ...props }: ProviderUpdateDialogProps) {
  const form = useForm<UpdateProviderSchema>({
    resolver: zodResolver(updateProviderSchema),
    values: {
      name: !provider ? '' : provider.name,
      description: !provider ? '' : provider.description,
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerUpdateProvider } = useMutation({
    mutationFn: providerHttpClient.updateProvider(provider?.id ?? ''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['providers', 'all'] });
      toast.success('Provider updated successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (payload: UpdateProviderSchema) => {
    await triggerUpdateProvider(payload);
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
          <DialogTitle>Edit provider info</DialogTitle>
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
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Description</FormLabel>
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

function ProviderCreateDialog({ onOpenChange, ...props }: ComponentProps<typeof Dialog>) {
  const form = useForm<CreateProviderSchema>({
    resolver: zodResolver(createProviderSchema),
    values: {
      name: '',
      description: '',
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerUpdateProvider } = useMutation({
    mutationFn: (payload: CreateProviderSchema) => providerHttpClient.createNewProvider(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers', 'all'] });
      toast.success('Provider created successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (values: CreateProviderSchema) => {
    await triggerUpdateProvider(values);
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
          <DialogTitle>Add new provider</DialogTitle>
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
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Description</FormLabel>
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
