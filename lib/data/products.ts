import { Product as DBProduct, MaterialValue, CertificationValue } from '../types/product';

export type Product = DBProduct;

export const products: Product[] = [
  {
    id: "PROD-2024-012",
    name: "AGM LEO Advanced Battery",
    description: "Advanced Absorbent Glass Mat (AGM) battery with superior performance, designed for modern vehicles with high electrical demands.",
    company_id: "INCI-001",
    product_type: "battery",
    model: "AGM-LEO-12V-65AH",
    status: "NEW",
    status_history: [
      {
        from: "DRAFT",
        to: "NEW",
        timestamp: new Date().toISOString(),
        userId: "SYSTEM",
        reason: "Initial product creation"
      }
    ],
    images: [
      {
        url: "/images/agm-leo-battery.png",
        alt: "AGM LEO Advanced Battery",
        is_primary: true
      }
    ],
    key_features: [
      {
        name: "Voltage",
        value: "12V"
      },
      {
        name: "Capacity",
        value: "65 Ah"
      },
      {
        name: "Battery Type",
        value: "AGM"
      },
      {
        name: "Weight",
        value: "17.5",
        unit: "kg"
      },
      {
        name: "Dimensions",
        value: "242x175x190",
        unit: "mm"
      },
      {
        name: "Manufacturing Date",
        value: "2024-04-01"
      },
      {
        name: "Serial Number",
        value: "86901451725441"
      },
      {
        name: "Origin",
        value: "Turkey"
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    dpp_config: {
      sections: [
        {
          id: "basic-info",
          title: "Basic Information",
          fields: [
            { 
              id: "manufacturer", 
              name: "Manufacturer", 
              type: "text", 
              required: true, 
              value: "İnci Akü" 
            },
            { 
              id: "category", 
              name: "Category", 
              type: "text", 
              required: true, 
              value: "Automotive Batteries" 
            }
          ],
          required: true,
          order: 0
        },
        {
          id: "materials",
          title: "Material Composition",
          fields: [
            { 
              id: "lead",
              name: "Lead",
              type: "material",
              required: true,
              value: {
                percentage: 62,
                recyclable: true,
                description: "CAS No: 7439-92-1"
              } as MaterialValue
            },
            { 
              id: "sulfuric-acid",
              name: "Sulfuric Acid",
              type: "material",
              required: true,
              value: {
                percentage: 31,
                recyclable: false,
                description: "CAS No: 7664-93-9 - Electrolyte"
              } as MaterialValue
            },
            { 
              id: "antimony",
              name: "Antimony",
              type: "material",
              required: true,
              value: {
                percentage: 1,
                recyclable: true,
                description: "CAS No: 7440-36-0"
              } as MaterialValue
            },
            { 
              id: "tin",
              name: "Tin",
              type: "material",
              required: true,
              value: {
                percentage: 0.2,
                recyclable: true,
                description: "CAS No: 7440-31-5"
              } as MaterialValue
            },
            { 
              id: "arsenic",
              name: "Arsenic",
              type: "material",
              required: true,
              value: {
                percentage: 0.1,
                recyclable: false,
                description: "CAS No: 7440-38-2"
              } as MaterialValue
            },
            { 
              id: "polypropylene",
              name: "Polypropylene",
              type: "material",
              required: true,
              value: {
                percentage: 3.5,
                recyclable: true,
                description: "CAS No: 9003-07-0 - Case material"
              } as MaterialValue
            },
            { 
              id: "silica",
              name: "Silica",
              type: "material",
              required: true,
              value: {
                percentage: 1.2,
                recyclable: true,
                description: "CAS No: 112926-00-8"
              } as MaterialValue
            },
            { 
              id: "natural-rubber",
              name: "Natural Rubber",
              type: "material",
              required: true,
              value: {
                percentage: 0.5,
                recyclable: true,
                description: "CAS No: 9006-04-6"
              } as MaterialValue
            },
            { 
              id: "oil",
              name: "Oil",
              type: "material",
              required: true,
              value: {
                percentage: 0.5,
                recyclable: false,
                description: "CAS No: 64742-52-5"
              } as MaterialValue
            }
          ],
          required: true,
          order: 1
        },
        {
          id: "certifications",
          title: "Certifications",
          fields: [
            {
              id: "ce-cert",
              name: "CE Sertifikası",
              type: "certification",
              required: true,
              value: {
                issuedBy: "TSE",
                validUntil: "2025-04-01",
                status: "valid",
                documentUrl: "/certificates/ce-battery.pdf"
              } as CertificationValue
            },
            {
              id: "tse-cert",
              name: "TSE",
              type: "certification",
              required: true,
              value: {
                issuedBy: "Turkish Standards Institution",
                validUntil: "2025-04-01",
                status: "valid",
                documentUrl: "/certificates/tse-battery.pdf"
              } as CertificationValue
            },
            {
              id: "iec-62040-1",
              name: "IEC 62040-1",
              type: "certification",
              required: true,
              value: {
                issuedBy: "TSE",
                validUntil: "2025-04-01",
                status: "valid",
                documentUrl: "/certificates/iec-62040-1.pdf"
              } as CertificationValue
            },
            {
              id: "iec-62477-1",
              name: "IEC 62477-1",
              type: "certification",
              required: true,
              value: {
                issuedBy: "TSE",
                validUntil: "2025-04-01",
                status: "valid",
                documentUrl: "/certificates/iec-62477-1.pdf"
              } as CertificationValue
            },
            {
              id: "iec-60896",
              name: "IEC 60896",
              type: "certification",
              required: true,
              value: {
                issuedBy: "TSE",
                validUntil: "2025-04-01",
                status: "valid",
                documentUrl: "/certificates/iec-60896.pdf"
              } as CertificationValue
            },
            {
              id: "rohs",
              name: "RoHS Belgesi",
              type: "certification",
              required: true,
              value: {
                issuedBy: "Eurocert",
                validUntil: "2025-04-01",
                status: "valid",
                documentUrl: "/certificates/rohs-battery.pdf"
              } as CertificationValue
            }
          ],
          required: true,
          order: 2
        },
        {
          id: "environmental",
          title: "Environmental Impact",
          fields: [
            {
              id: "sustainability-score",
              name: "Sustainability Score",
              type: "number",
              required: true,
              value: 85
            },
            {
              id: "carbon-footprint",
              name: "Carbon Footprint",
              type: "text",
              required: true,
              value: "20.5 kg CO2e"
            }
          ],
          required: true,
          order: 3
        }
      ],
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "PROD-2024-013",
    name: "EFB MAX TIGRIS Enhanced Flooded Battery",
    description: "Enhanced Flooded Battery (EFB) with high capacity and advanced cycling performance for start-stop vehicles.",
    company_id: "INCI-001",
    product_type: "battery",
    model: "EFB-TIGRIS-12V-145AH",
    status: "NEW",
    status_history: [
      {
        from: "DRAFT",
        to: "NEW",
        timestamp: new Date().toISOString(),
        userId: "SYSTEM",
        reason: "Initial product creation"
      }
    ],
    images: [
      {
        url: "/images/efb-max-battery.png",
        alt: "EFB MAX TIGRIS Enhanced Flooded Battery",
        is_primary: true
      }
    ],
    key_features: [
      {
        name: "Voltage",
        value: "12V"
      },
      {
        name: "Capacity",
        value: "145 Ah"
      },
      {
        name: "Battery Type",
        value: "Enhanced Flooded"
      },
      {
        name: "Weight",
        value: "38",
        unit: "kg"
      },
      {
        name: "Dimensions",
        value: "513x189x220",
        unit: "mm"
      },
      {
        name: "Manufacturing Date",
        value: "2024-04-01"
      },
      {
        name: "Serial Number",
        value: "8690145155004"
      },
      {
        name: "Origin",
        value: "Turkey"
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    dpp_config: {
      sections: [
        {
          id: "basic-info",
          title: "Basic Information",
          fields: [
            { id: "manufacturer", name: "Manufacturer", type: "text", required: true, value: "İnci Akü" },
            { id: "category", name: "Category", type: "text", required: true, value: "Automotive Batteries" }
          ],
          required: true,
          order: 0
        },
        {
          id: "materials",
          title: "Material Composition",
          fields: [
            { 
              id: "lead",
              name: "Lead",
              type: "material",
              required: true,
              value: {
                percentage: 62,
                recyclable: true,
                description: "CAS No: 7439-92-1"
              }
            },
            { 
              id: "sulfuric-acid",
              name: "Sulfuric Acid",
              type: "material",
              required: true,
              value: {
                percentage: 31,
                recyclable: false,
                description: "CAS No: 7664-93-9 - Electrolyte"
              }
            },
            { 
              id: "antimony",
              name: "Antimony",
              type: "material",
              required: true,
              value: {
                percentage: 1,
                recyclable: true,
                description: "CAS No: 7440-36-0"
              }
            },
            { 
              id: "tin",
              name: "Tin",
              type: "material",
              required: true,
              value: {
                percentage: 0.2,
                recyclable: true,
                description: "CAS No: 7440-31-5"
              }
            },
            { 
              id: "arsenic",
              name: "Arsenic",
              type: "material",
              required: true,
              value: {
                percentage: 0.1,
                recyclable: false,
                description: "CAS No: 7440-38-2"
              }
            },
            { 
              id: "polypropylene",
              name: "Polypropylene",
              type: "material",
              required: true,
              value: {
                percentage: 3.5,
                recyclable: true,
                description: "CAS No: 9003-07-0 - Case material"
              }
            },
            { 
              id: "silica",
              name: "Silica",
              type: "material",
              required: true,
              value: {
                percentage: 1.2,
                recyclable: true,
                description: "CAS No: 112926-00-8"
              }
            },
            { 
              id: "natural-rubber",
              name: "Natural Rubber",
              type: "material",
              required: true,
              value: {
                percentage: 0.5,
                recyclable: true,
                description: "CAS No: 9006-04-6"
              }
            },
            { 
              id: "oil",
              name: "Oil",
              type: "material",
              required: true,
              value: {
                percentage: 0.5,
                recyclable: false,
                description: "CAS No: 64742-52-5"
              }
            }
          ],
          required: true,
          order: 1
        },
        {
          id: "certifications",
          title: "Certifications",
          fields: [
            {
              id: "ce-cert",
              name: "CE Sertifikası",
              type: "certification",
              required: true,
              value: {
                issuedBy: "TSE",
                validUntil: "2025-04-01",
                status: "valid",
                documentUrl: "/certificates/ce-efb.pdf"
              }
            },
            {
              id: "tse-cert",
              name: "TSE",
              type: "certification",
              required: true,
              value: {
                issuedBy: "Turkish Standards Institution",
                validUntil: "2025-04-01",
                status: "valid",
                documentUrl: "/certificates/tse-efb.pdf"
              }
            },
            {
              id: "iec-62040-1",
              name: "IEC 62040-1",
              type: "certification",
              required: true,
              value: {
                issuedBy: "TSE",
                validUntil: "2025-04-01",
                status: "valid",
                documentUrl: "/certificates/iec-62040-1-efb.pdf"
              }
            },
            {
              id: "iec-62477-1",
              name: "IEC 62477-1",
              type: "certification",
              required: true,
              value: {
                issuedBy: "TSE",
                validUntil: "2025-04-01",
                status: "valid",
                documentUrl: "/certificates/iec-62477-1-efb.pdf"
              }
            },
            {
              id: "iec-60896",
              name: "IEC 60896",
              type: "certification",
              required: true,
              value: {
                issuedBy: "TSE",
                validUntil: "2025-04-01",
                status: "valid",
                documentUrl: "/certificates/iec-60896-efb.pdf"
              }
            },
            {
              id: "rohs",
              name: "RoHS Belgesi",
              type: "certification",
              required: true,
              value: {
                issuedBy: "Eurocert",
                validUntil: "2025-04-01",
                status: "valid",
                documentUrl: "/certificates/rohs-efb.pdf"
              }
            }
          ],
          required: true,
          order: 2
        },
        {
          id: "environmental",
          title: "Environmental Impact",
          fields: [
            {
              id: "sustainability-score",
              name: "Sustainability Score",
              type: "number",
              required: true,
              value: 83
            },
            {
              id: "carbon-footprint",
              name: "Carbon Footprint",
              type: "text",
              required: true,
              value: "28.5 kg CO2e"
            }
          ],
          required: true,
          order: 3
        }
      ],
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "PROD-2024-014",
    name: "MAXIM A GORILLA Heavy Duty Battery",
    description: "Robust and powerful battery designed for heavy-duty applications, offering exceptional performance and durability.",
    company_id: "INCI-001",
    product_type: "battery",
    model: "MAXIM-GORILLA-12V-105AH",
    status: "NEW",
    status_history: [
      {
        from: "DRAFT",
        to: "NEW",
        timestamp: new Date().toISOString(),
        userId: "SYSTEM",
        reason: "Initial product creation"
      }
    ],
    images: [
      {
        url: "/images/maxim-gorilla-battery.png",
        alt: "MAXIM A GORILLA Heavy Duty Battery",
        is_primary: true
      }
    ],
    key_features: [
      {
        name: "Voltage",
        value: "12V"
      },
      {
        name: "Capacity",
        value: "105 Ah"
      },
      {
        name: "Battery Type",
        value: "Heavy Duty"
      },
      {
        name: "Weight",
        value: "28",
        unit: "kg"
      },
      {
        name: "Dimensions",
        value: "242x175x190",
        unit: "mm"
      },
      {
        name: "Manufacturing Date",
        value: "2024-04-01"
      },
      {
        name: "Serial Number",
        value: "8690145165164"
      },
      {
        name: "Origin",
        value: "Turkey"
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "PROD-2024-015",
    name: "SUPRA SENTOR Premium Battery",
    description: "High-performance battery with superior energy storage and reliability, ideal for modern vehicles with complex electrical systems.",
    company_id: "INCI-001",
    product_type: "battery",
    model: "SUPRA-SENTOR-12V-90AH",
    status: "NEW",
    status_history: [
      {
        from: "DRAFT",
        to: "NEW",
        timestamp: new Date().toISOString(),
        userId: "SYSTEM",
        reason: "Initial product creation"
      }
    ],
    images: [
      {
        url: "/images/supra-sentor-battery.png",
        alt: "SUPRA SENTOR Premium Battery",
        is_primary: true
      }
    ],
    key_features: [
      {
        name: "Voltage",
        value: "12V"
      },
      {
        name: "Capacity",
        value: "90 Ah"
      },
      {
        name: "Battery Type",
        value: "Premium"
      },
      {
        name: "Weight",
        value: "24",
        unit: "kg"
      },
      {
        name: "Dimensions",
        value: "353x175x190",
        unit: "mm"
      },
      {
        name: "Manufacturing Date",
        value: "2024-04-01"
      },
      {
        name: "Serial Number",
        value: "8690145143810"
      },
      {
        name: "Origin",
        value: "Turkey"
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "PROD-2024-016",
    name: "MARİN & KARAVAN Battery",
    description: "Specialized battery for marine and caravan applications, designed for robust performance in challenging environments.",
    company_id: "INCI-001",
    product_type: "battery",
    model: "L5 Marine",
    status: "NEW",
    status_history: [
      {
        from: "DRAFT",
        to: "NEW",
        timestamp: new Date().toISOString(),
        userId: "SYSTEM",
        reason: "Initial product creation"
      }
    ],
    images: [
      {
        url: "/images/marine-karavan-battery.png",
        alt: "MARİN & KARAVAN Battery",
        is_primary: true
      }
    ],
    key_features: [
      {
        name: "Voltage",
        value: "12V"
      },
      {
        name: "Capacity",
        value: "90 Ah"
      },
      {
        name: "Battery Type",
        value: "Marine"
      },
      {
        name: "Weight",
        value: "24",
        unit: "kg"
      },
      {
        name: "Dimensions",
        value: "353x1075x190",
        unit: "mm"
      },
      {
        name: "Manufacturing Date",
        value: "2024-04-01"
      },
      {
        name: "Serial Number",
        value: "8690145143773"
      },
      {
        name: "Origin",
        value: "Turkey"
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];