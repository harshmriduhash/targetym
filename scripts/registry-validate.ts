#!/usr/bin/env node
/**
 * Registry Validation Script
 *
 * Validates the registry configuration and files
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

interface ValidationError {
  severity: 'error' | 'warning' | 'info'
  message: string
  item?: string
  file?: string
}

class RegistryValidator {
  private errors: ValidationError[] = []

  async validate() {
    console.log('🔍 Validating Targetym Registry')
    console.log('━'.repeat(50))

    // Load @resty.json
    const configPath = join(rootDir, '@resty.json')
    if (!existsSync(configPath)) {
      this.addError('error', '@resty.json not found')
      this.printResults()
      process.exit(1)
    }

    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    console.log(`✓ Loaded configuration: ${config.name} v${config.version}\n`)

    // Validate schema
    this.validateSchema(config)

    // Validate each registry item
    config.registry.forEach((item: any) => {
      this.validateItem(item)
    })

    // Print results
    this.printResults()

    // Exit with appropriate code
    const hasErrors = this.errors.some(e => e.severity === 'error')
    process.exit(hasErrors ? 1 : 0)
  }

  private validateSchema(config: any) {
    console.log('📋 Validating schema...')

    // Required top-level fields
    const requiredFields = ['name', 'version', 'description', 'registry']
    requiredFields.forEach(field => {
      if (!config[field]) {
        this.addError('error', `Missing required field: ${field}`)
      }
    })

    // Validate version format (semver)
    if (config.version && !/^\d+\.\d+\.\d+$/.test(config.version)) {
      this.addError('warning', `Invalid version format: ${config.version} (should be semver)`)
    }

    // Validate registry is array
    if (!Array.isArray(config.registry)) {
      this.addError('error', 'registry must be an array')
    }

    console.log(`  Registry items: ${config.registry.length}`)
  }

  private validateItem(item: any) {
    console.log(`\n📦 Validating: ${item.name}`)

    // Required fields
    const requiredFields = ['name', 'type', 'version', 'description', 'category', 'tags', 'files']
    requiredFields.forEach(field => {
      if (!item[field]) {
        this.addError('error', `Missing required field: ${field}`, item.name)
      }
    })

    // Validate name format (kebab-case)
    if (item.name && !/^[a-z0-9-]+$/.test(item.name)) {
      this.addError('warning', `Name should be kebab-case: ${item.name}`, item.name)
    }

    // Validate type
    const validTypes = ['registry:module', 'registry:lib', 'registry:ui', 'registry:hook']
    if (item.type && !validTypes.includes(item.type)) {
      this.addError('warning', `Unknown type: ${item.type}`, item.name)
    }

    // Validate version
    if (item.version && !/^\d+\.\d+\.\d+$/.test(item.version)) {
      this.addError('warning', `Invalid version: ${item.version}`, item.name)
    }

    // Validate tags is array
    if (item.tags && !Array.isArray(item.tags)) {
      this.addError('error', 'tags must be an array', item.name)
    }

    // Validate files
    if (Array.isArray(item.files)) {
      this.validateFiles(item.name, item.files)
    }

    // Validate dependencies
    if (item.dependencies && !Array.isArray(item.dependencies)) {
      this.addError('error', 'dependencies must be an array', item.name)
    }

    // Validate registryDependencies
    if (item.registryDependencies && !Array.isArray(item.registryDependencies)) {
      this.addError('error', 'registryDependencies must be an array', item.name)
    }

    // Check documentation
    this.checkDocumentation(item.name)
  }

  private validateFiles(itemName: string, files: any[]) {
    let validFiles = 0
    let missingFiles = 0

    files.forEach(file => {
      // Validate file structure
      if (!file.path || !file.type || !file.target) {
        this.addError('error', `File missing required fields (path, type, target)`, itemName)
        return
      }

      // Check if file exists
      const filePath = join(rootDir, file.path)
      if (existsSync(filePath)) {
        validFiles++
      } else {
        missingFiles++
        this.addError('error', `File not found: ${file.path}`, itemName, file.path)
      }
    })

    console.log(`  Files: ${validFiles} valid, ${missingFiles} missing`)
  }

  private checkDocumentation(itemName: string) {
    const docPath = join(rootDir, 'app', '_docs', 'modules', `${itemName}.md`)
    if (existsSync(docPath)) {
      console.log(`  ✓ Documentation found`)
    } else {
      this.addError('info', `No documentation found`, itemName)
      console.log(`  ℹ  No documentation`)
    }
  }

  private addError(severity: 'error' | 'warning' | 'info', message: string, item?: string, file?: string) {
    this.errors.push({ severity, message, item, file })
  }

  private printResults() {
    console.log('\n' + '━'.repeat(50))
    console.log('📊 Validation Results\n')

    const errors = this.errors.filter(e => e.severity === 'error')
    const warnings = this.errors.filter(e => e.severity === 'warning')
    const info = this.errors.filter(e => e.severity === 'info')

    if (errors.length > 0) {
      console.log(`❌ Errors (${errors.length}):`)
      errors.forEach(e => {
        const prefix = e.item ? `  [${e.item}] ` : '  '
        console.log(`${prefix}${e.message}`)
        if (e.file) console.log(`    ${e.file}`)
      })
      console.log()
    }

    if (warnings.length > 0) {
      console.log(`⚠️  Warnings (${warnings.length}):`)
      warnings.forEach(e => {
        const prefix = e.item ? `  [${e.item}] ` : '  '
        console.log(`${prefix}${e.message}`)
      })
      console.log()
    }

    if (info.length > 0) {
      console.log(`ℹ️  Info (${info.length}):`)
      info.forEach(e => {
        const prefix = e.item ? `  [${e.item}] ` : '  '
        console.log(`${prefix}${e.message}`)
      })
      console.log()
    }

    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ All validations passed!')
    } else if (errors.length === 0) {
      console.log('✅ No errors found (warnings can be ignored)')
    } else {
      console.log('❌ Validation failed - please fix errors above')
    }

    console.log('━'.repeat(50))
  }
}

// Run validator
const validator = new RegistryValidator()
validator.validate()
