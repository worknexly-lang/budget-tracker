"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { categorizeExpense } from "@/ai/flows/categorize-expense";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Sparkles, Loader2 } from "lucide-react";
import { expenseCategories, type ExpenseCategory, type Transaction } from "@/types";

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  description: z.string().min(2, "Description is too short."),
  amount: z.coerce.number().positive("Amount must be positive."),
  category: z.string().min(1, "Category is required."),
});

type AddTransactionDialogProps = {
  onAddTransaction: (transaction: Omit<Transaction, "id" | "date">) => void;
};

export default function AddTransactionDialog({ onAddTransaction }: AddTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      description: "",
      amount: 0,
      category: "",
    },
  });

  const transactionType = form.watch("type");

  const handleSuggestCategory = async () => {
    const description = form.getValues("description");
    if (!description) {
      toast({
        title: "No Description",
        description: "Please enter a description to suggest a category.",
        variant: "destructive",
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const result = await categorizeExpense({ description });
      if (result.category && expenseCategories.includes(result.category as ExpenseCategory)) {
        form.setValue("category", result.category, { shouldValidate: true });
        toast({
          title: "Category Suggested!",
          description: `We've suggested "${result.category}" for your expense.`,
        });
      } else {
        toast({
          title: "Suggestion not available",
          description: `Could not find a matching category for "${description}". Please select one manually.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to suggest a category.",
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  };
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    const finalCategory = values.type === 'income' ? 'Income' : values.category as ExpenseCategory;
    onAddTransaction({ ...values, category: finalCategory });
    toast({
      title: "Transaction Added",
      description: `${values.type.charAt(0).toUpperCase() + values.type.slice(1)} of ${values.amount} for ${values.description} has been added.`,
    });
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Add a new income or expense to your budget.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="expense" id="expense" />
                        </FormControl>
                        <FormLabel htmlFor="expense">Expense</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="income" id="income" />
                        </FormControl>
                        <FormLabel htmlFor="income">Income</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Coffee, Paycheck" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {transactionType === 'expense' && (
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <div className="flex gap-2">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" size="icon" onClick={handleSuggestCategory} disabled={isSuggesting}>
                        {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-accent" />}
                        <span className="sr-only">Suggest Category</span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="submit">Add Transaction</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
