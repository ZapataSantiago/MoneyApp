import { Account, listAccounts } from '@/data/accounts';
import { Category, listCategories } from '@/data/categories';
import { Group, listGroups } from '@/data/groups';
import { Balance, listBalances, listTransactions, Transaction } from '@/data/transactions';

export type MonthData = {
  transactions: Transaction[];
  categories: Category[];
  groups: Group[];
  accounts: Account[];
  balances: Balance[];
};

export async function loadMonth(range: { from: string; to: string }): Promise<MonthData> {
  const [transactions, categories, groups, accounts, balances] = await Promise.all([
    listTransactions(range),
    listCategories(),
    listGroups(),
    listAccounts(),
    listBalances(),
  ]);
  return { transactions, categories, groups, accounts, balances };
}
