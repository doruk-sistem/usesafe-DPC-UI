'use client';

import { ProductBlockchainHistory } from '@/components/dashboard/products/product-blockchain-history';

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Product Details</h1>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Blockchain History
              </h3>
              <div className="mt-5">
                <ProductBlockchainHistory productId={params.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 