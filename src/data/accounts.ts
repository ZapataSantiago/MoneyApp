import type { Tables, TablesInsert } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type Account = Tables<'accounts'>;
export type AccountInput = Pick<TablesInsert<'accounts'>, 'name' | 'type' | 'currency' | 'initial_balance'>;

export async function listAccounts(): Promise<Account[]> {
  const { data, error } = await supabase.from('accounts').select('*').order('created_at');
  if (error) throw error;
  return data;
}

export async function getAccount(id: string): Promise<Account> {
  const { data, error } = await supabase.from('accounts').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function saveAccount(input: AccountInput, id?: string): Promise<void> {
  const { error } = id
    ? await supabase.from('accounts').update(input).eq('id', id)
    : await supabase.from('accounts').insert(input);
  if (error) throw error;
}

export async function deleteAccount(id: string): Promise<void> {
  const { error } = await supabase.from('accounts').delete().eq('id', id);
  if (error?.code === '23503') throw new Error('in_use'); // tiene movimientos
  if (error) throw error;
}
