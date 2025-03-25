import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, getRouteApi, useNavigate } from '@tanstack/react-router';
import { type RowSelectionState } from '@tanstack/react-table';
import { Edit, Ellipsis, EyeIcon, Plus, Trash2 } from 'lucide-react';
import { type ComponentProps, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useAuth } from '@/common/hooks';
import type { SuccessResponse } from '@/common/types';
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
import { ServiceDataTable } from '@/components/ui/data-table';
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
import { branchHttpClient, serviceCategoryHttpClient, serviceHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/services/');

export function ManageServicesPage() {
  const searchParams = serviceSearchParamsSchema.parse(route.useSearch());
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: res, isLoading } = useQuery({
    queryKey: ['services', 'all', searchParams],
    queryFn: async () => serviceHttpClient.getAllService(searchParams),
  });

  const [servicesToDelete, setServicesToDelete] = useState<RowSelectionState>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToUpdate, setServiceToUpdate] = useState<Service | null>(null);
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
        {Object.keys(servicesToDelete).length === 0 || (
          <Button variant="danger" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="size-4" /> Delete selected
          </Button>
        )}
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="size-4" /> Add new service
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: '/services/deleted' })}>
          <EyeIcon className="size-4" /> View deleted services
        </Button>
      </div>
      <ServiceDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        enableRowSelection={() => true}
        onRowSelectionChange={setServicesToDelete}
        state={{
          rowSelection: servicesToDelete,
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
                      setServiceToUpdate(row.original);
                      setIsUpdateDialogOpen(true);
                    }}
                  >
                    <Edit className="size-4" /> Edit
                  </DropdownMenuItem>
                  {Object.keys(servicesToDelete).length === 0 && (
                    <DropdownMenuItem
                      className="text-danger focus:bg-danger focus:text-danger-foreground"
                      onClick={(e) => e.stopPropagation()}
                      onSelect={() => {
                        setServicesToDelete({ [row.original.id]: true });
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
        serviceIds={Object.keys(servicesToDelete)}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={() => setServicesToDelete({})}
      />
      <ServiceUpdateDialog
        service={serviceToUpdate!}
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
        serviceIds.map((id) => serviceHttpClient.softDeleteService(id)),
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
              ? 'Are you sure to delete this service?'
              : `Are you sure to delete ${serviceIds.length} selected services?`}
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
  const { data: categories, isLoading } = useQuery({
    queryKey: ['serviceCategories', 'all'],
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
    mutationFn: serviceHttpClient.updateService(service?.id ?? ''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['services', 'all'] });
      toast.success('Service updated successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (payload: UpdateServiceSchema) => {
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
          <DialogTitle>Edit service</DialogTitle>
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
              name="category"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel required>Category</FormLabel>
                  <Select
                    onValueChange={(value) => form.setValue('category', value)} // Only set the ID
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoading ? 'Loading...' : 'Select a category'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.data.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            <FormField
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
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

  // Helper function to safely get the default branch
  const getDefaultBranch = (user: User | null): string[] => {
    if (!user) return []; // Handle null case
    if ('branch' in user && (user.role === Role.BRANCH_ADMIN || user.role === Role.STAFF)) {
      return [user.branch.id]; // Default to user's branch
    }
    return []; // Empty for OWNER or GUEST
  };
  const defaultBranch = getDefaultBranch(user);

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
    mutationFn: (payload: CreateServiceSchema) => serviceHttpClient.createNewService(payload),
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

  const { data: categories, isLoading } = useQuery({
    queryKey: ['serviceCategories', 'all'],
    queryFn: async () => serviceCategoryHttpClient.getAllServiceCategories(),
  });
  console.log('categories', categories);

  const { data: branches } = useQuery({
    queryKey: ['branchs', 'all'],
    queryFn: async () => branchHttpClient.getAllBranches(),
  });
  console.log(branches);
  return (
    <Dialog onOpenChange={handleOpenChange} {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new service</DialogTitle>
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
              name="category"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel required>Category</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      form.setValue('category', value); // Set only the id in the form
                    }}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoading ? 'Loading...' : 'Select category'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.data && categories?.data.length > 0 ? (
                        categories?.data.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="">
                          No category available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
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
            <FormField
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
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
