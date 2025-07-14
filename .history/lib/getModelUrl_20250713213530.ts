export function getModelUrl(name: string, basePath = "/models/") {
    let cleanName = name.trim();
  
    // If it already ends with .glb, remove it so we re-append consistently
    if (cleanName.toLowerCase().endsWith(".glb")) {
      cleanName = cleanName.slice(0, -4);
    }
  
    // Replace spaces with underscores to match your renamed files
    cleanName = cleanName.replace(/\s+/g, "_");
  
    // Always return consistent URL (without encodeURIComponent)
    return `${basePath}${cleanName}.glb`;
  }
  