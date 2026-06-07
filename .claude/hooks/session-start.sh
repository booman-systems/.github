#!/bin/bash
# Booman Systems — Audit Session Hook
# Runs at the start of every Claude Code session in this repo.
# Stamps the session with date context so Claude knows to run the daily audit.

set -euo pipefail

AUDIT_FILE="$CLAUDE_PROJECT_DIR/AUDIT.md"
TODAY=$(date -u +%Y-%m-%d)
LAST_RUN_FILE="$CLAUDE_PROJECT_DIR/.claude/.last_audit_date"

# Write today's date to the env file so Claude can reference it
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export AUDIT_DATE=$TODAY" >> "$CLAUDE_ENV_FILE"
fi

# Check if audit already ran today
if [ -f "$LAST_RUN_FILE" ]; then
  LAST_RUN=$(cat "$LAST_RUN_FILE")
else
  LAST_RUN="never"
fi

if [ "$LAST_RUN" = "$TODAY" ]; then
  echo "Audit already ran today ($TODAY). Session ready."
  exit 0
fi

# Mark that this session will run the audit
echo "$TODAY" > "$LAST_RUN_FILE"

# Print structured message — Claude Code surfaces this at session start
cat <<EOF
=== BOOMAN SYSTEMS AUDIT SESSION — $TODAY ===
Last audit: $LAST_RUN

AUDIT PROTOCOL ACTIVE. Per CLAUDE.md:
1. Pull live state from Supabase (security + performance advisors, auth logs)
2. Pull Vercel deployment states for all 13 projects
3. Diff against AUDIT.md — report only what changed
4. Auto-fix any new CRITICAL/HIGH issues via apply_migration
5. Update AUDIT.md with findings, then push to branch

Run the audit before responding to any other request.
EOF
