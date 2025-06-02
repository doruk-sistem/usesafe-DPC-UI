import { NextRequest, NextResponse } from "next/server";

import { openai } from "@/lib/utils/openai";

/**
 * API endpoint to check ESPR compliance requirements for a new product.
 * This endpoint:
 * 1. Uses OpenAI to determine relevant directives, regulations, and standards
 * 2. Returns the compliance data without saving to database
 * 3. Focuses on sustainability and environmental impact requirements
 *
 * @param request - NextRequest containing categoryName and productName
 * @returns Compliance data including directives, regulations, and standards
 */
export async function POST(request: NextRequest) {
  try {
    const { productName, categoryName, regions } = (await request.json()) as {
      productName: string;
      categoryName: string;
      regions: ("uk" | "eu")[];
    };

    // Validate required fields
    if (!productName || !categoryName || !regions) {
      return NextResponse.json(
        { error: "Product name, category name and region are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(regions)) {
      return NextResponse.json(
        { error: "Regions must be an array" },
        { status: 400 }
      );
    }

    if (regions.length === 0) {
      return NextResponse.json(
        { error: "At least one region must be provided" },
        { status: 400 }
      );
    }

    // Define the expected response structure for OpenAI with ESPR requirements
    const schema = {
      directives: [
        {
          directive_name: "string",
          directive_number: "string",
          directive_edition_date: "string",
          directive_description: "string",
          sustainability_requirements: "string",
          environmental_impact: "string",
          circular_economy_criteria: "string",
          product_lifecycle_assessment: "string",
        },
      ],
      regulations: [
        {
          regulation_number: "string",
          regulation_name: "string",
          regulation_description: "string",
          regulation_edition_date: "string",
          sustainability_criteria: "string",
          circular_economy_requirements: "string",
          environmental_impact_assessment: "string",
          resource_efficiency_requirements: "string",
        },
      ],
      standards: [
        {
          ref_no: "string",
          edition_or_date: "string",
          title: "string",
          sustainability_metrics: "string",
          environmental_standards: "string",
          circular_economy_standards: "string",
          lifecycle_assessment_methodology: "string",
        },
      ],
    };

    const getRegionPromptString = () => {
      const includesUK = regions.includes("uk");
      const includesEU = regions.includes("eu");

      if (includesUK && includesEU) {
        return "EU and UK";
      } else if (includesUK) {
        return "UK";
      } else if (includesEU) {
        return "EU";
      } else {
        return "UK and EU";
      }
    };

    const regionPromptString = getRegionPromptString();

    // Request compliance data from OpenAI with ESPR focus
    const result = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert who provides detailed lists of directives, regulations, and standards that are valid for ESPR compliance of products in the specified category within the EU and UK scope. Focus on sustainability, environmental impact, circular economy, and product lifecycle assessment requirements.",
        },
        {
          role: "user",
          content: `Please list the Directives, Regulations, and Standards data that are valid for ESPR compliance of "${productName}" products in the "${categoryName}" category in the "${regionPromptString}". Include sustainability requirements, environmental impact assessments, circular economy criteria, and product lifecycle assessment requirements. Format: ${JSON.stringify(
            schema
          )}\n Always return results in English and provide only the JSON data. Please return a valid string in JSON format and properly escape quotation marks.`,
        },
      ],
      model: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const data = result?.choices[0]?.message?.content;

    if (!data) {
      return NextResponse.json(
        { error: "Failed to process ESPR data" },
        { status: 500 }
      );
    }

    // Clean and parse the OpenAI response
    const jsonString = data
      ?.replace(/```json|```/g, "")
      .trim()
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ");

    let jsonObject: typeof schema;
    try {
      jsonObject = JSON.parse(jsonString) as typeof schema;
    } catch (error) {
      console.error("JSON Parse Error Details:", error);
      throw error;
    }

    // Validate ESPR requirements
    if (!jsonObject.directives.some(d => d.sustainability_requirements)) {
      return NextResponse.json(
        { error: "Sustainability requirements are mandatory for ESPR compliance" },
        { status: 400 }
      );
    }

    // Return the compliance data
    return NextResponse.json({
      directives: jsonObject.directives,
      regulations: jsonObject.regulations,
      standards: jsonObject.standards,
    });
  } catch (error) {
    console.error("Error processing data: ", error);
    return NextResponse.json(
      { error: "Failed to process data" },
      { status: 500 }
    );
  }
} 