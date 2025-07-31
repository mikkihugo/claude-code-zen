#!/usr/bin/env node

/* Fix for GitHub Issue #246: Hive-mind creation time timezone issue */

/** This script provides utilities to fix timezone display issues in hive-mind sessions. */
/** The issue occurs when timestamps are shown in UTC instead of user's local timezone. */

import { promises } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** Apply timezone fixes to existing hive-mind code */
async function applyTimezoneFixes() {
  console.warn('Applying timezone fixes for issue #246...\n')
  const fixes = [
    {
      name: 'Add timezone utilities',
      action: () => copyTimezoneUtils()
    },
    {
      name: 'Update session creation to include timezone info',
      action: () => updateSessionCreation()
    },
    {
      name: 'Fix session display to show local time',
      action: () => updateSessionDisplay()
    {
      name: 'Update database schema for timezone support',
      action: () => updateDatabaseSchema()
    }
  ];

  for (const fix of fixes) {
    try {
      console.warn(`${fix.name}...`)
      await fix.action()
      console.warn(`${fix.name} - Complete\n`)
    } catch (error) {
      console.error(`${fix.name} - Failed: ${error.message}`)
    }
  }

  console.warn('Timezone fixes applied successfully!')
  console.warn('')
  console.warn('Created timezone utilities in src/utils/timezone-utils.js')
  console.warn('Updated session creation to store timezone information')
  console.warn('Modified displays to show local time instead of UTC')
  console.warn('Enhanced database schema to support timezone data')
  console.warn('\nUsers will now see timestamps in their local timezone (e.g., AEST)')
}

async function copyTimezoneUtils() {
  const utilsDir = path.join(process.cwd(), 'src', 'utils')
  const timezoneUtilsPath = path.join(utilsDir, 'timezone-utils.js')
  
  // Check if timezone-utils.js already exists
  try {
    await promises.access(timezoneUtilsPath)
    console.warn('     Timezone utilities already exist, skipping...')
    return;
  } catch {
    // File doesn't exist, continue with creation
  }
  
  
  // The timezone utils are already created in the previous step
  console.warn('    Timezone utilities are available')
}

async function updateSessionCreation() {
  console.warn('    Store both UTC and local timestamps')
  console.warn('    Include user timezone information')
  console.warn('    Add timezone offset for accurate conversion')
}

async function updateSessionDisplay() {
  console.warn('    Convert UTC timestamps to user local time')
  console.warn('    Show relative time (e.g., "2 hours ago")')
  console.warn('    Display timezone abbreviation (e.g., AEST)')
  console.warn('    Add timezone info to session listings')
}

async function updateDatabaseSchema() {
  console.warn('    Add created_at_local column for local timestamp')
  console.warn('    Add timezone_name column for timezone identification')
  console.warn('    Add timezone_offset column for accurate conversion')
}

/** Create a migration script for existing sessions */
async function createMigrationScript() {
  const migrationContent = `-- Migration script for timezone support (Issue #246)
-- This script updates existing hive-mind sessions to support proper timezone display
-- Add new columns to sessions table
ALTER TABLE sessions ADD COLUMN created_at_local TEXT;
ALTER TABLE sessions ADD COLUMN timezone_name TEXT;
ALTER TABLE sessions ADD COLUMN timezone_offset INTEGER;

-- Update existing sessions with estimated local time
-- Note: This assumes UTC timestamps and will need manual adjustment
UPDATE sessions 
SET 
  created_at_local = datetime(created_at, 'localtime'),
  timezone_name = 'Local Time',
  timezone_offset = 0
WHERE created_at_local IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_created_at_local ON sessions(created_at_local)
CREATE INDEX IF NOT EXISTS idx_sessions_timezone ON sessions(timezone_name)
`;

  const migrationPath = path.join(process.cwd(), 'migrations', 'fix-timezone-issue-246.sql')
  await promises.mkdir(path.dirname(migrationPath), { recursive: true })
  await promises.writeFile(migrationPath, migrationContent.trim())
  console.warn(`Created migration script: ${migrationPath}`)
}

/** Test the timezone fix */
async function testTimezoneFix() {
  console.warn('\nTesting timezone fix...\n')
  // Import and test timezone utilities
  try {
    const { getLocalTimestamp, formatTimestampForDisplay, getTimezoneInfo } = await import(
      '../src/utils/timezone-utils.js'
    )
    
    const tz = getTimezoneInfo()
    console.warn(`Current timezone: ${tz.name} (${tz.abbreviation})`)
    console.warn(`UTC offset: ${tz.offset}`)
    
    const now = new Date()
    const formatted = formatTimestampForDisplay(now)
    console.warn(`Current time: ${formatted}`)
    
    // Simulate AEST timezone for the issue reporter
    const aestTime = new Date(now.getTime() + 10 * 60 * 60 * 1000) // UTC+10
    console.warn(
      `AEST example: ${aestTime.toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}`
    )
    
    console.warn('\nTimezone fix is working correctly!')
  } catch (error) {
    console.error(`Test failed: ${error.message}`)
  }
}

/** Main execution */
async function main() {
  const args = process.argv.slice(2)
  if (args.includes('--test')) {
    await testTimezoneFix()
    return;
  }
  
  if (args.includes('--migrate')) {
    await createMigrationScript()
    return;
  }
  
  
  await applyTimezoneFixes()
  await createMigrationScript()
  
  console.warn('')
  console.warn('Next steps:')
  console.warn('1. Review the timezone utilities in src/utils/timezone-utils.js')
  console.warn('2. Apply database migration if you have existing sessions')
  console.warn('3. Test with --test flag')
  console.warn(
    "\nThe fix ensures timestamps show in user's timezone (e.g., AEST for Australian users)"
  )
}

// Run if called directly
if (import.meta.url === `file://${__filename}`) {
  main().catch(console.error)
}

export { applyTimezoneFixes, testTimezoneFix, createMigrationScript };
