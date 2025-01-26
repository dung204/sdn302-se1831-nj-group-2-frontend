import type { PropsWithChildren } from 'react';
import { type UseFormHandleSubmit, type UseFormReturn } from 'react-hook-form';

import { Role } from '@/common/types';
import type { User } from '@/common/types/api/user';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';

interface UserFormProps<
  TFieldValues extends Partial<User> = Partial<User>,
  TContext = unknown,
  TTransformedValues extends Partial<User> | undefined = undefined,
> extends PropsWithChildren {
  form: UseFormReturn<TFieldValues, TContext, undefined>;
  onValidSubmit: Parameters<
    UseFormHandleSubmit<TFieldValues, TTransformedValues>
  >[0];
  onInvalidSubmit?: Parameters<
    UseFormHandleSubmit<TFieldValues, TTransformedValues>
  >[1];
}

export function UserForm<
  TFieldValues extends Partial<User> = Partial<User>,
  TContext = unknown,
  TTransformedValues extends Partial<User> | undefined = undefined,
>({
  children,
  form,
  onValidSubmit,
  onInvalidSubmit,
}: UserFormProps<TFieldValues, TContext, TTransformedValues>) {
  return (
    <Form {...form}>
      <form
        className="grid grid-cols-2 gap-4"
        onSubmit={form.handleSubmit(onValidSubmit, onInvalidSubmit)}
      >
        <FormField
          name="firstName"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel required>First name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="lastName"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel required>Last name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="address"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="role"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={Role.ADMIN}>{Role.ADMIN}</SelectItem>
                  <SelectItem value={Role.USER}>{Role.USER}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {children}
      </form>
    </Form>
  );
}
