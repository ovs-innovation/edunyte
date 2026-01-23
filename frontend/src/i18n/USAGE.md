# How to Use the Scalable Language System

## Quick Start

### 1. Adding a New Language

Edit `frontend/src/i18n/languageConfig.ts`:

```typescript
export const LANGUAGES: Record<string, Language> = {
  // ... existing languages
  nl: {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    enabled: true, 
  },
}
```

That's it! The language will automatically appear in the switcher and content will be auto-translated.

### 2. Using Auto-Translation in Components

#### For Dynamic Content (Objects)

```typescript
import { useAutoTranslate } from '../hooks/useAutoTranslate'

const CourseCard = ({ course }) => {
  const { translatedData } = useAutoTranslate(course)
  
  return (
    <div>
      <h3>{translatedData.title}</h3>
      <p>{translatedData.description}</p>
    </div>
  )
}
```

#### For Single Text

```typescript
import { useAutoTranslateText } from '../hooks/useAutoTranslate'

const WelcomeMessage = () => {
  const { translatedText } = useAutoTranslateText("Welcome to our platform")
  return <h1>{translatedText}</h1>
}
```

#### For UI Text (i18n keys)

```typescript
import { useTranslation } from 'react-i18next'

const MyComponent = () => {
  const { t } = useTranslation()
  return <button>{t('common.buy_now')}</button>
}
```

## How It Works

1. **Base Language (English)**: All content is stored/created in English
2. **Auto-Translation**: When user selects another language:
   - UI text: Uses i18n translations (if available) or auto-translates
   - Dynamic content: Automatically translated via API
3. **Caching**: Translations are cached for 7 days to reduce API calls
4. **Fallback**: If translation fails, shows English (base language)

## Backend Setup

1. Get Google Translate API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Add to backend `.env`:
   ```
   GOOGLE_TRANSLATE_API_KEY=your_key_here
   ```
3. Restart backend server

## Example: Adding French

1. Add to `languageConfig.ts` (already done)
2. Create `locales/fr.json` for static UI text (already done)
3. Done! French will appear in language switcher

## Disabling a Language

Set `enabled: false` in `languageConfig.ts` - it will be hidden from the switcher but translations will still work if manually set.

