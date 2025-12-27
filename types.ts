
export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  FORM = 'FORM',
  INSIGHTS = 'INSIGHTS',
  PROFIT_LOSS = 'PROFIT_LOSS',
  CHAT_VIEW = 'CHAT_VIEW'
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}

export interface MonthlyData {
  name: string;
  value: number;
  highlight?: boolean;
}
