#!/usr/bin/env node
/**
 * Registry Publication Script
 *
 * Publishes registry artifacts to npm registry, GitHub Packages, or GitLab Container Registry
 */

import { readFileSync, existsSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

interface PublishConfig {
  registry?: string
  scope?: string
  access?: 'public' | 'restricted'
  tag?: string
  dryRun?: boolean
}

class RegistryPublisher {
  private config: any
  private publishConfig: PublishConfig

  constructor() {
    console.log('📦 Targetym Registry Publisher')
    console.log('━'.repeat(50))

    // Load @resty.json
    const configPath = join(rootDir, '@resty.json')
    if (!existsSync(configPath)) {
      throw new Error('❌ @resty.json not found')
    }

    this.config = JSON.parse(readFileSync(configPath, 'utf-8'))
    console.log(`✓ Loaded configuration: ${this.config.name} v${this.config.version}\n`)

    // Load publish configuration from environment or defaults
    this.publishConfig = {
      registry: process.env.NPM_REGISTRY || 'https://registry.npmjs.org',
      scope: process.env.NPM_SCOPE || '@targetym',
      access: (process.env.NPM_ACCESS as 'public' | 'restricted') || 'public',
      tag: process.env.NPM_TAG || 'latest',
      dryRun: process.env.DRY_RUN === 'true'
    }
  }

  async publish() {
    console.log('📋 Publish Configuration:')
    console.log(`  Registry: ${this.publishConfig.registry}`)
    console.log(`  Scope: ${this.publishConfig.scope}`)
    console.log(`  Access: ${this.publishConfig.access}`)
    console.log(`  Tag: ${this.publishConfig.tag}`)
    console.log(`  Dry Run: ${this.publishConfig.dryRun}`)
    console.log()

    // Check if registry is built
    const outputDir = join(rootDir, 'public', 'registry')
    if (!existsSync(outputDir)) {
      console.error('❌ Registry not built. Run `pnpm registry:build` first.')
      process.exit(1)
    }

    // Check if index.json exists
    const indexPath = join(outputDir, 'index.json')
    if (!existsSync(indexPath)) {
      console.error('❌ Registry index not found. Run `pnpm registry:build` first.')
      process.exit(1)
    }

    console.log('✓ Registry artifacts found\n')

    // Validate configuration
    this.validatePublishConfig()

    // Create package.json for each registry item
    this.createPackages()

    // Publish packages
    this.publishPackages()

    console.log('\n✨ Publishing complete!')
  }

  private validatePublishConfig() {
    console.log('🔍 Validating publish configuration...\n')

    // Check if authenticated to registry
    try {
      const whoami = execSync(`npm whoami --registry=${this.publishConfig.registry}`, {
        encoding: 'utf-8',
        stdio: 'pipe'
      }).trim()
      console.log(`  Authenticated as: ${whoami}`)
    } catch (error) {
      console.error(`  ❌ Not authenticated to ${this.publishConfig.registry}`)
      console.error('  Run: npm login')
      process.exit(1)
    }

    console.log()
  }

  private createPackages() {
    console.log('📝 Creating package.json for each item...\n')

    const index = JSON.parse(readFileSync(join(rootDir, 'public', 'registry', 'index.json'), 'utf-8'))

    index.items.forEach((item: any) => {
      const packageDir = join(rootDir, 'public', 'registry', item.name)
      const packageJsonPath = join(packageDir, 'package.json')

      const packageJson = {
        name: `${this.publishConfig.scope}/${item.name}`,
        version: item.version,
        description: item.description,
        keywords: item.tags,
        license: 'MIT',
        author: 'Targetym Team <dev@targetym.com>',
        repository: {
          type: 'git',
          url: 'https://github.com/your-org/targetym.git'
        },
        publishConfig: {
          access: this.publishConfig.access,
          registry: this.publishConfig.registry
        },
        dependencies: this.resolveDependencies(item.dependencies || []),
        peerDependencies: {
          'react': '>=19.0.0',
          'react-dom': '>=19.0.0',
          'next': '>=15.5.0'
        },
        files: ['files', 'actions', 'README.md', 'metadata.json'],
        main: 'files/index.js',
        types: 'files/index.d.ts',
        exports: {
          '.': {
            import: './files/index.js',
            types: './files/index.d.ts'
          }
        }
      }

      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
      console.log(`  ✓ Created package.json for ${item.name}`)
    })

    console.log()
  }

  private resolveDependencies(deps: string[]): Record<string, string> {
    const resolved: Record<string, string> = {}

    // Read root package.json to get versions
    const rootPackageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'))
    const allDeps = { ...rootPackageJson.dependencies, ...rootPackageJson.devDependencies }

    deps.forEach(dep => {
      if (allDeps[dep]) {
        resolved[dep] = allDeps[dep]
      } else {
        console.warn(`  ⚠  Warning: Could not resolve version for ${dep}`)
      }
    })

    return resolved
  }

  private publishPackages() {
    console.log('🚀 Publishing packages...\n')

    const index = JSON.parse(readFileSync(join(rootDir, 'public', 'registry', 'index.json'), 'utf-8'))

    let published = 0
    let failed = 0
    let skipped = 0

    index.items.forEach((item: any) => {
      const packageDir = join(rootDir, 'public', 'registry', item.name)
      const packageName = `${this.publishConfig.scope}/${item.name}`

      try {
        // Check if version already exists
        try {
          const existingVersion = execSync(
            `npm view ${packageName}@${item.version} version --registry=${this.publishConfig.registry}`,
            { encoding: 'utf-8', stdio: 'pipe' }
          ).trim()

          if (existingVersion === item.version) {
            console.log(`  ⏭️  ${packageName}@${item.version} already published`)
            skipped++
            return
          }
        } catch {
          // Version doesn't exist, proceed with publish
        }

        // Publish package
        const publishCmd = [
          'npm publish',
          packageDir,
          `--tag ${this.publishConfig.tag}`,
          `--registry ${this.publishConfig.registry}`,
          this.publishConfig.dryRun ? '--dry-run' : ''
        ].filter(Boolean).join(' ')

        if (this.publishConfig.dryRun) {
          console.log(`  🔍 DRY RUN: ${publishCmd}`)
        } else {
          execSync(publishCmd, { encoding: 'utf-8', stdio: 'inherit' })
          console.log(`  ✅ Published ${packageName}@${item.version}`)
        }

        published++
      } catch (error) {
        console.error(`  ❌ Failed to publish ${packageName}:`, error)
        failed++
      }
    })

    console.log('\n' + '━'.repeat(50))
    console.log('📊 Publishing Summary:')
    console.log(`  Published: ${published}`)
    console.log(`  Skipped: ${skipped}`)
    console.log(`  Failed: ${failed}`)
    console.log('━'.repeat(50))

    if (failed > 0) {
      process.exit(1)
    }
  }
}

// Run publisher
try {
  const publisher = new RegistryPublisher()
  publisher.publish()
} catch (error) {
  console.error('\n❌ Publishing failed:', error)
  process.exit(1)
}
