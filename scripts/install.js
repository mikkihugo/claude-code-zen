#!/usr/bin/env node

import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import https from 'node:https';
import { spawn } from 'node:child_process';

console.log('Installing Claude-Flow...');

// Check if Deno is available
function checkDeno() {
  return new Promise((resolve) => {
    const deno = spawn('deno', ['--version'], { stdio: 'pipe' });
    deno.on('close', (code) => {
      resolve(code === 0);
    });
    deno.on('error', () => {
      resolve(false);
    });
  });
}

// Install Deno if not available
async function installDeno() {
  console.log('Deno not found. Attempting to install Deno...');
  
  const platform = os.platform();
  const arch = os.arch();
  
  if (platform === 'win32') {
    console.log('Please install Deno manually from https://deno.land/');
    return false; // Don't exit, just skip Deno features
  }
  
  return new Promise((resolve) => {
    const installScript = spawn('curl', ['-fsSL', 'https://deno.land/x/install/install.sh'], { 
      stdio: 'pipe',
      timeout: 10000 // 10 second timeout
    });
    const sh = spawn('sh', [], { stdio: ['pipe', 'inherit', 'inherit'] });
    
    installScript.stdout.pipe(sh.stdin);
    
    // Handle timeout and errors gracefully
    installScript.on('error', () => {
      console.log('Deno installation skipped due to network restrictions');
      resolve(false);
    });
    
    sh.on('close', (code) => {
      if (code === 0) {
        console.log('Deno installed successfully!');
        resolve(true);
      } else {
        console.log('Deno installation failed - continuing without Deno support');
        resolve(false);
      }
    });
    
    sh.on('error', () => {
      console.log('Deno installation skipped - continuing without Deno support');
      resolve(false);
    });
  });
}

// Main installation process
async function main() {
  try {
    const denoAvailable = await checkDeno();
    
    if (!denoAvailable) {
      const denoInstalled = await installDeno();
      if (!denoInstalled) {
        console.log('Continuing installation without Deno support');
      }
    }
    
    console.log('Claude-Flow installation completed!');
    console.log('You can now use: npx claude-flow or claude-flow (if installed globally)');
    
    if (!denoAvailable) {
      console.log('Note: Deno features are not available. Install Deno manually from https://deno.land/ for full functionality.');
    }
    
  } catch (error) {
    console.error('Installation completed with warnings:', error.message);
    console.log('Main functionality is available. For Deno support, install Deno manually from https://deno.land/');
  }
}

main();