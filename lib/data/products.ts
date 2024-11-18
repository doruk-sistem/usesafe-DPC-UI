export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  image: string;
  description: string;
  basicInfo: {
    model: string;
    serialNumber: string;
    manufacturingDate: string;
    origin: string;
    weight: string;
    dimensions: string;
  };
  technicalSpecs: {
    name: string;
    value: string;
  }[];
  materials: {
    name: string;
    percentage: number;
    recyclable: boolean;
    description: string;
  }[];
  certifications: {
    name: string;
    issuedBy: string;
    validUntil: string;
    status: "valid" | "expired";
    documentUrl?: string;
  }[];
  sustainabilityScore: number;
  carbonFootprint: string;
}

export const products: Product[] = [
  {
    id: "PROD-2024-001",
    name: "Organic Cotton Baby Bodysuit Set",
    manufacturer: "e-bebek Organics",
    category: "Baby Clothing",
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Premium 3-piece organic cotton bodysuit set for babies, featuring snap closures and gentle elastic. Perfect for sensitive skin.",
    basicInfo: {
      model: "EB-BC-2024",
      serialNumber: "EB-BC-2024-1234",
      manufacturingDate: "2024-02-15",
      origin: "Turkey",
      weight: "200g",
      dimensions: "20cm x 15cm x 3cm (per piece)"
    },
    technicalSpecs: [
      { name: "Size Range", value: "0-3 months" },
      { name: "Material Type", value: "100% Organic Cotton" },
      { name: "Closure Type", value: "Snap Buttons" },
      { name: "Care Instructions", value: "Machine wash 30°C" },
      { name: "Pack Contents", value: "3 Bodysuits" }
    ],
    materials: [
      { 
        name: "Organic Cotton", 
        percentage: 96, 
        recyclable: true,
        description: "GOTS certified organic cotton from sustainable farms"
      },
      { 
        name: "Elastic", 
        percentage: 4, 
        recyclable: false,
        description: "Gentle elastic for comfort"
      }
    ],
    certifications: [
      {
        name: "GOTS Organic",
        issuedBy: "Global Organic Textile Standard",
        validUntil: "2025-02-15",
        status: "valid",
        documentUrl: "/certificates/gots.pdf"
      },
      {
        name: "OEKO-TEX Standard 100",
        issuedBy: "OEKO-TEX",
        validUntil: "2025-02-15",
        status: "valid",
        documentUrl: "/certificates/oeko-tex.pdf"
      }
    ],
    sustainabilityScore: 92,
    carbonFootprint: "3.2 kg CO2e"
  },
  {
    id: "PROD-2024-002",
    name: "Safe Journey Convertible Car Seat",
    manufacturer: "e-bebek Safety",
    category: "Car Seats",
    image: "https://cdn05.e-bebek.com/mnresize/1000/1000/media/p/joie-spi-360-0-18-kg-oto-koltugu_5056080605890_01.jpg",
    description: "Joie Spin 360 Dönebilen Güvenli Araba Koltuğu - Çok Aşamalı Konfor ve Güvenlik, 0-4 Yaş Arası Bebekler İçin",
    basicInfo: {
      model: "EB-CS-2024",
      serialNumber: "EB-CS-2024-5678",
      manufacturingDate: "2024-01-20",
      origin: "Turkey",
      weight: "12.5kg",
      dimensions: "73cm x 45cm x 55cm"
    },
    technicalSpecs: [
      { name: "Weight Capacity", value: "2.3-29.4 kg" },
      { name: "Installation", value: "ISOFIX + Support Leg" },
      { name: "Safety Features", value: "Side Impact Protection" },
      { name: "Recline Positions", value: "6 positions" },
      { name: "Usage Modes", value: "Rear & Forward Facing" }
    ],
    materials: [
      { 
        name: "Impact-Resistant Plastic", 
        percentage: 65, 
        recyclable: true,
        description: "High-grade recyclable safety plastic"
      },
      { 
        name: "EPS Foam", 
        percentage: 20, 
        recyclable: true,
        description: "Energy-absorbing safety foam"
      },
      { 
        name: "Recycled Polyester", 
        percentage: 15, 
        recyclable: true,
        description: "Breathable fabric from recycled materials"
      }
    ],
    certifications: [
      {
        name: "ECE R129/03",
        issuedBy: "European Safety Standards",
        validUntil: "2029-01-20",
        status: "valid",
        documentUrl: "/certificates/ece.pdf"
      },
      {
        name: "TSE Safety Certification",
        issuedBy: "Turkish Standards Institution",
        validUntil: "2029-01-20",
        status: "valid",
        documentUrl: "/certificates/tse.pdf"
      }
    ],
    sustainabilityScore: 85,
    carbonFootprint: "18.5 kg CO2e"
  },
  {
    id: "PROD-2024-010",
    name: "Nepia Genki! Premium Soft Bebek Bezi",
    manufacturer: "Nepia",
    category: "Diapers",
    image: "https://cdn05.e-bebek.com/mnresize/1000/1000/media/p/bebek-bezi-premium-soft-3-beden-firsat-paketi-76-adet-7-12-kg_4902011862003_01.jpg",
    description: "Yumuşak ve nefes alan premium bebek bezi, çok katmanlı emici teknoloji ile maksimum konfor sağlar. Hassas ciltler için yumuşak dokunuş.",
    basicInfo: {
      model: "EB-DB-2024",
      serialNumber: "EB-DB-2024-6789",
      manufacturingDate: "2024-03-05",
      origin: "Turkey",
      weight: "2.8kg",
      dimensions: "40cm x 30cm x 35cm"
    },
    technicalSpecs: [
      { name: "Size Range", value: "Newborn to Size 5" },
      { name: "Pack Count", value: "120 diapers" },
      { name: "Absorption", value: "12 hours" },
      { name: "Biodegradable", value: "Yes" },
      { name: "Wetness Indicator", value: "Yes" }
    ],
    materials: [
      { 
        name: "Bamboo Fiber", 
        percentage: 45, 
        recyclable: true,
        description: "Sustainable bamboo top sheet"
      },
      { 
        name: "Plant-based Core", 
        percentage: 40, 
        recyclable: true,
        description: "Biodegradable absorbent material"
      },
      { 
        name: "Bio-film", 
        percentage: 15, 
        recyclable: true,
        description: "Compostable waterproof layer"
      }
    ],
    certifications: [
      {
        name: "Biodegradable Materials",
        issuedBy: "DIN CERTCO",
        validUntil: "2025-03-05",
        status: "valid",
        documentUrl: "/certificates/din.pdf"
      },
      {
        name: "FSC Bamboo",
        issuedBy: "Forest Stewardship Council",
        validUntil: "2025-03-05",
        status: "valid",
        documentUrl: "/certificates/fsc-bamboo.pdf"
      }
    ],
    sustainabilityScore: 93,
    carbonFootprint: "5.6 kg CO2e"
  },
  {
    id: "PROD-2024-003",
    name: "Natural Care Baby Feeding Set",
    manufacturer: "e-bebek Essentials",
    category: "Feeding",
    image: "https://images.unsplash.com/photo-1594150878496-a921e5af8907?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Complete eco-friendly feeding set including BPA-free bottles, natural nipples, and sterilizer made from sustainable materials.",
    basicInfo: {
      model: "EB-BF-2024",
      serialNumber: "EB-BF-2024-9012",
      manufacturingDate: "2024-03-01",
      origin: "Turkey",
      weight: "850g",
      dimensions: "28cm x 18cm x 15cm"
    },
    technicalSpecs: [
      { name: "Bottle Capacity", value: "150ml & 250ml" },
      { name: "Heat Resistance", value: "Up to 180°C" },
      { name: "Dishwasher Safe", value: "Yes" },
      { name: "Flow Rate", value: "Adjustable" },
      { name: "Set Contents", value: "2 Bottles, 4 Nipples, Sterilizer" }
    ],
    materials: [
      { 
        name: "Medical Grade PP", 
        percentage: 70, 
        recyclable: true,
        description: "BPA-free, food-grade polypropylene"
      },
      { 
        name: "Silicone", 
        percentage: 20, 
        recyclable: true,
        description: "Medical-grade soft silicone"
      },
      { 
        name: "Other Components", 
        percentage: 10, 
        recyclable: true,
        description: "Recyclable packaging and accessories"
      }
    ],
    certifications: [
      {
        name: "EU Food Contact Safety",
        issuedBy: "European Commission",
        validUntil: "2026-03-01",
        status: "valid",
        documentUrl: "/certificates/eu-food.pdf"
      },
      {
        name: "BPA Free Certification",
        issuedBy: "SGS",
        validUntil: "2026-03-01",
        status: "valid",
        documentUrl: "/certificates/bpa-free.pdf"
      }
    ],
    sustainabilityScore: 88,
    carbonFootprint: "4.8 kg CO2e"
  },
  {
    id: "PROD-2024-005",
    name: "Obasan Organik Gebelik Destek Yastığı",
    manufacturer: "Obasan",
    category: "Maternity",
    image: "https://cdn05.e-bebek.com/mnresize/1000/1000/media/p/hamile-uyku-destek-yastigi_8680075433662_05.jpg",
    description: "İki parçalı, çıkarılabilir fermarlı organik yün ve pamuklu terapi yastığı. Hamilelik boyunca vücut desteği sağlar, yan uyku ve emzirme için ideal.",
    basicInfo: {
      model: "EB-MP-2024",
      serialNumber: "EB-MP-2024-7890",
      manufacturingDate: "2024-01-15",
      origin: "Turkey",
      weight: "1.8kg",
      dimensions: "140cm x 80cm x 20cm"
    },
    technicalSpecs: [
      { name: "Fill Material", value: "Organic Buckwheat Hulls" },
      { name: "Cover Material", value: "Organic Cotton" },
      { name: "Shape", value: "C-shaped" },
      { name: "Cover Removable", value: "Yes" },
      { name: "Usage", value: "Pregnancy & Nursing" }
    ],
    materials: [
      { 
        name: "Organic Cotton", 
        percentage: 55, 
        recyclable: true,
        description: "GOTS certified organic cotton cover"
      },
      { 
        name: "Buckwheat Hulls", 
        percentage: 40, 
        recyclable: true,
        description: "Natural, biodegradable filling"
      },
      { 
        name: "Natural Latex", 
        percentage: 5, 
        recyclable: true,
        description: "Support structure"
      }
    ],
    certifications: [
      {
        name: "GOTS Organic",
        issuedBy: "Global Organic Textile Standard",
        validUntil: "2025-01-15",
        status: "valid",
        documentUrl: "/certificates/gots-pillow.pdf"
      },
      {
        name: "OEKO-TEX Standard 100",
        issuedBy: "OEKO-TEX",
        validUntil: "2025-01-15",
        status: "valid",
        documentUrl: "/certificates/oeko-tex-pillow.pdf"
      }
    ],
    sustainabilityScore: 95,
    carbonFootprint: "2.8 kg CO2e"
  },
  {
    id: "PROD-2024-006",
    name: "Natural Baby Care Gift Set",
    manufacturer: "e-bebek Naturals",
    category: "Baby Care",
    image: "https://images.unsplash.com/photo-1602664876866-d3b33b77756b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Complete organic baby care set including shampoo, lotion, oil, and cream, all made with natural ingredients safe for sensitive skin.",
    basicInfo: {
      model: "EB-BC-2024",
      serialNumber: "EB-BC-2024-3456",
      manufacturingDate: "2024-02-20",
      origin: "Turkey",
      weight: "1.2kg",
      dimensions: "25cm x 20cm x 15cm"
    },
    technicalSpecs: [
      { name: "Product Count", value: "5 items" },
      { name: "Shelf Life", value: "24 months" },
      { name: "pH Level", value: "5.5" },
      { name: "Fragrance", value: "Natural" },
      { name: "Total Volume", value: "750ml" }
    ],
    materials: [
      { 
        name: "Organic Ingredients", 
        percentage: 95, 
        recyclable: true,
        description: "Natural plant extracts and oils"
      },
      { 
        name: "Natural Preservatives", 
        percentage: 5, 
        recyclable: true,
        description: "Plant-derived preservatives"
      }
    ],
    certifications: [
      {
        name: "Organic Cosmetics",
        issuedBy: "COSMOS",
        validUntil: "2026-02-20",
        status: "valid",
        documentUrl: "/certificates/cosmos.pdf"
      },
      {
        name: "Dermatologically Tested",
        issuedBy: "Dermatest",
        validUntil: "2026-02-20",
        status: "valid",
        documentUrl: "/certificates/dermatest.pdf"
      }
    ],
    sustainabilityScore: 94,
    carbonFootprint: "3.5 kg CO2e"
  },
  {
    id: "PROD-2024-007",
    name: "Smart Baby Monitor",
    manufacturer: "e-bebek Tech",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1595131838595-3154b9f4450b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Energy-efficient smart baby monitor with HD video, temperature sensing, and two-way audio, made with recyclable materials.",
    basicInfo: {
      model: "EB-BM-2024",
      serialNumber: "EB-BM-2024-8901",
      manufacturingDate: "2024-03-01",
      origin: "Turkey",
      weight: "350g",
      dimensions: "12cm x 8cm x 8cm"
    },
    technicalSpecs: [
      { name: "Camera Resolution", value: "1080p HD" },
      { name: "Range", value: "300m" },
      { name: "Battery Life", value: "12 hours" },
      { name: "Night Vision", value: "Infrared LED" },
      { name: "Connectivity", value: "Wi-Fi 2.4GHz" }
    ],
    materials: [
      { 
        name: "Recycled ABS", 
        percentage: 75, 
        recyclable: true,
        description: "Durable, recycled plastic housing"
      },
      { 
        name: "PCB Components", 
        percentage: 15, 
        recyclable: true,
        description: "Lead-free electronics"
      },
      { 
        name: "Other Materials", 
        percentage: 10, 
        recyclable: false,
        description: "Battery and sensors"
      }
    ],
    certifications: [
      {
        name: "CE Safety",
        issuedBy: "European Union",
        validUntil: "2029-03-01",
        status: "valid",
        documentUrl: "/certificates/ce.pdf"
      },
      {
        name: "RoHS Compliance",
        issuedBy: "EU Commission",
        validUntil: "2029-03-01",
        status: "valid",
        documentUrl: "/certificates/rohs.pdf"
      }
    ],
    sustainabilityScore: 82,
    carbonFootprint: "8.5 kg CO2e"
  },
  {
    id: "PROD-2024-008",
    name: "Organic Baby Play Mat",
    manufacturer: "e-bebek Home",
    category: "Nursery",
    image: "https://images.unsplash.com/photo-1587165282385-fe9bbf5eb1a0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Non-toxic, organic cotton play mat with natural dyes and sustainable padding, perfect for tummy time and early development.",
    basicInfo: {
      model: "EB-PM-2024",
      serialNumber: "EB-PM-2024-2345",
      manufacturingDate: "2024-02-10",
      origin: "Turkey",
      weight: "1.5kg",
      dimensions: "150cm x 150cm x 2cm"
    },
    technicalSpecs: [
      { name: "Material", value: "Organic Cotton + Natural Latex" },
      { name: "Thickness", value: "2cm" },
      { name: "Water Resistant", value: "Yes" },
      { name: "Anti-slip Base", value: "Yes" },
      { name: "Foldable", value: "Yes" }
    ],
    materials: [
      { 
        name: "Organic Cotton", 
        percentage: 60, 
        recyclable: true,
        description: "GOTS certified organic cotton surface"
      },
      { 
        name: "Natural Latex", 
        percentage: 35, 
        recyclable: true,
        description: "FSC certified natural rubber padding"
      },
      { 
        name: "Natural Dyes", 
        percentage: 5, 
        recyclable: true,
        description: "Plant-based colorants"
      }
    ],
    certifications: [
      {
        name: "GOTS Organic",
        issuedBy: "Global Organic Textile Standard",
        validUntil: "2025-02-10",
        status: "valid",
        documentUrl: "/certificates/gots-mat.pdf"
      },
      {
        name: "FSC Certified Latex",
        issuedBy: "Forest Stewardship Council",
        validUntil: "2025-02-10",
        status: "valid",
        documentUrl: "/certificates/fsc.pdf"
      }
    ],
    sustainabilityScore: 96,
    carbonFootprint: "4.2 kg CO2e"
  },

];