import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales')
const CONFIG_FILE = path.join(__dirname, '../src/i18n/languageConfig.ts')
const BASE_LOCALE = 'en.json'
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const readJsonFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message)
    return null
  }
}

const writeJsonFile = (filePath, data) => {
  try {
    const formatted = JSON.stringify(data, null, 2)
    fs.writeFileSync(filePath, formatted + '\n', 'utf8')
    return true
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message)
    return false
  }
}

const getLanguagesFromConfig = () => {
  try {
    const configContent = fs.readFileSync(CONFIG_FILE, 'utf8')
    const languages = []
    
    const regex = /code:\s*['"]([^'"]+)['"]/g
    let match
    
    while ((match = regex.exec(configContent)) !== null) {
      const code = match[1]
      if (code && code !== 'en') {
        languages.push(code)
      }
    }
    
    return ['en', ...languages]
  } catch (error) {
    console.error('Error reading language config:', error.message)
    return ['en', 'hi', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar']
  }
}

const translateText = async (text, targetLang, sourceLang = 'en') => {
  if (targetLang === sourceLang || !text) {
    return text
  }

  try {
    const response = await fetch(`${API_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLang,
      }),
    })

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.translatedText || text
  } catch (error) {
    console.warn(`Translation failed for "${text}" to ${targetLang}:`, error.message)
    return text
  }
}

const translateObject = async (obj, targetLang, sourceLang = 'en') => {
  if (targetLang === sourceLang) {
    return obj
  }

  const translated = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      translated[key] = await translateText(value, targetLang, sourceLang)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      translated[key] = await translateObject(value, targetLang, sourceLang)
    } else {
      translated[key] = value
    }
  }

  return translated
}

const mergeTranslations = (base, existing) => {
  const merged = { ...existing }
  
  const mergeRecursive = (baseObj, existingObj, mergedObj) => {
    for (const [key, value] of Object.entries(baseObj)) {
      if (!(key in mergedObj)) {
        mergedObj[key] = value
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (typeof mergedObj[key] !== 'object' || mergedObj[key] === null || Array.isArray(mergedObj[key])) {
          mergedObj[key] = {}
        }
        mergeRecursive(value, existingObj[key] || {}, mergedObj[key])
      }
    }
  }
  
  mergeRecursive(base, existing, merged)
  return merged
}

const syncLocale = async (langCode, baseTranslations, useTranslation = false) => {
  const localePath = path.join(LOCALES_DIR, `${langCode}.json`)
  const exists = fs.existsSync(localePath)
  const existing = exists ? readJsonFile(localePath) : {}
  
  let translations
  let needsUpdate = false
  
  if (langCode === 'en') {
    translations = baseTranslations
    needsUpdate = JSON.stringify(translations) !== JSON.stringify(existing)
  } else {
    const merged = mergeTranslations(baseTranslations, existing || {})
    const hasNewKeys = JSON.stringify(merged) !== JSON.stringify(existing)
    
    if (useTranslation && (!exists || hasNewKeys)) {
      console.log(`  Translating to ${langCode}...`)
      translations = await translateObject(merged, langCode, 'en')
      needsUpdate = true
    } else {
      translations = merged
      needsUpdate = hasNewKeys
    }
  }
  
  if (needsUpdate || !exists) {
    if (writeJsonFile(localePath, translations)) {
      const status = exists ? 'Updated' : 'Created'
      console.log(`  ✓ ${status} ${langCode}.json`)
      return { created: !exists, updated: exists }
    }
  } else {
    console.log(`  ⊘ ${langCode}.json (no changes)`)
    return { created: false, updated: false }
  }
  
  return { created: false, updated: false }
}

const main = async () => {
  console.log('🌍 Syncing locale files...\n')
  
  const basePath = path.join(LOCALES_DIR, BASE_LOCALE)
  const baseTranslations = readJsonFile(basePath)
  
  if (!baseTranslations) {
    console.error(`❌ Base locale file ${BASE_LOCALE} not found!`)
    process.exit(1)
  }
  
  console.log(`📄 Base locale: ${BASE_LOCALE}`)
  console.log(`📁 Locales directory: ${LOCALES_DIR}\n`)
  
  const languages = getLanguagesFromConfig()
  const useAutoTranslation = process.argv.includes('--translate') || process.argv.includes('-t')
  
  if (useAutoTranslation) {
    console.log('🔄 Auto-translation enabled (using API)\n')
  } else {
    console.log('ℹ️  Auto-translation disabled. Use --translate flag to enable.\n')
  }
  
  let created = 0
  let updated = 0
  let skipped = 0
  
  for (const langCode of languages) {
    const result = await syncLocale(langCode, baseTranslations, useAutoTranslation)
    if (result.created) {
      created++
    } else if (result.updated) {
      updated++
    } else {
      skipped++
    }
  }
  
  console.log(`\n✅ Sync complete!`)
  console.log(`   Created: ${created} files`)
  console.log(`   Updated: ${updated} files`)
  console.log(`   Skipped: ${skipped} files (no changes)`)
  console.log(`   Total: ${languages.length} languages\n`)
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})

