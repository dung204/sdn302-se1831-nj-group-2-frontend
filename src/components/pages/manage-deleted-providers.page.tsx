import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, getRouteApi, useNavigate } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { EyeIcon, Undo2 } from 'lucide-react';
import { type ComponentProps, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/common/hooks';
import type { SuccessResponse } from '@/common/types';
import { type Provider, providerSearchParamsSchema } from '@/common/types/api/provider';
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
import { DataTableHeader, ProviderDataTable } from '@/components/ui/data-table';
import { providerHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/providers/deleted/');

export function ManageDeletedProvidersPage() {
  const { user } = useAuth();
  const searchParams = providerSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();

  const { data: res, isLoading } = useQuery({
    queryKey: ['deleted-providers', 'all', searchParams],
    queryFn: () => providerHttpClient.getAllDeletedProviders(searchParams),
  });

  const [selectedProviders, setSelectedProviders] = useState<RowSelectionState>({});
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === Role.OWNER) {
      document.title = 'Deleted providers | Internet Cafe Management';
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user!.role !== Role.OWNER) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-4">
        {Object.keys(selectedProviders).length > 0 && (
          <Button onClick={() => setIsRestoreDialogOpen(true)}>
            <Undo2 className="size-4" /> Restore selected
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate({ to: '/providers' })}>
          <EyeIcon className="size-4" /> View non-deleted providers
        </Button>
      </div>
      <ProviderDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        onRowSelectionChange={setSelectedProviders}
        state={{
          rowSelection: selectedProviders,
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
        ]}
      />
      <ProviderRestoreDialog
        open={isRestoreDialogOpen}
        onOpenChange={setIsRestoreDialogOpen}
        providerIds={Object.keys(selectedProviders)}
        onRestore={() => setSelectedProviders({})}
      />
    </div>
  );
}

interface ProviderRestoreDialogProps extends ComponentProps<typeof AlertDialog> {
  providerIds: string[];
  onRestore?: (restoredProviderIds: string[]) => void;
}

function ProviderRestoreDialog({ providerIds, onRestore, ...props }: ProviderRestoreDialogProps) {
  const searchParams = providerSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerRestoreProviders } = useMutation({
    mutationFn: async (providerIds: string[]) => {
      const result = await Promise.allSettled(
        providerIds.map((id) => providerHttpClient.restoreProvider(id)),
      );
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({
        queryKey: ['deleted-providers', 'all'],
      });
      const res = queryClient.getQueryData<SuccessResponse<Provider[]>>([
        'deleted-providers',
        'all',
        searchParams,
      ]);
      if (res!.meta.pagination.page > res!.meta.pagination.totalPage) {
        navigate({
          to: '/providers/deleted',
          search: {
            ...searchParams,
            page: res!.meta.pagination.totalPage,
          },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} deleted, ${rejected?.length || 0} failed`);
      onRestore?.(providerIds);
    },
  });

  const handleRestore = async () => {
    await triggerRestoreProviders(providerIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure to restore {providerIds.length} deleted provider(s)?
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
