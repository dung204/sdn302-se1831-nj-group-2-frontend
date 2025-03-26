import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Clock, LogOut, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '@/common/hooks';
import type { CreateBillSchema } from '@/common/types/api/bill/create-bill.type';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { billHttpClient, computerHttpClient, positionHttpClient } from '@/lib/http';

// Time selection form schema
const timeSelectionSchema = z.object({
  hours: z.string().min(1, 'Please select play time'),
});

type TimeSelectionValues = z.infer<typeof timeSelectionSchema>;

// Computer price constants (should come from API in real implementation)
const PRICE_PER_HOUR = 15000; // 15,000 VND per hour

// Format currency as dollars
const formatCurrency = (amount: number) => {
  return `$${amount.toFixed(2)}`;
};

export function GuestComputerHomePage() {
  const { positionId } = useParams({
    from: '/_non-auth-layout/guests/login-computer/position/$positionId/computer/',
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showTimeSelectionDialog, setShowTimeSelectionDialog] = useState(true);
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const [showAddTimeDialog, setShowAddTimeDialog] = useState(false);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get position data
  const { data: positionData, isLoading: isPositionLoading } = useQuery({
    queryKey: ['position', positionId],
    queryFn: () => positionHttpClient.getPositionById(positionId),
    enabled: !!positionId,
  });

  const position = positionData?.data;

  // Get computer data for this position - each position has exactly one computer
  const { data: computerData, isLoading: isComputerLoading } = useQuery({
    queryKey: ['computer', positionId],
    queryFn: () =>
      computerHttpClient.getAllComputers({
        position: positionId,
      }),
    enabled: !!positionId && !!position,
  });

  // Since a position has exactly one computer, we can get it directly
  const computer = computerData?.data?.[0];
  const computerPrice = computer?.pricePerHour || PRICE_PER_HOUR;

  // Time selection form
  const timeSelectionForm = useForm<TimeSelectionValues>({
    resolver: zodResolver(timeSelectionSchema),
    defaultValues: {
      hours: '',
    },
  });

  const addTimeForm = useForm<TimeSelectionValues>({
    resolver: zodResolver(timeSelectionSchema),
    defaultValues: {
      hours: '',
    },
  });

  // Create bill mutation
  const { mutateAsync: createBill, isPending: isCreatingBill } = useMutation({
    mutationFn: (data: CreateBillSchema) => billHttpClient.createNewBill(data),
    onSuccess: (res) => {
      const bill = res.data;
      setActiveBillId(bill.id);

      if (bill.maxEndTimestamp) {
        const endTimeDate = new Date(bill.maxEndTimestamp);
        setEndTime(endTimeDate);
      }

      setShowTimeSelectionDialog(false);
      toast.success('Computer session started successfully');

      // Refresh user data instead of directly updating it
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update bill mutation (for adding time or logging out)
  const { mutateAsync: updateBill } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBillSchema> }) =>
      billHttpClient.updateBill(id)(data),
    onSuccess: (res) => {
      if (res.data.maxEndTimestamp) {
        const newEndTime = new Date(res.data.maxEndTimestamp);
        setEndTime(newEndTime);
      }

      // Refresh user data instead of directly updating it
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  // Calculate time remaining and update UI
  useEffect(() => {
    if (!endTime) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        // Time's up, automatically logout
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        handleLogout(true);
        return;
      }

      // Calculate remaining time
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    };

    // Update immediately and set interval
    updateTimeRemaining();
    timerRef.current = setInterval(updateTimeRemaining, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [endTime]);

  // Handle initial time selection and payment
  const handleTimeSelection = async (values: TimeSelectionValues) => {
    if (!user || !position || !computer) return;

    // If there's no computer available at this position, show an error
    if (!computer) {
      toast.error('No computer is available at this position.');
      return;
    }

    const hours = parseInt(values.hours, 10);
    const totalPrice = hours * computerPrice;

    // Check if user has enough balance
    const userBalance = user.balance || 0;
    if (userBalance < totalPrice) {
      toast.error(
        `Insufficient balance. You need ${formatCurrency(totalPrice)} but only have ${formatCurrency(userBalance)}.`,
      );
      return;
    }

    // Create start and end times
    const startTime = new Date();
    const maxEndTime = new Date(startTime);
    maxEndTime.setHours(maxEndTime.getHours() + hours);

    // Create bill object with the correct format for the API
    const billData = {
      user: user.id,
      computer: computer.id,
      services: [], // Empty services array
      startTimestamp: startTime,
      endTimestamp: null, // No end timestamp initially
      maxEndTimestamp: maxEndTime,
      maxHoldingTimestamp: null,
    };

    try {
      console.log('Creating bill with data:', billData);
      await createBill(billData);
    } catch (error) {
      console.error('Error creating bill:', error);
    }
  };

  // Handle adding more time
  const handleAddTime = async (values: TimeSelectionValues) => {
    if (!user || !activeBillId || !endTime) return;

    const hours = parseInt(values.hours, 10);
    const additionalPrice = hours * computerPrice;

    // Check if user has enough balance
    const userBalance = user.balance || 0;
    if (userBalance < additionalPrice) {
      toast.error(
        `Insufficient balance. You need ${formatCurrency(additionalPrice)} but only have ${formatCurrency(userBalance)}.`,
      );
      return;
    }

    // Calculate new end time
    const newEndTime = new Date(endTime);
    newEndTime.setHours(newEndTime.getHours() + hours);

    try {
      await updateBill({
        id: activeBillId,
        data: {
          maxEndTimestamp: newEndTime,
        },
      });

      setShowAddTimeDialog(false);
      toast.success(`Added ${hours} more hour(s) to your session`);
      addTimeForm.reset();
    } catch (error) {
      toast.error('Failed to add time: ' + (error as Error).message);
    }
  };

  // Handle logout (manual or automatic)
  const handleLogout = async (isAutomatic = false) => {
    if (!activeBillId) {
      navigate({ to: '/guests/login-computer' });
      return;
    }

    try {
      // Update bill with end timestamp
      await updateBill({
        id: activeBillId,
        data: {
          endTimestamp: new Date(),
        },
      });

      if (isAutomatic) {
        toast.info('Your session has ended.');
      } else {
        toast.success('Successfully logged out.');
      }

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['bills'] });

      // Navigate back to login page
      navigate({ to: '/guests/login-computer' });
    } catch (error) {
      toast.error('Error during logout: ' + (error as Error).message);
    }
  };

  if (isPositionLoading || isComputerLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!position) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h2 className="mb-4 text-2xl">Position not found</h2>
        <Button onClick={() => navigate({ to: '/guests/login-computer' })}>Return to Login</Button>
      </div>
    );
  }

  if (!computer) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h2 className="mb-4 text-2xl">Computer not available at this position</h2>
        <Button onClick={() => navigate({ to: '/guests/login-computer' })}>Return to Login</Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background p-4">
      {/* Computer interface */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Computer: {computer.name}</h1>
          <p className="mt-1 text-muted-foreground">
            CPU: {computer.cpu} • RAM: {computer.ram} • Storage: {computer.storage}
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setShowAddTimeDialog(true)} className="flex items-center gap-2">
            <Plus className="size-4" /> Add Time
          </Button>
          <Button
            onClick={() => handleLogout()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="size-4" /> Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder content for computer interface */}
        <div className="col-span-full flex h-[400px] items-center justify-center rounded-lg border bg-card p-6">
          <p className="text-xl text-muted-foreground">Desktop Environment</p>
        </div>
      </div>

      {/* Countdown timer */}
      {endTime && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 rounded-lg border bg-card p-4 shadow-lg">
          <Clock className="size-5" />
          <div>
            <p className="text-sm font-medium">Time Remaining</p>
            <p className="text-xl font-bold">
              {String(timeRemaining.hours).padStart(2, '0')}:
              {String(timeRemaining.minutes).padStart(2, '0')}:
              {String(timeRemaining.seconds).padStart(2, '0')}
            </p>
          </div>
        </div>
      )}

      {/* Initial time selection dialog */}
      <Dialog open={showTimeSelectionDialog} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Play Time</DialogTitle>
            <DialogDescription>
              Choose how long you want to use this computer. The cost is{' '}
              {formatCurrency(computerPrice)} per hour.
            </DialogDescription>
          </DialogHeader>
          <Form {...timeSelectionForm}>
            <form
              onSubmit={timeSelectionForm.handleSubmit(handleTimeSelection)}
              className="space-y-4"
            >
              <FormField
                control={timeSelectionForm.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Hours</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hours" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((hour) => (
                          <SelectItem key={hour} value={String(hour)}>
                            {hour} hour{hour > 1 ? 's' : ''} ({formatCurrency(hour * computerPrice)}
                            )
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Your Balance</FormLabel>
                <div className="text-lg font-medium">{formatCurrency(user?.balance || 0)}</div>
              </FormItem>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/guests/login-computer' })}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatingBill}>
                  Confirm Payment
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add time dialog */}
      <Dialog open={showAddTimeDialog} onOpenChange={setShowAddTimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add More Time</DialogTitle>
            <DialogDescription>
              Add more time to your current session. The cost is {formatCurrency(computerPrice)} per
              hour.
            </DialogDescription>
          </DialogHeader>
          <Form {...addTimeForm}>
            <form onSubmit={addTimeForm.handleSubmit(handleAddTime)} className="space-y-4">
              <FormField
                control={addTimeForm.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Additional Hours</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hours" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((hour) => (
                          <SelectItem key={hour} value={String(hour)}>
                            {hour} hour{hour > 1 ? 's' : ''} ({formatCurrency(hour * computerPrice)}
                            )
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Your Balance</FormLabel>
                <div className="text-lg font-medium">{formatCurrency(user?.balance || 0)}</div>
              </FormItem>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddTimeDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Time</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
