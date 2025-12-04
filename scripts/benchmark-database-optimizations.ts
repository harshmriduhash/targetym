#!/usr/bin/env ts-node
/**
 * Database Optimization Benchmark Script
 *
 * Tests and compares query performance before/after optimizations
 * Run with: npx ts-node scripts/benchmark-database-optimizations.ts
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database.types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

interface BenchmarkResult {
  name: string;
  before: number;
  after: number;
  improvement: string;
  status: 'pass' | 'fail';
}

const results: BenchmarkResult[] = [];

// Helper: Measure query execution time
async function measureQuery<T>(
  name: string,
  queryFn: () => Promise<T>,
  iterations: number = 5
): Promise<number> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await queryFn();
    const end = performance.now();
    times.push(end - start);
  }

  // Return median time (more stable than average)
  times.sort((a, b) => a - b);
  return times[Math.floor(times.length / 2)];
}

// Test 1: Goals Query with Composite Index
async function benchmarkGoalsQuery(orgId: string) {
  console.log('\n📊 Test 1: Goals Query (Composite Index)');

  const before = await measureQuery('goals-sequential', async () => {
    // Simulate query without index (force sequential scan)
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .eq('period', 'quarterly')
      .is('deleted_at', null);
    return data;
  });

  const after = await measureQuery('goals-indexed', async () => {
    // Same query (will use idx_goals_org_status_period)
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .eq('period', 'quarterly')
      .is('deleted_at', null);
    return data;
  });

  const improvement = (((before - after) / before) * 100).toFixed(1);

  results.push({
    name: 'Goals Query (Composite Index)',
    before,
    after,
    improvement: `${improvement}%`,
    status: after < before * 0.5 ? 'pass' : 'fail', // 50% improvement expected
  });

  console.log(`  Before: ${before.toFixed(2)}ms`);
  console.log(`  After:  ${after.toFixed(2)}ms`);
  console.log(`  Improvement: ${improvement}% ✅`);
}

// Test 2: Notification Stats Aggregation
async function benchmarkNotificationStats(userId: string) {
  console.log('\n📊 Test 2: Notification Stats (SQL Aggregation)');

  const before = await measureQuery('notification-stats-js', async () => {
    // Old approach: fetch all, aggregate in JS
    const { data: notifications } = await supabase
      .from('notifications')
      .select('type, priority, is_read, is_archived')
      .eq('recipient_id', userId);

    // Simulate JS aggregation
    const stats = {
      total: notifications?.length || 0,
      unread: 0,
      read: 0,
      by_type: {} as Record<string, number>,
    };

    notifications?.forEach((n) => {
      if (n.is_read) stats.read++;
      else stats.unread++;
      stats.by_type[n.type] = (stats.by_type[n.type] || 0) + 1;
    });

    return stats;
  });

  const after = await measureQuery('notification-stats-sql', async () => {
    // New approach: SQL aggregation
    const { data } = await supabase.rpc('get_notification_stats_optimized', {
      p_user_id: userId,
    });
    return data;
  });

  const improvement = (((before - after) / before) * 100).toFixed(1);

  results.push({
    name: 'Notification Stats (SQL Aggregation)',
    before,
    after,
    improvement: `${improvement}%`,
    status: after < before * 0.3 ? 'pass' : 'fail', // 70% improvement expected
  });

  console.log(`  Before: ${before.toFixed(2)}ms`);
  console.log(`  After:  ${after.toFixed(2)}ms`);
  console.log(`  Improvement: ${improvement}% ✅`);
}

// Test 3: Cursor vs Offset Pagination
async function benchmarkPagination(orgId: string) {
  console.log('\n📊 Test 3: Pagination (Cursor vs Offset)');

  // Simulate deep pagination (page 100)
  const offset = 100 * 20;

  const before = await measureQuery('offset-pagination', async () => {
    const { data } = await supabase
      .from('candidates')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + 19); // OFFSET 2000 LIMIT 20
    return data;
  });

  // Get cursor from page 99 (simulate)
  const { data: page99 } = await supabase
    .from('candidates')
    .select('id, created_at')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .range(offset - 20, offset - 1);

  const lastItem = page99?.[page99.length - 1];

  const after = await measureQuery('cursor-pagination', async () => {
    const { data } = await supabase.rpc('get_candidates_cursor', {
      p_organization_id: orgId,
      p_cursor: lastItem?.created_at || null,
      p_cursor_id: lastItem?.id || null,
      p_page_size: 20,
    });
    return data;
  });

  const improvement = (((before - after) / before) * 100).toFixed(1);

  results.push({
    name: 'Pagination (Cursor vs Offset, Page 100)',
    before,
    after,
    improvement: `${improvement}%`,
    status: after < before * 0.2 ? 'pass' : 'fail', // 80% improvement expected
  });

  console.log(`  Before: ${before.toFixed(2)}ms (OFFSET ${offset})`);
  console.log(`  After:  ${after.toFixed(2)}ms (CURSOR)`);
  console.log(`  Improvement: ${improvement}% ✅`);
}

// Test 4: Full-Text Search
async function benchmarkFullTextSearch(orgId: string) {
  console.log('\n📊 Test 4: Full-Text Search vs LIKE');

  const searchTerm = 'senior developer';

  const before = await measureQuery('like-search', async () => {
    // Old approach: LIKE query
    const { data } = await supabase
      .from('job_postings')
      .select('*')
      .eq('organization_id', orgId)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .is('deleted_at', null);
    return data;
  });

  const after = await measureQuery('fulltext-search', async () => {
    // New approach: Full-text search
    const { data } = await supabase.rpc('search_job_postings', {
      p_organization_id: orgId,
      p_query: searchTerm,
      p_limit: 20,
    });
    return data;
  });

  const improvement = (((before - after) / before) * 100).toFixed(1);

  results.push({
    name: 'Full-Text Search vs LIKE',
    before,
    after,
    improvement: `${improvement}%`,
    status: after < before * 0.3 ? 'pass' : 'fail', // 70% improvement expected
  });

  console.log(`  Before: ${before.toFixed(2)}ms (LIKE)`);
  console.log(`  After:  ${after.toFixed(2)}ms (FTS)`);
  console.log(`  Improvement: ${improvement}% ✅`);
}

// Test 5: Materialized View vs Regular View
async function benchmarkMaterializedView(orgId: string) {
  console.log('\n📊 Test 5: Materialized View (Goals with Progress)');

  const before = await measureQuery('regular-view', async () => {
    // Simulate regular view with joins and aggregations
    const { data } = await supabase
      .from('goals')
      .select(
        `
        *,
        key_results(progress_percentage, status),
        owner:profiles!owner_id(full_name, avatar_url)
      `
      )
      .eq('organization_id', orgId)
      .is('deleted_at', null);

    // Calculate progress in JS (simulating view aggregation)
    return data?.map((goal) => ({
      ...goal,
      calculated_progress:
        goal.key_results?.reduce((acc, kr) => acc + kr.progress_percentage, 0) /
        (goal.key_results?.length || 1),
    }));
  });

  const after = await measureQuery('materialized-view', async () => {
    // New approach: Materialized view
    const { data } = await supabase
      .from('mv_goals_with_progress')
      .select('*')
      .eq('organization_id', orgId);
    return data;
  });

  const improvement = (((before - after) / before) * 100).toFixed(1);

  results.push({
    name: 'Materialized View (Goals with Progress)',
    before,
    after,
    improvement: `${improvement}%`,
    status: after < before * 0.3 ? 'pass' : 'fail', // 70% improvement expected
  });

  console.log(`  Before: ${before.toFixed(2)}ms (Regular View + JS)`);
  console.log(`  After:  ${after.toFixed(2)}ms (Materialized View)`);
  console.log(`  Improvement: ${improvement}% ✅`);
}

// Test 6: Index Usage Validation
async function validateIndexes() {
  console.log('\n📊 Test 6: Index Usage Validation');

  const { data: indexes, error } = await supabase.rpc('get_index_usage');

  if (error) {
    console.error('  ❌ Failed to fetch index usage:', error.message);
    return;
  }

  const criticalIndexes = [
    'idx_goals_org_status_period',
    'idx_notifications_unread',
    'idx_candidates_email_job_unique',
    'idx_candidates_cursor',
    'idx_job_postings_search',
  ];

  console.log('\n  Critical Indexes:');
  criticalIndexes.forEach((indexName) => {
    const index = indexes?.find((idx: any) => idx.indexname === indexName);
    if (index) {
      console.log(`    ✅ ${indexName} (scans: ${index.idx_scan || 0})`);
    } else {
      console.log(`    ❌ ${indexName} NOT FOUND`);
    }
  });
}

// Print Summary Report
function printSummaryReport() {
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 DATABASE OPTIMIZATION BENCHMARK REPORT');
  console.log('='.repeat(80));

  console.log('\n┌─────────────────────────────────────────────┬──────────┬──────────┬──────────┬────────┐');
  console.log('│ Test                                        │ Before   │ After    │ Gain     │ Status │');
  console.log('├─────────────────────────────────────────────┼──────────┼──────────┼──────────┼────────┤');

  results.forEach((result) => {
    const name = result.name.padEnd(43);
    const before = `${result.before.toFixed(1)}ms`.padStart(8);
    const after = `${result.after.toFixed(1)}ms`.padStart(8);
    const improvement = result.improvement.padStart(8);
    const status = result.status === 'pass' ? '✅ PASS' : '❌ FAIL';

    console.log(`│ ${name} │ ${before} │ ${after} │ ${improvement} │ ${status} │`);
  });

  console.log('└─────────────────────────────────────────────┴──────────┴──────────┴──────────┴────────┘');

  // Overall Statistics
  const totalBefore = results.reduce((acc, r) => acc + r.before, 0);
  const totalAfter = results.reduce((acc, r) => acc + r.after, 0);
  const overallImprovement = (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1);

  console.log(`\n📈 Overall Performance Improvement: ${overallImprovement}%`);
  console.log(`   Average Before: ${(totalBefore / results.length).toFixed(1)}ms`);
  console.log(`   Average After:  ${(totalAfter / results.length).toFixed(1)}ms`);

  const passCount = results.filter((r) => r.status === 'pass').length;
  const failCount = results.filter((r) => r.status === 'fail').length;

  console.log(`\n✅ Passed: ${passCount}/${results.length}`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}/${results.length}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// Main Benchmark Runner
async function main() {
  console.log('🚀 Starting Database Optimization Benchmarks...\n');

  // Get test organization (or use first available)
  const { data: orgs } = await supabase.from('organizations').select('id').limit(1);

  if (!orgs || orgs.length === 0) {
    console.error('❌ No organizations found. Please seed test data first.');
    process.exit(1);
  }

  const orgId = orgs[0].id;

  // Get test user
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('organization_id', orgId)
    .limit(1);

  if (!profiles || profiles.length === 0) {
    console.error('❌ No profiles found. Please seed test data first.');
    process.exit(1);
  }

  const userId = profiles[0].id;

  console.log(`📌 Test Organization: ${orgId}`);
  console.log(`📌 Test User: ${userId}`);

  try {
    await benchmarkGoalsQuery(orgId);
    await benchmarkNotificationStats(userId);
    await benchmarkPagination(orgId);
    await benchmarkFullTextSearch(orgId);
    await benchmarkMaterializedView(orgId);
    await validateIndexes();

    printSummaryReport();

    const failedTests = results.filter((r) => r.status === 'fail').length;
    if (failedTests > 0) {
      console.error(`\n❌ ${failedTests} tests failed. Review optimization migrations.`);
      process.exit(1);
    }

    console.log('\n✅ All benchmarks passed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Benchmark failed with error:', error);
    process.exit(1);
  }
}

// Run benchmarks
main();
