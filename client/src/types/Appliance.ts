export type Appliance = {
  id: number;
  name: string;
  type: string;
  location: string;
  power: number;
  usage_today: number;
  energy: number;
  cost: number;
  status: string;
  connectivity: string;
  average_usage: number;
  daily_use_target: number;
  priority: boolean;
  monthly_use: number;
  recommended_schedule: string[];
};
