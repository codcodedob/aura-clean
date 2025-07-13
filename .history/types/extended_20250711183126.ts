import { Database } from "./supabase";

export type Active = Database["public"]["Tables"]["active"]["Row"];
export type Enteractive = Database["public"]["Tables"]["enteractive"]["Row"];
