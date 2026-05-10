# LogoGames

Логопедические игры и конструктор упражнений на фонематическое восприятие.

- **Angular 21** + standalone-компоненты
- **IndexedDB** (idb) — хранение пользовательских игр
- **Capacitor 8** — нативные Android / iOS обёртки
- Хостинг: GitHub Pages (web build)

## Разработка

```bash
npm install
npm start           # http://localhost:4200
npm run build       # production build → dist/logo-games/browser
```

## Деплой на GitHub Pages

```bash
npm run deploy      # ng deploy --base-href=/logo-games/
```

Используется `withHashLocation()`, поэтому `/#/games` и т. п. работают без 404 на статическом хостинге.

## Конструктор игр (без backend)

- Все кастомные игры хранятся в IndexedDB браузера пользователя
- Картинки и аудио сохраняются как `data:` URI и не отправляются никуда
- Игры можно экспортировать в JSON и импортировать на другом устройстве
  («Мои игры» → «Экспорт» / «Импорт»)

## Нативное мобильное приложение (Capacitor)

Веб-сборка та же, что и для GitHub Pages, — она просто упакована в нативный
контейнер.

Установка платформ (один раз):

```bash
npx cap add android        # требует Android SDK
npx cap add ios            # требует macOS + Xcode
```

Цикл разработки:

```bash
npm run cap:sync           # build + cap sync
npm run cap:android        # открыть в Android Studio
npm run cap:ios            # открыть в Xcode
```

`capacitor.config.ts`:

- `webDir: 'dist/logo-games/browser'`
- `appId: app.logogames.client`
- splash-экран — фирменный фиолетовый `#4f46e5`

## Версия для слабовидящих

Иконка-глаз в левом нижнем углу. Открывает панель с:

- регулируемым шрифтом (масштаб, жирность, межбуквенное расстояние),
- межстрочным интервалом,
- громкостью озвучивания,
- пятью вариантами цветокоррекции (ч/б, инверсия, протанопия, дейтеранопия, тританопия),
- режимом «озвучивать при наведении» (использует Web Speech API).

Настройки сохраняются в `localStorage`.

## Чат-виджет поддержки

Кнопка в правом нижнем углу. Открывает диалог с предложением связаться через
ВКонтакте / MAX / imo / E-mail или заказать обратный звонок.
