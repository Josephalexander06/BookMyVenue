export interface StatCardData {
  title: string;
  value: string | number;
  helper?: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalVenues: number;
  totalBookings: number;
  activeCities: number;
}
