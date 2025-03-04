export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
}


export type Property = {
  id: string;
  title: string;
  address: string;
  price: number;
  description: string | null;
  images: string[];
  iq_score: number;
  user_id: string;
  created_at: string;
  deal_type?: "Fix & Flip" | "BRRRR";
  status?: "Deal Pending" | "Under Contract" | "Sold";
  repair_cost?: number;
  profit_for_selling?: number;
  roi?: number;
  rent?: number;
  net_cash_flow?: number;
  cash_on_cash_return?: number;
  arv?: number;
  property_id?: string;
};



export interface DealAnalysis {
  purchase_price: number;
  rehab_cost: number;
  arv: number;
  rent: number;
  refinance_rate: number;
  loan_amount: number;
  holding_costs: number;
  roi: number;
  closing_costs: number;
  project_duration: number;
  project_management_fee: number;
  annual_taxes: number;
  utilities: number;
  annual_insurance_premium: number;
  interest_points: number;
  other_fees: number;
  hml_purchase: number;
  hml_repair: number;
  selling_costs: number;
  turnkey_flip: number;
  current_rent: number;
  property_management: number;
  loan_fees: number;
  down_payment: number;
  vacancy_maintenance: number;
  refinance_loan_interest_points: number;
  refinance_loan_other_fees: number;
}

export interface AdvisorRequest {
  id: string;
  property_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  response?: string;
  created_at: string;
  responded_at?: string;
  advisor_id?: string;
  properties?: Property;
  profiles?: User;
  property?:{
    title: string;
  };
  user?:{
    name: string;
  };
}