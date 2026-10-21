import type { Tables, TablesInsert } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type Transaction = Tables<'transactions'>;
export type TransactionInput = Pick<
  TablesInsert<'transactions'>,
  'account_id' | 'category_id' | 'kind' | 'amount' | 'date' | 'note'
>;
export type Balance = { account_id: string; currency: string; balance: number };

export async function listTransactions(range: { from: string; to: string }): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .gte('date', range.from)
    .lt('date', range.to)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTransaction(id: string): Promise<Transaction> {
  const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function saveTransaction(input: TransactionInput, id?: string): Promise<void> {
  const { error } = id
    ? await supabase.from('transactions').update(input).eq('id', id)
    : await supabase.from('transactions').insert(input);
  if (error) throw error;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

export async function listBalances(): Promise<Balance[]> {
  const { data, error } = await supabase.from('account_balances').select('*');
  if (error) throw error;
  // Las columnas de una vista salen como opcionales en los tipos generados, pero nunca son null.
  return data.map((r) => ({ account_id: r.account_id!, currency: r.currency!, balance: r.balance ?? 0 }));
}
