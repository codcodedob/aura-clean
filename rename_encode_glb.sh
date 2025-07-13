#!/bin/bash

# Script to rename all .glb files by replacing spaces with underscores

find ./public/models -type f -name "*.glb" | while read -r file; do
  # Get directory and filename
  dir="$(dirname "$file")"
  base="$(basename "$file")"

  # Replace spaces with underscores
  newbase="${base// /_}"

  # Only rename if different
  if [ "$base" != "$newbase" ]; then
    mv "$file" "$dir/$newbase"
    echo "Renamed: '$base' -> '$newbase'"
  fi
done
