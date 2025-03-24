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
  type CreateServiceCategorieSchema,
  type ServiceCategories,
  type UpdateServiceCategoriesSchema,
  createServiceCategoriesSchema,
  serviceCategoriesSearchParamsSchema,
  updateServiceCategoriesSchema,
} from '@/common/types/api/service-categories';
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
import { ServiceCategoriesDataTable } from '@/components/ui/data-table';
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
import { serviceCategoriesHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/service-categories/');

export function ManageServiceCategoriesPage() {
  const searchParams = serviceCategoriesSearchParamsSchema.parse(route.useSearch());
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: res, isLoading } = useQuery({
    queryKey: ['serviceCategories', 'all', searchParams],
    queryFn: async () => serviceCategoriesHttpClient.getAllServiceCategories(searchParams),
  });

  const [categoriesToDelete, setCategoriesToDelete] = useState<RowSelectionState>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToUpdate, setCategoryToUpdate] = useState<ServiceCategories | null>(null);
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
        {Object.keys(categoriesToDelete).length === 0 || (
          <Button variant="danger" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="size-4" /> Delete selected
          </Button>
        )}
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="size-4" /> Add new category
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: '/service-categories/deleted' })}>
          <EyeIcon className="size-4" /> View deleted computers
        </Button>
      </div>
      <ServiceCategoriesDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        enableRowSelection={() => true} // Cho phép chọn tất cả các hàng
        onRowSelectionChange={setCategoriesToDelete}
        state={{
          rowSelection: categoriesToDelete,
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
                      setCategoryToUpdate(row.original);
                      setIsUpdateDialogOpen(true);
                    }}
                  >
                    <Edit className="size-4" /> Edit
                  </DropdownMenuItem>
                  {Object.keys(categoriesToDelete).length === 0 && (
                    <DropdownMenuItem
                      className="text-danger focus:bg-danger focus:text-danger-foreground"
                      onClick={(e) => e.stopPropagation()}
                      onSelect={() => {
                        setCategoriesToDelete({ [row.original.id]: true });
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
      <ServiceCategoryDeleteDialog
        categoryIds={Object.keys(categoriesToDelete)}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={() => setCategoriesToDelete({})}
      />
      <ServiceCategoryUpdateDialog
        category={categoryToUpdate!}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
      />
      <ServiceCategoryCreateDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}

interface ServiceCategoryDeleteDialogProps extends ComponentProps<typeof AlertDialog> {
  categoryIds: string[];
  onDelete?: (deletedCategoryIds: string[]) => void;
}

function ServiceCategoryDeleteDialog({
  categoryIds,
  onDelete,
  ...props
}: ServiceCategoryDeleteDialogProps) {
  const searchParams = serviceCategoriesSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerDeleteCategories, isPending } = useMutation({
    mutationFn: async (categoryIds: string[]) => {
      const result = await Promise.allSettled(
        categoryIds.map((id) => serviceCategoriesHttpClient.softDeleteServiceCategories(id)),
      );
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({ queryKey: ['serviceCategories', 'all'] });
      const res = queryClient.getQueryData<SuccessResponse<ServiceCategories[]>>([
        'serviceCategories',
        'all',
        searchParams,
      ]);
      if (
        res!.meta.pagination.page > res!.meta.pagination.totalPage &&
        res!.meta.pagination.totalPage > 0
      ) {
        navigate({
          to: '/service-categories',
          search: { ...searchParams, page: res!.meta.pagination.totalPage },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} deleted, ${rejected?.length || 0} failed`);
      onDelete?.(categoryIds);
    },
  });

  const handleDelete = async () => {
    await triggerDeleteCategories(categoryIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {categoryIds.length === 1
              ? 'Are you sure to delete this service category?'
              : `Are you sure to delete ${categoryIds.length} selected service categories?`}
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

interface ServiceCategoryUpdateDialogProps extends ComponentProps<typeof Dialog> {
  category: ServiceCategories | null;
}

function ServiceCategoryUpdateDialog({
  category,
  onOpenChange,
  ...props
}: ServiceCategoryUpdateDialogProps) {
  const form = useForm<UpdateServiceCategoriesSchema>({
    resolver: zodResolver(updateServiceCategoriesSchema),
    values: {
      name: !category ? '' : category.name,
      description: !category ? '' : category.description,
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerUpdateCategory } = useMutation({
    mutationFn: serviceCategoriesHttpClient.updateServiceCategories(category?.id ?? ''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['serviceCategories', 'all'] });
      toast.success('Service category updated successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (payload: UpdateServiceCategoriesSchema) => {
    await triggerUpdateCategory(payload);
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
          <DialogTitle>Edit service category</DialogTitle>
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

function ServiceCategoryCreateDialog({ onOpenChange, ...props }: ComponentProps<typeof Dialog>) {
  const form = useForm<CreateServiceCategorieSchema>({
    resolver: zodResolver(createServiceCategoriesSchema),
    values: {
      name: '',
      description: '',
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerCreateCategory } = useMutation({
    mutationFn: (payload: CreateServiceCategorieSchema) =>
      serviceCategoriesHttpClient.createNewServiceCategories(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['serviceCategories', 'all'] });
      toast.success('Service category created successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (values: CreateServiceCategorieSchema) => {
    await triggerCreateCategory(values);
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
          <DialogTitle>Add new service category</DialogTitle>
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
