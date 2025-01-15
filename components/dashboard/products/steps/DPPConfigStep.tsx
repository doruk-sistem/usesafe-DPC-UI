"use client";

import type { UseFormReturn } from "react-hook-form";

import { DPPConfigurator } from "../dpp-configurator";
import type { NewProduct, DPPSection } from "@/lib/types/product";

interface DPPConfigStepProps {
  form: UseFormReturn<NewProduct>;
  availableSections: DPPSection[];
  selectedSections: DPPSection[];
  onSectionsChange: (sections: DPPSection[]) => void;
}

export function DPPConfigStep({ 
  form,
  availableSections, 
  selectedSections, 
  onSectionsChange 
}: DPPConfigStepProps) {
  const handleSectionsChange = (sections: DPPSection[]) => {
    // Update the sections in parent component
    onSectionsChange(sections);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Digital Product Passport Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure the sections and fields that will be included in your product's DPP
          </p>
        </div>
        
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Add or remove sections to customize your Digital Product Passport. Required sections cannot be removed.
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