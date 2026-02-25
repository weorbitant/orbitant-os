#!/usr/bin/env bash
# check-prerequisites.sh — Sourced by install.sh
# Expects color variables (RED, GREEN, NC) from caller.

check_prerequisites() {
  local missing=0

  # claude CLI
  if command -v claude &>/dev/null; then
    local claude_version
    claude_version=$(claude --version 2>/dev/null || echo "unknown")
    printf "  ${GREEN}✓${NC} claude CLI found (${claude_version})\n"
  else
    printf "  ${RED}✗${NC} claude CLI not found\n"
    printf "    Install: ${GREEN}npm install -g @anthropic-ai/claude-code${NC}\n"
    missing=1
  fi

  # git
  if command -v git &>/dev/null; then
    printf "  ${GREEN}✓${NC} git found\n"
  else
    printf "  ${RED}✗${NC} git not found\n"
    printf "    Install: ${GREEN}https://git-scm.com/downloads${NC}\n"
    missing=1
  fi

  # jq
  if command -v jq &>/dev/null; then
    printf "  ${GREEN}✓${NC} jq found\n"
  else
    printf "  ${RED}✗${NC} jq not found\n"
    printf "    Install: ${GREEN}brew install jq${NC} (macOS) or ${GREEN}apt-get install jq${NC} (Linux)\n"
    missing=1
  fi

  # npx
  if command -v npx &>/dev/null; then
    printf "  ${GREEN}✓${NC} npx found\n"
  else
    printf "  ${RED}✗${NC} npx not found\n"
    printf "    Install Node.js from ${GREEN}https://nodejs.org/${NC}\n"
    missing=1
  fi

  if [[ "$missing" -eq 1 ]]; then
    printf "\n${RED}Error: missing required tools. Install them and try again.${NC}\n"
    return 1
  fi

  return 0
}
