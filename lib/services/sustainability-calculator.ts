import { ChatGPTService } from "./chatgpt";

export interface Material {
  name: string;
  percentage: number;
  recyclable: boolean;
  description: string;
}

export interface SustainabilityMetrics {
  sustainability_score: number;
  carbon_footprint: string;
  water_usage: string;
  energy_consumption: string;
  recycled_materials: string;
  chemical_reduction: string;
  biodegradability: string;
  // Senior onaylı yeni metrikler
  water_consumption_per_unit: string;
  recycled_content_percentage: string;
  chemical_consumption_per_unit: string;
  greenhouse_gas_emissions: string;
  co2e_emissions_per_unit: string;
  minimum_durability_years: string;
}

export class SustainabilityCalculatorService {
  static async calculateFromProductType(productType: string, productSubcategory: string, materials: Material[]): Promise<SustainabilityMetrics> {
    try {
      const materialsDescription = materials.map(mat => 
        `${mat.name} (${mat.percentage}%, ${mat.recyclable ? 'recyclable' : 'non-recyclable'}): ${mat.description}`
      ).join('\n');

      const prompt = `
        As a sustainability expert, analyze the following product and calculate sustainability metrics:

        Product Type: ${productType}
        Product Subcategory: ${productSubcategory}
        Materials:
        ${materialsDescription}

        Please provide the following metrics in JSON format:
        {
          "sustainability_score": number (0-100),
          "carbon_footprint": string (e.g., "3.2 kg CO2e"),
          "water_usage": string (e.g., "2500 liters"),
          "energy_consumption": string (e.g., "7.5 kWh per unit"),
          "recycled_materials": string (e.g., "0% of total materials"),
          "chemical_reduction": string (e.g., "30% less than conventional"),
          "biodegradability": string (e.g., "20% biodegradable materials"),
          "water_consumption_per_unit": string (e.g., "15.000 Litre"),
          "recycled_content_percentage": string (e.g., "40%"),
          "chemical_consumption_per_unit": string (e.g., "8 kg"),
          "greenhouse_gas_emissions": string (e.g., "205.4"),
          "co2e_emissions_per_unit": string (e.g., "30 kg"),
          "minimum_durability_years": string (e.g., "10 yıl")
        }

        IMPORTANT GUIDELINES:
        - 'Biodegradability' and 'recyclability' are different concepts. A material can be biodegradable even if it is not recyclable.
        - If the product is made of 100% natural fibers (like cotton, wool, etc.), always set biodegradability to 100% regardless of recyclability.
        - If the product is made of 100% synthetic materials (like polyester, nylon, etc.), set biodegradability to a low value (0-20%).
        - If the product is a mix, estimate biodegradability based on the least biodegradable component.
        - 'recycled_materials' must be 0% unless the input materials are explicitly marked as recycled or reused. Only assign a value greater than 0% if the input data specifies recycled content.
        - Always use the actual input data for calculations. Do not assume recycled content or biodegradability unless specified in the materials list.
        - Use realistic values for carbon footprint, energy, and water usage based on the product type and subcategory provided above.
        - Provide realistic values based on industry standards for the given product type and subcategory.
        - If you are unsure, prefer conservative, realistic values rather than extremes.
      `;

      // Yeni endpointi kullan
      const response = await fetch('/api/chatgpt/sustainability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const result = await response.json();
      const content = result.response || result.message || JSON.stringify(result);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format from ChatGPT");
      }

      const metrics = JSON.parse(jsonMatch[0]) as SustainabilityMetrics;
      
      const defaultMetrics: SustainabilityMetrics = {
        sustainability_score: 65,
        carbon_footprint: "3.2 kg CO2e",
        water_usage: "2500 liters",
        energy_consumption: "7.5 kWh per unit",
        recycled_materials: "0% of total materials",
        chemical_reduction: "30% less than conventional",
        biodegradability: "20% biodegradable materials",
        // Senior onaylı gerçek metrikler
        water_consumption_per_unit: "15.000 Litre",
        recycled_content_percentage: "40%",
        chemical_consumption_per_unit: "8 kg",
        greenhouse_gas_emissions: "205.4",
        co2e_emissions_per_unit: "30 kg",
        minimum_durability_years: "10 yıl"
      };

      const finalMetrics = {
        ...defaultMetrics,
        ...metrics,
        sustainability_score: Math.min(100, Math.max(0, metrics.sustainability_score || 75))
      };
      return finalMetrics;

    } catch (error) {
      // Fallback to default values (Senior onaylı gerçek metrikler)
      return {
        sustainability_score: 65,
        carbon_footprint: "3.2 kg CO2e",
        water_usage: "2500 liters",
        energy_consumption: "7.5 kWh per unit",
        recycled_materials: "0% of total materials",
        chemical_reduction: "30% less than conventional",
        biodegradability: "20% biodegradable materials",
        water_consumption_per_unit: "15.000 Litre",
        recycled_content_percentage: "40%",
        chemical_consumption_per_unit: "8 kg",
        greenhouse_gas_emissions: "205.4",
        co2e_emissions_per_unit: "30 kg",
        minimum_durability_years: "10 yıl"
      };
    }
  }
} 