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
  technicalSpecs: TechnicalSpec[];
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

export interface TechnicalSpec {
  name: string;
  value: string;
}

export const products: Product[] = [
  {
    id: "PROD-2024-012",
    name: "AGM LEO Advanced Battery",
    manufacturer: "İnci Akü",
    category: "Automotive Batteries",
    image: "/images/agm-leo-battery.png", // Placeholder image path
    description: "Advanced Absorbent Glass Mat (AGM) battery with superior performance, designed for modern vehicles with high electrical demands.",
    basicInfo: {
      model: "AGM-LEO-12V-65AH",
      serialNumber: "86901451725441",
      manufacturingDate: "2024-04-01",
      origin: "Turkey",
      weight: "17.5 kg",
      dimensions: "242mm x 175mm x 190mm"
    },
    technicalSpecs: [
      { name: "Voltage", value: "12V" },
      { name: "Capacity", value: "65 Ah" },
      { name: "Battery Type", value: "AGM" },
      { name: "Color", value: "Gri" },
      { name: "Cycle Life", value: "High" }
    ],
    materials: [
      { 
        name: "Lead", 
        percentage: 62, 
        recyclable: true,
        description: "CAS No: 7439-92-1"
      },
      { 
        name: "Sulfuric Acid", 
        percentage: 31, 
        recyclable: false,
        description: "CAS No: 7664-93-9 - Electrolyte"
      },
      { 
        name: "Antimony", 
        percentage: 1, 
        recyclable: true,
        description: "CAS No: 7440-36-0"
      },
      { 
        name: "Tin", 
        percentage: 0.2, 
        recyclable: true,
        description: "CAS No: 7440-31-5"
      },
      { 
        name: "Arsenic", 
        percentage: 0.1, 
        recyclable: false,
        description: "CAS No: 7440-38-2"
      },
      { 
        name: "Polypropylene", 
        percentage: 3.5, 
        recyclable: true,
        description: "CAS No: 9003-07-0 - Case material"
      },
      { 
        name: "Silica", 
        percentage: 1.2, 
        recyclable: true,
        description: "CAS No: 112926-00-8"
      },
      { 
        name: "Natural Rubber", 
        percentage: 0.5, 
        recyclable: true,
        description: "CAS No: 9006-04-6"
      },
      { 
        name: "Oil", 
        percentage: 0.5, 
        recyclable: false,
        description: "CAS No: 64742-52-5"
      }
    ],
    certifications: [
      {
        name: "CE Sertifikası",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/ce-battery.pdf"
      },
      {
        name: "TSE",
        issuedBy: "Turkish Standards Institution",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/tse-battery.pdf"
      },
      {
        name: "IEC 62040-1",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/iec-62040-1.pdf"
      },
      {
        name: "IEC 62477-1",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/iec-62477-1.pdf"
      },
      {
        name: "IEC 60896",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/iec-60896.pdf"
      },
      {
        name: "RoHS Belgesi",
        issuedBy: "Eurocert",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/rohs-battery.pdf"
      }
    ],
    sustainabilityScore: 85,
    carbonFootprint: "20.5 kg CO2e"
  },
  {
    id: "PROD-2024-013",
    name: "EFB MAX TIGRIS Enhanced Flooded Battery",
    manufacturer: "İnci Akü",
    category: "Automotive Batteries",
    image: "/images/efb-max-battery.png", // Placeholder image path
    description: "Enhanced Flooded Battery (EFB) with high capacity and advanced cycling performance for start-stop vehicles.",
    basicInfo: {
      model: "EFB-TIGRIS-12V-145AH",
      serialNumber: "8690145155004",
      manufacturingDate: "2024-04-01",
      origin: "Turkey",
      weight: "38 kg",
      dimensions: "513mm x 189mm x 220mm"
    },
    technicalSpecs: [
      { name: "Voltage", value: "12V" },
      { name: "Capacity", value: "145 Ah" },
      { name: "Battery Type", value: "Enhanced Flooded" },
      { name: "Color", value: "Gri" },
      { name: "Start-Stop Compatible", value: "Yes" }
    ],
    materials: [
      { 
        name: "Lead", 
        percentage: 62, 
        recyclable: true,
        description: "CAS No: 7439-92-1"
      },
      { 
        name: "Sulfuric Acid", 
        percentage: 31, 
        recyclable: false,
        description: "CAS No: 7664-93-9 - Electrolyte"
      },
      { 
        name: "Antimony", 
        percentage: 1, 
        recyclable: true,
        description: "CAS No: 7440-36-0"
      },
      { 
        name: "Tin", 
        percentage: 0.2, 
        recyclable: true,
        description: "CAS No: 7440-31-5"
      },
      { 
        name: "Arsenic", 
        percentage: 0.1, 
        recyclable: false,
        description: "CAS No: 7440-38-2"
      },
      { 
        name: "Polypropylene", 
        percentage: 3.5, 
        recyclable: true,
        description: "CAS No: 9003-07-0 - Case material"
      },
      { 
        name: "Silica", 
        percentage: 1.2, 
        recyclable: true,
        description: "CAS No: 112926-00-8"
      },
      { 
        name: "Natural Rubber", 
        percentage: 0.5, 
        recyclable: true,
        description: "CAS No: 9006-04-6"
      },
      { 
        name: "Oil", 
        percentage: 0.5, 
        recyclable: false,
        description: "CAS No: 64742-52-5"
      }
    ],
    certifications: [
      {
        name: "CE Sertifikası",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/ce-efb.pdf"
      },
      {
        name: "TSE",
        issuedBy: "Turkish Standards Institution",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/tse-efb.pdf"
      },
      {
        name: "IEC 62040-1",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/iec-62040-1-efb.pdf"
      },
      {
        name: "IEC 62477-1",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/iec-62477-1-efb.pdf"
      },
      {
        name: "IEC 60896",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/iec-60896-efb.pdf"
      },
      {
        name: "RoHS Belgesi",
        issuedBy: "Eurocert",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/rohs-efb.pdf"
      }
    ],
    sustainabilityScore: 83,
    carbonFootprint: "28.5 kg CO2e"
  },
  {
    id: "PROD-2024-014",
    name: "MAXIM A GORILLA Heavy Duty Battery",
    manufacturer: "İnci Akü",
    category: "Automotive Batteries",
    image: "/images/maxim-gorilla-battery.png", // Placeholder image path
    description: "Robust and powerful battery designed for heavy-duty applications, offering exceptional performance and durability.",
    basicInfo: {
      model: "MAXIM-GORILLA-12V-105AH",
      serialNumber: "8690145165164",
      manufacturingDate: "2024-04-01",
      origin: "Turkey",
      weight: "28 kg",
      dimensions: "242mm x 175mm x 190mm"
    },
    technicalSpecs: [
      { name: "Voltage", value: "12V" },
      { name: "Capacity", value: "105 Ah" },
      { name: "Battery Type", value: "Heavy Duty" },
      { name: "Color", value: "Siyah" },
      { name: "Cold Cranking Amps", value: "850 CCA" }
    ],
    materials: [
      { 
        name: "Lead", 
        percentage: 62, 
        recyclable: true,
        description: "CAS No: 7439-92-1"
      },
      { 
        name: "Sulfuric Acid", 
        percentage: 31, 
        recyclable: false,
        description: "CAS No: 7664-93-9 - Electrolyte"
      },
      { 
        name: "Antimony", 
        percentage: 1, 
        recyclable: true,
        description: "CAS No: 7440-36-0"
      },
      { 
        name: "Tin", 
        percentage: 0.2, 
        recyclable: true,
        description: "CAS No: 7440-31-5"
      },
      { 
        name: "Arsenic", 
        percentage: 0.1, 
        recyclable: false,
        description: "CAS No: 7440-38-2"
      },
      { 
        name: "Polypropylene", 
        percentage: 3.5, 
        recyclable: true,
        description: "CAS No: 9003-07-0 - Case material"
      },
      { 
        name: "Silica", 
        percentage: 1.2, 
        recyclable: true,
        description: "CAS No: 112926-00-8"
      },
      { 
        name: "Natural Rubber", 
        percentage: 0.5, 
        recyclable: true,
        description: "CAS No: 9006-04-6"
      },
      { 
        name: "Oil", 
        percentage: 0.5, 
        recyclable: false,
        description: "CAS No: 64742-52-5"
      }
    ],
    certifications: [
      {
        name: "CE Sertifikası",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/ce-gorilla.pdf"
      },
      {
        name: "TSE",
        issuedBy: "Turkish Standards Institution",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/tse-gorilla.pdf"
      },
      {
        name: "IEC 62040-1",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/iec-62040-1-gorilla.pdf"
      },
      {
        name: "IEC 62477-1",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/iec-62477-1-gorilla.pdf"
      },
      {
        name: "IEC 60896",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/iec-60896-gorilla.pdf"
      },
      {
        name: "RoHS Belgesi",
        issuedBy: "Eurocert",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/rohs-gorilla.pdf"
      }
    ],
    sustainabilityScore: 82,
    carbonFootprint: "32.5 kg CO2e"
  },
  {
    id: "PROD-2024-015",
    name: "SUPRA SENTOR Premium Battery",
    manufacturer: "İnci Akü",
    category: "Automotive Batteries",
    image: "/images/supra-sentor-battery.png", // Placeholder image path
    description: "High-performance battery with superior energy storage and reliability, ideal for modern vehicles with complex electrical systems.",
    basicInfo: {
      model: "SUPRA-SENTOR-12V-90AH",
      serialNumber: "8690145143810",
      manufacturingDate: "2024-04-01",
      origin: "Turkey",
      weight: "24 kg",
      dimensions: "353mm x 175mm x 190mm"
    },
    technicalSpecs: [
      { name: "Voltage", value: "12V" },
      { name: "Capacity", value: "90 Ah" },
      { name: "Battery Type", value: "Premium" },
      { name: "Color", value: "Siyah" },
      { name: "Maintenance Free", value: "Yes" }
    ],
    materials: [
      { 
        name: "Lead", 
        percentage: 59, 
        recyclable: true,
        description: "CAS No: 7439-92-1"
      },
      { 
        name: "Sulfuric Acid", 
        percentage: 31, 
        recyclable: false,
        description: "CAS No: 7664-93-9 - Electrolyte"
      },
      { 
        name: "Calcium", 
        percentage: 0.02, 
        recyclable: true,
        description: "CAS No: 7440-70-2"
      },
      { 
        name: "Arsenic", 
        percentage: 0.035, 
        recyclable: false,
        description: "CAS No: 7440-38-2"
      },
      { 
        name: "Antimony", 
        percentage: 0.78, 
        recyclable: true,
        description: "CAS No: 7440-36-0"
      },
      { 
        name: "Tin", 
        percentage: 0.16, 
        recyclable: true,
        description: "CAS No: 7440-31-5"
      }
    ],
    certifications: [
      {
        name: "CE Sertifikası",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/ce-sentor.pdf"
      },
      {
        name: "TSE",
        issuedBy: "Turkish Standards Institution",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/tse-sentor.pdf"
      },
      {
        name: "IEC 62040-1",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/iec-62040-1-sentor.pdf"
      },
      {
        name: "IEC 62477-1",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/iec-62477-1-sentor.pdf"
      },
      {
        name: "IEC 60896",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/iec-60896-sentor.pdf"
      },
      {
        name: "RoHS Belgesi",
        issuedBy: "Eurocert",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/rohs-sentor.pdf"
      }
    ],
    sustainabilityScore: 87,
    carbonFootprint: "26.5 kg CO2e"
  },
  {
    id: "PROD-2024-016",
    name: "MARİN & KARAVAN Battery",
    manufacturer: "İnci Akü",
    category: "Marine & Caravan Batteries",
    image: "/images/marine-karavan-battery.png",
    description: "Specialized battery for marine and caravan applications, designed for robust performance in challenging environments.",
    basicInfo: {
      model: "L5 Marine",
      serialNumber: "8690145143773",
      manufacturingDate: "2024-04-01",
      origin: "Turkey", 
      weight: "24 kg",
      dimensions: "353mm x 1075mm x 190mm"
    },
    technicalSpecs: [
      { name: "Voltage", value: "12V" },
      { name: "Capacity", value: "90 Ah" },
      { name: "Battery Type", value: "Marine" },
      { name: "Color", value: "Siyah" },
      { name: "Terminal Position", value: "0" }
    ],
    materials: [
      { 
        name: "Lead", 
        percentage: 60, 
        recyclable: true,
        description: "CAS No: 7439-92-1"
      },
      { 
        name: "Sulfuric Acid", 
        percentage: 6.5, 
        recyclable: false,
        description: "CAS No: 7664-93-9 - Electrolyte"
      },
      { 
        name: "Arsenic", 
        percentage: 1, 
        recyclable: false,
        description: "CAS No: 7440-38-2 - Less than 1%"
      },
      { 
        name: "Copper", 
        percentage: 1, 
        recyclable: true,
        description: "CAS No: 7440-50-8 - Less than 1%"
      }
    ],
    certifications: [
      {
        name: "CE Sertifikası",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/ce-marine.pdf"
      },
      {
        name: "TSE",
        issuedBy: "Turkish Standards Institution",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/tse-marine.pdf"
      },
      {
        name: "IEC 62040-1",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/iec-62040-1-marine.pdf"
      },
      {
        name: "IEC 62477-1",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/iec-62477-1-marine.pdf"
      },
      {
        name: "IEC 60896",
        issuedBy: "TSE",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/iec-60896-marine.pdf"
      },
      {
        name: "RoHS Belgesi",
        issuedBy: "Eurocert",
        validUntil: "2025-04-01",
        status: Math.random() > 0.5 ? "valid" : "expired",
        documentUrl: "/certificates/rohs-marine.pdf"
      }
    ],
    sustainabilityScore: 81,
    carbonFootprint: "25.5 kg CO2e"
  }
];