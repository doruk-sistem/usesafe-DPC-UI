import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-10">
        <Search className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Verify Product</h1>
        <p className="text-muted-foreground">
          Enter a product ID or scan a QR code to verify its authenticity and view its Digital Product Passport.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Enter Product ID (e.g., PROD-2024-001)" />
              <Button type="submit">Verify</Button>
            </div>
            <div className="text-center">
              <span className="text-sm text-muted-foreground">or</span>
            </div>
            <Button variant="outline" className="w-full">
              Scan QR Code
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}