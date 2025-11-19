import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ExpensePhotoViewerProps {
  photoUrl: string | null | undefined;
  expenseName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExpensePhotoViewer: React.FC<ExpensePhotoViewerProps> = ({ 
  photoUrl, 
  expenseName,
  open, 
  onOpenChange 
}) => {
  if (!photoUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {expenseName ? `Photo for ${expenseName}` : 'Expense Photo'}
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <img 
            src={photoUrl} 
            alt={expenseName ? `Photo for ${expenseName}` : 'Expense photo'} 
            className="w-full h-auto rounded-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const errorDiv = document.createElement('div');
              errorDiv.className = 'text-center py-8 text-muted-foreground';
              errorDiv.textContent = 'Failed to load image';
              target.parentElement?.appendChild(errorDiv);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpensePhotoViewer;

