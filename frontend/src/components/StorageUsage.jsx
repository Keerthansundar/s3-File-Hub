import { Progress } from "@/components/ui/progress";
import Spinner from "@/components/Spinner";
import { useEffect, useState } from "react";

export default function StorageUsage({ refreshTrigger }) {
  const [usage, setUsage] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUsage = () => {
      const token = localStorage.getItem('token');
      fetch(`${API_BASE_URL}/api/files/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => setUsage(data))
        .catch(() => setUsage({ totalMB: 0 }));
    };
    fetchUsage();
  }, [API_BASE_URL, refreshTrigger]);

  if (!usage) return <Spinner className="my-4" />;

  const usedMB = usage.totalMB;
  const quotaMB = 1024; // 1 GB
  const percent = Math.min((usedMB / quotaMB) * 100, 100);

  // AWS S3 cost calculation
  const usdPerMB = 0.023 / 1024; // $ per MB
  const inrPerUSD = 83; // 1 USD = 83 INR (2025)
  const costInUSD = usedMB * usdPerMB;
  const costInINR = costInUSD * inrPerUSD;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-semibold">
          Storage Usage: {usedMB.toFixed(2)} MB / {quotaMB} MB
        </div>
        <div className="text-xs text-gray-500">
          Est. S3 Cost: ₹{costInINR.toFixed(2)} / month
        </div>
      </div>
      <Progress value={percent} />
    </div>
  );
}
