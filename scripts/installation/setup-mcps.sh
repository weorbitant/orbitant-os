#!/usr/bin/env bash
# setup-mcps.sh — MCP server configuration with guided auth flows
# Sourced by install.sh. Expects color variables (RED, GREEN, YELLOW, BLUE, BOLD, NC) from caller.

# Check if an MCP server is already configured in ~/.claude/.mcp.json
# Arguments: $1 = server name
# Returns: 0 if configured, 1 otherwise
is_mcp_configured() {
  local name="$1"
  local mcp_config="$HOME/.claude/.mcp.json"

  if [[ ! -f "$mcp_config" ]]; then
    return 1
  fi

  if jq -e ".mcpServers.\"${name}\"" "$mcp_config" > /dev/null 2>&1; then
    return 0
  fi

  return 1
}

# Configure a single MCP server with guided auth flow
# Arguments: $1 = name, $2 = description, $3.. = command args
setup_mcp() {
  local name="$1"
  local description="$2"
  shift 2
  local command_args=("$@")

  # Check if already configured
  if is_mcp_configured "$name"; then
    printf "  ${YELLOW}%s${NC} Already configured: %s\n" "~" "$description"
    return 0
  fi

  # Section header
  printf "\n  ${BLUE}${BOLD}%s${NC} Setting up %s...\n" ">" "$description"

  # Run claude mcp add
  if claude mcp add "$name" -s user -- "${command_args[@]}" > /dev/null 2>&1; then
    printf "  ${GREEN}%s${NC} %s registered successfully\n" "+" "$description"
  else
    printf "  ${RED}%s${NC} Failed to register %s\n" "x" "$description"
    printf "    Retry manually: ${BOLD}claude mcp add \"%s\" -s user -- %s${NC}\n" "$name" "${command_args[*]}"
  fi

  # Auth instructions
  printf "\n  ${BOLD}Next steps:${NC}\n"
  printf "    1. Start a new Claude Code session\n"
  printf "    2. Run: /mcp\n"
  printf "    3. Select \"%s\" and complete the OAuth flow\n\n" "$name"

  # Wait for user confirmation
  local response
  read -r -p "  Press Enter when done (or 's' to skip)... " response
  if [[ "$response" == "s" ]]; then
    printf "  ${YELLOW}Skipped${NC} %s auth — remember to complete it later\n" "$description"
  fi
}

# Set up all MCP servers required by a given plugin
# Arguments: $1 = plugin name
setup_mcps_for_plugin() {
  local plugin_name="$1"

  case "$plugin_name" in
    orbitant-chief-of-staff)
      setup_mcp "gmail" "Gmail" npx @anthropic/gmail
      setup_mcp "calendar" "Google Calendar" npx @anthropic/google-calendar
      setup_mcp "google-drive" "Google Drive" npx @anthropic/google-drive
      setup_mcp "slack" "Slack" npx @anthropic/slack
      setup_mcp "asana" "Asana" npx @anthropic/asana
      ;;
    orbitant-marketing)
      printf "  ${GREEN}%s${NC} No MCP servers required for %s\n" "+" "$plugin_name"
      ;;
    *)
      printf "  ${YELLOW}%s${NC} Unknown plugin: %s — skipping MCP setup\n" "!" "$plugin_name"
      ;;
  esac
}
