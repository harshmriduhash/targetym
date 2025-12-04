#!/usr/bin/env node
/**
 * Registry Build Script
 *
 * Builds the Targetym Component Registry from @resty.json configuration
 * Generates public registry files for consumption
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

interface RegistryFile {
  path: string
  type: string
  target: string
}

interface RegistryItem {
  name: string
  type: string
  version: string
  description: string
  category: string
  tags: string[]
  dependencies?: string[]
  registryDependencies?: string[]
  files: RegistryFile[]
  actions?: string[]
}

interface RegistryConfig {
  name: string
  version: string
  description: string
  registry: RegistryItem[]
  style?: string
  tailwind?: object
  rsc?: boolean
  tsx?: boolean
  aliases?: Record<string, string>
}

interface RegistryOutput {
  name: string
  version: string
  description: string
  items: RegistryItem[]
  categories: string[]
  totalItems: number
  built: string
}

class RegistryBuilder {
  private config: RegistryConfig
  private output: RegistryOutput
  private outputDir: string

  constructor() {
    console.log('📦 Targetym Registry Builder')
    console.log('━'.repeat(50))

    // Load @resty.json
    const configPath = join(rootDir, '@resty.json')
    if (!existsSync(configPath)) {
      throw new Error('❌ @resty.json not found')
    }

    this.config = JSON.parse(readFileSync(configPath, 'utf-8'))
    console.log(`✓ Loaded configuration: ${this.config.name} v${this.config.version}`)

    this.outputDir = join(rootDir, 'public', 'registry')

    this.output = {
      name: this.config.name,
      version: this.config.version,
      description: this.config.description,
      items: [],
      categories: [],
      totalItems: 0,
      built: new Date().toISOString()
    }
  }

  /**
   * Build the registry
   */
  async build() {
    console.log('\n🔨 Building registry...')

    // Ensure output directory exists
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true })
    }

    // Process registry items
    this.processItems()

    // Generate registry index
    this.generateIndex()

    // Generate item manifests
    this.generateItemManifests()

    // Copy documentation
    this.copyDocumentation()

    // Copy component files
    this.copyComponentFiles()

    // Generate stats
    this.generateStats()

    console.log('\n✨ Registry built successfully!')
    console.log(`📍 Output: ${this.outputDir}`)
    console.log(`📦 Items: ${this.output.totalItems}`)
    console.log(`📂 Categories: ${this.output.categories.length}`)
  }

  /**
   * Process all registry items from config
   */
  private processItems() {
    console.log('\n📋 Processing registry items...')

    const categories = new Set<string>()

    this.config.registry.forEach(item => {
      categories.add(item.category)
      this.output.items.push(item)

      // Validate item
      this.validateItem(item)

      console.log(`  ✓ ${item.name} (${item.type}) - ${item.files.length} files`)
    })

    this.output.categories = Array.from(categories)
    this.output.totalItems = this.output.items.length

    console.log(`\n📊 Processed ${this.output.totalItems} items in ${this.output.categories.length} categories`)
  }

  /**
   * Validate registry item
   */
  private validateItem(item: RegistryItem) {
    let warnings = 0

    // Check if component files exist
    item.files.forEach(file => {
      const filePath = join(rootDir, file.path)
      if (!existsSync(filePath)) {
        console.warn(`    ⚠  Warning: File not found: ${file.path}`)
        warnings++
      }
    })

    // Check if documentation exists
    const docPath = join(rootDir, 'app', '_docs', 'modules', `${item.name}.md`)
    if (!existsSync(docPath)) {
      console.warn(`    ℹ  Info: No documentation found for ${item.name}`)
    }

    if (warnings > 0) {
      console.warn(`    ⚠  ${warnings} warnings for ${item.name}`)
    }
  }

  /**
   * Generate registry index file
   */
  private generateIndex() {
    const indexPath = join(this.outputDir, 'index.json')
    const index = {
      name: this.output.name,
      version: this.output.version,
      description: this.output.description,
      items: this.output.items.map(item => ({
        name: item.name,
        type: item.type,
        version: item.version,
        description: item.description,
        category: item.category,
        tags: item.tags,
        dependencies: item.dependencies || [],
        registryDependencies: item.registryDependencies || []
      })),
      built: this.output.built
    }

    writeFileSync(indexPath, JSON.stringify(index, null, 2))
    console.log(`\n✓ Generated index: ${indexPath}`)
  }

  /**
   * Generate individual item manifests
   */
  private generateItemManifests() {
    console.log('\n📝 Generating item manifests...')

    this.output.items.forEach(item => {
      const manifestDir = join(this.outputDir, item.name)
      if (!existsSync(manifestDir)) {
        mkdirSync(manifestDir, { recursive: true })
      }

      const manifestPath = join(manifestDir, 'metadata.json')
      const manifest = {
        name: item.name,
        type: item.type,
        version: item.version,
        description: item.description,
        category: item.category,
        tags: item.tags,
        dependencies: item.dependencies || [],
        registryDependencies: item.registryDependencies || [],
        files: item.files.map(f => f.target),
        actions: item.actions || []
      }

      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    })

    console.log(`✓ Generated ${this.output.totalItems} manifests`)
  }

  /**
   * Copy component files to output
   */
  private copyComponentFiles() {
    console.log('\n📁 Copying component files...')

    let copied = 0
    let failed = 0

    this.output.items.forEach(item => {
      const itemDir = join(this.outputDir, item.name, 'files')
      if (!existsSync(itemDir)) {
        mkdirSync(itemDir, { recursive: true })
      }

      item.files.forEach(file => {
        const srcPath = join(rootDir, file.path)
        const destPath = join(itemDir, file.target)
        const destDir = dirname(destPath)

        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true })
        }

        try {
          if (existsSync(srcPath)) {
            copyFileSync(srcPath, destPath)
            copied++
          } else {
            failed++
          }
        } catch (error) {
          console.warn(`  ⚠  Failed to copy ${file.path}`)
          failed++
        }
      })

      // Copy action files if they exist
      if (item.actions && item.actions.length > 0) {
        const actionsDir = join(this.outputDir, item.name, 'actions')
        if (!existsSync(actionsDir)) {
          mkdirSync(actionsDir, { recursive: true })
        }

        item.actions.forEach(actionPath => {
          const srcPath = join(rootDir, actionPath)
          const fileName = actionPath.split('/').pop() || ''
          const destPath = join(actionsDir, fileName)

          try {
            if (existsSync(srcPath)) {
              copyFileSync(srcPath, destPath)
              copied++
            }
          } catch (error) {
            console.warn(`  ⚠  Failed to copy action ${actionPath}`)
          }
        })
      }
    })

    console.log(`✓ Copied ${copied} files (${failed} failed)`)
  }

  /**
   * Copy documentation to output
   */
  private copyDocumentation() {
    console.log('\n📚 Copying documentation...')

    const docsOutputDir = join(this.outputDir, 'docs')
    if (!existsSync(docsOutputDir)) {
      mkdirSync(docsOutputDir, { recursive: true })
    }

    let copied = 0

    this.output.items.forEach(item => {
      const srcDoc = join(rootDir, 'app', '_docs', 'modules', `${item.name}.md`)
      if (existsSync(srcDoc)) {
        const destDoc = join(docsOutputDir, `${item.name}.md`)
        copyFileSync(srcDoc, destDoc)
        copied++

        // Also copy to item directory
        const itemDocPath = join(this.outputDir, item.name, 'README.md')
        copyFileSync(srcDoc, itemDocPath)
      }
    })

    console.log(`✓ Copied ${copied} documentation files`)
  }

  /**
   * Generate build statistics
   */
  private generateStats() {
    const stats = {
      built: this.output.built,
      version: this.output.version,
      totalItems: this.output.totalItems,
      totalFiles: this.output.items.reduce((sum, item) => sum + item.files.length, 0),
      categories: this.output.categories.map(cat => ({
        name: cat,
        count: this.output.items.filter(i => i.category === cat).length
      })),
      types: this.getTypeStats(),
      tags: this.getTagStats()
    }

    const statsPath = join(this.outputDir, 'stats.json')
    writeFileSync(statsPath, JSON.stringify(stats, null, 2))
    console.log(`\n✓ Generated stats: ${statsPath}`)
    console.log(`\n📊 Statistics:`)
    console.log(`   Total items: ${stats.totalItems}`)
    console.log(`   Total files: ${stats.totalFiles}`)
    console.log(`   Categories: ${this.output.categories.join(', ')}`)
  }

  /**
   * Get type statistics
   */
  private getTypeStats() {
    const typeMap = new Map<string, number>()

    this.output.items.forEach(item => {
      typeMap.set(item.type, (typeMap.get(item.type) || 0) + 1)
    })

    return Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Get tag statistics
   */
  private getTagStats() {
    const tagMap = new Map<string, number>()

    this.output.items.forEach(item => {
      item.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
      })
    })

    return Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // Top 20 tags
  }
}

// Run builder
;(async () => {
  try {
    const builder = new RegistryBuilder()
    await builder.build()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Build failed:', error)
    process.exit(1)
  }
})()
