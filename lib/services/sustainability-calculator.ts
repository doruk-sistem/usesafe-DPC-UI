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
  static async calculateFromMaterials(materials: Material[]): Promise<SustainabilityMetrics> {
    try {
      const materialsDescription = materials.map(mat => 
        `${mat.name} (${mat.percentage}%, ${mat.recyclable ? 'recyclable' : 'non-recyclable'}): ${mat.description}`
      ).join('\n');

      const prompt = `
        As a sustainability expert, analyze the following materials composition for a textile product and calculate sustainability metrics:

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

        Consider:
        - Recyclable materials increase sustainability score
        - Organic/natural materials reduce carbon footprint
        - Recycled content reduces water and energy usage
        - Higher percentage of sustainable materials improves overall score
        - Provide realistic values based on textile industry standards
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

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format from ChatGPT");
      }

      const metrics = JSON.parse(jsonMatch[0]) as SustainabilityMetrics;
      
      // Validate and ensure all required fields are present
      const defaultMetrics: SustainabilityMetrics = {
        sustainability_score: 75,
        carbon_footprint: "3.0 kg CO2e",
        water_usage: "1.5k liters",
        energy_consumption: "5.2 kWh per unit",
        recycled_materials: "25% of total materials",
        chemical_reduction: "35% less than conventional",
        biodegradability: "70% biodegradable materials"
      };

      return {
        ...defaultMetrics,
        ...metrics,
        sustainability_score: Math.min(100, Math.max(0, metrics.sustainability_score || 75))
      };

    } catch (error) {
      console.error("Error calculating sustainability metrics:", error);
      
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

  static async calculateFromProductType(productType: string, materials: Material[]): Promise<SustainabilityMetrics> {
    try {
      const materialsDescription = materials.map(mat => 
        `${mat.name} (${mat.percentage}%, ${mat.recyclable ? 'recyclable' : 'non-recyclable'}): ${mat.description}`
      ).join('\n');

      const prompt = `
        As a sustainability expert, analyze the following product and calculate sustainability metrics:

        Product Type: ${productType}
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

        Consider the specific requirements and environmental impact of ${productType} products.
        Provide realistic values based on industry standards for this product type.
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

      return {
        ...defaultMetrics,
        ...metrics,
        sustainability_score: Math.min(100, Math.max(0, metrics.sustainability_score || 75))
      };

    } catch (error) {
      console.error("Error calculating sustainability metrics:", error);
      
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