import { VerificationStatus } from "@/components/verify/verification-status";
import { products } from "@/lib/data/products";

// Required for static export
export function generateStaticParams() {
  return products.map((product) => ({
    code: product.id,
  }));
}

export default async function VerifyCodePage(props: {
  params: Promise<{ code: string }>;
}) {
  const params = await props.params;
  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <VerificationStatus code={params.code} />
    </div>
  );
}
