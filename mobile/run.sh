#!/bin/bash
set -e

SUPABASE_URL="https://cdnecuufkdykybisqybm.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbmVjdXVma2R5a3liaXNxeWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjAzMzgsImV4cCI6MjA5MjYzNjMzOH0.0NgeTSZKThgoRFEfSsn_5_cEs2QymC2_hqdzOlnIg2A"

flutter run \
  --dart-define=SUPABASE_URL="$SUPABASE_URL" \
  --dart-define=SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  "$@"
