import { Distributor, ProductDistributor, DistributorStats } from "@/lib/types/distributor";

// Mock Distributors Data
export const mockDistributors: Distributor[] = [
  {
    id: "dist-001",
    name: "Anadolu Dağıtım A.Ş.",
    companyType: "distributor",
    taxInfo: {
      taxNumber: "1234567890",
      tradeRegistryNo: "TR-001",
      mersisNo: "MERSIS-001"
    },
    email: "info@anadoludagitim.com",
    phone: "+90 212 555 0101",
    website: "https://anadoludagitim.com",
    address: {
      headquarters: "İstanbul, Türkiye",
      branches: "Ankara, İzmir, Bursa"
    },
    assignedProducts: 15,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-12-01T14:30:00Z"
  },
  {
    id: "dist-002",
    name: "Ege Distribütör Ltd. Şti.",
    companyType: "distributor",
    taxInfo: {
      taxNumber: "2345678901",
      tradeRegistryNo: "TR-002",
      mersisNo: "MERSIS-002"
    },
    email: "contact@egedistributor.com",
    phone: "+90 232 555 0202",
    website: "https://egedistributor.com",
    address: {
      headquarters: "İzmir, Türkiye",
      branches: "Aydın, Manisa, Denizli"
    },
    assignedProducts: 8,
    createdAt: "2024-02-20T09:00:00Z",
    updatedAt: "2024-11-28T16:45:00Z"
  },
  {
    id: "dist-003",
    name: "Akdeniz Ticaret A.Ş.",
    companyType: "distributor",
    taxInfo: {
      taxNumber: "3456789012",
      tradeRegistryNo: "TR-003",
      mersisNo: "MERSIS-003"
    },
    email: "info@akdenizticaret.com",
    phone: "+90 242 555 0303",
    website: "https://akdenizticaret.com",
    address: {
      headquarters: "Antalya, Türkiye",
      branches: "Mersin, Adana, Hatay"
    },
    assignedProducts: 3,
    createdAt: "2024-11-15T11:00:00Z",
    updatedAt: "2024-11-15T11:00:00Z"
  },
  {
    id: "dist-004",
    name: "Karadeniz Dağıtım Ltd.",
    companyType: "distributor",
    taxInfo: {
      taxNumber: "4567890123",
      tradeRegistryNo: "TR-004",
      mersisNo: "MERSIS-004"
    },
    email: "info@karadenizdagitim.com",
    phone: "+90 462 555 0404",
    website: "https://karadenizdagitim.com",
    address: {
      headquarters: "Trabzon, Türkiye",
      branches: "Rize, Giresun, Ordu"
    },
    assignedProducts: 12,
    createdAt: "2024-03-10T08:00:00Z",
    updatedAt: "2024-11-30T12:15:00Z"
  },
  {
    id: "dist-005",
    name: "İç Anadolu Ticaret A.Ş.",
    companyType: "distributor",
    taxInfo: {
      taxNumber: "5678901234",
      tradeRegistryNo: "TR-005",
      mersisNo: "MERSIS-005"
    },
    email: "info@icanadoluticaret.com",
    phone: "+90 312 555 0505",
    website: "https://icanadoluticaret.com",
    address: {
      headquarters: "Ankara, Türkiye",
      branches: "Konya, Kayseri, Sivas"
    },
    assignedProducts: 0,
    createdAt: "2024-04-05T10:30:00Z",
    updatedAt: "2024-10-15T09:20:00Z"
  }
];

// Mock Product-Distributor Relationships
export const mockProductDistributors: ProductDistributor[] = [
  {
    id: "pd-001",
    productId: "prod-001",
    distributorId: "dist-001",
    assignedBy: "company-001",
    assignedAt: "2024-06-15T10:00:00Z",
    status: "active",
    territory: "Türkiye",
    commissionRate: 12.5,
    notes: "Ana distribütör olarak atandı",
    distributor: mockDistributors[0],
    product: {
      id: "prod-001",
      name: "Premium Laptop",
      model: "PL-2024",
      productType: "electronics"
    },
    assignedByCompany: {
      id: "company-001",
      name: "TechCorp A.Ş."
    }
  },
  {
    id: "pd-002",
    productId: "prod-001",
    distributorId: "dist-002",
    assignedBy: "company-001",
    assignedAt: "2024-07-20T14:30:00Z",
    status: "active",
    territory: "Ege Bölgesi",
    commissionRate: 15.0,
    notes: "Ege bölgesi için özel distribütör",
    distributor: mockDistributors[1],
    product: {
      id: "prod-001",
      name: "Premium Laptop",
      model: "PL-2024",
      productType: "electronics"
    },
    assignedByCompany: {
      id: "company-001",
      name: "TechCorp A.Ş."
    }
  },
  {
    id: "pd-003",
    productId: "prod-002",
    distributorId: "dist-001",
    assignedBy: "company-001",
    assignedAt: "2024-08-10T09:15:00Z",
    status: "active",
    territory: "Türkiye",
    commissionRate: 12.5,
    notes: "Genel dağıtım",
    distributor: mockDistributors[0],
    product: {
      id: "prod-002",
      name: "Smartphone Pro",
      model: "SP-2024",
      productType: "electronics"
    },
    assignedByCompany: {
      id: "company-001",
      name: "TechCorp A.Ş."
    }
  },
  {
    id: "pd-004",
    productId: "prod-003",
    distributorId: "dist-004",
    assignedBy: "company-002",
    assignedAt: "2024-09-05T11:45:00Z",
    status: "active",
    territory: "Karadeniz Bölgesi",
    commissionRate: 14.0,
    notes: "Karadeniz bölgesi için özel anlaşma",
    distributor: mockDistributors[3],
    product: {
      id: "prod-003",
      name: "Tablet Ultra",
      model: "TU-2024",
      productType: "electronics"
    },
    assignedByCompany: {
      id: "company-002",
      name: "MobileTech Ltd."
    }
  },
  {
    id: "pd-005",
    productId: "prod-004",
    distributorId: "dist-003",
    assignedBy: "company-003",
    assignedAt: "2024-11-20T16:20:00Z",
    status: "pending",
    territory: "Akdeniz Bölgesi",
    commissionRate: 18.0,
    notes: "Onay bekliyor",
    distributor: mockDistributors[2],
    product: {
      id: "prod-004",
      name: "Wireless Headphones",
      model: "WH-2024",
      productType: "audio"
    },
    assignedByCompany: {
      id: "company-003",
      name: "AudioPro A.Ş."
    }
  }
];

// Mock Distributor Stats
export const mockDistributorStats: DistributorStats = {
  total: 5,
  withProducts: 4,
  withoutProducts: 1,
  totalProducts: 38
};

// Helper functions for mock data
export const getDistributorById = (id: string): Distributor | undefined => {
  return mockDistributors.find(dist => dist.id === id);
};

export const getDistributorsByStatus = (status: 'active' | 'inactive' | 'pending'): Distributor[] => {
  // Status artık Distributor interface'inde yok, bu fonksiyonu kaldır veya değiştir
  return mockDistributors;
};

export const getProductDistributors = (productId: string): ProductDistributor[] => {
  return mockProductDistributors.filter(pd => pd.productId === productId);
};

export const getDistributorProducts = (distributorId: string): ProductDistributor[] => {
  return mockProductDistributors.filter(pd => pd.distributorId === distributorId);
};

export const searchDistributors = (query: string): Distributor[] => {
  const lowerQuery = query.toLowerCase();
  return mockDistributors.filter(dist => 
    dist.name.toLowerCase().includes(lowerQuery) ||
    dist.taxInfo.taxNumber.includes(query)
  );
}; 