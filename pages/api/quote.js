import * as turf from "@turf/turf";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const { propertyId, services = [] } = req.body;
  const { data } = await supabase.from("properties").select("*").eq("id", propertyId).single();
  if (!data) return res.status(404).json({ error: "Property not found" });

  // Serviceable area
  const lotPoly = turf.polygon([data.lot_polygon.map(pt => [pt.lng, pt.lat])]);
  let mowable = lotPoly;
  (data.buildings || []).forEach(b => {
    if (b.length) {
      const bPoly = turf.polygon([b.map(pt => [pt.lng, pt.lat])]);
      mowable = turf.difference(mowable, bPoly) || mowable;
    }
  });
  const area = turf.area(mowable) * 10.7639; // sq ft

  // Simple price logic: $0.005 per sq ft, $25/service, $35 min
  const base = 35, perSqFt = 0.005, perService = 25;
  const price = Math.max(base, Math.round(base + area * perSqFt + services.length * perService));

  res.json({ area, price });
}
