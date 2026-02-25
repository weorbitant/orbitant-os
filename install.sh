#!/usr/bin/env bash
set -e

# ============================================
# orbitant-os — MCP Setup Installer
# ============================================

# Resolve script directory for reliable sourcing
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# --------------------------------------------
# Color constants (shared with sourced scripts)
# --------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# --------------------------------------------
# Source sub-scripts
# --------------------------------------------
source "$SCRIPT_DIR/scripts/installation/check-prerequisites.sh"
source "$SCRIPT_DIR/scripts/installation/setup-mcps.sh"
source "$SCRIPT_DIR/scripts/installation/verify-installation.sh"

# --------------------------------------------
# Welcome banner
# --------------------------------------------
printf "\n${BOLD}============================================${NC}\n"
printf "${BOLD}   orbitant-os — MCP Setup${NC}\n"
printf "${BOLD}============================================${NC}\n"
printf "\n"
printf "  This script configures MCP servers needed\n"
printf "  by your selected orbitant-os plugins.\n"
printf "\n"

# --------------------------------------------
# Parse --team flag
# --------------------------------------------
TEAM_MODE=false
if [[ "${1:-}" == "--team" ]]; then
  TEAM_MODE=true
fi

# --------------------------------------------
# Prerequisites check
# --------------------------------------------
printf "${BOLD}Checking prerequisites...${NC}\n\n"

if ! check_prerequisites; then
  exit 1
fi

printf "\n"

# --------------------------------------------
# Plugin selection
# --------------------------------------------
AVAILABLE_PLUGINS=(
  "orbitant-chief-of-staff"
  "orbitant-marketing"
)

SELECTED_PLUGINS=()

if [[ "$TEAM_MODE" == true ]]; then
  printf "${BLUE}Team mode:${NC} setting up all plugins\n\n"
  SELECTED_PLUGINS=("${AVAILABLE_PLUGINS[@]}")
else
  printf "${BOLD}Available plugins:${NC}\n\n"
  printf "  1) orbitant-chief-of-staff\n"
  printf "     AI chief of staff — requires: Gmail, Calendar, Drive, Slack, Asana\n\n"
  printf "  2) orbitant-marketing\n"
  printf "     Marketing content skills — no MCP setup needed\n\n"

  read -r -p "Enter plugin numbers (e.g., 1 2) or 'a' for all: " selection

  if [[ "$selection" == "a" ]]; then
    SELECTED_PLUGINS=("${AVAILABLE_PLUGINS[@]}")
  else
    for num in $selection; do
      case "$num" in
        1) SELECTED_PLUGINS+=("orbitant-chief-of-staff") ;;
        2) SELECTED_PLUGINS+=("orbitant-marketing") ;;
        *) printf "${YELLOW}Warning:${NC} ignoring invalid selection '%s'\n" "$num" ;;
      esac
    done
  fi

  if [[ ${#SELECTED_PLUGINS[@]} -eq 0 ]]; then
    printf "\n${RED}No plugins selected. Exiting.${NC}\n"
    exit 1
  fi

  printf "\n"
fi

# --------------------------------------------
# MCP setup
# --------------------------------------------
printf "${BOLD}Configuring MCP servers...${NC}\n"

for plugin in "${SELECTED_PLUGINS[@]}"; do
  printf "\n${BLUE}${BOLD}%s${NC}\n" "$plugin"
  setup_mcps_for_plugin "$plugin"
done

# --------------------------------------------
# Summary
# --------------------------------------------
print_summary "${SELECTED_PLUGINS[@]}"
