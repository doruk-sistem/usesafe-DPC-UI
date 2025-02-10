import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HederaService } from "@/lib/services/hedera";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ProductBlockchainHistoryProps {
  productId: string;
}

export function ProductBlockchainHistory({
  productId,
}: ProductBlockchainHistoryProps) {
  const [productHistory, setProductHistory] = useState<any | null>(null); // Use 'any' for simplicity
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductHistory = async () => {
      setIsLoading(true);
      try {
        const history = await HederaService.getProductFromBlockchain(productId);
        setProductHistory(history);
      } catch (error) {
        console.error("Error fetching product history:", error);
        // Handle error appropriately, e.g., show an error message to the user
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductHistory();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!productHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blockchain History</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No blockchain history found for this product.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blockchain History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Product ID:</span>{" "}
              {productHistory.productId}
            </div>
            <div>
              <span className="font-semibold">Name:</span> {productHistory.name}
            </div>
            <div>
              <span className="font-semibold">Description:</span>{" "}
              {productHistory.description}
            </div>
            <div>
              <span className="font-semibold">Status:</span>{" "}
              {productHistory.status}
            </div>
            <div>
              <span className="font-semibold">Timestamp:</span>{" "}
              {format(new Date(Number(productHistory.timestamp) * 1000), "PPPpp")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 