import { supabase } from './supabase';

export async function getSiteLive(): Promise<boolean> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.rpc('get_site_live');
  if (error) throw error;
  if (typeof data !== 'boolean') throw new Error('Site status is unavailable.');
  return data;
}

export async function setSiteLive(siteLive: boolean): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.rpc('set_site_live', { site_live: siteLive });
  if (error) throw error;
}
