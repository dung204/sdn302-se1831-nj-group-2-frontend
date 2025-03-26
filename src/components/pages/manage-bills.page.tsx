import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, getRouteApi, useNavigate } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { Ellipsis, EyeIcon, Trash2 } from 'lucide-react';
import { type ComponentProps, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/common/hooks';
import { type SuccessResponse } from '@/common/types';
import { type Bill, billSearchParamsSchema } from '@/common/types/api/bill';
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
import { BillDataTable } from '@/components/ui/data-table/bill-data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { billHttpClient } from '@/lib/http/bill.http';

const route = getRouteApi('/_non-auth-layout/bills/');

export function ManageBillsPage() {
  const searchParams = billSearchParamsSchema.parse(route.useSearch());
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: res, isLoading } = useQuery({
    queryKey: ['bills', 'all', searchParams],
    queryFn: () => billHttpClient.getAllBills(searchParams),
  });

  const [branchesToDelete, setBranchesToDelete] = useState<RowSelectionState>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === Role.OWNER) {
      document.title = 'Existing bills | Internet Cafe Management';
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
        <Button variant="outline" onClick={() => navigate({ to: '/bills/deleted' })}>
          <EyeIcon className="size-4" /> View deleted bills
        </Button>
      </div>
      <BillDataTable
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
      <BillDeleteDialog
        billIds={Object.keys(branchesToDelete)}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={() => setBranchesToDelete({})}
      />
    </div>
  );
}

interface BillDeleteDialogProps extends ComponentProps<typeof AlertDialog> {
  billIds: string[];
  onDelete?: (deletedBranchIds: string[]) => void;
}

function BillDeleteDialog({ billIds, onDelete, ...props }: BillDeleteDialogProps) {
  const searchParams = billSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerDeleteBranches, isPending } = useMutation({
    mutationFn: async (branchIds: string[]) => {
      const result = await Promise.allSettled(
        branchIds.map((id) => billHttpClient.softDeleteBill(id)),
      );
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({ queryKey: ['bills', 'all'] });
      const res = queryClient.getQueryData<SuccessResponse<Bill[]>>(['bills', 'all', searchParams]);
      if (
        res!.meta.pagination.page > res!.meta.pagination.totalPage &&
        res!.meta.pagination.totalPage > 0
      ) {
        navigate({
          to: '/bills',
          search: { ...searchParams, page: res!.meta.pagination.totalPage },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} deleted, ${rejected?.length || 0} failed`);
      onDelete?.(billIds);
    },
  });

  const handleDelete = async () => {
    await triggerDeleteBranches(billIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {billIds.length === 1
              ? 'Are you sure to delete this branch?'
              : `Are you sure to delete ${billIds.length} selected branches?`}
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
