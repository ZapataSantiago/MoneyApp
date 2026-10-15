import type { Tables, TablesInsert } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type Group = Tables<'groups'>;
export type GroupInput = Pick<TablesInsert<'groups'>, 'name' | 'allocation_type' | 'allocation_value' | 'is_fixed'>;

export async function listGroups(): Promise<Group[]> {
  const { data, error } = await supabase.from('groups').select('*').order('created_at');
  if (error) throw error;
  return data;
}

export async function getGroup(id: string): Promise<Group> {
  const { data, error } = await supabase.from('groups').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function saveGroup(input: GroupInput, id?: string): Promise<void> {
  const { error } = id
    ? await supabase.from('groups').update(input).eq('id', id)
    : await supabase.from('groups').insert(input);
  if (error) throw error;
}

export async function deleteGroup(id: string): Promise<void> {
  const { error } = await supabase.from('groups').delete().eq('id', id);
  if (error) throw error;
}
