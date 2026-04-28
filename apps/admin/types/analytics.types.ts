export interface UserGrowthPoint {
  date: string;
  count: number;
}

export interface MessageVolumePoint {
  date: string;
  count: number;
}

export interface SafetyTrendPoint {
  date: string;
  flag_type: string;
  count: number;
}

export interface AIUsagePoint {
  date: string;
  sessions: number;
  summaries: number;
}

export interface TopOffender {
  id: string;
  name: string;
  email: string;
  flag_count: number;
  last_flag_at: string;
}

export interface AnalyticsData {
  userGrowth: UserGrowthPoint[];
  messageVolume: MessageVolumePoint[];
  safetyTrends: SafetyTrendPoint[];
  aiUsage: AIUsagePoint[];
  topOffenders: TopOffender[];
}
