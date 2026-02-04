"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "@/app/context/Appcontext";
import { API_CONFIG, apiUrl } from "@/app/api/api";

const ProfileWelcome = () => {
  const { userData } = useAppContext();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData?.id) {
      fetchWalletBalance();
    }
  }, [userData?.id]);

  const fetchWalletBalance = async () => {
    try {
      setLoading(true);
      const endpoint = `${API_CONFIG.ENDPOINTS.WALLET.GET_BALANCE}`;
      const url = apiUrl(endpoint);
      const response = await axios.get(url, { withCredentials: true });
      
      setWalletBalance(response.data.wallet.balance || 0);
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-between bg-lightsecondary rounded-lg p-6">
      <div className="flex items-center gap-3">
        <div>
          <Image
            src={"/images/profile/user-1.jpg"}
            alt="user-img"
            width={50}
            height={50}
            className="rounded-full"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <h5 className="card-title text-xl font-bold">
            Welcome back! {userData?.firstName || "User"} 👋
          </h5>
          <p className="text-muted-foreground">Check your reports</p>
          {walletBalance !== null && (
            <p className="text-sm font-semibold text-primary mt-2">
              Balance: ₦{walletBalance.toFixed(2)}
            </p>
          )}
        </div>
      </div>
      <div className="hidden sm:block absolute right-8 bottom-0">
        <Image
          src={"/images/dashboard/customer-support-img.png"}
          alt="support-img"
          width={145}
          height={95}
        />
      </div>
    </div>
  );
};

export default ProfileWelcome;
