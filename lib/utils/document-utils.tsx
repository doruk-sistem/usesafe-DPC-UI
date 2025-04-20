import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import React from 'react';

import { DocumentStatus } from '../types/document'; 

// Döküman durumuna göre ikon döndüren yardımcı fonksiyon
export const getStatusIcon = (
  status: DocumentStatus | string | null | undefined
): React.ReactElement => {
  const statusLower = (status || '').toLowerCase();
  switch (statusLower) {
    case 'approved':
    case 'valid':
    case 'verified':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'rejected':
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'expired':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'warning':
    case 'expiring':
    case 'expiring_soon':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

// Döküman durumuna göre renk sınıfı döndüren yardımcı fonksiyon
export const getStatusColor = (
  status: DocumentStatus | string | null | undefined
): string => {
  const statusLower = (status || '').toLowerCase();
  switch (statusLower) {
    case 'approved':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'expired':
      return 'bg-red-100 text-red-800 hover:bg-red-200'; // Expired için de kırmızı tonları
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};