export interface DPP {
  id: string;
  product_id: string;
  serial_number: string;
  manufacturing_date: string;
  manufacturing_facility: string;
  qr_code: string;
  template_id: string;
  created_at: string;
  updated_at: string;
}

export interface DPPListItem extends DPP {
  product_name: string;
  product_type: string;
  company_id: string;
}

export interface DPPTemplate {
  id: string;
  product_type: string;
  hazard_pictograms: {
    id: string;
    name: string;
    image_url: string;
    description: string;
  }[];
  materials: {
    name: string;
    percentage: number;
    cas_number?: string;
    hazard_level?: string;
    recyclable: boolean;
  }[];
  health_safety_measures: {
    category: string;
    measures: string[];
  }[];
  emergency_procedures: {
    scenario: string;
    steps: string[];
  }[];
  storage_installation_guidelines: {
    title: string;
    items: string[];
  }[];
  required_certifications: string[];
  optional_certifications: string[];
  created_at: string;
  updated_at: string;
}

export interface NewDPPTemplate extends Omit<DPPTemplate, 'id' | 'created_at' | 'updated_at'> {}
export interface NewDPP {
  product_id: string;
  serial_number: string;
  manufacturing_date: string;
  manufacturing_facility: string;
}