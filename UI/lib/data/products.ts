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
    name: "EcoTech Smart Watch",
    manufacturer: "GreenTech Electronics",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Advanced smartwatch built with sustainable materials and energy-efficient technology.",
    basicInfo: {
      model: "GT-SW-2024",
      serialNumber: "GT-SW-2024-1234",
      manufacturingDate: "2024-01-15",
      origin: "Singapore",
      weight: "45g",
      dimensions: "44mm x 38mm x 10.7mm"
    },
    technicalSpecs: [
      { name: "Display", value: "1.9\" AMOLED" },
      { name: "Battery Life", value: "Up to 7 days" },
      { name: "Water Resistance", value: "5 ATM" },
      { name: "Sensors", value: "Heart Rate, SpO2, Temperature" },
      { name: "Connectivity", value: "Bluetooth 5.2, WiFi" }
    ],
    materials: [
      { 
        name: "Recycled Aluminum", 
        percentage: 60, 
        recyclable: true,
        description: "Aircraft-grade recycled aluminum housing"
      },
      { 
        name: "Bio-based Plastic", 
        percentage: 25, 
        recyclable: true,
        description: "Plant-based polymer components"
      },
      { 
        name: "Glass", 
        percentage: 10, 
        recyclable: true,
        description: "Gorilla Glass with recycled content"
      },
      { 
        name: "Other Components", 
        percentage: 5, 
        recyclable: false,
        description: "Electronic components and sensors"
      }
    ],
    certifications: [
      {
        name: "Energy Star",
        issuedBy: "EPA",
        validUntil: "2025-01-15",
        status: "valid",
        documentUrl: "/certificates/energy-star.pdf"
      },
      {
        name: "RoHS Compliant",
        issuedBy: "EU Commission",
        validUntil: "2026-01-15",
        status: "valid",
        documentUrl: "/certificates/rohs.pdf"
      }
    ],
    sustainabilityScore: 85,
    carbonFootprint: "12.5 kg CO2e"
  },
  {
    id: "PROD-2024-002",
    name: "Sustainable Denim Jeans",
    manufacturer: "EcoFashion Co.",
    category: "Apparel",
    image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Eco-friendly denim made with organic cotton and sustainable manufacturing processes.",
    basicInfo: {
      model: "ECO-DNM-001",
      serialNumber: "EF-DJ-2024-5678",
      manufacturingDate: "2024-02-01",
      origin: "Portugal",
      weight: "400g",
      dimensions: "Standard Fit"
    },
    technicalSpecs: [
      { name: "Fabric Weight", value: "12.5 oz" },
      { name: "Fit Type", value: "Regular Fit" },
      { name: "Closure Type", value: "Button" },
      { name: "Care Instructions", value: "Cold Wash" },
      { name: "Available Sizes", value: "28-38" }
    ],
    materials: [
      { 
        name: "Organic Cotton", 
        percentage: 75, 
        recyclable: true,
        description: "GOTS certified organic cotton"
      },
      { 
        name: "Recycled Polyester", 
        percentage: 23, 
        recyclable: true,
        description: "Made from recycled plastic bottles"
      },
      { 
        name: "Elastane", 
        percentage: 2, 
        recyclable: false,
        description: "For stretch and comfort"
      }
    ],
    certifications: [
      {
        name: "Global Organic Textile Standard",
        issuedBy: "GOTS",
        validUntil: "2025-02-01",
        status: "valid",
        documentUrl: "/certificates/gots.pdf"
      },
      {
        name: "Fair Trade Certified",
        issuedBy: "Fair Trade USA",
        validUntil: "2025-02-01",
        status: "valid",
        documentUrl: "/certificates/fair-trade.pdf"
      }
    ],
    sustainabilityScore: 92,
    carbonFootprint: "8.3 kg CO2e"
  },
  {
    id: "PROD-2024-003",
    name: "Solar Power Bank",
    manufacturer: "SunCharge Technologies",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1620813834147-3e64704a3939?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "High-capacity power bank with integrated solar charging capability.",
    basicInfo: {
      model: "SC-PB-2024",
      serialNumber: "SC-PB-2024-9012",
      manufacturingDate: "2024-03-01",
      origin: "Vietnam",
      weight: "280g",
      dimensions: "152mm x 75mm x 25mm"
    },
    technicalSpecs: [
      { name: "Battery Capacity", value: "20,000 mAh" },
      { name: "Solar Panel", value: "5W" },
      { name: "Input Ports", value: "USB-C, Solar" },
      { name: "Output Ports", value: "2x USB-A, 1x USB-C" },
      { name: "Charging Time", value: "4 hours (USB-C)" }
    ],
    materials: [
      { 
        name: "Recycled Plastic", 
        percentage: 70, 
        recyclable: true,
        description: "Post-consumer recycled ABS plastic"
      },
      { 
        name: "Solar Cells", 
        percentage: 15, 
        recyclable: true,
        description: "High-efficiency monocrystalline silicon"
      },
      { 
        name: "Battery Components", 
        percentage: 10, 
        recyclable: true,
        description: "Lithium-ion cells with recycling program"
      },
      { 
        name: "Other Materials", 
        percentage: 5, 
        recyclable: false,
        description: "Circuit boards and connectors"
      }
    ],
    certifications: [
      {
        name: "Solar Rating Certification",
        issuedBy: "SRCC",
        validUntil: "2026-03-01",
        status: "valid",
        documentUrl: "/certificates/srcc.pdf"
      }
    ],
    sustainabilityScore: 88,
    carbonFootprint: "5.2 kg CO2e"
  }
];