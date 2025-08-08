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
  recycled_materials_percentage: string;
}

export class SustainabilityCalculatorService {
  static async calculateFromProductType(productType: string, productSubcategory: string, materials: Material[], productWeight?: number): Promise<SustainabilityMetrics> {
    try {
      const materialsDescription = materials.map(mat => 
        `${mat.name} (${mat.percentage}%, ${mat.recyclable ? 'recyclable' : 'non-recyclable'}): ${mat.description}`
      ).join('\n');

      const weightInfo = productWeight ? `Product Weight: ${productWeight} grams (${(productWeight/1000).toFixed(2)} kg)` : 'Product Weight: Not specified';

      const prompt = `
        As a sustainability expert with deep knowledge of ${productType} manufacturing, analyze this specific ${productSubcategory} product.

        Product Details:
        Category: ${productType}
        Subcategory: ${productSubcategory}
        ${weightInfo}
        Material Composition:
        ${materialsDescription}

        Please calculate precise sustainability metrics considering:

        1. Manufacturing Process Analysis:
        - Analyze typical production methods for ${productSubcategory}
        - Consider standard batch sizes in this industry
        - Account for regional manufacturing practices
        - Calculate resource usage PER UNIT based on typical production batches
        - Factor in product weight for accurate per-unit calculations

        2. Material Impact Assessment:
        - Evaluate environmental impact of each material
        - Consider material combinations and their interaction
        - Assess recyclability based on material composition
        - Factor in material durability standards for ${productSubcategory}
        - Calculate based on actual material percentages and weight

        3. Industry-Specific Considerations for ${productType}:
        - Use actual industry benchmarks for ${productType} manufacturing
        - Consider typical lifecycle patterns for ${productSubcategory}
        - Factor in usage patterns and durability requirements
        - Account for end-of-life disposal methods
        - Use weight-based calculations for resource consumption

        4. Resource Consumption Analysis:
        - Calculate water usage per individual unit (considering weight)
        - Determine energy requirements for single unit production
        - Assess chemical usage in manufacturing process
        - Measure CO2e emissions for one unit
        - Base calculations on actual product weight and material composition

          REALISTIC VALUE RANGES FOR ${productWeight || 500} GRAM PRODUCT:
         - Carbon Footprint: 0.1-50 kg CO2e (depending on materials and manufacturing)
           * Light products (textiles, toys): 0.1-2.0 kg CO2e
           * Medium products (electronics, tools): 2.0-15 kg CO2e  
           * Heavy products (vehicles, machinery): 15-50 kg CO2e
         - Water Usage: 50-800 liters (textiles use more water, metals less)
         - Energy Consumption: 0.5-8 kWh per unit (electronics higher, simple products lower)
         - Chemical Usage: 0.005-0.2 kg (depends on materials and processes)

         EXAMPLE CALCULATIONS FOR ${productWeight || 500} GRAM PRODUCT:
         - Simple metal product: ~0.3 kg CO2e, ~100 liters water, ~1 kWh energy
         - Textile product: ~0.8 kg CO2e, ~300 liters water, ~2 kWh energy
         - Complex product: ~1.2 kg CO2e, ~500 liters water, ~4 kWh energy
         - Electronics: ~1.8 kg CO2e, ~700 liters water, ~6 kWh energy

         Please provide the following metrics in JSON format, with all calculations based on PER UNIT values and actual product weight:
         {
           "sustainability_score": number (0-100, based on actual industry benchmarks),
           "carbon_footprint": string (CO2e emissions per unit, e.g., "2.5 kg CO2e"),
           "water_usage": string (water consumption per unit, e.g., "850 liters"),
           "energy_consumption": string (energy per unit, e.g., "10 kWh per unit"),
           "recycled_materials": string (percentage of recycled content, e.g., "20% of total materials"),
           "chemical_reduction": string (comparison to industry standard, e.g., "15% less than conventional"),
           "biodegradability": string (actual biodegradable percentage, e.g., "25% biodegradable materials"),
           "water_consumption_per_unit": string (must match water_usage exactly),
           "recycled_content_percentage": string (must match recycled_materials),
           "chemical_consumption_per_unit": string (actual chemical usage, e.g., "0.12 kg"),
           "greenhouse_gas_emissions": string (must match carbon_footprint exactly),
           "co2e_emissions_per_unit": string (must match carbon_footprint exactly),
           "minimum_durability_years": string (based on material composition and usage patterns),
           "recycled_materials_percentage": string (must match recycled_materials)
         }

         CRITICAL VALIDATION RULES:
         1. For a ${productWeight || 500} gram product, carbon footprint should be between 0.1-50 kg CO2e
            * Light products (textiles, toys): 0.1-2.0 kg CO2e
            * Medium products (electronics, tools): 2.0-15 kg CO2e
            * Heavy products (vehicles, machinery): 15-50 kg CO2e
         2. Water usage should be between 50-800 liters for this weight
         3. Energy consumption should be between 0.5-8 kWh for this weight
         4. Chemical usage should be between 0.005-0.2 kg for this weight
         5. If values are below these ranges, they are unrealistic and need adjustment
         6. Consider that ${productWeight || 500} grams is ${(productWeight || 500)/1000} kg, so multiply material impacts accordingly
         7. IMPORTANT: These are MINIMUM realistic values. Values below these ranges are scientifically impossible for this product weight.

         Critical Requirements:
        1. All metrics MUST be calculated PER UNIT considering actual product weight
        2. Use real industry data for ${productType} and ${productSubcategory}
        3. Ensure all related metrics match exactly (CO2, water usage, etc.)
        4. Consider actual material properties and combinations
        5. Base calculations on standard industry practices for ${productType}
        6. Use conservative estimates when exact data isn't available
        7. Consider the specific use case of ${productSubcategory}
        8. Account for local manufacturing conditions
        9. Factor in material percentages: ${materials.map(m => `${m.name} (${m.percentage}%)`).join(', ')}
        10. Calculate based on product weight of ${productWeight || 'unknown'} grams
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
      
      // Validate if ChatGPT returned realistic values
      const carbonFootprintValue = parseFloat(metrics.carbon_footprint?.replace(/[^\d.]/g, '') || '0');
      const waterUsageValue = parseFloat(metrics.water_usage?.replace(/[^\d.]/g, '') || '0');
      const energyConsumptionValue = parseFloat(metrics.energy_consumption?.replace(/[^\d.]/g, '') || '0');
      
                    // Check if values are too low (unrealistic)
       // For heavy products like vehicles, carbon footprint should be much higher
       // Note: productWeight is in grams, so we need to convert to kg for comparison
       const weightInKg = productWeight ? productWeight / 1000 : 0.5;
       
       console.log("Validation check:", {
         productWeight,
         weightInKg,
         carbonFootprintValue,
         waterUsageValue,
         energyConsumptionValue,
         carbonFootprint: metrics.carbon_footprint,
         waterUsage: metrics.water_usage,
         energyConsumption: metrics.energy_consumption,
         isHeavyProduct: weightInKg >= 10,
         minCarbonFootprint: weightInKg >= 10 ? 15 : weightInKg >= 2 ? 2 : 0.1,
         isUnrealistic: carbonFootprintValue < (weightInKg >= 10 ? 15 : weightInKg >= 2 ? 2 : 0.1) || waterUsageValue < 50 || energyConsumptionValue < 0.5
       });
       const isLightProduct = weightInKg < 2; // Less than 2kg
       const isMediumProduct = weightInKg >= 2 && weightInKg < 10; // 2-10kg
       const isHeavyProduct = weightInKg >= 10; // 10kg+
       
       let minCarbonFootprint = 0.1; // Default for light products
       if (isHeavyProduct) minCarbonFootprint = 15; // Heavy products like vehicles
       else if (isMediumProduct) minCarbonFootprint = 2; // Medium products
       
       const isUnrealistic = carbonFootprintValue < minCarbonFootprint || waterUsageValue < 50 || energyConsumptionValue < 0.5;
      
      if (isUnrealistic) {
        console.log("ChatGPT returned unrealistic values, using fallback calculation");
        console.log("Values were:", { carbonFootprintValue, waterUsageValue, energyConsumptionValue });
        throw new Error("Unrealistic values detected, using fallback");
      }
      
      // Ensure consistency between related metrics
      const finalMetrics = {
        ...metrics,
        sustainability_score: Math.min(100, Math.max(0, metrics.sustainability_score || 50)),
        greenhouse_gas_emissions: metrics.carbon_footprint,
        co2e_emissions_per_unit: metrics.carbon_footprint,
        water_consumption_per_unit: metrics.water_usage,
        recycled_materials_percentage: metrics.recycled_materials
      };

      return finalMetrics;

    } catch (error) {
      console.error("Error calculating sustainability metrics:", error);
      console.log("Using fallback calculation for weight:", productWeight, "grams");
      // Fallback to realistic default values for any product type
      const defaultWeight = productWeight || 500; // Default to 500g if weight not provided
      const weightInKg = defaultWeight / 1000;
      
             // Generic industry averages for fallback calculations
       let carbonIntensity = 2.5; // Default for light products
       if (productWeight && productWeight >= 10000) {
         carbonIntensity = 8.0; // Higher for heavy products like vehicles
       } else if (productWeight && productWeight >= 2000) {
         carbonIntensity = 4.0; // Medium for medium products
       }
       
       const industryAverages = {
         carbonIntensity, // kg CO2e per kg of product (adjusted by weight)
         waterIntensity: 800,  // liters per kg of product (industry average)
         energyIntensity: 12,  // kWh per kg of product (industry average)
         chemicalIntensity: 0.12 // kg chemicals per kg of product (industry average)
       };
      
      return {
        sustainability_score: 45,
        carbon_footprint: `${(weightInKg * industryAverages.carbonIntensity).toFixed(1)} kg CO2e`,
        water_usage: `${Math.round(weightInKg * industryAverages.waterIntensity)} liters`,
        energy_consumption: `${(weightInKg * industryAverages.energyIntensity).toFixed(1)} kWh per unit`,
        recycled_materials: "15% of total materials",
        chemical_reduction: "20% less than conventional",
        biodegradability: "20% biodegradable materials",
        water_consumption_per_unit: `${Math.round(weightInKg * industryAverages.waterIntensity)} liters`,
        recycled_content_percentage: "15%",
        chemical_consumption_per_unit: `${(weightInKg * industryAverages.chemicalIntensity).toFixed(2)} kg`,
        greenhouse_gas_emissions: `${(weightInKg * industryAverages.carbonIntensity).toFixed(1)} kg CO2e`,
        co2e_emissions_per_unit: `${(weightInKg * industryAverages.carbonIntensity).toFixed(1)} kg CO2e`,
        minimum_durability_years: "3-4 years",
        recycled_materials_percentage: "15%"
      };
    }
  }
} 