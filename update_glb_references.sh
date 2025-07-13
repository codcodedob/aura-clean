#!/bin/bash

# Recursively find all .tsx and .ts files in your project
# and replace occurrences of filenames with spaces to filenames with underscores.

# Example: "Stack of Bills.glb" -> "Stack_of_Bills.glb"

# This script assumes you have already renamed your files (with the other script)
# and now want to update all code references.

find . -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 \
  | xargs -0 sed -i '' -E 's/Stack[ _]%20?of[ _]%20?Bills\.glb/Stack_of_Bills.glb/g'

