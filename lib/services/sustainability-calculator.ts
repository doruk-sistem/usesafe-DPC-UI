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
          "carbon_footprint": string (e.g., "2.5 kg CO2e"),
          "water_usage": string (e.g., "1.2k liters"),
          "energy_consumption": string (e.g., "4.8 kWh per unit"),
          "recycled_materials": string (e.g., "30% of total materials"),
          "chemical_reduction": string (e.g., "45% less than conventional"),
          "biodegradability": string (e.g., "80% biodegradable materials")
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
        sustainability_score: 75,
        carbon_footprint: "3.0 kg CO2e",
        water_usage: "1.5k liters",
        energy_consumption: "5.2 kWh per unit",
        recycled_materials: "25% of total materials",
        chemical_reduction: "35% less than conventional",
        biodegradability: "70% biodegradable materials"
      };

      const finalMetrics = {
        ...defaultMetrics,
        ...metrics,
        sustainability_score: Math.min(100, Math.max(0, metrics.sustainability_score || 75))
      };
      return finalMetrics;

    } catch (error) {
      // Fallback to default values
      return {
        sustainability_score: 75,
        carbon_footprint: "3.0 kg CO2e",
        water_usage: "1.5k liters",
        energy_consumption: "5.2 kWh per unit",
        recycled_materials: "25% of total materials",
        chemical_reduction: "35% less than conventional",
        biodegradability: "70% biodegradable materials"
      };
    }
  }
} 