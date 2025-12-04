# AUDIT RLS TARGETYM - 2025-10-09

## Tables Identifiées: 15 tables
1. organizations - Système
2. profiles - Système  
3. goals - OKR Module
4. key_results - OKR Module
5. goal_collaborators - OKR Module
6. job_postings - Recruitment
7. candidates - Recruitment
8. interviews - Recruitment
9. candidate_notes - Recruitment
10. performance_reviews - Performance
11. performance_criteria - Performance
12. performance_ratings - Performance
13. performance_goals - Performance
14. peer_feedback - Performance
15. career_development - Career

## État Actuel
- RLS: NON ACTIF sur 15/15 tables
- Policies: AUCUNE
- Risque: CRITIQUE - Isolation multi-tenant absente

## Migration Créée
Fichier: supabase/migrations/20251009135324_enable_rls_all_tables.sql

### Contenu
- 5 Helper functions pour RLS
- 15 ALTER TABLE ENABLE RLS
- 80+ Policies (SELECT, INSERT, UPDATE, DELETE)
- Isolation par organization_id
- RBAC: admin, hr, manager, employee

## Application
```bash
# Dev/Test
supabase db reset
supabase migration up

# Production
supabase db push
```

## Tests Requis
1. Isolation org (user A != org B data)
2. Role access (employee cannot create job_posting)
3. Owner access (user can update own goal)
4. Manager visibility (manager sees team goals)

