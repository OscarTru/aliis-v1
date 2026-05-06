#!/bin/bash
set -e

SUPABASE_URL="https://cdnecuufkdykybisqybm.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbmVjdXVma2R5a3liaXNxeWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjAzMzgsImV4cCI6MjA5MjYzNjMzOH0.0NgeTSZKThgoRFEfSsn_5_cEs2QymC2_hqdzOlnIg2A"

# Exclude build/ from iCloud sync to prevent xattr codesign failures
mkdir -p build
xattr -w com.apple.fileprovider.ignore#P 1 build/ 2>/dev/null || true

flutter run \
  --dart-define=SUPABASE_URL="$SUPABASE_URL" \
  --dart-define=SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  "$@"
