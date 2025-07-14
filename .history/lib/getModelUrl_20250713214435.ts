// lib/getModelUrl.ts

export function getModelUrl(name: string, basePath = "/models/") {
    let cleanName = name.trim();
  
    // Remove .glb if present so we re-append consistently
    if (cleanName.toLowerCase().endsWith(".glb")) {
      cleanName = cleanName.slice(0, -4);
    }
  
    // Replace spaces with underscores to match your files
    cleanName = cleanName.replace(/\s+/g, "_");
  
    return `${basePath}${cleanName}.glb`;
  }
  