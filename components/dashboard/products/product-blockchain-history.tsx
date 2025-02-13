'use client';

import { useEffect, useState } from 'react';
import { ProductBlockchainRecord } from '@/lib/types/product-blockchain';
import { productBlockchainService } from '@/lib/services/product-blockchain';
import { format } from 'date-fns';

interface ProductBlockchainHistoryProps {
  productId?: string;
}

export function ProductBlockchainHistory({ productId }: ProductBlockchainHistoryProps) {
  const [records, setRecords] = useState<ProductBlockchainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const history = await productBlockchainService.getProductHistory(productId);

        console.log('History:', history);
        const sortedHistory = history.sort((a, b) => {
          const timestampA = a.timestamp ? parseFloat(a.timestamp) : 0;
          const timestampB = b.timestamp ? parseFloat(b.timestamp) : 0;
          return timestampB - timestampA;
        });
        setRecords(sortedHistory);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Error: {error}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No blockchain records found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
              Action
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Product Name
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Manufacturer
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Timestamp
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {records.map((record, index) => (
            <tr key={`${record.id}-${index}`}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  record.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                  record.action === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {record.action}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {record.name}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {record.manufacturer}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {record.timestamp ? format(new Date(record.timestamp), 'PPpp') : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 