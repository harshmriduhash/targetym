#!/usr/bin/env node

/**
 * OAuth Configuration Checker
 * Vérifie que votre configuration OAuth est correcte
 */

const https = require('https');

const SUPABASE_URL = 'https://juuekovwshynwgjkqkbu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1dWVrb3Z3c2h5bndnamtxa2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTk0MzUsImV4cCI6MjA3NDk3NTQzNX0.gV7xwZZoUqKbuUFbngH7s5ShCHx9bNeLUuqhzMH6tdo';

console.log('🔍 Vérification de la configuration OAuth...\n');

// Fonction pour faire une requête HTTP
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

async function checkOAuthProviders() {
  try {
    console.log('📡 Connexion à Supabase...');

    // Vérifier l'endpoint de santé
    const healthCheck = await makeRequest(`${SUPABASE_URL}/rest/v1/`);
    console.log('✅ Connexion Supabase établie\n');

    // Récupérer les providers disponibles
    console.log('🔐 Vérification des providers OAuth disponibles...\n');

    const settingsUrl = `${SUPABASE_URL}/auth/v1/settings`;
    const settings = await makeRequest(settingsUrl);

    if (settings.external) {
      console.log('📋 Providers OAuth configurés :\n');

      const providers = settings.external;
      let configuredCount = 0;

      // Google
      if (providers.google === true) {
        console.log('  ✅ Google OAuth : CONFIGURÉ');
        configuredCount++;
      } else {
        console.log('  ❌ Google OAuth : NON CONFIGURÉ');
        console.log('     → Suivez la PARTIE 1 du guide OAUTH_SETUP_GUIDE.md');
      }

      // GitHub
      if (providers.github === true) {
        console.log('  ✅ GitHub OAuth : CONFIGURÉ');
        configuredCount++;
      } else {
        console.log('  ❌ GitHub OAuth : NON CONFIGURÉ');
        console.log('     → Suivez la PARTIE 2 du guide OAUTH_SETUP_GUIDE.md');
      }

      // Microsoft
      if (providers.azure === true) {
        console.log('  ✅ Microsoft OAuth : CONFIGURÉ');
        configuredCount++;
      } else {
        console.log('  ⚪ Microsoft OAuth : NON CONFIGURÉ (optionnel)');
      }

      console.log(`\n📊 Total : ${configuredCount} provider(s) configuré(s)\n`);

      if (configuredCount === 0) {
        console.log('⚠️  AUCUN PROVIDER OAUTH CONFIGURÉ');
        console.log('    Suivez le guide dans docs/OAUTH_SETUP_GUIDE.md\n');
      } else if (configuredCount < 2) {
        console.log('⚠️  Configuration partielle');
        console.log('    Configurez au moins Google ET GitHub pour une meilleure UX\n');
      } else {
        console.log('✅ Configuration OAuth complète !\n');
      }

      // URLs de callback
      console.log('🔗 URLs de callback à utiliser :');
      console.log('   Production : https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback');
      console.log('   Local      : http://localhost:54321/auth/v1/callback\n');

      // URLs de redirection frontend
      console.log('🌐 URLs de redirection frontend :');
      console.log('   Production : https://targetym-production.onrender.com/auth/callback');
      console.log('   Local      : http://localhost:3001/auth/callback\n');

    } else {
      console.log('❌ Impossible de récupérer la configuration OAuth');
      console.log('   Vérifiez que Supabase est bien configuré\n');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification :', error.message);
    console.log('\n💡 Assurez-vous que :');
    console.log('   1. Supabase est accessible');
    console.log('   2. Votre clé ANON KEY est correcte');
    console.log('   3. Vous êtes connecté à Internet\n');
  }
}

// Afficher les étapes suivantes
function showNextSteps() {
  console.log('📝 ÉTAPES SUIVANTES :\n');
  console.log('1️⃣  Configurer Google OAuth (si non fait)');
  console.log('    → https://console.cloud.google.com/');
  console.log('    → Suivez la PARTIE 1 dans docs/OAUTH_SETUP_GUIDE.md\n');

  console.log('2️⃣  Configurer GitHub OAuth (si non fait)');
  console.log('    → https://github.com/settings/developers');
  console.log('    → Suivez la PARTIE 2 dans docs/OAUTH_SETUP_GUIDE.md\n');

  console.log('3️⃣  Tester l\'authentification');
  console.log('    → https://targetym-production.onrender.com/auth/signin\n');

  console.log('4️⃣  Créer votre organisation');
  console.log('    → Utilisez scripts/create-test-organization.sql\n');
}

// Exécution
console.log('════════════════════════════════════════════════════════');
console.log('   TARGETYM - OAuth Configuration Checker');
console.log('════════════════════════════════════════════════════════\n');

checkOAuthProviders().then(() => {
  console.log('════════════════════════════════════════════════════════\n');
  showNextSteps();
  console.log('════════════════════════════════════════════════════════\n');
});
