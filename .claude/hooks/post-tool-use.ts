#!/usr/bin/env bun
/**
 * Claude Code PostToolUse Hook
 *
 * This hook executes after every tool call in Claude Code sessions.
 * It logs tool usage, validates outputs, and can perform custom actions.
 *
 * @author Claude Code
 * @version 1.0.0
 * @runtime Bun
 */

import { stdin } from "process";

// ============================================================================
// Types
// ============================================================================

interface HookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: "PostToolUse";
  tool_name: string;
  tool_input: Record<string, any>;
  tool_output?: string;
  error?: string;
}

interface HookOutput {
  continue: boolean;
  stopReason?: string;
  suppressOutput?: boolean;
  systemMessage?: string;
  hookSpecificOutput?: {
    hookEventName: string;
    additionalContext?: string;
  };
}

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  // Enable detailed logging
  verbose: true,

  // Log file path (relative to project root)
  logFile: ".claude/logs/tool-usage.log",

  // Tools to track (empty = all tools)
  trackedTools: [] as string[],

  // Tools to ignore
  ignoredTools: ["TodoWrite", "BashOutput"] as string[],

  // Enable notifications for specific tools
  notifyOnTools: ["Write", "Edit", "Bash"] as string[],

  // Enable performance tracking
  trackPerformance: true,
};

// ============================================================================
// Utilities
// ============================================================================

/**
 * Read JSON input from stdin
 */
async function readStdin(): Promise<HookInput> {
  const chunks: Buffer[] = [];

  for await (const chunk of stdin) {
    chunks.push(chunk);
  }

  const input = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(input);
}

/**
 * Write structured output to stdout
 */
function writeOutput(output: HookOutput): void {
  console.log(JSON.stringify(output, null, 2));
}

/**
 * Log message to file and/or console
 */
async function log(message: string, level: "info" | "warn" | "error" = "info"): Promise<void> {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

  if (CONFIG.verbose) {
    console.error(logEntry.trim()); // stderr doesn't block the hook
  }

  // Append to log file
  try {
    const logPath = `${process.env.CLAUDE_PROJECT_DIR || process.cwd()}/${CONFIG.logFile}`;
    await Bun.write(logPath, logEntry, { createPath: true });
  } catch (err) {
    // Silently fail if logging fails
  }
}

/**
 * Check if tool should be tracked
 */
function shouldTrackTool(toolName: string): boolean {
  // Ignore specific tools
  if (CONFIG.ignoredTools.includes(toolName)) {
    return false;
  }

  // If trackedTools is empty, track all (except ignored)
  if (CONFIG.trackedTools.length === 0) {
    return true;
  }

  // Only track specified tools
  return CONFIG.trackedTools.includes(toolName);
}

/**
 * Format tool input for logging
 */
function formatToolInput(input: Record<string, any>): string {
  const keys = Object.keys(input);

  if (keys.length === 0) return "{}";

  // Show only relevant fields, truncate long values
  const formatted = keys
    .slice(0, 3) // First 3 fields
    .map(key => {
      const value = input[key];
      if (typeof value === "string" && value.length > 50) {
        return `${key}: "${value.substring(0, 50)}..."`;
      }
      return `${key}: ${JSON.stringify(value)}`;
    })
    .join(", ");

  return `{ ${formatted}${keys.length > 3 ? ", ..." : ""} }`;
}

// ============================================================================
// Hook Actions
// ============================================================================

/**
 * Track tool usage statistics
 */
async function trackToolUsage(input: HookInput): Promise<void> {
  const statsFile = `${process.env.CLAUDE_PROJECT_DIR || process.cwd()}/.claude/stats/tool-usage.json`;

  try {
    let stats: Record<string, { count: number; lastUsed: string }> = {};

    // Read existing stats
    const file = Bun.file(statsFile);
    if (await file.exists()) {
      stats = await file.json();
    }

    // Update stats
    if (!stats[input.tool_name]) {
      stats[input.tool_name] = { count: 0, lastUsed: "" };
    }

    stats[input.tool_name].count++;
    stats[input.tool_name].lastUsed = new Date().toISOString();

    // Write updated stats
    await Bun.write(statsFile, JSON.stringify(stats, null, 2), { createPath: true });
  } catch (err) {
    await log(`Failed to track tool usage: ${err}`, "error");
  }
}

/**
 * Validate tool outputs for specific tools
 */
async function validateOutput(input: HookInput): Promise<{ valid: boolean; message?: string }> {
  const { tool_name, tool_output, error } = input;

  // If tool errored, it's invalid
  if (error) {
    return {
      valid: false,
      message: `Tool ${tool_name} failed: ${error}`,
    };
  }

  // Custom validations per tool
  switch (tool_name) {
    case "Write":
    case "Edit":
      // Check if file was actually written
      if (tool_output?.includes("successfully")) {
        return { valid: true };
      }
      break;

    case "Bash":
      // Check for common error patterns
      if (tool_output?.includes("error:") || tool_output?.includes("Error:")) {
        return {
          valid: false,
          message: "Bash command produced errors",
        };
      }
      break;

    case "TypeCheck":
      // Ensure no type errors
      if (tool_output?.includes("error TS")) {
        return {
          valid: false,
          message: "TypeScript errors detected",
        };
      }
      break;
  }

  return { valid: true };
}

/**
 * Send notifications for important tools
 */
async function notifyIfNeeded(input: HookInput): Promise<void> {
  if (!CONFIG.notifyOnTools.includes(input.tool_name)) {
    return;
  }

  const notification = `🔧 Tool used: ${input.tool_name}`;
  await log(notification, "info");

  // Could integrate with system notifications, Slack, Discord, etc.
  // Example: await notifySlack(notification);
}

// ============================================================================
// Main Hook Logic
// ============================================================================

async function main(): Promise<void> {
  try {
    // Read hook input
    const input = await readStdin();

    // Log the tool usage
    if (shouldTrackTool(input.tool_name)) {
      const formattedInput = formatToolInput(input.tool_input);
      await log(`Tool: ${input.tool_name} | Input: ${formattedInput}`);
    }

    // Track statistics
    if (CONFIG.trackPerformance) {
      await trackToolUsage(input);
    }

    // Validate output
    const validation = await validateOutput(input);
    if (!validation.valid) {
      await log(`Validation failed: ${validation.message}`, "warn");
    }

    // Send notifications if configured
    await notifyIfNeeded(input);

    // Prepare hook output
    const output: HookOutput = {
      continue: true, // Always continue (non-blocking)
      suppressOutput: false, // Show tool output
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: validation.valid
          ? `✅ ${input.tool_name} completed successfully`
          : `⚠️ ${input.tool_name} completed with warnings`,
      },
    };

    // Write output
    writeOutput(output);

    // Exit successfully
    process.exit(0);
  } catch (err) {
    await log(`Hook error: ${err}`, "error");

    // Exit with error (non-blocking)
    const errorOutput: HookOutput = {
      continue: true,
      suppressOutput: false,
      systemMessage: `Hook processing failed: ${err}`,
    };

    writeOutput(errorOutput);
    process.exit(0); // Exit 0 to not block Claude
  }
}

// ============================================================================
// Entry Point
// ============================================================================

main();
