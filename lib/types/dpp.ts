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

export interface NewDPP {
  product_id: string;
  serial_number: string;
  manufacturing_date: string;
  manufacturing_facility: string;
}