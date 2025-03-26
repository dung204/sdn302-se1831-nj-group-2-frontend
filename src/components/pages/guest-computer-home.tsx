import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { CheckCircle, Clock, Clock3, LogOut, Minus, Plus, ShoppingCart, Trash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '@/common/hooks';
import type { CreateBillSchema } from '@/common/types/api/bill/create-bill.type';
import type { Service } from '@/common/types/api/service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  billHttpClient,
  computerHttpClient,
  positionHttpClient,
  serviceCategoryHttpClient,
  serviceHttpClient,
} from '@/lib/http';

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

// Selected service item type
type SelectedService = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

// Define type for ordered service with status
type OrderedService = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  status: 'pending' | 'preparing' | 'delivered' | 'cancelled';
  orderedAt: Date;
};

// Mock ordered services data for demonstration
const mockOrderedServices: OrderedService[] = [
  {
    id: '1',
    name: 'Coffee',
    price: 20,
    quantity: 1,
    status: 'delivered',
    orderedAt: new Date(Date.now() - 35 * 60000), // 35 minutes ago
  },
  {
    id: '2',
    name: 'Sandwich',
    price: 25,
    quantity: 2,
    status: 'preparing',
    orderedAt: new Date(Date.now() - 10 * 60000), // 10 minutes ago
  },
  {
    id: '3',
    name: 'Water Bottle',
    price: 8,
    quantity: 1,
    status: 'pending',
    orderedAt: new Date(Date.now() - 2 * 60000), // 2 minutes ago
  },
];

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
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [orderedServices, setOrderedServices] = useState<OrderedService[]>(mockOrderedServices);
  const [activeTab, setActiveTab] = useState('order');

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

  // Fetch service categories
  const { data: serviceCategoriesData, isLoading: isServiceCategoriesLoading } = useQuery({
    queryKey: ['serviceCategories'],
    queryFn: () => serviceCategoryHttpClient.getAllServiceCategories(),
    enabled: !!user,
  });

  // Fetch services
  const { data: servicesData, isLoading: isServicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceHttpClient.getAllService(),
    enabled: !!user,
  });

  // Process service data
  const serviceCategories = serviceCategoriesData?.data || [];
  const services = servicesData?.data || [];

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

  // Handle order service
  const handleOrderService = (service: Service) => {
    const existingServiceIndex = selectedServices.findIndex((item) => item.id === service.id);

    if (existingServiceIndex >= 0) {
      // Service already exists in the order, increase quantity
      const updatedServices = [...selectedServices];
      updatedServices[existingServiceIndex].quantity += 1;
      setSelectedServices(updatedServices);
    } else {
      // Service not in the order, add it
      setSelectedServices([
        ...selectedServices,
        {
          id: service.id,
          name: service.name,
          price: service.price,
          quantity: 1,
        },
      ]);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (serviceId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove the service if quantity is zero or negative
      setSelectedServices(selectedServices.filter((service) => service.id !== serviceId));
    } else {
      // Update the quantity
      setSelectedServices(
        selectedServices.map((service) =>
          service.id === serviceId ? { ...service, quantity: newQuantity } : service,
        ),
      );
    }
  };

  // Handle remove service from order
  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter((service) => service.id !== serviceId));
  };

  // Calculate total order amount
  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => total + service.price * service.quantity, 0);
  };

  // Handle confirm order
  const handleConfirmOrder = () => {
    if (selectedServices.length === 0) {
      toast.error('Please add at least one item to your order');
      return;
    }

    // Create new ordered services with pending status
    const newOrderedServices = selectedServices.map((service) => ({
      ...service,
      status: 'pending' as const,
      orderedAt: new Date(),
    }));

    // Add to ordered services list
    setOrderedServices([...newOrderedServices, ...orderedServices]);

    toast.success(`Order placed successfully! Total: ${formatCurrency(calculateTotal())}`);

    // Reset the order
    setSelectedServices([]);

    // Switch to the order history tab to show the newly placed order
    setActiveTab('history');
  };

  // Function to get appropriate status badge
  const getStatusBadge = (status: OrderedService['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case 'preparing':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Preparing
          </Badge>
        );
      case 'delivered':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Delivered
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  // Format date function
  const formatOrderTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group services by their category
  const groupedServices: Record<string, Service[]> = {};
  services.forEach((service) => {
    const categoryId = service.category.id;
    if (!groupedServices[categoryId]) {
      groupedServices[categoryId] = [];
    }
    groupedServices[categoryId].push(service);
  });

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
          <Button onClick={() => setShowOrderDialog(true)} className="flex items-center gap-2">
            <ShoppingCart className="size-4" /> Order Services
          </Button>
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
          <img
            src="https://i.redd.it/9s2t54ycbtz71.jpg"
            alt="Computer Interface"
            className="max-h-full max-w-full object-contain"
          />
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

      {/* Order Services Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="w-full max-w-[80vw]">
          <DialogHeader>
            <DialogTitle>Order Services</DialogTitle>
            <DialogDescription>
              Place your order or check the status of your previous orders.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="order">New Order</TabsTrigger>
              <TabsTrigger value="history">Order History</TabsTrigger>
            </TabsList>

            <TabsContent value="order" className="mt-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Services selection panel (left side) */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Available Services</h3>
                  <Card>
                    <CardContent className="p-4">
                      {isServiceCategoriesLoading || isServicesLoading ? (
                        <div className="flex h-[350px] items-center justify-center">
                          Loading services...
                        </div>
                      ) : (
                        <ScrollArea className="h-[350px] pr-4">
                          {/* Group services by category */}
                          {serviceCategories.map((category) => (
                            <div key={category.id} className="mb-4">
                              <h4 className="mb-2 font-semibold">{category.name}</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {(groupedServices[category.id] || []).map((service) => (
                                  <Card
                                    key={service.id}
                                    className="cursor-pointer hover:bg-accent"
                                    onClick={() => handleOrderService(service)}
                                  >
                                    <CardContent className="flex items-center justify-between p-3">
                                      <div>{service.name}</div>
                                      <div>{formatCurrency(service.price)}</div>
                                    </CardContent>
                                  </Card>
                                ))}
                                {(groupedServices[category.id] || []).length === 0 && (
                                  <div className="py-2 text-center text-sm text-muted-foreground">
                                    No services available in this category
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Invoice panel (right side) */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Your Order</h3>
                  <Card>
                    <CardContent className="p-4">
                      {selectedServices.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                          No items added to your order yet
                        </div>
                      ) : (
                        <div>
                          <div className="mb-2 grid grid-cols-12 font-medium">
                            <div className="col-span-5">Item</div>
                            <div className="col-span-2 text-right">Price</div>
                            <div className="col-span-3 text-center">Qty</div>
                            <div className="col-span-2 text-right">Total</div>
                          </div>
                          <ScrollArea className="h-[300px] pr-4">
                            {selectedServices.map((service) => (
                              <div key={service.id} className="grid grid-cols-12 items-center py-2">
                                <div className="col-span-5 font-medium">{service.name}</div>
                                <div className="col-span-2 text-right">
                                  {formatCurrency(service.price)}
                                </div>
                                <div className="col-span-3 flex items-center justify-center space-x-1">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="size-7"
                                    onClick={() =>
                                      handleQuantityChange(service.id, service.quantity - 1)
                                    }
                                  >
                                    <Minus className="size-3" />
                                  </Button>
                                  <span className="w-6 text-center">{service.quantity}</span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="size-7"
                                    onClick={() =>
                                      handleQuantityChange(service.id, service.quantity + 1)
                                    }
                                  >
                                    <Plus className="size-3" />
                                  </Button>
                                </div>
                                <div className="col-span-1 text-right">
                                  {formatCurrency(service.price * service.quantity)}
                                </div>
                                <div className="col-span-1 text-right">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-7"
                                    onClick={() => handleRemoveService(service.id)}
                                  >
                                    <Trash className="size-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </ScrollArea>
                          <Separator className="my-3" />
                          <div className="flex justify-between">
                            <div className="text-lg font-bold">Total:</div>
                            <div className="text-lg font-bold">
                              {formatCurrency(calculateTotal())}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              <DialogFooter className="mt-6 gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setShowOrderDialog(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={selectedServices.length === 0}
                >
                  Confirm Order
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <h3 className="mb-3 text-lg font-semibold">Your Order History</h3>
              <Card>
                <CardContent className="p-4">
                  {orderedServices.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      You haven't placed any orders yet
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px] pr-4">
                      {orderedServices
                        .sort((a, b) => b.orderedAt.getTime() - a.orderedAt.getTime()) // Sort by most recent
                        .map((service, index) => (
                          <div
                            key={`${service.id}-${index}`}
                            className="mb-4 rounded-md border p-3"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{service.name}</span>
                                {getStatusBadge(service.status)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Ordered at {formatOrderTime(service.orderedAt)}
                              </div>
                            </div>
                            <div className="grid grid-cols-3 text-sm">
                              <div>
                                Quantity: <span className="font-medium">{service.quantity}</span>
                              </div>
                              <div>
                                Price:{' '}
                                <span className="font-medium">{formatCurrency(service.price)}</span>
                              </div>
                              <div className="text-right">
                                Total:{' '}
                                <span className="font-medium">
                                  {formatCurrency(service.price * service.quantity)}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-muted-foreground">
                              {service.status === 'pending' && (
                                <div className="flex items-center gap-1">
                                  <Clock3 className="size-3" /> Estimated time: 10-15 minutes
                                </div>
                              )}
                              {service.status === 'preparing' && (
                                <div className="flex items-center gap-1">
                                  <Clock3 className="size-3" /> Almost ready, will be delivered soon
                                </div>
                              )}
                              {service.status === 'delivered' && (
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="size-3 text-green-500" /> Delivered
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowOrderDialog(false)}>
                  Close
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
