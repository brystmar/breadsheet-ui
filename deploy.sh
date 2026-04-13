#!/bin/bash
# Deploy breadsheet-ui to Google Cloud Storage
# Prerequisites:
#   - gcloud CLI installed and authenticated (run `gcloud auth login` once)
#   - GCS bucket already configured for website hosting

set -e  # Exit immediately on any error

BUCKET="gs://www.breadsheet.com"

echo "Building..."
npm run build

echo "Uploading assets (cache forever)..."
gsutil -m -h "Cache-Control:public, max-age=31536000, immutable" \
    rsync -r dist/assets/ "$BUCKET/assets/"

echo "Uploading other files (no cache)..."
gsutil -m -h "Cache-Control:no-cache, no-store" \
    rsync -r -x "^assets/.*" dist/ "$BUCKET/"

echo "Done. Site is live at https://breadsheet.com"
