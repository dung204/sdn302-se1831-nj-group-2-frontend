import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, getRouteApi, useNavigate } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { EyeIcon, Undo2 } from 'lucide-react';
import { type ComponentProps, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/common/hooks';
import type { SuccessResponse } from '@/common/types';
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
import { DataTableHeader } from '@/components/ui/data-table';
import { BillDataTable } from '@/components/ui/data-table/bill-data-table';
import { billHttpClient } from '@/lib/http/bill.http';

const route = getRouteApi('/_non-auth-layout/bills/deleted/');

export function ManageDeletedBillsPage() {
  const { user } = useAuth();
  const searchParams = billSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();

  const { data: res, isLoading } = useQuery({
    queryKey: ['deleted-bills', 'all', searchParams],
    queryFn: () => billHttpClient.getAllDeletedBills(searchParams),
  });

  const [selectedBills, setSelectedBills] = useState<RowSelectionState>({});
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === Role.OWNER || user?.role === Role.BRANCH_ADMIN) {
      document.title = 'Deleted bills | Internet Cafe Management';
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user!.role !== Role.OWNER && user!.role !== Role.BRANCH_ADMIN) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-4">
        {Object.keys(selectedBills).length === 0 || (
          <div className="flex justify-end">
            <Button onClick={() => setIsRestoreDialogOpen(true)}>
              <Undo2 className="size-4" /> Restore
            </Button>
          </div>
        )}
        <Button variant="outline" onClick={() => navigate({ to: '/bills' })}>
          <EyeIcon className="size-4" /> View deleted bills
        </Button>
      </div>

      <BillDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        onRowSelectionChange={setSelectedBills}
        state={{
          rowSelection: selectedBills,
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
              const date = new Date(row.getValue<string>('deleteTimestamp'));
              const formattedDate = new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'long',
              }).format(date);

              return <span>{formattedDate}</span>;
            },
          },
        ]}
      />
      <BillRestoreDialog
        open={isRestoreDialogOpen}
        onOpenChange={setIsRestoreDialogOpen}
        billIds={Object.keys(selectedBills)}
        onRestore={() => setSelectedBills({})}
      />
    </div>
  );
}

interface BillRestoreDialogProps extends ComponentProps<typeof AlertDialog> {
  billIds: string[];
  onRestore?: (restoredBillIds: string[]) => void;
}

function BillRestoreDialog({ billIds, onRestore, ...props }: BillRestoreDialogProps) {
  const searchParams = billSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerRestoreBills } = useMutation({
    mutationFn: async (billIds: string[]) => {
      const result = await Promise.allSettled(billIds.map((id) => billHttpClient.restoreBill(id)));
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({
        queryKey: ['deleted-bills', 'all'],
      });
      const res = queryClient.getQueryData<SuccessResponse<Bill[]>>([
        'deleted-bills',
        'all',
        searchParams,
      ]);
      if (res!.meta.pagination.page > res!.meta.pagination.totalPage) {
        navigate({
          to: '/bills/deleted',
          search: {
            ...searchParams,
            page: res!.meta.pagination.totalPage,
          },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} restored, ${rejected?.length || 0} failed`);
      onRestore?.(billIds);
    },
  });

  const handleRestore = async () => {
    await triggerRestoreBills(billIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure to restore {billIds.length} deleted bill(s)?
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
