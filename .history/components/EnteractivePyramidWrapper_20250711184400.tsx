"use client";

import dynamic from "next/dynamic";

const DynamicPyramid = dynamic(() => import("./EnteractivePyramid"), {
  ssr: false, // ⬅️ disables SSR to prevent hydration mismatch
});

export default DynamicPyramid;
