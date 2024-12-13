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

export type AllAppliances = {
  "Connectivity Status": string[];
  "Cost (IDR)": string[];
  "Device ID": string[];
  "Device Name": string[];
  "Device Type": string[];
  "Duration (Hours)": string[];
  "Energy Consumption (kWh)": string[];
  Location: string[];
  "Power Rating (Watt)": string[];
  "Status (ON/OFF)": string[];
  "Usage End Time": string[];
  "Usage Start Time": string[];
};

export type OverusedDevices = {
  name: string;
  duration: number;
  averageUsage: number;
  usageStartTime: string;
  usageEndTime: string;
};

export type Recommendations = {
  message: string;
  recommendations: string[];
};