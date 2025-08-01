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
        As a sustainability expert with deep knowledge of ${productType} manufacturing, analyze this specific ${productSubcategory} product.

        Product Details:
        Category: ${productType}
        Subcategory: ${productSubcategory}
        Material Composition:
        ${materialsDescription}

        Please calculate precise sustainability metrics considering:

        1. Manufacturing Process Analysis:
        - Analyze typical production methods for ${productSubcategory}
        - Consider standard batch sizes in this industry
        - Account for regional manufacturing practices
        - Calculate resource usage PER UNIT based on typical production batches

        2. Material Impact Assessment:
        - Evaluate environmental impact of each material
        - Consider material combinations and their interaction
        - Assess recyclability based on material composition
        - Factor in material durability standards for ${productSubcategory}

        3. Industry-Specific Considerations for ${productType}:
        - Use actual industry benchmarks
        - Consider typical lifecycle patterns
        - Factor in usage patterns and durability requirements
        - Account for end-of-life disposal methods

        4. Resource Consumption Analysis:
        - Calculate water usage per individual unit
        - Determine energy requirements for single unit production
        - Assess chemical usage in manufacturing process
        - Measure CO2e emissions for one unit

        Please provide the following metrics in JSON format, with all calculations based on PER UNIT values:
        {
          "sustainability_score": number (0-100, based on actual industry benchmarks),
          "carbon_footprint": string (CO2e emissions per unit, e.g., "1.5 kg CO2e"),
          "water_usage": string (water consumption per unit, e.g., "2.0 liters"),
          "energy_consumption": string (energy per unit, e.g., "1.2 kWh per unit"),
          "recycled_materials": string (percentage of recycled content, e.g., "30% of total materials"),
          "chemical_reduction": string (comparison to industry standard, e.g., "15% less than conventional"),
          "biodegradability": string (actual biodegradable percentage, e.g., "20% biodegradable materials"),
          "water_consumption_per_unit": string (must match water_usage exactly),
          "recycled_content_percentage": string (must match recycled_materials),
          "chemical_consumption_per_unit": string (actual chemical usage, e.g., "0.1 kg"),
          "greenhouse_gas_emissions": string (must match carbon_footprint exactly),
          "co2e_emissions_per_unit": string (must match carbon_footprint exactly),
          "minimum_durability_years": string (based on material composition and usage patterns)
        }

        Critical Requirements:
        1. All metrics MUST be calculated PER UNIT
        2. Use real industry data for ${productSubcategory}
        3. Ensure all related metrics match exactly (CO2, water usage, etc.)
        4. Consider actual material properties and combinations
        5. Base calculations on standard industry practices
        6. Use conservative estimates when exact data isn't available
        7. Consider the specific use case of ${productSubcategory}
        8. Account for local manufacturing conditions
        `;

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
      
      // Ensure consistency between related metrics
      const finalMetrics = {
        ...metrics,
        sustainability_score: Math.min(100, Math.max(0, metrics.sustainability_score || 50)),
        greenhouse_gas_emissions: metrics.carbon_footprint,
        co2e_emissions_per_unit: metrics.carbon_footprint,
        water_consumption_per_unit: metrics.water_usage
      };

      return finalMetrics;

    } catch (error) {
      console.error("Error calculating sustainability metrics:", error);
      // Fallback to conservative default values
      return {
        sustainability_score: 50,
        carbon_footprint: "1.0 kg CO2e",
        water_usage: "1.0 liters",
        energy_consumption: "0.5 kWh per unit",
        recycled_materials: "0% of total materials",
        chemical_reduction: "10% less than conventional",
        biodegradability: "10% biodegradable materials",
        water_consumption_per_unit: "1.0 liters",
        recycled_content_percentage: "0%",
        chemical_consumption_per_unit: "0.1 kg",
        greenhouse_gas_emissions: "1.0 kg CO2e",
        co2e_emissions_per_unit: "1.0 kg CO2e",
        minimum_durability_years: "1 yıl"
      };
    }
  }
} 