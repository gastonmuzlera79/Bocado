/** Sin Supabase configurado, la web funciona en modo demo con datos/demo.json. */
export const modoDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const sitioUrl = process.env.NEXT_PUBLIC_SITIO_URL ?? "http://localhost:3000";
