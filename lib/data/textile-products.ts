import { Product } from "../types/product";

export const textileProducts: Product[] = [
  {
    id: "koton-001",
    name: "Bisiklet Yaka Biyeli Arkası Baskılı Kısa Kollu Tişört",
    description: "Comfortable fit basic t-shirt made from sustainable cotton. Made with Better Cotton Initiative (BCI) certified cotton.",
    model: "K1234-BASIC-TS",
    company_id: "koton-tr",
    product_type: "textile",
    status: "NEW",
    status_history: [
      {
        from: "DRAFT",
        to: "NEW",
        timestamp: "2024-01-15T08:00:00Z",
        userId: "system"
      }
    ],
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2024-01-20T10:30:00Z",
    images: [
      {
        url: "/images/tshirt.webp",
        alt: "White Basic T-shirt Front View",
        is_primary: true
      },
      {
        url: "/images/tshirt-2.webp",
        alt: "White Basic T-shirt Back View",
        is_primary: false
      },
      {
        url: "/images/tshirt-3.webp",
        alt: "White Basic T-shirt Detail View",
        is_primary: false
      }
    ],
    key_features: [
      {
        name: "Color",
        value: "White",
        unit: null
      },
      {
        name: "Collection",
        value: "Spring/Summer 2024",
        unit: null
      },
      {
        name: "Fit",
        value: "Regular Fit",
        unit: null
      },
      {
        name: "Neckline",
        value: "Crew Neck",
        unit: null
      },
      {
        name: "Sleeve Length",
        value: "Short Sleeve",
        unit: null
      }
    ],
    dpp_config: {
      lastUpdated: "2024-01-20T10:30:00Z",
      sections: [
        {
          id: "basic-info",
          title: "Basic Information",
          required: true,
          order: 1,
          fields: [
            {
              id: "manufacturer",
              name: "Manufacturer",
              type: "text",
              value: "Koton Mağazacılık Tekstil San. ve Tic. A.Ş.",
              required: true
            },
            {
              id: "category",
              name: "Category",
              type: "text",
              value: "Women's Clothing",
              required: true
            }
          ]
        },
        {
          id: "materials",
          title: "Material Information",
          required: true,
          order: 2,
          fields: [
            {
              id: "cotton",
              name: "Cotton",
              type: "material",
              value: {
                percentage: 95,
                recyclable: true,
                description: "BCI certified organic cotton"
              },
              required: true
            },
            {
              id: "elastane",
              name: "Elastane",
              type: "material",
              value: {
                percentage: 5,
                recyclable: false,
                description: "Elastane blend for stretch"
              },
              required: true
            }
          ]
        },
        {
          id: "certifications",
          title: "Certifications",
          required: true,
          order: 3,
          fields: [
            {
              id: "bci-cert",
              name: "Better Cotton Initiative",
              type: "certification",
              value: {
                issuedBy: "BCI",
                validUntil: "2025-12-31",
                status: "valid",
                documentUrl: "/documents/certificates/bci-cert-2024.pdf"
              },
              required: true
            },
            {
              id: "oeko-tex",
              name: "OEKO-TEX Standard 100",
              type: "certification",
              value: {
                issuedBy: "OEKO-TEX Association",
                validUntil: "2025-06-30",
                status: "valid",
                documentUrl: "/documents/certificates/oeko-tex-2024.pdf"
              },
              required: true
            }
          ]
        },
        {
          id: "care-instructions",
          title: "Care Instructions",
          required: true,
          order: 4,
          fields: [
            {
              id: "washing",
              name: "Washing",
              type: "text",
              value: "Wash at 30 degrees",
              required: true
            },
            {
              id: "ironing",
              name: "Ironing",
              type: "text",
              value: "Iron at medium temperature",
              required: true
            },
            {
              id: "bleaching",
              name: "Bleaching",
              type: "text",
              value: "Do not bleach",
              required: true
            },
            {
              id: "drying",
              name: "Drying",
              type: "text",
              value: "Lay flat to dry",
              required: true
            }
          ]
        },
        {
          id: "environmental",
          title: "Environmental Impact",
          required: true,
          order: 5,
          fields: [
            {
              id: "sustainability-score",
              name: "Sustainability Score",
              type: "number",
              value: 85,
              required: true
            },
            {
              id: "carbon-footprint",
              name: "Carbon Footprint",
              type: "text",
              value: "2.5 kg CO2e",
              required: true
            },
            {
              id: "water-usage",
              name: "Water Usage",
              type: "text",
              value: "1.2k liters",
              required: true
            },
            {
              id: "energy-consumption",
              name: "Energy Consumption",
              type: "text",
              value: "4.8 kWh per unit",
              required: true
            },
            {
              id: "recycled-materials",
              name: "Recycled Materials",
              type: "text",
              value: "30% of total materials",
              required: true
            },
            {
              id: "chemical-reduction",
              name: "Chemical Usage Reduction",
              type: "text",
              value: "45% less than conventional",
              required: true
            },
            {
              id: "biodegradability",
              name: "Biodegradability",
              type: "text",
              value: "80% biodegradable materials",
              required: true
            }
          ]
        }
      ]
    }
  },
  {
    id: "koton-002",
    name: "Yüksek Bel İspanyol Paça Düğmeli Kot Pantolon",
    description: "High-waist flare jeans made with recycled materials. Manufactured using water-saving production techniques.",
    model: "K5678-JEAN-MF",
    company_id: "koton-tr",
    product_type: "jeans",
    status: "NEW",
    status_history: [
      {
        from: "DRAFT",
        to: "NEW",
        timestamp: "2024-01-16T09:00:00Z",
        userId: "system"
      }
    ],
    created_at: "2024-01-16T09:00:00Z",
    updated_at: "2024-01-21T11:30:00Z",
    images: [
      {
        url: "/images/jeans.webp",
        alt: "Flare Leg Jeans Front View",
        is_primary: true
      },
      {
        url: "/images/jeans-2.webp",
        alt: "Flare Leg Jeans Back View",
        is_primary: false
      },
      {
        url: "/images/jeans-3.webp",
        alt: "Flare Leg Jeans Detail View",
        is_primary: false
      }
    ],
    key_features: [
      {
        name: "Color",
        value: "Blue",
        unit: null
      },
      {
        name: "Collection",
        value: "Spring/Summer 2024",
        unit: null
      },
      {
        name: "Fit",
        value: "Flare Leg",
        unit: null
      },
      {
        name: "Waist",
        value: "High Waist",
        unit: null
      },
      {
        name: "Leg Style",
        value: "Flare",
        unit: null
      }
    ],
    dpp_config: {
      lastUpdated: "2024-01-21T11:30:00Z",
      sections: [
        {
          id: "basic-info",
          title: "Basic Information",
          required: true,
          order: 1,
          fields: [
            {
              id: "manufacturer",
              name: "Manufacturer",
              type: "text",
              value: "Koton Mağazacılık Tekstil San. ve Tic. A.Ş.",
              required: true
            },
            {
              id: "category",
              name: "Category",
              type: "text",
              value: "Women's Clothing",
              required: true
            }
          ]
        },
        {
          id: "materials",
          title: "Material Information",
          required: true,
          order: 2,
          fields: [
            {
              id: "recycled-cotton",
              name: "Recycled Cotton",
              type: "material",
              value: {
                percentage: 30,
                recyclable: true,
                description: "Post-consumer recycled cotton"
              },
              required: true
            },
            {
              id: "cotton",
              name: "Cotton",
              type: "material",
              value: {
                percentage: 65,
                recyclable: true,
                description: "BCI certified cotton"
              },
              required: true
            },
            {
              id: "elastane",
              name: "Elastane",
              type: "material",
              value: {
                percentage: 5,
                recyclable: false,
                description: "Elastane blend for stretch"
              },
              required: true
            }
          ]
        },
        {
          id: "certifications",
          title: "Certifications",
          required: true,
          order: 3,
          fields: [
            {
              id: "grs-cert",
              name: "Global Recycle Standard",
              type: "certification",
              value: {
                issuedBy: "Control Union",
                validUntil: "2025-12-31",
                status: "valid",
                documentUrl: "/documents/certificates/grs-cert-2024.pdf"
              },
              required: true
            },
            {
              id: "bci-cert",
              name: "Better Cotton Initiative",
              type: "certification",
              value: {
                issuedBy: "BCI",
                validUntil: "2025-12-31",
                status: "valid",
                documentUrl: "/documents/certificates/bci-cert-2024.pdf"
              },
              required: true
            }
          ]
        },
        {
          id: "care-instructions",
          title: "Care Instructions",
          required: true,
          order: 4,
          fields: [
            {
              id: "washing",
              name: "Washing",
              type: "text",
              value: "Wash inside out at 30 degrees",
              required: true
            },
            {
              id: "ironing",
              name: "Ironing",
              type: "text",
              value: "Iron inside out at medium temperature",
              required: true
            },
            {
              id: "bleaching",
              name: "Bleaching",
              type: "text",
              value: "Do not bleach",
              required: true
            },
            {
              id: "drying",
              name: "Drying",
              type: "text",
              value: "Lay flat to dry",
              required: true
            }
          ]
        },
        {
          id: "environmental",
          title: "Environmental Impact",
          required: true,
          order: 5,
          fields: [
            {
              id: "sustainability-score",
              name: "Sustainability Score",
              type: "number",
              value: 90,
              required: true
            },
            {
              id: "carbon-footprint",
              name: "Carbon Footprint",
              type: "text",
              value: "4.2 kg CO2e",
              required: true
            },
            {
              id: "water-saving",
              name: "Water Saving",
              type: "text",
              value: "85% less water usage compared to conventional production",
              required: true
            },
            {
              id: "energy-consumption",
              name: "Energy Consumption",
              type: "text",
              value: "6.2 kWh per unit",
              required: true
            },
            {
              id: "recycled-content",
              name: "Recycled Content",
              type: "text",
              value: "45% recycled materials used",
              required: true
            },
            {
              id: "chemical-usage",
              name: "Chemical Usage",
              type: "text",
              value: "60% reduction in chemical usage",
              required: true
            },
            {
              id: "renewable-energy",
              name: "Renewable Energy",
              type: "text",
              value: "70% of production energy from renewable sources",
              required: true
            },
            {
              id: "packaging",
              name: "Sustainable Packaging",
              type: "text",
              value: "100% recyclable packaging materials",
              required: true
            },
            {
              id: "waste-reduction",
              name: "Waste Reduction",
              type: "text",
              value: "Zero waste to landfill production process",
              required: true
            }
          ]
        }
      ]
    }
  }
]; 