import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, BusinessSummary, ExpenseFormData } from '@/types/expense.types';
import { usePOS } from './POSContext';
import { generateId } from '@/utils/pos.utils';
import { useToast } from '@/hooks/use-toast';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';

interface ExpenseContextType {
  expenses: Expense[];
  businessSummary: BusinessSummary;
  addExpense: (expense: Omit<ExpenseFormData, 'date'> & { date: string }, photoFile?: File) => Promise<boolean>;
  updateExpense: (expense: Expense, photoFile?: File) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  refreshExpenses: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);
const STORAGE_KEY = 'pos-expenses';

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error('useExpenses must be used within an ExpenseProvider');
  return context;
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessSummary, setBusinessSummary] = useState<BusinessSummary>({
    grossIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    withdrawals: 0,
    moneyInBank: 0
  });
  const { bills } = usePOS();
  const { toast } = useToast();

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: supabaseExpenses, error: supabaseError } = await (supabase
        .from('expenses' as any)
        .select('*')
        .order('date', { ascending: false }) as any);

      if (supabaseError) {
        const storedExpenses = localStorage.getItem(STORAGE_KEY);
        if (storedExpenses) {
          const parsedExpenses = JSON.parse(storedExpenses) as Expense[];
          setExpenses(parsedExpenses);
          // try sync to supabase (best-effort)
          parsedExpenses.forEach(async (expense) => {
            await (supabase.from('expenses' as any).upsert({
              id: expense.id,
              name: expense.name,
              amount: expense.amount,
              category: expense.category,
              frequency: expense.frequency,
              date: expense.date,
              is_recurring: expense.isRecurring,
              notes: expense.notes || null,
              photo_url: expense.photoUrl || null
            }, { onConflict: 'id' }) as any);
          });
        } else {
          setExpenses([]);
        }
      } else {
        const formatted = (supabaseExpenses || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          amount: item.amount,
          category: item.category as Expense['category'],
          frequency: item.frequency as Expense['frequency'],
          date: item.date,
          isRecurring: item.is_recurring,
          notes: item.notes || undefined,
          photoUrl: item.photo_url || undefined
        }));
        setExpenses(formatted);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formatted));
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching expenses');
    } finally {
      setLoading(false);
    }
  };

  const prorate = (e: Expense) => {
    if (!e.isRecurring) return e.amount;
    switch (e.frequency) {
      case 'monthly': return e.amount;
      case 'quarterly': return e.amount / 3;
      case 'yearly': return e.amount / 12;
      default: return e.amount;
    }
  };

  const normalizeCategory = (c: string) => (c === 'restock' ? 'inventory' : c);

  const calculateBusinessSummary = () => {
    const grossIncome = (bills || [])
      .filter((b: any) => b?.paymentMethod !== 'complimentary')
      .reduce((sum: number, b: any) => sum + (b?.total ?? 0), 0);

    const totalWithdrawals = expenses
      .filter(e => normalizeCategory(e.category) === 'withdrawal')
      .reduce((sum, e) => sum + prorate(e), 0);

    const operatingExpenses = expenses
      .filter(e => normalizeCategory(e.category) !== 'withdrawal')
      .reduce((sum, e) => sum + prorate(e), 0);

    const netProfit = grossIncome - operatingExpenses;
    const moneyInBank = netProfit - totalWithdrawals;
    const profitMargin = grossIncome > 0 ? (netProfit / grossIncome) * 100 : 0;

    setBusinessSummary({
      grossIncome,
      totalExpenses: operatingExpenses,
      netProfit,
      profitMargin,
      withdrawals: totalWithdrawals,
      moneyInBank
    });
  };

  const saveExpensesToStorage = (updated: Expense[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      toast({ title: 'Error', description: 'Failed to save expenses data locally', variant: 'destructive' });
    }
  };

  const uploadExpensePhoto = async (file: File, expenseId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${expenseId}-${Date.now()}.${fileExt}`;
      const filePath = `expense-receipts/${fileName}`;

      // Upload image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('expense-receipts')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading expense photo:', uploadError);
        toast({ 
          title: 'Upload failed', 
          description: 'Failed to upload photo. The expense will be saved without photo.', 
          variant: 'destructive' 
        });
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('expense-receipts')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Unexpected error uploading photo:', error);
      return null;
    }
  };

  const addExpense = async (formData: Omit<ExpenseFormData, 'date'> & { date: string }, photoFile?: File): Promise<boolean> => {
    try {
      const id = generateId();
      
      // Upload photo if provided
      let photoUrl: string | undefined = undefined;
      if (photoFile) {
        const uploadedUrl = await uploadExpensePhoto(photoFile, id);
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      const newExpense: Expense = {
        id,
        name: formData.name,
        amount: formData.amount,
        category: formData.category,
        frequency: formData.frequency,
        date: formData.date,
        isRecurring: formData.isRecurring,
        notes: formData.notes,
        photoUrl
      };

      const { error: supabaseError } = await (supabase
        .from('expenses' as any)
        .insert({
          id: newExpense.id,
          name: newExpense.name,
          amount: newExpense.amount,
          category: newExpense.category,
          frequency: newExpense.frequency,
          date: newExpense.date,
          is_recurring: newExpense.isRecurring,
          notes: newExpense.notes || null,
          photo_url: newExpense.photoUrl || null
        }) as any);

      if (supabaseError) {
        const msg = handleSupabaseError(supabaseError, 'adding expense');
        toast({ title: 'Error', description: msg, variant: 'destructive' });
        // Clean up uploaded photo if database insert fails
        if (photoUrl) {
          const urlParts = photoUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `expense-receipts/${fileName}`;
          await supabase.storage.from('expense-receipts').remove([filePath]);
        }
        return false;
      }

      const updated = [newExpense, ...expenses];
      setExpenses(updated);
      saveExpensesToStorage(updated);
      toast({ title: 'Success', description: 'Expense added successfully' });
      return true;
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred while adding expense', variant: 'destructive' });
      return false;
    }
  };

  const updateExpense = async (expense: Expense, photoFile?: File): Promise<boolean> => {
    try {
      let photoUrl = expense.photoUrl;

      // Upload new photo if provided
      if (photoFile) {
        // Delete old photo if it exists
        if (expense.photoUrl) {
          try {
            const urlParts = expense.photoUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const filePath = `expense-receipts/${fileName}`;
            await supabase.storage.from('expense-receipts').remove([filePath]);
          } catch (error) {
            console.error('Error deleting old photo:', error);
          }
        }

        const uploadedUrl = await uploadExpensePhoto(photoFile, expense.id);
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      const updatedExpense = { ...expense, photoUrl };

      const { error: supabaseError } = await (supabase
        .from('expenses' as any)
        .update({
          name: updatedExpense.name,
          amount: updatedExpense.amount,
          category: updatedExpense.category,
          frequency: updatedExpense.frequency,
          date: updatedExpense.date,
          is_recurring: updatedExpense.isRecurring,
          notes: updatedExpense.notes || null,
          photo_url: updatedExpense.photoUrl || null
        }).eq('id', updatedExpense.id) as any);

      if (supabaseError) {
        const msg = handleSupabaseError(supabaseError, 'updating expense');
        toast({ title: 'Error', description: msg, variant: 'destructive' });
        return false;
      }

      const updated = expenses.map(item => item.id === updatedExpense.id ? updatedExpense : item);
      setExpenses(updated);
      saveExpensesToStorage(updated);
      toast({ title: 'Success', description: 'Expense updated successfully' });
      return true;
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred while updating expense', variant: 'destructive' });
      return false;
    }
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    try {
      const { error: supabaseError } = await (supabase.from('expenses' as any).delete().eq('id', id) as any);
      if (supabaseError) {
        const msg = handleSupabaseError(supabaseError, 'deleting expense');
        toast({ title: 'Error', description: msg, variant: 'destructive' });
        return false;
      }
      const updated = expenses.filter(item => item.id !== id);
      setExpenses(updated);
      saveExpensesToStorage(updated);
      toast({ title: 'Success', description: 'Expense deleted successfully' });
      return true;
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred while deleting expense', variant: 'destructive' });
      return false;
    }
  };

  useEffect(() => { fetchExpenses(); }, []);
  useEffect(() => { calculateBusinessSummary(); }, [bills, expenses]);

  const contextValue: ExpenseContextType = {
    expenses,
    businessSummary,
    addExpense,
    updateExpense,
    deleteExpense,
    refreshExpenses: fetchExpenses,
    loading,
    error
  };

  return <ExpenseContext.Provider value={contextValue}>{children}</ExpenseContext.Provider>;
};
