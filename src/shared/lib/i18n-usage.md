# Использование i18next в проекте

## Настройка

i18next настроен для работы с тремя языками:
- **ru** - Русский (по умолчанию)
- **be** - Белорусский
- **en** - Английский

## Использование в компонентах

### Базовое использование

```tsx
"use client";

import { useTranslation } from "@/shared/lib/hooks";

export function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("common.title")}</h1>
      <p>{t("common.description")}</p>
    </div>
  );
}
```

### Переключение языка

```tsx
"use client";

import { useTranslation } from "@/shared/lib/hooks";
import { supportedLocales } from "@/shared/config";

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useTranslation();

  return (
    <div>
      {supportedLocales.map((locale) => (
        <button
          key={locale}
          onClick={() => changeLanguage(locale)}
          disabled={currentLanguage === locale}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
```

### Использование готового компонента

```tsx
import { LanguageSwitcher } from "@/shared/ui";

export function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

## Структура файлов переводов

Переводы хранятся в `public/locales/{lang}/common.json`:

```
public/
  locales/
    ru/
      common.json
    be/
      common.json
    en/
      common.json
```

## Добавление новых переводов

1. Добавьте ключ в файлы переводов всех языков:

**public/locales/ru/common.json:**
```json
{
  "common": {
    "myNewKey": "Мой новый текст"
  }
}
```

**public/locales/be/common.json:**
```json
{
  "common": {
    "myNewKey": "Мой новы тэкст"
  }
}
```

**public/locales/en/common.json:**
```json
{
  "common": {
    "myNewKey": "My new text"
  }
}
```

2. Используйте в компоненте:
```tsx
const { t } = useTranslation();
<p>{t("common.myNewKey")}</p>
```

## Интерполяция

Для подстановки значений используйте:

```json
{
  "common": {
    "welcome": "Добро пожаловать, {{name}}!"
  }
}
```

```tsx
const { t } = useTranslation();
<p>{t("common.welcome", { name: "Иван" })}</p>
```

## Множественное число

```json
{
  "common": {
    "items": "{{count}} элемент",
    "items_plural": "{{count}} элементов"
  }
}
```

```tsx
const { t } = useTranslation();
<p>{t("common.items", { count: 5 })}</p>
```
