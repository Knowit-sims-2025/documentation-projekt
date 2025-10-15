export interface Badge {
  id: number;
  name: string;
  description: string;
  iconUrl?: string;
  criteriaValue?: number; // e.g. points or actions needed for badge
}