export interface Distributor {
  id: string;
  name: string;
  companyType: 'distributor';
  taxInfo: {
    taxNumber: string;
    tradeRegistryNo?: string;
    mersisNo?: string;
  };
  email?: string;
  phone?: string;
  website?: string;
  address?: {
    headquarters?: string;
    branches?: string;
  };
  // İstatistikler
  assignedProducts?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDistributor {
  id: string;
  productId: string;
  distributorId: string;
  assignedBy: string;
  assignedAt: string;
  status: 'active' | 'inactive' | 'pending';
  territory?: string;
  commissionRate?: number;
  notes?: string;
  // İlişkili veriler
  distributor?: Distributor;
  product?: {
    id: string;
    name: string;
    model: string;
    productType: string;
  };
  assignedByCompany?: {
    id: string;
    name: string;
  };
}

export interface DistributorAssignment {
  distributorId: string;
  territory?: string;
  commissionRate?: number;
  notes?: string;
}

export interface DistributorStats {
  total: number;
  withProducts: number;
  withoutProducts: number;
  totalProducts: number;
}

export interface DistributorFilters {
  search?: string;
  sortBy?: 'name' | 'assignedProducts' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
} 