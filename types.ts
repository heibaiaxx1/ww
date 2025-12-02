export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // e.g., "Daily", "Morning", "Night", "With Food"
  taken: boolean;
  notes?: string;
  category?: 'vitamin' | 'medicine' | 'protein' | 'other';
  reminderTime?: string; // Format: "HH:MM" 24h
}

export type NewSupplementInput = Omit<Supplement, 'id' | 'taken'>;

export interface DayProgress {
  total: number;
  completed: number;
  percentage: number;
}