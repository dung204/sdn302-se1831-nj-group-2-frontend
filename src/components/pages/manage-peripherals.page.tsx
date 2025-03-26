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
  type CreatePeripheralSchema,
  type Peripheral,
  PeripheralType,
  type UpdatePeripheralSchema,
  createPeripheralSchema,
  peripheralSearchParamsSchema,
  updatePeripheralSchema,
} from '@/common/types/api/peripheral';
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
import { AsyncSelect, getProviderAsyncSelectOptions } from '@/components/ui/async-select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CurrencyInput } from '@/components/ui/currency-input';
import { PeripheralDataTable } from '@/components/ui/data-table';
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
import { peripheralHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/peripherals/');

export function ManagePeripheralsPage() {
  const searchParams = peripheralSearchParamsSchema.parse(route.useSearch());
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: res, isLoading } = useQuery({
    queryKey: ['peripherals', 'all', searchParams],
    queryFn: () => peripheralHttpClient.getAllPeripherals(searchParams),
  });

  const [peripheralsToDelete, setPeripheralsToDelete] = useState<RowSelectionState>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [peripheralToUpdate, setPeripheralToUpdate] = useState<Peripheral | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === Role.OWNER) {
      document.title = 'Existing peripherals | Internet Cafe Management';
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (![Role.OWNER, Role.BRANCH_ADMIN].includes(user.role)) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-4">
        {Object.keys(peripheralsToDelete).length === 0 || (
          <Button variant="danger" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="size-4" /> Delete selected
          </Button>
        )}
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="size-4" /> Add new peripheral
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: '/peripherals/deleted' })}>
          <EyeIcon className="size-4" /> View deleted peripherals
        </Button>
      </div>
      <PeripheralDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        onRowSelectionChange={setPeripheralsToDelete}
        state={{
          rowSelection: peripheralsToDelete,
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
                        setPeripheralToUpdate(row.original);
                        setIsUpdateDialogOpen(true);
                      }}
                    >
                      <Edit className="size-4" /> Edit
                    </DropdownMenuItem>
                    {Object.keys(peripheralsToDelete).length === 0 && (
                      <DropdownMenuItem
                        className="text-danger focus:bg-danger focus:text-danger-foreground"
                        onClick={(e) => e.stopPropagation()}
                        onSelect={() => {
                          setPeripheralsToDelete({ [row.original.id]: true });
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
      <PeripheralDeleteDialog
        peripheralIds={Object.keys(peripheralsToDelete)}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={() => setPeripheralsToDelete({})}
      />
      <PeripheralUpdateDialog
        peripheral={peripheralToUpdate!}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
      />
      <PeripheralCreateDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}

interface PeripheralDeleteDialogProps extends ComponentProps<typeof AlertDialog> {
  peripheralIds: string[];
  onDelete?: (deletedPeripheralIds: string[]) => void;
}

function PeripheralDeleteDialog({
  peripheralIds,
  onDelete,
  ...props
}: PeripheralDeleteDialogProps) {
  const searchParams = peripheralSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerDeletePeripherals, isPending } = useMutation({
    mutationFn: async (peripheralIds: string[]) => {
      const result = await Promise.allSettled(
        peripheralIds.map((id) => peripheralHttpClient.softDeletePeripheral(id)),
      );
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({ queryKey: ['peripherals', 'all'] });
      const res = queryClient.getQueryData<SuccessResponse<Peripheral[]>>([
        'peripherals',
        'all',
        searchParams,
      ]);
      if (
        res!.meta.pagination.page > res!.meta.pagination.totalPage &&
        res!.meta.pagination.totalPage > 0
      ) {
        navigate({
          to: '/peripherals',
          search: { ...searchParams, page: res!.meta.pagination.totalPage },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} deleted, ${rejected?.length || 0} failed`);
      onDelete?.(peripheralIds);
    },
  });

  const handleDelete = async () => {
    await triggerDeletePeripherals(peripheralIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {peripheralIds.length === 1
              ? 'Are you sure to delete this peripheral?'
              : `Are you sure to delete ${peripheralIds.length} selected peripherals?`}
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

interface PeripheralUpdateDialogProps extends ComponentProps<typeof Dialog> {
  peripheral: Peripheral | null;
}

function PeripheralUpdateDialog({
  peripheral,
  onOpenChange,
  ...props
}: PeripheralUpdateDialogProps) {
  const form = useForm<UpdatePeripheralSchema>({
    resolver: zodResolver(updatePeripheralSchema),
    values: {
      name: !peripheral ? '' : peripheral.name,
      brand: !peripheral ? '' : peripheral.brand,
      provider: !peripheral ? '' : peripheral.name,
      type: !peripheral ? PeripheralType.KEYBOARD : peripheral.type,
      importPrice: !peripheral ? 0 : peripheral.importPrice,
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerUpdatePeripheral } = useMutation({
    mutationFn: peripheralHttpClient.updatePeripheral(peripheral?.id ?? ''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['peripherals', 'all'] });
      toast.success('Peripheral updated successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (payload: UpdatePeripheralSchema) => {
    await triggerUpdatePeripheral(payload);
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
          <DialogTitle>Edit peripheral info</DialogTitle>
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
              name="type"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel required>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(PeripheralType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="brand"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel required>Brand</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="provider"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel required>Provider</FormLabel>
                  <AsyncSelect
                    value={field.name}
                    onChange={field.onChange}
                    {...getProviderAsyncSelectOptions('name')}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="importPrice"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel required>Import Price</FormLabel>
                  <CurrencyInput value={field.value} onChange={field.onChange} />
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

function PeripheralCreateDialog({ onOpenChange, ...props }: ComponentProps<typeof Dialog>) {
  const form = useForm<CreatePeripheralSchema>({
    resolver: zodResolver(createPeripheralSchema),
    values: {
      name: '',
      brand: '',
      provider: '',
      type: PeripheralType.KEYBOARD,
      importPrice: 0,
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerUpdatePeripheral } = useMutation({
    mutationFn: (payload: CreatePeripheralSchema) =>
      peripheralHttpClient.createNewPeripheral(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peripherals', 'all'] });
      toast.success('Peripheral created successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (values: CreatePeripheralSchema) => {
    await triggerUpdatePeripheral(values);
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
          <DialogTitle>Add new peripheral</DialogTitle>
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
              name="type"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel required>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(PeripheralType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="brand"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel required>Brand</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="provider"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel required>Provider</FormLabel>
                  <AsyncSelect
                    value={field.name}
                    onChange={field.onChange}
                    {...getProviderAsyncSelectOptions('name')}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="importPrice"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel required>Import Price</FormLabel>
                  <CurrencyInput value={field.value} onChange={field.onChange} />
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
