import * as turf from "@turf/turf";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const { id } = req.query;
  const { data } = await supabase.from("properties").select("*").eq("id", id).single();
  if (!data) return res.status(404).json({ error: "Property not found" });

  // Compute lot and building area
  const lotPoly = turf.polygon([data.lot_polygon.map(pt => [pt.lng, pt.lat])]);
  const lotArea = turf.area(lotPoly) * 10.7639; // sq ft
  let mowable = lotPoly;
  let buildingsArea = 0;
  (data.buildings || []).forEach(b => {
    if (b.length) {
      const bPoly = turf.polygon([b.map(pt => [pt.lng, pt.lat])]);
      buildingsArea += turf.area(bPoly) * 10.7639;
      mowable = turf.difference(mowable, bPoly) || mowable;
    }
  });
  const mowableArea = turf.area(mowable) * 10.7639;

  res.json({
    lotArea,
    buildingsArea,
    mowableArea
  });
}
