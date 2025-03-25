import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, getRouteApi, useNavigate } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { Edit, Ellipsis, EyeIcon, Plus, Trash2 } from 'lucide-react';
import { type ComponentProps, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useAuth } from '@/common/hooks';
import { DeviceStatus, type SuccessResponse } from '@/common/types';
import {
  type Computer,
  type CreateComputerSchema,
  type UpdateComputerSchema,
  computerSearchParamsSchema,
  createComputerSchema,
  updateComputerSchema,
} from '@/common/types/api/computer';
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
import {
  AsyncSelect,
  getPeripheralAsyncSelectOptions,
  getPositionAsyncSelectOptions,
  getProviderAsyncSelectOptions,
} from '@/components/ui/async-select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CurrencyInput } from '@/components/ui/currency-input';
import { ComputerDataTable } from '@/components/ui/data-table';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { computerHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/computers/');

export function ManageComputersPage() {
  const searchParams = computerSearchParamsSchema.parse(route.useSearch());
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: res, isLoading } = useQuery({
    queryKey: ['computers', 'all', searchParams],
    queryFn: () => computerHttpClient.getAllComputers(searchParams),
  });

  const [computerToViewDetails, setComputerToViewDetails] = useState<Computer | null>(null);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [computersToDelete, setComputersToDelete] = useState<RowSelectionState>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [computerToUpdate, setComputerToUpdate] = useState<Computer | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === Role.OWNER) {
      document.title = 'Existing computers | Internet Cafe Management';
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
        {Object.keys(computersToDelete).length === 0 || (
          <Button variant="danger" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="size-4" /> Delete selected
          </Button>
        )}
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="size-4" /> Add new computer
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: '/computers/deleted' })}>
          <EyeIcon className="size-4" /> View deleted computers
        </Button>
      </div>
      <ComputerDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        onRowSelectionChange={setComputersToDelete}
        state={{
          rowSelection: computersToDelete,
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
                        setComputerToViewDetails(row.original);
                        setIsViewDetailsDialogOpen(true);
                      }}
                    >
                      <EyeIcon className="size-4" /> View details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => e.stopPropagation()}
                      onSelect={() => {
                        setComputerToUpdate(row.original);
                        setIsUpdateDialogOpen(true);
                      }}
                    >
                      <Edit className="size-4" /> Edit
                    </DropdownMenuItem>
                    {Object.keys(computersToDelete).length === 0 && (
                      <DropdownMenuItem
                        className="text-danger focus:bg-danger focus:text-danger-foreground"
                        onClick={(e) => e.stopPropagation()}
                        onSelect={() => {
                          setComputersToDelete({ [row.original.id]: true });
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
      <ComputerDeleteDialog
        computerIds={Object.keys(computersToDelete)}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={() => setComputersToDelete({})}
      />
      <ComputerUpdateDialog
        computer={computerToUpdate!}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
      />
      <ComputerCreateDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
      <ComputerViewDetailsDialog
        computer={computerToViewDetails}
        open={isViewDetailsDialogOpen}
        onOpenChange={setIsViewDetailsDialogOpen}
      />
    </div>
  );
}

interface ComputerDeleteDialogProps extends ComponentProps<typeof AlertDialog> {
  computerIds: string[];
  onDelete?: (deletedComputerIds: string[]) => void;
}

function ComputerDeleteDialog({ computerIds, onDelete, ...props }: ComputerDeleteDialogProps) {
  const searchParams = computerSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerDeleteComputers, isPending } = useMutation({
    mutationFn: async (computerIds: string[]) => {
      const result = await Promise.allSettled(
        computerIds.map((id) => computerHttpClient.softDeleteComputer(id)),
      );
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({ queryKey: ['computers', 'all'] });
      const res = queryClient.getQueryData<SuccessResponse<Computer[]>>([
        'computers',
        'all',
        searchParams,
      ]);
      if (
        res!.meta.pagination.page > res!.meta.pagination.totalPage &&
        res!.meta.pagination.totalPage > 0
      ) {
        navigate({
          to: '/computers',
          search: { ...searchParams, page: res!.meta.pagination.totalPage },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} deleted, ${rejected?.length || 0} failed`);
      onDelete?.(computerIds);
    },
  });

  const handleDelete = async () => {
    await triggerDeleteComputers(computerIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {computerIds.length === 1
              ? 'Are you sure to delete this computer?'
              : `Are you sure to delete ${computerIds.length} selected computers?`}
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

interface ComputerViewDetailsDialogProps extends ComponentProps<typeof Dialog> {
  computer: Computer | null;
}

function ComputerViewDetailsDialog({ computer, ...props }: ComputerViewDetailsDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Computer details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-lg font-semibold">{computer?.name}</p>
          </div>
          <div className="col-span-1">
            <p className="text-sm text-muted-foreground">Position</p>
            <p className="text-lg font-semibold">{computer?.position.name}</p>
          </div>
          <div className="col-span-1">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-lg font-semibold">{computer?.status}</p>
          </div>
          <div className="col-span-1">
            <p className="text-sm text-muted-foreground">Price/Hour</p>
            <p className="text-lg font-semibold">${computer?.pricePerHour.toFixed(2)}</p>
          </div>
          <div className="col-span-1">
            <p className="text-sm text-muted-foreground">CPU</p>
            <p className="text-lg font-semibold">{computer?.cpu}</p>
          </div>
          <div className="col-span-1">
            <p className="text-sm text-muted-foreground">RAM</p>
            <p className="text-lg font-semibold">{computer?.ram}</p>
          </div>
          <div className="col-span-1">
            <p className="text-sm text-muted-foreground">Storage</p>
            <p className="text-lg font-semibold">{computer?.storage}</p>
          </div>
          <div className="col-span-1">
            <p className="text-sm text-muted-foreground">Provider</p>
            <p className="text-lg font-semibold">{computer?.provider.name}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Provider</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {computer?.peripherals.map((p, index) => (
                  <TableRow key={p.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.type}</TableCell>
                    <TableCell>{p.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ComputerUpdateDialogProps extends ComponentProps<typeof Dialog> {
  computer: Computer | null;
}

function ComputerUpdateDialog({ computer, onOpenChange, ...props }: ComputerUpdateDialogProps) {
  const form = useForm<UpdateComputerSchema>({
    resolver: zodResolver(updateComputerSchema),
    values: {
      name: !computer ? '' : computer.name,
      position: !computer ? '' : computer.position.id,
      status: !computer ? DeviceStatus.NORMAL : computer.status,
      provider: !computer ? '' : computer.provider.id,
      pricePerHour: !computer ? 0 : computer.pricePerHour,
      cpu: !computer ? '' : computer.cpu,
      ram: !computer ? '' : computer.ram,
      storage: !computer ? '' : computer.storage,
      peripherals: !computer ? [] : computer.peripherals.map((p) => p.id),
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerUpdateComputer } = useMutation({
    mutationFn: computerHttpClient.updateComputer(computer?.id ?? ''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['computers', 'all'] });
      toast.success('Computer updated successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (payload: UpdateComputerSchema) => {
    await triggerUpdateComputer(payload);
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
          <DialogTitle>Edit computer info</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <ScrollArea className="h-96 w-full">
              <div className="grid grid-cols-2 gap-4">
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
                  name="status"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel required>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(DeviceStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="position"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel required>Position</FormLabel>
                      <FormControl>
                        <AsyncSelect
                          value={field.value}
                          onChange={field.onChange}
                          {...getPositionAsyncSelectOptions('name')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="pricePerHour"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel required>Price/Hour</FormLabel>
                      <FormControl>
                        <CurrencyInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="cpu"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel required>CPU</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="ram"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel required>RAM</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="storage"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel required>Storage</FormLabel>
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
                        value={field.value}
                        onChange={field.onChange}
                        {...getProviderAsyncSelectOptions('name')}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="peripherals"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Peripherals</FormLabel>
                      <AsyncSelect
                        multiple
                        value={field.value}
                        onChange={field.onChange}
                        {...getPeripheralAsyncSelectOptions('name')}
                        placeholder="Select peripherals..."
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="col-span-2 mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ComputerCreateDialog({ onOpenChange, ...props }: ComponentProps<typeof Dialog>) {
  const form = useForm<CreateComputerSchema>({
    resolver: zodResolver(createComputerSchema),
    values: {
      name: '',
      position: '',
      status: DeviceStatus.NORMAL,
      provider: '',
      pricePerHour: 0,
      cpu: '',
      ram: '',
      storage: '',
      peripherals: [],
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerUpdateComputer } = useMutation({
    mutationFn: (payload: CreateComputerSchema) => computerHttpClient.createNewComputer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['computers', 'all'] });
      toast.success('Computer created successfully!');
      handleOpenChange(false);
    },
  });

  const handleSubmit = async (values: CreateComputerSchema) => {
    await triggerUpdateComputer(values);
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
          <DialogTitle>Add new computer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <ScrollArea className="h-96 w-full">
              <div className="grid grid-cols-2 gap-4">
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
                  name="status"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel required>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(DeviceStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="position"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel required>Position</FormLabel>
                      <FormControl>
                        <AsyncSelect
                          value={field.value}
                          onChange={field.onChange}
                          {...getPositionAsyncSelectOptions('name')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="pricePerHour"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel required>Price/Hour</FormLabel>
                      <FormControl>
                        <CurrencyInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="cpu"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel required>CPU</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="ram"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel required>RAM</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="storage"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel required>Storage</FormLabel>
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
                        value={field.value}
                        onChange={field.onChange}
                        {...getProviderAsyncSelectOptions('name')}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="peripherals"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Peripherals</FormLabel>
                      <AsyncSelect
                        multiple
                        value={field.value}
                        onChange={field.onChange}
                        {...getPeripheralAsyncSelectOptions('name')}
                        placeholder="Select peripherals..."
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="col-span-2 mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
