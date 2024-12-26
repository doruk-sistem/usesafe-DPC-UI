import type { DPPTemplate } from "@/lib/types/dpp";

export const defaultBatteryTemplate: Partial<DPPTemplate> = {
  hazard_pictograms: [
    { id: "health", name: "Health Hazard", image_url: "/images/hazard-health.gif", description: "May cause respiratory irritation" },
    { id: "corrosive", name: "Corrosive", image_url: "/images/hazard-explosive.gif", description: "Contains corrosive materials" },
    { id: "warning", name: "Warning", image_url: "/images/hazard-warning.png", description: "General safety warning" },
    { id: "explosive", name: "Explosive", image_url: "/images/hazard-explosive.jpeg", description: "Risk of explosion under specific conditions" },
    { id: "environmental", name: "Environmental Hazard", image_url: "/images/hazard-environmental.png", description: "May pollute water sources" }
  ],
  health_safety_measures: [
    {
      category: "General Safety",
      measures: [
        "Always carry the batteries carefully.",
        "Always keep in the upright position.",
        "Charge in a well-ventilated place.",
        "Do not add extra quantities of pure water. (Pure water level must not be more than 1.5 cm above the plates.)",
        "During battery maintenance (addition of water, cleaning, battery charge), absolutely wear protective goggles suitable with working conditions.",
        "In case of any possible acid splash risk, wear protective clothing."
      ]
    }
  ],
  emergency_procedures: [
    {
      scenario: "Emergency Response",
      steps: [
        "In case of contact with eyes or skin wash with plenty of water.",
        "Immediately remove contaminated clothing.",
        "Ingestion: Drink plenty of water and milk. Consult a physician.",
        "Spill: Wash small-spills with water.",
        "Operating batteries emit highly flammable hydrogen and oxygen gases.",
        "Do not smoke or avoid any sources and acts which may cause sparks near batteries which are being charged, operating on the vehicle, or stopped after a long operation period.",
        "Keep fire away.",
        "Use all devices with great care."
      ]
    }
  ],
  storage_installation_guidelines: [
    {
      title: "General Storage",
      items: [
        "Always store in a dry and cool place in the upright position. (10°C to 25°C).",
        "Place batteries on a wood pallet for avoiding direct contact with concrete ground."
      ]
    },
    {
      title: "Charge Level Monitoring",
      items: [
        "Charge level of the battery must be greater than 12.6V before sale.",
        "During storage, the minimum voltage must be 12.4V.",
        "For preventing permanent damage, unpack and charge at 16.1V and 1/20Cn current if voltage is low."
      ]
    },
    {
      title: "Installation Steps",
      items: [
        "Verify battery compatibility with vehicle manual",
        "Ensure engine is switched off",
        "Remove old battery (negative terminal first)",
        "Conduct short-circuit control",
        "Clean battery compartment and terminals",
        "Install new battery (connect positive cable first)",
        "Check charge current compatibility"
      ]
    }
  ]
};