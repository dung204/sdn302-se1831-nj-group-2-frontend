import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, getRouteApi, useNavigate } from '@tanstack/react-router';
import { type RowSelectionState } from '@tanstack/react-table';
import { Edit, Ellipsis, EyeIcon, Plus, Trash2 } from 'lucide-react';
import { type ComponentProps, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useAuth } from '@/common/hooks';
import type { SuccessResponse } from '@/common/types';
import type { UpdateProviderSchema } from '@/common/types/api/provider';
import {
  type CreateServiceSchema,
  type Service,
  type UpdateServiceSchema,
  createServiceSchema,
  serviceSearchParamsSchema,
  updateServiceSchema,
} from '@/common/types/api/service';
import { Role, type User } from '@/common/types/api/user';
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
import { branchHttpClient, providerHttpClient, serviceCategoryHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/providers/');

export function ManageProvidersPage() {
  const searchParams = serviceSearchParamsSchema.parse(route.useSearch());
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: res, isLoading } = useQuery({
    queryKey: ['providers', 'all', searchParams],
    queryFn: async () => providerHttpClient.getAllProviders(searchParams),
  });

  const [providersToDelete, setProvidersToDelete] = useState<RowSelectionState>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [providerToUpdate, setProviderToUpdate] = useState<Service | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" />;
  }
  if (![Role.OWNER, Role.BRANCH_ADMIN].includes(user.role)) {
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
        enableRowSelection={() => true}
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
            cell: ({ row }) => (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex size-full items-center justify-center">
                  <Ellipsis className="size-6" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => e.stopPropagation()}
                    onSelect={() => {
                      setProviderToUpdate(null);
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
            ),
            enableSorting: false,
            enableHiding: false,
            enableResizing: false,
          },
        ]}
      />
      <ServiceDeleteDialog
        serviceIds={Object.keys(providersToDelete)}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={() => setProvidersToDelete({})}
      />
      <ServiceUpdateDialog
        service={providerToUpdate!}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
      />
      <ServiceCreateDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}

interface ServiceDeleteDialogProps extends ComponentProps<typeof AlertDialog> {
  serviceIds: string[];
  onDelete?: (deletedServiceIds: string[]) => void;
}

function ServiceDeleteDialog({ serviceIds, onDelete, ...props }: ServiceDeleteDialogProps) {
  const searchParams = serviceSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerDeleteServices, isPending } = useMutation({
    mutationFn: async (serviceIds: string[]) => {
      const result = await Promise.allSettled(
        serviceIds.map((id) => providerHttpClient.softDeleteProvider(id)),
      );
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({ queryKey: ['services', 'all'] });
      const res = queryClient.getQueryData<SuccessResponse<Service[]>>([
        'services',
        'all',
        searchParams,
      ]);
      if (
        res!.meta.pagination.page > res!.meta.pagination.totalPage &&
        res!.meta.pagination.totalPage > 0
      ) {
        navigate({
          to: '/services',
          search: { ...searchParams, page: res!.meta.pagination.totalPage },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} deleted, ${rejected?.length || 0} failed`);
      onDelete?.(serviceIds);
    },
  });

  const handleDelete = async () => {
    await triggerDeleteServices(serviceIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {serviceIds.length === 1
              ? 'Are you sure to delete this provider?'
              : `Are you sure to delete ${serviceIds.length} selected provider?`}
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

interface ServiceUpdateDialogProps extends ComponentProps<typeof Dialog> {
  service: Service | null;
}

function ServiceUpdateDialog({ service, onOpenChange, ...props }: ServiceUpdateDialogProps) {
  const { user } = useAuth(); // Access user here

  const getDefaultBranch = (user: User | null): string[] => {
    if (!user) return [];
    if ('branch' in user && (user.role === Role.BRANCH_ADMIN || user.role === Role.STAFF)) {
      return [user.branch.id];
    }
    return [];
  };

  const defaultBranch = getDefaultBranch(user);
  const form = useForm<UpdateServiceSchema>({
    resolver: zodResolver(updateServiceSchema),
    values: {
      name: !service ? '' : service.name,
      description: !service ? '' : service.description,
      price: !service ? 0 : service.price,
      category: !service ? '' : service.category.id,
      branches: defaultBranch,
    },
  });
  const { data: categories } = useQuery({
    queryKey: ['service-categories', 'all'],
    queryFn: async () => serviceCategoryHttpClient.getAllServiceCategories(),
  });
  console.log('categories', categories);
  console.log('service', service);

  const { data: branches } = useQuery({
    queryKey: ['branchs', 'all'],
    queryFn: async () => branchHttpClient.getAllBranches(),
  });
  console.log('branches', branches);

  const queryClient = useQueryClient();
  const { mutateAsync: triggerUpdateService } = useMutation({
    mutationFn: providerHttpClient.updateProvider(service?.id ?? ''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['services', 'all'] });
      toast.success('Service updated successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (payload: UpdateProviderSchema) => {
    await triggerUpdateService(payload);
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
          <DialogTitle>Edit provider</DialogTitle>
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

function ServiceCreateDialog({ onOpenChange, ...props }: ComponentProps<typeof Dialog>) {
  const { user } = useAuth(); // Access user here

  const defaultBranch = useMemo(() => {
    if (!user) return []; // Handle null case
    if ('branch' in user && (user.role === Role.BRANCH_ADMIN || user.role === Role.STAFF)) {
      return [user.branch.id]; // Default to user's branch
    }
    return []; // Empty for OWNER or GUEST
  }, [user]);

  const form = useForm<CreateServiceSchema>({
    resolver: zodResolver(createServiceSchema),
    values: {
      name: '',
      description: '',
      price: 0,
      category: '',
      branches: defaultBranch,
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerCreateService } = useMutation({
    mutationFn: (payload: CreateServiceSchema) => providerHttpClient.createNewProvider(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['services', 'all'] });
      toast.success('Service created successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (values: CreateServiceSchema) => {
    await triggerCreateService(values);
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
