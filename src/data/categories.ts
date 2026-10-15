import type { Tables, TablesInsert } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type Category = Tables<'categories'>;
export type CategoryInput = Pick<TablesInsert<'categories'>, 'name' | 'kind' | 'group_id' | 'emoji' | 'color'>;

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('created_at');
  if (error) throw error;
  return data;
}

export async function getCategory(id: string): Promise<Category> {
  const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function saveCategory(input: CategoryInput, id?: string): Promise<void> {
  const { error } = id
    ? await supabase.from('categories').update(input).eq('id', id)
    : await supabase.from('categories').insert(input);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}
