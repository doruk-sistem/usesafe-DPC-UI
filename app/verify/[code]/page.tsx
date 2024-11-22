import { products } from "@/lib/data/products";
import { VerificationStatus } from "@/components/verify/verification-status";

// Required for static export
export function generateStaticParams() {
  return products.map((product) => ({
    code: product.id,
  }));
}

export default function VerifyCodePage({ params }: { params: { code: string } }) {
  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <VerificationStatus code={params.code} />
    </div>
  );
}