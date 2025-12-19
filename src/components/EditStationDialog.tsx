
import React from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Station } from '@/types/pos.types';
import { Edit } from 'lucide-react';

interface EditStationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  station: Station | null;
  onSave: (stationId: string, name: string, hourlyRate: number) => Promise<boolean>;
}

const EditStationDialog: React.FC<EditStationDialogProps> = ({
  open,
  onOpenChange,
  station,
  onSave,
}) => {
  const [name, setName] = React.useState('');
  const [hourlyRate, setHourlyRate] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  // Update form when station changes
  React.useEffect(() => {
    if (station) {
      setName(station.name);
      setHourlyRate(station.hourlyRate);
    }
  }, [station]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!station) return;
    
    setIsLoading(true);
    try {
      const success = await onSave(station.id, name, hourlyRate);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#1A1F2C] border-green-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">
            <Edit size={16} className="text-green-500" />
            Edit Court
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Update court name and hourly rate
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">Court Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter court name"
              required
              className="focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hourlyRate" className="text-gray-300">Hourly Rate (₹)</Label>
            <Input
              id="hourlyRate"
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
              placeholder="Enter hourly rate"
              min={10}
              step={50}
              required
              className="focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-gray-600 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white" 
              disabled={isLoading || !name || hourlyRate <= 0}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStationDialog;
