"use client";

import React, { useState } from "react";
import CardBox from "../shared/CardBox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
}

interface ProcessedBy {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Transaction {
  _id: string;
  walletId: string;
  userId: User;
  taskId: string | null;
  type: "CREDIT" | "DEBIT";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  week: string;
  reference: string;
  processedBy: ProcessedBy;
  createdAt: string;
  updatedAt: string;
}

interface WalletTableProps {
  wallets: Transaction[];
}

const ITEMS_PER_PAGE = 10;

export default function WalletTable({ wallets }: WalletTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(wallets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedWallets = wallets.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisiblePages; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  return (
    <div className="mt-8">
      <CardBox className="p-6">
        <h5 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Icon
            icon="solar:wallet-bold-duotone"
            className="text-primary text-2xl"
          />
          Transaction History
        </h5>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance Before</TableHead>
                <TableHead>Balance After</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Week</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWallets.length > 0 ? (
                paginatedWallets.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{transaction.userId?.firstName} {transaction.userId?.lastName}</span>
                        <span className="text-xs text-muted-foreground">{transaction.userId?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === "CREDIT" ? "default" : "destructive"}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold">
                      ₦{transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      ₦{transaction.balanceBefore.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-bold text-primary">
                      ₦{transaction.balanceAfter.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-sm">
                      {transaction.week}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {transaction.reference}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No transaction data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {wallets.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, wallets.length)}{" "}
              of {wallets.length} transactions
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {generatePageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageClick(page)}
                  className="min-w-[2.5rem]"
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardBox>
    </div>
  );
}
