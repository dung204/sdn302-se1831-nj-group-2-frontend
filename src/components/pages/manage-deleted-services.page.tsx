import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { EyeIcon, Undo2 } from 'lucide-react';
import { type ComponentProps, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/common/hooks';
import type { SuccessResponse } from '@/common/types';
import { type Service, serviceSearchParamsSchema } from '@/common/types/api/service';
// Assuming this is where Service is defined
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
import { DataTableHeader, ServiceDataTable } from '@/components/ui/data-table';
import { serviceHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/services/deleted/');

export function ManageDeletedServicesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const searchParams = serviceSearchParamsSchema.parse(route.useSearch());

  const { data: res, isLoading } = useQuery({
    queryKey: ['deleted-services', 'all', searchParams],
    queryFn: () => serviceHttpClient.getAllDeletedService(searchParams),
  });

  const [selectedServices, setSelectedServices] = useState<RowSelectionState>({});
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === Role.OWNER) {
      document.title = 'Deleted Services | Internet Cafe Management';
    }
  }, [user]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-4">
        {Object.keys(selectedServices).length > 0 && (
          <Button onClick={() => setIsRestoreDialogOpen(true)}>
            <Undo2 className="size-4" /> Restore selected
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate({ to: '/services' })}>
          <EyeIcon className="size-4" /> View non-deleted services
        </Button>
      </div>
      <ServiceDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        onRowSelectionChange={setSelectedServices}
        state={{
          rowSelection: selectedServices,
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
      <ServiceRestoreDialog
        open={isRestoreDialogOpen}
        onOpenChange={setIsRestoreDialogOpen}
        serviceIds={Object.keys(selectedServices)}
        onRestore={() => setSelectedServices({})}
      />
    </div>
  );
}

interface ServiceRestoreDialogProps extends ComponentProps<typeof AlertDialog> {
  serviceIds: string[];
  onRestore?: (restoredServiceIds: string[]) => void;
}

function ServiceRestoreDialog({ serviceIds, onRestore, ...props }: ServiceRestoreDialogProps) {
  const searchParams = serviceSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerRestoreServices, isPending } = useMutation({
    mutationFn: async (serviceIds: string[]) => {
      const result = await Promise.allSettled(
        serviceIds.map((id) => serviceHttpClient.restoreService(id)),
      );
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({
        queryKey: ['deleted-services', 'all'],
      });
      const res = queryClient.getQueryData<SuccessResponse<Service[]>>([
        'deleted-services',
        'all',
        searchParams,
      ]);
      if (res && res.meta.pagination && res.meta.pagination.page > res.meta.pagination.totalPage) {
        navigate({
          to: '/services/deleted',
          search: {
            ...searchParams,
            page: res.meta.pagination.totalPage,
          },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} restored, ${rejected?.length || 0} failed`);
      onRestore?.(serviceIds);
    },
    onError: (error) => {
      toast.error(`Failed to restore services: ${error.message}`);
    },
  });

  const handleRestore = async () => {
    await triggerRestoreServices(serviceIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure to restore {serviceIds.length} deleted service
            {serviceIds.length > 1 ? 's' : ''}?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestore} disabled={isPending}>
            Restore
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
