import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PositionStatus } from '@/common/types/api/position/position-status.type';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { branchHttpClient, positionHttpClient } from '@/lib/http';

const formSchema = z.object({
  branchId: z.string({
    required_error: 'Please select a branch',
  }),
  positionId: z.string({
    required_error: 'Please select a position',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function GuestComputerLoginPage() {
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branchId: '',
      positionId: '',
    },
  });

  const { data: branchesData, isLoading: isLoadingBranches } = useQuery({
    queryKey: ['branches', 'all'],
    queryFn: async () => branchHttpClient.getAllBranches(),
  });

  const { data: positionsData, isLoading: isLoadingPositions } = useQuery({
    queryKey: ['positions', 'all', { branch: selectedBranch, status: PositionStatus.AVAILABLE }],
    queryFn: async () =>
      positionHttpClient.getAllPositions({
        branch: selectedBranch || undefined,
        status: [PositionStatus.AVAILABLE],
      }),
    enabled: !!selectedBranch,
  });

  const branches = branchesData?.data || [];
  const positions = positionsData?.data || [];

  const onSubmit = (values: FormValues) => {
    navigate({ to: `/guests/login-computer/position/${values.positionId}/computer` });
  };

  const handleBranchChange = (value: string) => {
    setSelectedBranch(value);
    form.setValue('branchId', value);
    form.setValue('positionId', '');
  };

  // Add this function to properly handle position selection
  const handlePositionChange = (value: string) => {
    form.setValue('positionId', value);
  };

  // Check if both a branch and position are selected
  const isBothSelected = !!selectedBranch && !!form.watch('positionId');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Computer Login</CardTitle>
          <CardDescription>Select a branch and position to login</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Branch</FormLabel>
                    <Select
                      disabled={isLoadingBranches}
                      onValueChange={(value) => handleBranchChange(value)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.length === 0 ? (
                          <div className="p-2 text-center text-muted-foreground">
                            No branches available
                          </div>
                        ) : (
                          branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="positionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Position</FormLabel>
                    <Select
                      disabled={!selectedBranch || isLoadingPositions}
                      onValueChange={(value) => handlePositionChange(value)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {positions.length === 0 ? (
                          <div className="p-2 text-center text-muted-foreground">
                            No available positions for this branch
                          </div>
                        ) : (
                          positions.map((position) => (
                            <SelectItem key={position.id} value={position.id}>
                              {position.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={!isBothSelected}>
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
