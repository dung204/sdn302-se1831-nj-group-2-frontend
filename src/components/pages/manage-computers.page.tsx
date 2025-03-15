import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, getRouteApi } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { Edit, Ellipsis, Plus, Trash2 } from 'lucide-react';
import { type ComponentProps, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useAuth } from '@/common/hooks';
import { type SuccessResponse } from '@/common/types';
import {
  type Computer,
  type CreateComputerSchema,
  DeviceStatus,
  type Position,
  type Provider,
  type UpdateComputerSchema,
  createComputerSchema,
  updateComputerSchema,
} from '@/common/types/api/computer';
import { computerSearchParamsSchema } from '@/common/types/api/user/computer-search-param.type';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { positionHttpClient, providerHttpClient } from '@/lib/http';
import { computerHttpClient } from '@/lib/http/computer.http';

const route = getRouteApi('/_non-auth-layout/computers/');

export function ManageComputersPage() {
  const { user } = useAuth();
  const searchParams = computerSearchParamsSchema.parse(route.useSearch());

  const { data: res, isLoading } = useQuery({
    queryKey: ['computers', 'all', searchParams],
    queryFn: () => computerHttpClient.getAllComputers(searchParams),
  });

  // Lấy danh sách providers từ API
  const { data: providersResponse, isLoading: isLoadingProviders } = useQuery<
    SuccessResponse<Provider[]>
  >({
    queryKey: ['providers', 'all'],
    queryFn: () => providerHttpClient.getAllProviders(),
  });
  const providers = providersResponse?.data || [];

  // Lấy danh sách positions từ API
  const { data: positionsResponse, isLoading: isLoadingPositions } = useQuery<
    SuccessResponse<Position[]>
  >({
    queryKey: ['positions', 'all'],
    queryFn: () => positionHttpClient.getAllPositions(),
  });
  const positions = positionsResponse?.data || [];

  // console.log('providersResponse?.data', providersResponse?.data);
  // console.log('positionsResponse?.data', positionsResponse?.data);

  const [computersToDelete, setComputersToDelete] = useState<RowSelectionState>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [computerToUpdate, setComputerToUpdate] = useState<Computer | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'OWNER') {
      document.title = 'Existing computers | Internet Cafe Management';
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'OWNER') {
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
      </div>
      <ComputerDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        enableRowSelection={true} // Cho phép chọn tất cả các hàng
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
            cell: ({ row }) => (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex size-full items-center justify-center">
                  <Ellipsis className="size-6" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
            ),
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
        providers={providers}
        positions={positions}
        isLoadingProviders={isLoadingProviders}
        isLoadingPositions={isLoadingPositions}
      />
      <ComputerCreateDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}

interface ComputerDeleteDialogProps extends ComponentProps<typeof AlertDialog> {
  computerIds: string[];
  onDelete?: (deletedComputerIds: string[]) => void;
}

