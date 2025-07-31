"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, List } from "lucide-react";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { categoryIcons } from "@/components/icons";
import type { Transaction } from "@/types";

type TransactionsTableProps = {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
};

export default function TransactionsTable({
  transactions,
  onDeleteTransaction,
}: TransactionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <List className="h-6 w-6" />
          <CardTitle>Recent Transactions</CardTitle>
        </div>
        <CardDescription>
          View and manage your recent income and expenses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Category</TableHead>
                <TableHead className="text-center hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((t) => {
                  const Icon = categoryIcons[t.category];
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        {t.description}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="flex items-center justify-center gap-2"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="hidden sm:inline">{t.category}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        {format(new Date(t.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-semibold",
                          t.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {formatCurrency(t.amount)}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this transaction.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeleteTransaction(t.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
