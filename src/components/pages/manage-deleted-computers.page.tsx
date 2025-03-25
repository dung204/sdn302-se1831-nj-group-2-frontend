import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, getRouteApi, useNavigate } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { Ellipsis, EyeIcon, Undo2 } from 'lucide-react';
import { type ComponentProps, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/common/hooks';
import type { SuccessResponse } from '@/common/types';
import { type Computer, computerSearchParamsSchema } from '@/common/types/api/computer';
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
import { ComputerDataTable, DataTableHeader } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { computerHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/computers/deleted/');

export function ManageDeletedComputersPage() {
  const { user } = useAuth();
  const searchParams = computerSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();

  const { data: res, isLoading } = useQuery({
    queryKey: ['deleted-computers', 'all', searchParams],
    queryFn: () => computerHttpClient.getAllDeletedComputers(searchParams),
  });

  const [computerToViewDetails, setComputerToViewDetails] = useState<Computer | null>(null);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [selectedComputers, setSelectedComputers] = useState<RowSelectionState>({});
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === Role.OWNER) {
      document.title = 'Deleted computers | Internet Cafe Management';
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user!.role !== Role.BRANCH_ADMIN) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-4">
        {Object.keys(selectedComputers).length > 0 && (
          <Button onClick={() => setIsRestoreDialogOpen(true)}>
            <Undo2 className="size-4" /> Restore selected
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate({ to: '/computers' })}>
          <EyeIcon className="size-4" /> View non-deleted computers
        </Button>
      </div>
      <ComputerDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        onRowSelectionChange={setSelectedComputers}
        state={{
          rowSelection: selectedComputers,
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
            accessorKey: 'deleteTimestamp',
            header: ({ column }) => <DataTableHeader column={column} title="Deleted At" />,
            cell: ({ row }) => {
              const date = new Date(row.getValue<string>('createTimestamp'));
              const formattedDate = new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'long',
              }).format(date);

              return <span>{formattedDate}</span>;
            },
          },
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
      <ComputerViewDetailsDialog
        computer={computerToViewDetails}
        open={isViewDetailsDialogOpen}
        onOpenChange={setIsViewDetailsDialogOpen}
      />
      <ComputerRestoreDialog
        open={isRestoreDialogOpen}
        onOpenChange={setIsRestoreDialogOpen}
        computerIds={Object.keys(selectedComputers)}
        onRestore={() => setSelectedComputers({})}
      />
    </div>
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

interface ComputerRestoreDialogProps extends ComponentProps<typeof AlertDialog> {
  computerIds: string[];
  onRestore?: (restoredComputerIds: string[]) => void;
}

function ComputerRestoreDialog({ computerIds, onRestore, ...props }: ComputerRestoreDialogProps) {
  const searchParams = computerSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerRestoreComputers } = useMutation({
    mutationFn: async (computerIds: string[]) => {
      const result = await Promise.allSettled(
        computerIds.map((id) => computerHttpClient.restoreComputer(id)),
      );
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({
        queryKey: ['deleted-computers', 'all'],
      });
      const res = queryClient.getQueryData<SuccessResponse<Computer[]>>([
        'deleted-computers',
        'all',
        searchParams,
      ]);
      if (res!.meta.pagination.page > res!.meta.pagination.totalPage) {
        navigate({
          to: '/computers/deleted',
          search: {
            ...searchParams,
            page: res!.meta.pagination.totalPage,
          },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} deleted, ${rejected?.length || 0} failed`);
      onRestore?.(computerIds);
    },
  });

  const handleRestore = async () => {
    await triggerRestoreComputers(computerIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure to restore {computerIds.length} deleted computer(s)?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
