# Рефакторинг Frontend

## Обзор изменений

Проведен масштабный рефакторинг frontend-приложения для улучшения архитектуры, уменьшения дублирования кода и повышения поддерживаемости.

## Основные улучшения

### 1. Разделение manage page (899 → ~150 строк)

**Было:** Монолитный компонент `app/manage/page.tsx` на 899 строк с 15+ useState и смешанной логикой.

**Стало:** Модульная структура с разделением по фичам:

```
src/features/manage/
├── ui/
│   ├── ManagePoints.tsx       # Управление точками
│   ├── ManageCategories.tsx   # Управление категориями
│   ├── ManageContainers.tsx   # Управление контейнерами
│   ├── CategoryForm.tsx       # Форма категории
│   └── ContainerForm.tsx      # Форма контейнера
└── index.ts

app/manage/page.tsx             # Теперь только роутинг и табы (~60 строк)
```

**Преимущества:**
- Каждый компонент отвечает за одну фичу
- Легче тестировать и поддерживать
- Улучшена читаемость кода
- Проще добавлять новые функции

### 2. Централизованное управление состоянием

**Было:** 15+ useState в manage page, разрозненное состояние.

**Стало:** Zustand store для управления состоянием:

```typescript
// src/shared/lib/store/manage-store.ts
export const useManageStore = create<ManageState>((set, get) => ({
  // Points
  points: [],
  pointsLoading: false,
  draggedPoint: null,
  
  // Categories
  categories: [],
  categoriesLoading: false,
  expandedCategories: new Set<number>(),
  editingCategory: null,
  showCategoryForm: false,
  
  // Containers
  containers: [],
  containersLoading: false,
  expandedContainers: new Set<string>(),
  editingContainer: null,
  showContainerForm: false,
  
  // Actions
  setActiveTab, toggleCategoryExpand, etc.
}));
```

**Преимущества:**
- Единый источник истины
- Легче отслеживать изменения состояния
- Меньше prop drilling
- Возможность переиспользования состояния

### 3. Базовый API класс (сокращение на 60%)

**Было:** Дублирование кода в каждом API модуле:

```typescript
export const pointsApi = {
  getAll: async () => { const response = await apiClient.get(...); return response.data; },
  getById: async (id) => { const response = await apiClient.get(...); return response.data; },
  create: async (data) => { const response = await apiClient.post(...); return response.data; },
  // ... повторяется в categoriesApi, containersApi, etc.
};
```

**Стало:** Базовый класс с общей логикой:

```typescript
// src/shared/api/base-api.ts
export class BaseApi<T, CreateDTO, UpdateDTO> {
  constructor(private endpoint: string, private client: AxiosInstance) {}
  
  async getAll(params?: any): Promise<T[]> { ... }
  async getById(id: string | number): Promise<T> { ... }
  async create(data: CreateDTO): Promise<T> { ... }
  async update(id: string | number, data: UpdateDTO): Promise<T> { ... }
  async delete(id: string | number): Promise<void> { ... }
}

// Использование
export const pointsApi = new BaseApi<Point, CreatePointRequest, UpdatePointRequest>(
  '/points',
  apiClient
);
```

**Преимущества:**
- Сокращение кода на 60%
- Единообразие API методов
- Легче добавлять новые API
- Централизованная обработка ошибок

### 4. Переиспользуемые хуки

Созданы кастомные хуки для общих паттернов:

#### useForm
```typescript
const { values, handleChange, handleSubmit, isSubmitting, errors } = useForm({
  initialValues: { name: '', color: '#3B82F6' },
  onSubmit: async (values) => {
    await categoriesApi.create(values);
  },
});
```

#### useModal
```typescript
const { isOpen, open, close, toggle } = useModal();
```

#### useDataFetching
```typescript
const { data, loading, error, refetch } = useDataFetching({
  fetchFn: () => pointsApi.getAll(),
  dependencies: [userId],
});
```

#### useDebounce
```typescript
const debouncedSearch = useDebounce(searchTerm, 500);
```

**Преимущества:**
- Устранение дублирования логики
- Консистентная обработка форм и загрузки данных
- Меньше boilerplate кода

### 5. Базовый компонент модального окна

**Было:** Дублирование структуры в каждой модалке.

**Стало:** Переиспользуемый BaseModal:

