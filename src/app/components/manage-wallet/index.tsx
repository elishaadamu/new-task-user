"use client";

import React, { useState, useEffect } from "react";
import CardBox from "../shared/CardBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@iconify/react";
import { CustomAlertDialog } from "@/components/CustomAlertDialog";
import { API_CONFIG, apiUrl } from "../../api/api";
import axios from "axios";
import BreadcrumbComp from "../../(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import WalletTable from "./wallet-table";
import { useAppContext } from "../../context/Appcontext";

const ManageWallet = () => {
  const { setEncryptedUserData, userData } = useAppContext();
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedUserBalance, setSelectedUserBalance] = useState<number | null>(
    null,
  );
  const [selectedUserHistory, setSelectedUserHistory] = useState<any[]>([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [type, setType] = useState("credit");

  const [formData, setFormData] = useState({
    userId: "",
    amount: "",
    description: "",
    taskId: "",
    week: "",
  });

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: "info" | "success" | "danger" | "warning";
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "info",
  });

  const showAlert = (
    title: string,
    description: string,
    variant: "info" | "success" | "danger" | "warning" = "info",
  ) => {
    setAlertConfig({
      isOpen: true,
      title,
      description,
      variant,
    });
  };

  const fetchAllWallets = async () => {
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.WALLET.GET_TRANSACTIONS),
        {
          withCredentials: true,
        },
      );
      console.log(response.data);
      setWallets(response.data.transactions || response.data || []);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  useEffect(() => {
    const loadWallets = async () => {
      await fetchAllWallets();
      setFetchLoading(false);
    };
    loadWallets();
  }, []);
 

 

  

  const BCrumb = [{ to: "/", title: "Home" }, { title: "Manage Bonus/Wallet" }];

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Icon
          icon="line-md:loading-twotone-loop"
          className="text-4xl text-primary"
        />
      </div>
    );
  }

  return (
    <>
      <BreadcrumbComp title="Bonus & Wallet Management" items={BCrumb} />
      <div className="mb-8">
        <WalletTable wallets={wallets} />
      </div>

     
     

      
    </>
  );
};

export default ManageWallet;