function ComputerDeleteDialog({ computerIds, onDelete, ...props }: ComputerDeleteDialogProps) {
  // const navigate = useNavigate();
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

// interface ComputerUpdateDialogProps extends ComponentProps<typeof Dialog> {
//   computer: Computer | null;
// }
interface ComputerUpdateDialogProps extends ComponentProps<typeof Dialog> {
  computer: Computer | null;
  providers: Provider[];
  positions: Position[];
  isLoadingProviders: boolean;
  isLoadingPositions: boolean;
}

function ComputerUpdateDialog({
  computer,
  onOpenChange,
  providers,
  positions,
  isLoadingProviders,
  isLoadingPositions,
  ...props
}: ComputerUpdateDialogProps) {
  const form = useForm<UpdateComputerSchema>({
    resolver: zodResolver(updateComputerSchema),
    values: {
      name: !computer ? '' : computer.name,
      position: !computer ? '' : computer.position.id, // Use positionId instead of the whole object
      status: !computer ? DeviceStatus.NORMAL : computer.status,
      pricePerHour: !computer ? 0 : computer.pricePerHour,
      cpu: !computer ? '' : computer.cpu,
      ram: !computer ? '' : computer.ram,
      storage: !computer ? '' : computer.storage,
      provider: !computer ? '' : computer.provider.id, // Use providerId instead of the whole object
      peripherals: !computer ? [] : computer.peripherals,
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
          <form className="grid grid-cols-2 gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel required>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="positionId"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel required>Position</FormLabel>
                  <Select
                    onValueChange={(value) => form.setValue('position', value)} // Only set the ID
                    value={field.value}
                    disabled={isLoadingPositions}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={isLoadingPositions ? 'Loading...' : 'Select a position'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {position.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="providerId"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel required>Provider</FormLabel>
                  <Select
                    onValueChange={(value) => form.setValue('provider', value)} // Only set the ID
                    value={field.value}
                    disabled={isLoadingProviders}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={isLoadingProviders ? 'Loading...' : 'Select a provider'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {providers.length > 0 ? (
                        providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="">
                          No providers available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="status"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Status</FormLabel>
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
              name="pricePerHour"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel required>Price/Hour</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))} // Ensure the value is a number
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="cpu"
              render={({ field }) => (
                <FormItem className="col-span-1">
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
                <FormItem className="col-span-1">
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
                <FormItem className="col-span-1">
                  <FormLabel required>Storage</FormLabel>
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

function ComputerCreateDialog({ onOpenChange, ...props }: ComponentProps<typeof Dialog>) {
  // Lấy danh sách providers từ API
  // Khai báo kiểu dữ liệu cho useQuery
  const { data: providersResponse, isLoading: isLoadingProviders } = useQuery<
    SuccessResponse<Provider[]>
  >({
    queryKey: ['providers', 'all'],
    queryFn: () => providerHttpClient.getAllProviders(),
  });

  // Lấy danh sách positions từ API
  const { data: positionsResponse, isLoading: isLoadingPositions } = useQuery<
    SuccessResponse<Position[]>
  >({
    queryKey: ['positions', 'all'],
    queryFn: () => positionHttpClient.getAllPositions(),
  });

  // console.log("providersResponse?.data", providersResponse?.data)
  // console.log("positionsResponse?.data", positionsResponse?.data)
  const form = useForm<CreateComputerSchema>({
    resolver: zodResolver(createComputerSchema),
    values: {
      name: '',
      position: '',
      status: DeviceStatus.NORMAL,
      pricePerHour: 0,
      cpu: '',
      ram: '',
      storage: '',
      provider: '',
      peripherals: [],
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: triggerCreateComputer } = useMutation({
    mutationFn: (payload: CreateComputerSchema) => computerHttpClient.createNewComputer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['computers', 'all'] });
      toast.success('Computer created successfully!');
      handleOpenChange(false);
    },
    onError: (error) => {
      console.error('Error creating computer:', error); // Xử lý lỗi và hiển thị trên console
      toast.error('Failed to create computer.'); // Hiển thị thông báo lỗi
    },
  });

  const handleSubmit = async (values: CreateComputerSchema) => {
    console.log('handleSubmit is called'); // Kiểm tra xem hàm có được gọi không
    console.log('Form data on submit:', values); // Kiểm tra dữ liệu form
    await triggerCreateComputer(values);
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
          <form className="grid grid-cols-2 gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel required>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="position.id"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel required>Position</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      form.setValue('position', value); // Set only the id in the form
                    }}
                    value={field.value}
                    disabled={isLoadingPositions}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={isLoadingPositions ? 'Loading...' : 'Select a position'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {positionsResponse?.data && positionsResponse?.data.length > 0 ? (
                        positionsResponse?.data.map((position) => (
                          <SelectItem key={position.id} value={position.id}>
                            {position.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="">
                          No positions available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="provider.id"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel required>Provider</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      form.setValue('provider', value);
                    }}
                    value={field.value}
                    disabled={isLoadingProviders}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={isLoadingProviders ? 'Loading...' : 'Select a provider'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {providersResponse?.data && providersResponse?.data.length > 0 ? (
                        providersResponse?.data.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="">
                          No providers available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="status"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Status</FormLabel>
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
              name="pricePerHour"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel required>Price/Hour</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))} // Ensure the value is a number
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="cpu"
              render={({ field }) => (
                <FormItem className="col-span-1">
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
                <FormItem className="col-span-1">
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
                <FormItem className="col-span-1">
                  <FormLabel required>Storage</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="col-span-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
