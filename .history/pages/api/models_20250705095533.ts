// /pages/api/models.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req, res) {
  try {
    // Fetch all models from the Supabase 'models' bucket
    const { data, error } = await supabase.storage
      .from('models') // models bucket
      .list('', { limit: 10 });

    if (error) {
      throw error;
    }

    // Return model files list
    const models = data.map((file) => ({
      name: file.name,
      url: supabase.storage.from('models').getPublicUrl(file.name).publicURL,
    }));

    res.status(200).json({ models });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching models' });
  }
}
