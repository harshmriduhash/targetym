#!/bin/bash
# ============================================================================
# Script: Deploy Migrations to Supabase
# Description: Apply migrations to remote Supabase database
# ============================================================================

set -e  # Exit on error

echo "🚀 Targetym - Déploiement des Migrations Supabase"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI n'est pas installé${NC}"
    echo ""
    echo "Installation:"
    echo "  npm install -g supabase"
    echo "  # Ou"
    echo "  brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI installé"

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo -e "${YELLOW}⚠️  Projet Supabase non lié${NC}"
    echo ""
    read -p "Voulez-vous lier le projet maintenant? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Project Reference ID: " PROJECT_REF
        supabase link --project-ref "$PROJECT_REF"
    else
        echo -e "${RED}❌ Projet non lié. Exiting.${NC}"
        exit 1
    fi
fi

echo "✅ Projet lié"

# Check connection
echo ""
echo "📡 Vérification de la connexion..."
if supabase db ping; then
    echo "✅ Connexion établie"
else
    echo -e "${RED}❌ Impossible de se connecter à Supabase${NC}"
    exit 1
fi

# Show current migration status
echo ""
echo "📋 État actuel des migrations:"
supabase migration list

# Ask for confirmation
echo ""
echo -e "${YELLOW}⚠️  ATTENTION: Vous allez appliquer les migrations suivantes:${NC}"
echo "  - 20250109000000_create_complete_schema.sql"
echo "  - 20250109000001_rls_policies_complete.sql"
echo "  - 20250109000002_views_and_functions.sql"
echo ""
read -p "Voulez-vous continuer? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Opération annulée"
    exit 0
fi

# Create backup first
echo ""
echo "💾 Création d'un backup..."
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
if supabase db dump -f "$BACKUP_FILE"; then
    echo "✅ Backup créé: $BACKUP_FILE"
else
    echo -e "${YELLOW}⚠️  Impossible de créer le backup (continuer quand même?)${NC}"
    read -p "Continuer sans backup? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Dry run first
echo ""
echo "🔍 Dry run des migrations..."
if supabase db push --dry-run; then
    echo "✅ Dry run réussi"
else
    echo -e "${RED}❌ Dry run échoué${NC}"
    exit 1
fi

# Apply migrations
echo ""
echo "🚀 Application des migrations..."
if supabase db push; then
    echo -e "${GREEN}✅ Migrations appliquées avec succès!${NC}"
else
    echo -e "${RED}❌ Erreur lors de l'application des migrations${NC}"
    echo ""
    echo "Pour restaurer depuis le backup:"
    echo "  psql -h <db-host> -U postgres -d postgres -f $BACKUP_FILE"
    exit 1
fi

# Verify migrations
echo ""
echo "✅ Vérification des migrations:"
supabase migration list

# Generate TypeScript types
echo ""
echo "📝 Génération des types TypeScript..."
if npm run supabase:types; then
    echo "✅ Types générés"
else
    echo -e "${YELLOW}⚠️  Erreur lors de la génération des types${NC}"
fi

# Show table count
echo ""
echo "📊 Statistiques de la base de données:"
supabase db remote exec "
SELECT
  schemaname,
  COUNT(*) as table_count
FROM pg_tables
WHERE schemaname = 'public'
GROUP BY schemaname;
"

echo ""
echo -e "${GREEN}✨ Déploiement terminé avec succès!${NC}"
echo ""
echo "Prochaines étapes:"
echo "  1. Vérifier les tables dans Supabase Studio"
echo "  2. Tester les RLS policies"
echo "  3. Configurer Realtime sur les tables critiques"
echo "  4. Mettre à jour les services et actions"
