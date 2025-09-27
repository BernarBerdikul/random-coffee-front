export type Employee = {
  id: string;
  name: string;
  dept?: string;
  position?: string;
  phoneMasked?: string;
  status?: 'Активный' | 'Приглашение';
  tenureMonths?: number;
  hasWhatsApp?: boolean;
  hasTelegram?: boolean;
  email?: string;
};

export type ShuffleRequest = {
  employeeIds: string[];
  groupSize: number;
};

export type ShuffleResult = {
  groups: string[][]; // array of employee id groups
  at: number; // timestamp
  seed: number;
};

