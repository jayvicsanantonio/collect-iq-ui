#!/bin/bash

# Clean up any existing .amplify-hosting directory
rm -rf ./.amplify-hosting

# Create the directory structure
mkdir -p ./.amplify-hosting/compute/default
mkdir -p ./.amplify-hosting/static

# Copy the standalone server files
cp -r ./.next/standalone/. ./.amplify-hosting/compute/default/

# Create .next directory if it doesn't exist
mkdir -p ./.amplify-hosting/compute/default/.next

# Copy static assets
cp -r ./.next/static ./.amplify-hosting/compute/default/.next/

# Copy public directory if it exists
if [ -d "./public" ]; then
  cp -r ./public ./.amplify-hosting/static/
fi

# Create deploy-manifest.json
cat > ./.amplify-hosting/deploy-manifest.json << 'EOF'
{
  "version": 1,
  "framework": { "name": "nextjs", "version": "14.2.33" },
  "imageSettings": {
    "sizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    "domains": [],
    "remotePatterns": [],
    "formats": ["image/webp"],
    "minimumCacheTTL": 60,
    "dangerouslyAllowSVG": false
  },
  "routes": [
    {
      "path": "/_amplify/image",
      "target": {
        "kind": "ImageOptimization",
        "cacheControl": "public, max-age=3600, immutable"
      }
    },
    {
      "path": "/_next/static/*",
      "target": {
        "kind": "Static",
        "cacheControl": "public, max-age=31536000, immutable"
      }
    },
    {
      "path": "/_next/image*",
      "target": {
        "kind": "Compute",
        "src": "default"
      }
    },
    {
      "path": "/api/*",
      "target": {
        "kind": "Compute",
        "src": "default"
      }
    },
    {
      "path": "/*",
      "target": {
        "kind": "Compute",
        "src": "default"
      }
    }
  ],
  "computeResources": [
    {
      "name": "default",
      "runtime": "nodejs20.x",
      "entrypoint": "server.js"
    }
  ]
}
EOF

echo "✓ Successfully prepared .amplify-hosting directory"
