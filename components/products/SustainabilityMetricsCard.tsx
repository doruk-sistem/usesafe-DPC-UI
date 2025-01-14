interface SustainabilityMetricsCardProps {
  environmentalFields: {
    id: string;
    name: string;
    value: string | number;
  }[];
}

export function SustainabilityMetricsCard({ environmentalFields }: SustainabilityMetricsCardProps) {
  // ... rest of the code ...
} 