import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePOS } from '@/context/POSContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { generateId } from '@/utils/pos.utils';

// Create a schema for station validation - Updated for sports courts
const stationSchema = z.object({
  name: z.string().min(2, { message: 'Court name must be at least 2 characters.' }),
  type: z.enum(['turf', 'pickleball'], { 
    required_error: 'Please select a court type.' 
  }),
  hourlyRate: z.coerce.number()
    .min(10, { message: 'Rate must be at least ₹10.' })
    .max(5000, { message: 'Rate cannot exceed ₹5000.' })
});

type StationFormValues = z.infer<typeof stationSchema>;

interface AddStationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddStationDialog: React.FC<AddStationDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const { stations, setStations } = usePOS();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the form
  const form = useForm<StationFormValues>({
    resolver: zodResolver(stationSchema),
    defaultValues: {
      name: '',
      type: 'turf',
      hourlyRate: 500,
    },
  });

  // Watch the type field to conditionally change the label and pricing
  const selectedType = form.watch('type');

  const onSubmit = async (values: StationFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Generate a proper UUID for the new station
      const stationId = crypto.randomUUID();
      
      // Create a new station object
      const newStation = {
        id: stationId,
        name: values.name,
        type: values.type,
        hourlyRate: values.hourlyRate,
        isOccupied: false,
        currentSession: null
      };
      
      // First add to Supabase
      const { error } = await supabase
        .from('stations')
        .insert({
          id: stationId,
          name: values.name,
          type: values.type,
          hourly_rate: values.hourlyRate,
          is_occupied: false
        });
      
      if (error) {
        console.error('Error adding court to Supabase:', error);
        toast({
          title: "Error",
          description: "Could not add the court to the database",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Then update local state
      setStations([...stations, newStation]);
      
      // Show success toast
      toast({
        title: "Court Added",
        description: `${values.name} has been added successfully.`,
      });
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error in adding court:', error);
      toast({
        title: "Error",
        description: "Something went wrong while adding the court",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#1A1F2C] border-green-500/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">Add New Court</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Court Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter court name" 
                      {...field} 
                      className="focus:ring-green-500 focus:border-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Court Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="hover:bg-green-500/10 focus:ring-green-500">
                        <SelectValue placeholder="Select court type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1A1F2C] border-green-500/30">
                      <SelectItem value="turf" className="hover:bg-green-500/20 focus:bg-green-500/20 focus:text-white cursor-pointer">
                        ⚽ Main Turf Court (Football & Cricket)
                      </SelectItem>
                      <SelectItem value="pickleball" className="hover:bg-blue-500/20 focus:bg-blue-500/20 focus:text-white cursor-pointer">
                        🎾 Pickleball Court
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Hourly Rate (₹)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="10" 
                      step="1" 
                      {...field} 
                      className="focus:ring-green-500 focus:border-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="border-gray-600 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Court'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStationDialog;
