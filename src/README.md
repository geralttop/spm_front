# Структура проекта (Feature-Sliced Design)

Проект организован по методологии **Feature-Sliced Design (FSD)**.

## Структура слоев

```
src/
├── app/          # App Layer - инициализация приложения, провайдеры
├── widgets/      # Widgets Layer - крупные составные блоки интерфейса
├── features/     # Features Layer - функциональные возможности
├── entities/     # Entities Layer - бизнес-сущности
└── shared/       # Shared Layer - переиспользуемый код
    ├── ui/       # UI компоненты
    ├── lib/      # Утилиты
    ├── api/      # API клиенты
    └── config/   # Конфигурации
```

## Описание слоев

### `app/` - App Layer
Слой инициализации приложения:
- Провайдеры (React Query, Theme, i18n и т.д.)
- Инициализация роутинга
- Глобальные настройки

### `widgets/` - Widgets Layer
Крупные составные блоки интерфейса:
- Хедер, футер, сайдбары
- Сложные композиции из features и entities

### `features/` - Features Layer
Функциональные возможности пользователя:
- Создание коллекций мест
- Поиск и фильтрация
- Комментарии и лайки
- Управление профилем

### `entities/` - Entities Layer
Бизнес-сущности приложения:
- Place (Место)
- Collection (Коллекция)
- Guide (Гайд)
- User (Пользователь)
- Review (Отзыв)

### `shared/` - Shared Layer
Переиспользуемый код:
- **ui/** - базовые UI компоненты (кнопки, карточки, инпуты)
- **lib/** - утилиты и хелперы
- **api/** - API клиенты и типы
- **config/** - конфигурации (тема, константы)

## Правила импорта

Слои могут импортировать только из слоев ниже по иерархии:

```
app → widgets → features → entities → shared
```

**Примеры:**
- ✅ `features/` может импортировать из `entities/` и `shared/`
- ❌ `entities/` НЕ может импортировать из `features/`
- ✅ `widgets/` может импортировать из `features/`, `entities/`, `shared/`

## Алиасы путей

В `tsconfig.json` настроены следующие алиасы:

- `@/app/*` → `./src/app/*`
- `@/widgets/*` → `./src/widgets/*`
- `@/features/*` → `./src/features/*`
- `@/entities/*` → `./src/entities/*`
- `@/shared/*` → `./src/shared/*`

## Цветовая схема

Проект поддерживает светлую и темную тему. Цвета определены в `app/globals.css` и `shared/config/theme.ts`.

### Светлая тема
- Primary: `#6366F1` (Indigo/Violet)
- Background: `#F8FAFC` (Slate 50)
- Card: `#FFFFFF` (White)
- Secondary: `#10B981` (Emerald)
- Text Main: `#0F172A` (Slate 900)
- Text Muted: `#64748B` (Slate 500)

### Темная тема
- Primary: `#818CF8` (Indigo 400)
- Background: `#020617` (Slate 950)
- Card: `#0F172A` (Slate 900)
- Secondary: `#34D399` (Emerald 400)
- Text Main: `#F8FAFC` (Slate 50)
- Text Muted: `#94A3B8` (Slate 400)
