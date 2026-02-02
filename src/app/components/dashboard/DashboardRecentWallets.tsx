"use client";

import React, { useEffect, useState } from "react";
import CardBox from "../shared/CardBox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { API_CONFIG, apiUrl } from "@/app/api/api";
import axios from "axios";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Transaction {
  _id: string;
  walletId: string;
  userId: User;
  taskId: string | null;
  type: "CREDIT" | "DEBIT";
  amount: number;
  balanceAfter: number;
  description: string;
  week: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardRecentWallets() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.WALLET.GET_TRANSACTIONS),
        { withCredentials: true },
      );

      const data = response.data;
      let transactionList: Transaction[] = Array.isArray(data)
        ? data
        : (data.transactions ?? []);

      setTransactions(transactionList.slice(0, 5));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardBox className="h-full">
      <div className="flex justify-between items-start mb-6 gap-4">
        <div>
          <h5 className="card-title flex items-center gap-2">
            <Icon
              icon="solar:wallet-bold-duotone"
              className="text-primary text-2xl"
            />
            Recent Transaction History
          </h5>
          <p className="text-sm text-muted-foreground font-normal">
            Latest wallet transactions
          </p>
        </div>
        <Link href="/manage-wallet">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            View All
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <span className="text-muted-foreground">Loading...</span>
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>
                        {transaction.userId?.firstName}{" "}
                        {transaction.userId?.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {transaction.userId?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.type === "CREDIT" ? "default" : "destructive"
                      }
                      className="text-white"
                    >
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold">
                    ₦{transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    ₦{transaction.balanceAfter.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </CardBox>
  );
}