```typescript
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Заголовок"
  size="md"
  footer={<Button>Сохранить</Button>}
>
  {/* Контент */}
</BaseModal>
```

**Преимущества:**
- Единообразный UI
- Автоматическое управление overflow
- Backdrop и анимации из коробки
- Адаптивность

## Структура проекта

```
spm_front/
├── app/                        # Next.js pages (роутинг)
│   └── manage/
│       └── page.tsx           # Упрощенная страница (~60 строк)
├── src/
│   ├── features/              # Фичи приложения
│   │   └── manage/
│   │       ├── ui/
│   │       │   ├── ManagePoints.tsx
│   │       │   ├── ManageCategories.tsx
│   │       │   ├── ManageContainers.tsx
│   │       │   ├── CategoryForm.tsx
│   │       │   └── ContainerForm.tsx
│   │       └── index.ts
│   └── shared/
│       ├── api/
│       │   ├── base-api.ts    # Базовый API класс
│       │   ├── points.ts      # Рефакторенный API
│       │   └── ...
│       ├── lib/
│       │   ├── hooks/
│       │   │   ├── useForm.ts
│       │   │   ├── useModal.ts
│       │   │   ├── useDataFetching.ts
│       │   │   ├── useDebounce.ts
│       │   │   └── index.ts
│       │   └── store/
│       │       ├── manage-store.ts
│       │       └── index.ts
│       └── ui/
│           ├── modal/
│           │   ├── BaseModal.tsx
│           │   └── index.ts
│           └── ...
```

## Метрики улучшений

| Метрика | До | После | Улучшение |
|---------|-----|-------|-----------|
| Размер manage page | 899 строк | ~60 строк | -93% |
| Количество useState в manage | 15+ | 0 (используется store) | -100% |
| Дублирование API кода | ~300 строк | ~100 строк | -67% |
| Переиспользуемые хуки | 0 | 4 | +∞ |
| Модульность компонентов | Низкая | Высокая | ✓ |

## Миграция существующего кода

### Использование новых хуков

**Старый код:**
```typescript
const [values, setValues] = useState({ name: '', color: '' });
const [loading, setLoading] = useState(false);
const [errors, setErrors] = useState({});

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await api.create(values);
  } catch (err) {
    setErrors({ submit: err.message });
  } finally {
    setLoading(false);
  }
};
```

**Новый код:**
```typescript
const { values, handleChange, handleSubmit, isSubmitting, errors } = useForm({
  initialValues: { name: '', color: '' },
  onSubmit: async (values) => {
    await api.create(values);
  },
});
```

### Использование BaseApi

**Старый код:**
```typescript
export const myApi = {
  getAll: async () => {
    const response = await apiClient.get('/my-endpoint');
    return response.data;
  },
  // ... остальные методы
};
```

**Новый код:**
```typescript
export const myApi = new BaseApi<MyType, CreateDTO, UpdateDTO>(
  '/my-endpoint',
  apiClient
);
```

### Использование manage store

**Старый код:**
```typescript
const [points, setPoints] = useState([]);
const [loading, setLoading] = useState(false);
```

**Новый код:**
```typescript
const { points, pointsLoading, setPoints, setPointsLoading } = useManageStore();
```

## Следующие шаги

### Высокий приоритет
- [ ] Рефакторинг profile page (аналогично manage page)
- [ ] Создание типов в отдельной директории `src/shared/types/`
- [ ] Добавление Zod схем валидации

### Средний приоритет
- [ ] Рефакторинг point-card (400+ строк → композиция)
- [ ] Создание переиспользуемых action buttons (FavoriteButton, ReportButton, etc.)
- [ ] Добавление error boundaries

### Низкий приоритет
- [ ] Заполнение entities layer
- [ ] Миграция остальных страниц на новые хуки
- [ ] Создание shared component library

## Рекомендации

1. **Используйте новые хуки** для всех новых форм и модалок
2. **Создавайте feature-based компоненты** вместо больших page компонентов
3. **Используйте BaseApi** для новых API endpoints
4. **Храните состояние в Zustand stores** для сложной логики
5. **Следуйте Feature-Sliced Design** при организации кода

## Полезные ссылки

- [Feature-Sliced Design](https://feature-sliced.design/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Hooks Best Practices](https://react.dev/reference/react)
