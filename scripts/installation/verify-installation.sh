#!/usr/bin/env bash
# verify-installation.sh — Post-install verification and summary
# Sourced by install.sh. Expects color variables (RED, GREEN, YELLOW, BLUE, BOLD, NC) from caller.
# Expects is_mcp_configured() from setup-mcps.sh to already be available.

# Verify a single MCP server is configured
# Arguments: $1 = server name, $2 = description
# Returns: 0 if configured, 1 if not
verify_mcp() {
  local name="$1"
  local description="$2"

  if is_mcp_configured "$name"; then
    printf "  ${GREEN}✓${NC} %s (auth needed in Claude Code)\n" "$description"
    return 0
  else
    printf "  ${RED}✗${NC} %s (not configured)\n" "$description"
    return 1
  fi
}

# Print the Claude Code commands needed to install plugins
# Arguments: $@ = selected plugin names
print_plugin_install_commands() {
  local selected_plugins=("$@")

  printf "\n  Run these commands inside Claude Code:\n\n"
  printf "    ${BOLD}/plugin marketplace add weorbitant/orbitant-os${NC}\n"

  for plugin in "${selected_plugins[@]}"; do
    printf "    ${BOLD}/plugin install %s${NC}\n" "$plugin"
  done
}

# Print the full installation summary
# Arguments: $@ = selected plugin names
print_summary() {
  local selected_plugins=("$@")

  printf "\n${BOLD}============================================${NC}\n"
  printf "${BOLD}   Installation Summary${NC}\n"
  printf "${BOLD}============================================${NC}\n\n"

  # MCP verification per plugin
  for plugin in "${selected_plugins[@]}"; do
    printf "  ${BLUE}${BOLD}%s${NC}\n" "$plugin"

    case "$plugin" in
      orbitant-chief-of-staff)
        verify_mcp "gmail" "Gmail"
        verify_mcp "calendar" "Google Calendar"
        verify_mcp "google-drive" "Google Drive"
        verify_mcp "slack" "Slack"
        verify_mcp "asana" "Asana"
        ;;
      orbitant-marketing)
        printf "  ${GREEN}✓${NC} No MCP servers needed\n"
        ;;
    esac

    printf "\n"
  done

  # Plugin install commands
  print_plugin_install_commands "${selected_plugins[@]}"

  # Next steps
  printf "\n  ${BOLD}Next steps:${NC}\n\n"
  printf "    1. Open Claude Code\n"
  printf "    2. Run the plugin install commands shown above\n"
  printf "    3. Run: ${BOLD}/mcp${NC} — authenticate each server\n"

  local step=4
  for plugin in "${selected_plugins[@]}"; do
    if [[ "$plugin" == "orbitant-chief-of-staff" ]]; then
      printf "    %d. Try: ${BOLD}/orbitant-chief-of-staff:preflight${NC}\n" "$step"
      step=$((step + 1))
      break
    fi
  done

  printf "\n"
}
