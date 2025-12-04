#!/usr/bin/env node

/**
 * Interactive OAuth Setup Wizard
 * Guides the user through OAuth configuration step-by-step
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const https = require('https');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const SUPABASE_URL = 'https://juuekovwshynwgjkqkbu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1dWVrb3Z3c2h5bndnamtxa2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTk0MzUsImV4cCI6MjA3NDk3NTQzNX0.gV7xwZZoUqKbuUFbngH7s5ShCHx9bNeLUuqhzMH6tdo';

// Helper function to ask questions
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// HTTP request helper
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

// Check current OAuth configuration
async function checkCurrentConfig() {
  try {
    const settingsUrl = `${SUPABASE_URL}/auth/v1/settings`;
    const settings = await makeRequest(settingsUrl);

    if (!settings.external) {
      return { google: false, github: false, microsoft: false };
    }

    return {
      google: settings.external.google === true,
      github: settings.external.github === true,
      microsoft: settings.external.azure === true
    };
  } catch (error) {
    console.error('Error checking configuration:', error.message);
    return { google: false, github: false, microsoft: false };
  }
}

// Display welcome screen
function displayWelcome() {
  console.clear();
  console.log('\n════════════════════════════════════════════════════════');
  console.log('   🚀 TARGETYM - OAuth Setup Wizard');
  console.log('════════════════════════════════════════════════════════\n');
  console.log('This wizard will guide you through setting up OAuth authentication.');
  console.log('Estimated time: 15-20 minutes\n');
  console.log('What you need:');
  console.log('  ✓ Google account');
  console.log('  ✓ GitHub account');
  console.log('  ✓ Access to Supabase Dashboard');
  console.log('  ✓ 15-20 minutes of your time\n');
  console.log('════════════════════════════════════════════════════════\n');
}

// Display current status
async function displayStatus() {
  console.log('📊 Checking current configuration...\n');
  const config = await checkCurrentConfig();

  console.log('Current OAuth Providers Status:');
  console.log(`  ${config.google ? '✅' : '❌'} Google OAuth`);
  console.log(`  ${config.github ? '✅' : '❌'} GitHub OAuth`);
  console.log(`  ${config.microsoft ? '⚪' : '⚪'} Microsoft OAuth (optional)`);
  console.log('');

  return config;
}

// Google OAuth setup
async function setupGoogleOAuth(config) {
  console.clear();
  console.log('\n════════════════════════════════════════════════════════');
  console.log('   🔴 GOOGLE OAUTH SETUP (10 minutes)');
  console.log('════════════════════════════════════════════════════════\n');

  if (config.google) {
    console.log('✅ Google OAuth is already configured!\n');
    const reconfigure = await ask('Do you want to reconfigure it? (y/N): ');
    if (reconfigure.toLowerCase() !== 'y') {
      return;
    }
  }

  console.log('📖 Step-by-step guide:\n');
  console.log('1. Open Google Cloud Console:');
  console.log('   https://console.cloud.google.com/\n');

  await ask('Press ENTER when you have opened the link...');

  console.log('\n2. Create or select a project named "Targetym"\n');
  await ask('Press ENTER when your project is ready...');

  console.log('\n3. Configure OAuth consent screen:');
  console.log('   https://console.cloud.google.com/apis/credentials/consent\n');
  console.log('   - User Type: External');
  console.log('   - App name: Targetym');
  console.log('   - Support email: your-email@example.com');
  console.log('   - Authorized domains: onrender.com, supabase.co');
  console.log('   - Scopes: userinfo.email, userinfo.profile, openid\n');

  await ask('Press ENTER when OAuth consent screen is configured...');

  console.log('\n4. Create OAuth credentials:');
  console.log('   https://console.cloud.google.com/apis/credentials\n');
  console.log('   - Type: OAuth client ID → Web application');
  console.log('   - Name: Targetym Web Client');
  console.log('   - Authorized redirect URIs:');
  console.log('     → https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback');
  console.log('     → http://localhost:54321/auth/v1/callback\n');

  await ask('Press ENTER when credentials are created...');

  console.log('\n5. Copy your credentials:\n');
  const googleClientId = await ask('Enter your Google Client ID: ');
  const googleClientSecret = await ask('Enter your Google Client Secret: ');

  console.log('\n6. Add credentials to Supabase:');
  console.log('   https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/auth/providers\n');
  console.log('   - Find "Google" provider');
  console.log('   - Enable toggle');
  console.log('   - Paste Client ID and Secret');
  console.log('   - Click "Save"\n');

  await ask('Press ENTER when you have saved in Supabase...');

  return { googleClientId, googleClientSecret };
}

// GitHub OAuth setup
async function setupGitHubOAuth(config) {
  console.clear();
  console.log('\n════════════════════════════════════════════════════════');
  console.log('   🔵 GITHUB OAUTH SETUP (5 minutes)');
  console.log('════════════════════════════════════════════════════════\n');

  if (config.github) {
    console.log('✅ GitHub OAuth is already configured!\n');
    const reconfigure = await ask('Do you want to reconfigure it? (y/N): ');
    if (reconfigure.toLowerCase() !== 'y') {
      return;
    }
  }

  console.log('📖 Step-by-step guide:\n');
  console.log('1. Open GitHub Developer Settings:');
  console.log('   https://github.com/settings/developers\n');

  await ask('Press ENTER when you have opened the link...');

  console.log('\n2. Create a New OAuth App:');
  console.log('   - Application name: Targetym');
  console.log('   - Homepage URL: https://targetym-production.onrender.com');
  console.log('   - Authorization callback URL: https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback\n');

  await ask('Press ENTER when OAuth App is created...');

  console.log('\n3. Generate a Client Secret:\n');
  await ask('Press ENTER when you have generated the secret...');

  console.log('\n4. Copy your credentials:\n');
  const githubClientId = await ask('Enter your GitHub Client ID: ');
  const githubClientSecret = await ask('Enter your GitHub Client Secret: ');

  console.log('\n5. Add credentials to Supabase:');
  console.log('   https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/auth/providers\n');
  console.log('   - Find "GitHub" provider');
  console.log('   - Enable toggle');
  console.log('   - Paste Client ID and Secret');
  console.log('   - Click "Save"\n');

  await ask('Press ENTER when you have saved in Supabase...');

  return { githubClientId, githubClientSecret };
}

// Save credentials to .env file
function saveCredentials(googleCreds, githubCreds) {
  if (!googleCreds && !githubCreds) {
    return;
  }

  const envPath = path.join(process.cwd(), '.env.oauth.local');
  let content = '# OAuth Credentials - KEEP SECRET!\n';
  content += '# Auto-generated by setup-oauth-wizard.js\n\n';

  if (googleCreds) {
    content += '# Google OAuth\n';
    content += `GOOGLE_CLIENT_ID=${googleCreds.googleClientId}\n`;
    content += `GOOGLE_CLIENT_SECRET=${googleCreds.googleClientSecret}\n\n`;
  }

  if (githubCreds) {
    content += '# GitHub OAuth\n';
    content += `GITHUB_CLIENT_ID=${githubCreds.githubClientId}\n`;
    content += `GITHUB_CLIENT_SECRET=${githubCreds.githubClientSecret}\n\n`;
  }

  try {
    fs.writeFileSync(envPath, content);
    console.log(`\n✅ Credentials saved to: ${envPath}`);
    console.log('⚠️  Remember: This file contains secrets. Never commit it to git!\n');
  } catch (error) {
    console.error(`\n❌ Error saving credentials: ${error.message}\n`);
  }
}

// Display completion screen
async function displayCompletion() {
  console.clear();
  console.log('\n════════════════════════════════════════════════════════');
  console.log('   🎉 OAUTH SETUP COMPLETE!');
  console.log('════════════════════════════════════════════════════════\n');

  console.log('📊 Verifying configuration...\n');
  const finalConfig = await checkCurrentConfig();

  console.log('Configured Providers:');
  console.log(`  ${finalConfig.google ? '✅' : '❌'} Google OAuth`);
  console.log(`  ${finalConfig.github ? '✅' : '❌'} GitHub OAuth`);
  console.log(`  ${finalConfig.microsoft ? '✅' : '⚪'} Microsoft OAuth\n`);

  const configuredCount = [finalConfig.google, finalConfig.github, finalConfig.microsoft].filter(Boolean).length;

  if (configuredCount === 0) {
    console.log('⚠️  No providers configured yet.');
    console.log('   Please complete the setup in Supabase Dashboard.\n');
  } else if (configuredCount < 2) {
    console.log('⚠️  Partial configuration detected.');
    console.log('   Configure both Google and GitHub for best user experience.\n');
  } else {
    console.log('✅ OAuth authentication is fully configured!\n');
  }

  console.log('📝 NEXT STEPS:\n');
  console.log('1. Test authentication:');
  console.log('   → https://targetym-production.onrender.com/auth/signin\n');

  console.log('2. Create test organization:');
  console.log('   → Run: scripts/create-test-organization.sql\n');

  console.log('3. Add environment variables to Render:');
  console.log('   → Dashboard → Environment → Add Variables\n');

  console.log('4. Redeploy application:');
  console.log('   → Render Dashboard → Manual Deploy\n');

  console.log('📚 DOCUMENTATION:\n');
  console.log('  → docs/OAUTH_SETUP_GUIDE.md (complete reference)');
  console.log('  → docs/GOOGLE_OAUTH_STEP_BY_STEP.md');
  console.log('  → docs/GITHUB_OAUTH_STEP_BY_STEP.md');
  console.log('  → docs/OAUTH_QUICK_START.md\n');

  console.log('🆘 NEED HELP?\n');
  console.log('  → Check troubleshooting sections in the guides');
  console.log('  → Run: node scripts/check-oauth-config.js\n');

  console.log('════════════════════════════════════════════════════════\n');
}

// Main wizard flow
async function runWizard() {
  try {
    displayWelcome();

    const startSetup = await ask('Ready to start? (Y/n): ');
    if (startSetup.toLowerCase() === 'n') {
      console.log('\nSetup cancelled. Run the wizard again when ready.\n');
      rl.close();
      return;
    }

    // Check current status
    console.log('');
    const config = await displayStatus();

    // Choose what to configure
    console.log('What would you like to configure?\n');
    console.log('1. Google OAuth (10 min)');
    console.log('2. GitHub OAuth (5 min)');
    console.log('3. Both (15 min)');
    console.log('4. Exit\n');

    const choice = await ask('Enter your choice (1-4): ');

    let googleCreds = null;
    let githubCreds = null;

    switch (choice) {
      case '1':
        googleCreds = await setupGoogleOAuth(config);
        break;
      case '2':
        githubCreds = await setupGitHubOAuth(config);
        break;
      case '3':
        googleCreds = await setupGoogleOAuth(config);
        githubCreds = await setupGitHubOAuth(config);
        break;
      case '4':
        console.log('\nExiting wizard. Run again when ready.\n');
        rl.close();
        return;
      default:
        console.log('\nInvalid choice. Exiting.\n');
        rl.close();
        return;
    }

    // Save credentials if provided
    saveCredentials(googleCreds, githubCreds);

    // Display completion
    await displayCompletion();

    rl.close();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Try running the wizard again or check the documentation.\n');
    rl.close();
  }
}

// Run the wizard
runWizard();
