import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import EnteractivePyramid, { EnteractiveItem } from "@/components/EnteractivePyramid";

export default function Space() {
  const [enteractiveData, setEnteractiveData] = useState<EnteractiveItem[]>([]);

  useEffect(() => {
    async function fetchEnteractive() {
      const { data, error } = await supabase
        .from("enteractive")
        .select("id, name, project_scope, link");

      if (error) {
        console.error("Error fetching enteractive data:", error);
        setEnteractiveData([]);
        return;
      }

      if (data) {
        // Filter out any null or undefined project_scope or link
        const filteredData = data.filter(
          (item): item is EnteractiveItem =>
            item.project_scope !== null &&
            item.project_scope !== undefined &&
            item.link !== null &&
            item.link !== undefined
        );
        setEnteractiveData(filteredData);
      }
    }

    fetchEnteractive();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Your Enteractive Pyramid</h1>
      {enteractiveData.length > 0 ? (
        <EnteractivePyramid data={enteractiveData} width={600} height={400} />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
}
