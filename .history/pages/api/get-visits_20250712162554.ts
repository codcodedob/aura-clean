import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { stringify } from "csv-stringify/sync";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const {
    page = "1",
    pageSize = "50",
    urlFilter = "",
    startDate,
    endDate,
    sortBy = "timestamp",
    sortOrder = "desc",
    exportCSV = "false",
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const pageSizeNum = parseInt(pageSize as string, 10);
  const from = (pageNum - 1) * pageSizeNum;
  const to = from + pageSizeNum - 1;

  // Validate sortOrder
  const orderAsc = sortOrder === "asc";

  try {
    let query = supabase.from("site_visits").select("*");

    // URL filter
    if (urlFilter) {
      query = query.ilike("url", `%${urlFilter}%`);
    }

    // Date range filter
    if (startDate && endDate) {
      // Supabase syntax for range filter
      query = query.gte("timestamp", startDate as string).lte("timestamp", endDate as string);
    } else if (startDate) {
      query = query.gte("timestamp", startDate as string);
    } else if (endDate) {
      query = query.lte("timestamp", endDate as string);
    }

    // Sorting
    query = query.order(sortBy as string, { ascending: orderAsc });

    // Export CSV (ignore pagination, fetch all matching records)
    if (exportCSV === "true") {
      const { data, error } = await query;

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: "No visits found for CSV export" });
      }

      // Prepare CSV columns and rows
      const csvData = data.map((visit) => ({
        id: visit.id,
        url: visit.url,
        timestamp: visit.timestamp,
        ip: visit.ip,
        user_agent: visit.user_agent,
        country: visit.country,
        referrer: visit.referrer,
        session_duration: visit.session_duration,
        scroll_depth: visit.scroll_depth,
        device_type: visit.device_type,
        screen_resolution: visit.screen_resolution,
        browser: visit.browser,
        os: visit.os,
        utm_source: visit.utm_source,
      }));

      const csv = stringify(csvData, {
        header: true,
        columns: [
          "id",
          "url",
          "timestamp",
          "ip",
          "user_agent",
          "country",
          "referrer",
          "session_duration",
          "scroll_depth",
          "device_type",
          "screen_resolution",
          "browser",
          "os",
          "utm_source",
        ],
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="site_visits_export.csv"`);
      return res.status(200).send(csv);
    }

    // Pagination for normal JSON response
    const { data, error } = await query.range(from, to);

    if (error) throw error;

    res.status(200).json({
      visits: data,
      page: pageNum,
      pageSize: pageSizeNum,
      total: data?.length ?? 0,
    });
  } catch (err: any) {
    console.error("Error fetching visits:", err);
    res.status(500).json({ error: err.message || "Failed to fetch visits" });
  }
}
