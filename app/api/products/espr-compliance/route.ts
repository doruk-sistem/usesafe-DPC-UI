import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/utils/openai";
import { NextRequest, NextResponse } from "next/server";

/**
 * API endpoint to save ESPR compliance requirements for a product.
 * This endpoint:
 * 1. Validates user authentication and product existence
 * 2. Uses OpenAI to determine relevant directives, regulations, and standards
 * 3. Saves the compliance data to respective database tables
 * 4. Focuses on sustainability and environmental impact requirements
 *
 * @param request - NextRequest containing categoryName and productName
 * @param params - Contains userProductId from the URL
 * @returns Saved directives, regulations, and standards data
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userProductId: string }> }
) {
  try {
    const { userProductId } = await params;
    const { productName, categoryName, regions } = (await request.json()) as {
      productName: string;
      categoryName: string;
      regions: ("uk" | "eu")[];
    };

    // Validate required fields
    if (!productName || !categoryName || !regions)
      return NextResponse.json(
        { error: "Product name, category name and region are required" },
        { status: 400 }
      );

    if (!Array.isArray(regions))
      return NextResponse.json(
        { error: "Regions must be an array" },
        { status: 400 }
      );

    if (regions.length === 0)
      return NextResponse.json(
        { error: "At least one region must be provided" },
        { status: 400 }
      );

    const supabase = await createClient();

    // IMPORTANT: DO NOT REMOVE auth.getUser()
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the product exists
    const product = await supabase
      .from("products")
      .select("*")
      .eq("id", userProductId)
      .single();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
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

    // Save directives to database with ESPR fields
    const {
      data: productEsprDirectives,
      error: productEsprDirectivesError,
    } = await supabase
      .from("product_espr_directives")
      .insert(
        jsonObject.directives.map((directive) => ({
          product_id: userProductId,
          directive_number: directive.directive_number,
          directive_name: directive.directive_name,
          directive_description: directive.directive_description,
          directive_edition_date: directive.directive_edition_date,
          sustainability_requirements: directive.sustainability_requirements,
          environmental_impact: directive.environmental_impact,
          circular_economy_criteria: directive.circular_economy_criteria,
          product_lifecycle_assessment: directive.product_lifecycle_assessment,
        }))
      )
      .select();

    if (productEsprDirectivesError) throw productEsprDirectivesError;

    // Save regulations to database with ESPR fields
    const {
      data: productEsprRegulations,
      error: productEsprRegulationsError,
    } = await supabase
      .from("product_espr_regulations")
      .insert(
        jsonObject.regulations.map((regulation) => ({
          product_id: userProductId,
          regulation_number: regulation.regulation_number,
          regulation_name: regulation.regulation_name,
          regulation_description: regulation.regulation_description,
          regulation_edition_date: regulation.regulation_edition_date,
          sustainability_criteria: regulation.sustainability_criteria,
          circular_economy_requirements: regulation.circular_economy_requirements,
          environmental_impact_assessment: regulation.environmental_impact_assessment,
          resource_efficiency_requirements: regulation.resource_efficiency_requirements,
        }))
      )
      .select();

    if (productEsprRegulationsError) throw productEsprRegulationsError;

    // Save standards to database with ESPR fields
    const {
      data: productEsprStandards,
      error: productEsprStandardsError,
    } = await supabase
      .from("product_espr_standards")
      .insert(
        jsonObject.standards.map((standard) => ({
          product_id: userProductId,
          ref_no: standard.ref_no,
          edition_date: standard.edition_or_date,
          title: standard.title,
          sustainability_metrics: standard.sustainability_metrics,
          environmental_standards: standard.environmental_standards,
          circular_economy_standards: standard.circular_economy_standards,
          lifecycle_assessment_methodology: standard.lifecycle_assessment_methodology,
        }))
      )
      .select();

    if (productEsprStandardsError) throw productEsprStandardsError;

    // Return all saved data
    return NextResponse.json({
      directives: productEsprDirectives,
      regulations: productEsprRegulations,
      standards: productEsprStandards,
    });
  } catch (error) {
    console.error("Error processing data: ", error);
    return NextResponse.json(
      { error: "Failed to process data" },
      { status: 500 }
    );
  }
} 