#!/bin/bash

# Description:
# This script checks your /public/models folder for any missing .glb assets
# referenced by your app that are returning 404 errors.

MODEL_DIR="./public/models"
MISSING_MODELS=(
  "Stack of Bills.glb"
  "XTime.glb"
  "Jacket.glb"
  "Shirt.glb"
  "Dollar Bill.glb"
)

echo "🔍 Verifying existence of referenced .glb models in $MODEL_DIR"
echo

for MODEL in "${MISSING_MODELS[@]}"; do
  FILE_PATH="$MODEL_DIR/$MODEL"
  if [ -f "$FILE_PATH" ]; then
    echo "✅ Found: $MODEL"
  else
    echo "❌ Missing: $MODEL"
  fi
done

echo
if [ "$1" == "encode" ]; then
  echo "📦 Encoding model filenames for browser compatibility..."
  for MODEL in "${MISSING_MODELS[@]}"; do
    RAW_PATH="$MODEL_DIR/$MODEL"
    if [ -f "$RAW_PATH" ]; then
      ENCODED_NAME=$(node -p "encodeURIComponent('$MODEL')")
      if [ "$MODEL" != "$ENCODED_NAME" ]; then
        echo "🔁 Renaming '$MODEL' -> '$ENCODED_NAME'"
        mv "$RAW_PATH" "$MODEL_DIR/$ENCODED_NAME"
      fi
    fi
  done
fi
