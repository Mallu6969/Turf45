import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExpenseCategory, ExpenseFrequency, ExpenseFormData } from '@/types/expense.types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Upload, X, ImageIcon } from 'lucide-react';

const expenseSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  category: z.enum([
    'inventory','salary','utilities','rent','marketing','maintenance',
    'transport','subscriptions','events','bank_charges','withdrawal','other','restock'
  ] as [ExpenseCategory, ...ExpenseCategory[]]),
  frequency: z.enum(['one-time','monthly','quarterly','yearly'] as [ExpenseFrequency, ...ExpenseFrequency[]]),
  date: z.date({ required_error: 'Please select a date', invalid_type_error: "That's not a date!" }),
  isRecurring: z.boolean(),
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
});

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData, photoFile?: File) => void;
  initialData?: Partial<ExpenseFormData>;
  onCancel?: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const today = new Date();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.photoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: initialData?.name || '',
      amount: initialData?.amount || 0,
      category: (initialData?.category as ExpenseCategory) || 'other',
      frequency: (initialData?.frequency as ExpenseFrequency) || 'one-time',
      date: initialData?.date || today,
      isRecurring: initialData?.isRecurring || false,
      notes: initialData?.notes || '',
      photoUrl: initialData?.photoUrl || '',
    },
  });

  const isRecurring = form.watch('isRecurring');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        form.setError('photoUrl', { message: 'Please select an image file' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        form.setError('photoUrl', { message: 'Image size must be less than 5MB' });
        return;
      }

      // Clean up previous blob URL if it exists
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      form.clearErrors('photoUrl');
    }
  };

  const handleRemovePhoto = () => {
    // Clean up blob URL if it exists
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    form.setValue('photoUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFormSubmit = (data: ExpenseFormData) => {
    onSubmit(data, selectedFile || undefined);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Expense Name</FormLabel>
            <FormControl><Input placeholder="Rent, Electricity, Snacks Restock, etc." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="amount" render={({ field }) => (
          <FormItem>
            <FormLabel>Amount</FormLabel>
            <FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="category" render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="inventory">Stock and supplies</SelectItem>
                <SelectItem value="salary">Staff payroll and bonuses</SelectItem>
                <SelectItem value="utilities">Utilities and bills</SelectItem>
                <SelectItem value="rent">Rent and deposits</SelectItem>
                <SelectItem value="marketing">Marketing and printing</SelectItem>
                <SelectItem value="maintenance">Repairs and maintenance</SelectItem>
                <SelectItem value="transport">Transport and delivery</SelectItem>
                <SelectItem value="subscriptions">Software and subscriptions</SelectItem>
                <SelectItem value="events">Events and prizes</SelectItem>
                <SelectItem value="bank_charges">Finance and bank fees</SelectItem>
                <SelectItem value="withdrawal">Partner withdrawals</SelectItem>
                <SelectItem value="other">Miscellaneous</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="isRecurring" render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel>Recurring Expense</FormLabel>
              <FormDescription>Is this a recurring expense?</FormDescription>
            </div>
            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
          </FormItem>
        )} />

        {isRecurring && (
          <FormField control={form.control} name="frequency" render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <FormField control={form.control} name="date" render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant={"outline"} className="pl-3 text-left font-normal">
                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl><Textarea placeholder="Add any additional notes about this expense" className="resize-none" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="photoUrl" render={({ field }) => (
          <FormItem>
            <FormLabel>Photo/Receipt (Optional)</FormLabel>
            <FormDescription>Upload a photo or receipt for this expense</FormDescription>
            <FormControl>
              <div className="space-y-2">
                {previewUrl ? (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Expense preview" 
                      className="w-full h-48 object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemovePhoto}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-md p-6 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="mb-2"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Photo
                      </Button>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end space-x-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit">{initialData?.name ? 'Update Expense' : 'Add Expense'}</Button>
        </div>
      </form>
    </Form>
  );
};

export default ExpenseForm;
