"use client";

import { DPPConfigurator } from "../dpp-configurator";
import type { DPPSection } from "@/lib/types/product";
import { useState } from "react";

// Default available DPP sections
const defaultAvailableSections: DPPSection[] = [
  {
    id: "materials",
    title: "Material Composition",
    fields: [
      {
        id: "material-name",
        name: "Material Name",
        type: "text",
        required: true,
      },
      {
        id: "percentage",
        name: "Percentage",
        type: "number",
        required: true,
      },
      {
        id: "recyclable",
        name: "Recyclable",
        type: "select",
        required: false,
        options: ["Yes", "No"],
      },
    ],
    required: false,
    order: 1,
  },
  {
    id: "environmental",
    title: "Environmental Footprint",
    fields: [
      {
        id: "carbon-footprint",
        name: "Carbon Footprint",
        type: "number",
        required: true,
      },
      {
        id: "energy-consumption",
        name: "Energy Consumption",
        type: "number",
        required: true,
      },
      {
        id: "water-usage",
        name: "Water Usage",
        type: "number",
        required: false,
      },
    ],
    required: false,
    order: 2,
  },
  {
    id: "recycling",
    title: "Recycling & Disposal",
    fields: [
      {
        id: "recycling-instructions",
        name: "Recycling Instructions",
        type: "text",
        required: true,
      },
      {
        id: "disposal-method",
        name: "Disposal Method",
        type: "select",
        required: true,
        options: ["Recycle", "Special Waste", "General Waste"],
      },
    ],
    required: false,
    order: 3,
  },
  {
    id: "supply-chain",
    title: "Supply Chain Information",
    fields: [
      { id: "supplier", name: "Supplier", type: "text", required: true },
      {
        id: "origin",
        name: "Country of Origin",
        type: "text",
        required: true,
      },
      {
        id: "transportation",
        name: "Transportation Method",
        type: "select",
        required: false,
        options: ["Sea", "Air", "Land"],
      },
    ],
    required: false,
    order: 4,
  },
];

// Required DPP sections that cannot be removed
const requiredSections: DPPSection[] = [
  {
    id: "basic-info",
    title: "Basic Information",
    fields: [
      { id: "name", name: "Product Name", type: "text", required: true },
      { id: "type", name: "Product Type", type: "text", required: true },
      {
        id: "description",
        name: "Description",
        type: "text",
        required: true,
      },
    ],
    required: true,
    order: 0,
  },
  {
    id: "manufacturing",
    title: "Manufacturing Details",
    fields: [
      {
        id: "serial-number",
        name: "Serial Number",
        type: "text",
        required: true,
      },
      {
        id: "manufacturing-date",
        name: "Manufacturing Date",
        type: "date",
        required: true,
      },
      {
        id: "facility",
        name: "Manufacturing Facility",
        type: "text",
        required: true,
      },
    ],
    required: true,
    order: 1,
  },
];

export function DPPConfigStep() {
  const [selectedSections, setSelectedSections] = useState<DPPSection[]>(requiredSections);
  const [availableSections] = useState<DPPSection[]>(defaultAvailableSections);

  const handleSectionsChange = (sections: DPPSection[]) => {
    // Update the sections in parent component
    setSelectedSections(sections);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">
            Digital Product Passport Configuration
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure the sections and fields that will be included in your
            product's DPP
          </p>
        </div>

        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Add or remove sections to customize your Digital Product Passport.
            Required sections cannot be removed.
          </p>
        </div>

        <DPPConfigurator
          availableSections={availableSections}
          selectedSections={selectedSections}
          onSectionsChange={handleSectionsChange}
        />
      </div>
    </div>
  );
}
