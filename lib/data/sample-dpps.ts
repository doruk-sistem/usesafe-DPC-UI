export interface DPP {
  id: string;
  productName: string;
  manufacturer: string;
  serialNumber: string;
  manufacturingDate: string;
  category: string;
  sustainabilityScore: number;
  carbonFootprint: string;
  materials: {
    name: string;
    percentage: number;
    recyclable: boolean;
  }[];
  certifications: {
    name: string;
    issuedBy: string;
    validUntil: string;
    status: "valid" | "expired";
  }[];
  lifecycle: {
    stage: string;
    location: string;
    date: string;
    description: string;
  }[];
}

export const sampleDPPs: DPP[] = [
  {
    id: "DPP-2024-001",
    productName: "EcoTech Smart Watch",
    manufacturer: "GreenTech Electronics",
    serialNumber: "GT-SW-2024-1234",
    manufacturingDate: "2024-01-15",
    category: "Electronics",
    sustainabilityScore: 85,
    carbonFootprint: "12.5 kg CO2e",
    materials: [
      { name: "Recycled Aluminum", percentage: 60, recyclable: true },
      { name: "Bio-based Plastic", percentage: 25, recyclable: true },
      { name: "Glass", percentage: 10, recyclable: true },
      { name: "Other Components", percentage: 5, recyclable: false }
    ],
    certifications: [
      {
        name: "Energy Star",
        issuedBy: "EPA",
        validUntil: "2025-01-15",
        status: "valid"
      },
      {
        name: "RoHS Compliant",
        issuedBy: "EU Commission",
        validUntil: "2026-01-15",
        status: "valid"
      }
    ],
    lifecycle: [
      {
        stage: "Raw Material Sourcing",
        location: "Multiple Locations",
        date: "2023-12-01",
        description: "Sustainable materials sourced from certified suppliers"
      },
      {
        stage: "Manufacturing",
        location: "Green Factory, Singapore",
        date: "2024-01-15",
        description: "Assembled using 100% renewable energy"
      },
      {
        stage: "Distribution",
        location: "Global",
        date: "2024-01-20",
        description: "Low-emission transportation methods used"
      }
    ]
  },
  {
    id: "DPP-2024-002",
    productName: "Sustainable Denim Jeans",
    manufacturer: "EcoFashion Co.",
    serialNumber: "EF-DJ-2024-5678",
    manufacturingDate: "2024-02-01",
    category: "Apparel",
    sustainabilityScore: 92,
    carbonFootprint: "8.3 kg CO2e",
    materials: [
      { name: "Organic Cotton", percentage: 75, recyclable: true },
      { name: "Recycled Polyester", percentage: 23, recyclable: true },
      { name: "Elastane", percentage: 2, recyclable: false }
    ],
    certifications: [
      {
        name: "Global Organic Textile Standard",
        issuedBy: "GOTS",
        validUntil: "2025-02-01",
        status: "valid"
      },
      {
        name: "Fair Trade Certified",
        issuedBy: "Fair Trade USA",
        validUntil: "2025-02-01",
        status: "valid"
      }
    ],
    lifecycle: [
      {
        stage: "Cotton Farming",
        location: "Organic Farms, India",
        date: "2023-08-15",
        description: "Organic cotton harvested using sustainable practices"
      },
      {
        stage: "Manufacturing",
        location: "EcoFactory, Portugal",
        date: "2024-02-01",
        description: "Water-saving manufacturing process"
      },
      {
        stage: "Distribution",
        location: "Europe",
        date: "2024-02-10",
        description: "Rail and electric vehicle transportation"
      }
    ]
  },
  {
    id: "DPP-2024-003",
    productName: "Solar Power Bank",
    manufacturer: "SunCharge Technologies",
    serialNumber: "SC-PB-2024-9012",
    manufacturingDate: "2024-03-01",
    category: "Electronics",
    sustainabilityScore: 88,
    carbonFootprint: "5.2 kg CO2e",
    materials: [
      { name: "Recycled Plastic", percentage: 70, recyclable: true },
      { name: "Solar Cells", percentage: 15, recyclable: true },
      { name: "Battery Components", percentage: 10, recyclable: true },
      { name: "Other Materials", percentage: 5, recyclable: false }
    ],
    certifications: [
      {
        name: "Solar Rating Certification",
        issuedBy: "SRCC",
        validUntil: "2026-03-01",
        status: "valid"
      }
    ],
    lifecycle: [
      {
        stage: "Component Manufacturing",
        location: "Tech City, Taiwan",
        date: "2024-02-15",
        description: "High-efficiency solar cells production"
      },
      {
        stage: "Assembly",
        location: "Green Plant, Vietnam",
        date: "2024-03-01",
        description: "Solar-powered assembly facility"
      },
      {
        stage: "Quality Control",
        location: "Green Plant, Vietnam",
        date: "2024-03-05",
        description: "Rigorous testing for durability and efficiency"
      }
    ]
  }
];