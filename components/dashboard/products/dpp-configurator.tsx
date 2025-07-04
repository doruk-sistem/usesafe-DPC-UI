"use client";

import { Plus, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DPPSection } from "@/lib/types/product";

interface DPPConfiguratorProps {
  availableSections: DPPSection[];
  selectedSections: DPPSection[];
  onSectionsChange: (sections: DPPSection[]) => void;
}

export function DPPConfigurator({
  availableSections,
  selectedSections,
  onSectionsChange,
}: DPPConfiguratorProps) {
  
 
  const filteredAvailableSections = availableSections.filter(
    available => !selectedSections.some(selected => selected.title === available.title)
  );

  
  const handleAdd = (section: DPPSection) => {
    const newSection = { ...section, id: section.id}; 
    onSectionsChange([...selectedSections, newSection]);
  };

 
  const handleRemove = (index: number) => {
    const newSections = [...selectedSections];
    newSections.splice(index, 1);
    onSectionsChange(newSections);
  };

  
  const renderSection = (
    section: DPPSection,
    index?: number,
    isAvailable: boolean = true
  ) => (
    <div
      key={section.id}
      className={`flex items-center justify-between p-3 bg-card border rounded-lg transition-colors ${
        section.required ? "bg-muted" : "hover:border-primary"
      }`}
    >
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium">{section.title}</p>
          {section.required && (
            <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded">
              Required
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {section.fields.length} fields
        </p>
      </div>
      {isAvailable ? (
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => handleAdd(section)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      ) : (
        !section.required && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => handleRemove(index!)}
          >
            <Minus className="h-4 w-4" />
          </Button>
        )
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Available Sections */}
      <Card className="p-4 h-[300px] lg:h-[600px]">
        <h3 className="text-lg font-semibold mb-4">Available Elements</h3>
        <ScrollArea className="h-[220px] lg:h-[500px]">
          <div className="space-y-2">
            {filteredAvailableSections.map(section =>
              renderSection(section, undefined, true)
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Selected Sections */}
      <Card className="p-4 h-[300px] lg:h-[600px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">DPP Configuration</h3>
        </div>
        <ScrollArea className="h-[220px] lg:h-[500px]">
          <div className="space-y-2">
            {selectedSections.map((section, index) =>
              renderSection(section, index, false)
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
