# Random Coffee App

Простое React-приложение (Vite + React Router, TypeScript).

Проект переразложен по Feature-Sliced Design (FSD):
- app — инфраструктура приложения (layouts, роутер и т.п.)
- pages — страницы (узлы маршрутов)
- shared — переиспользуемые сущности без бизнес-логики (ui, api, types, styles)

## Запуск
1) Установить зависимости:

   npm i

2) Запустить dev-сервер:

   npm run dev

3) Перейти по адресу из консоли (обычно http://localhost:5173).

## Структура (FSD)
- src/app/layouts/AppShell.tsx — каркас с хэдером и навигацией
- src/pages/home/ui/HomePage.tsx — главная страница с виджетом
- src/pages/random-coffee/ui/RandomCoffeePage.tsx — выбор сотрудников, валидация, запуск шафла, результат и история
- src/pages/settings/ui/SettingsPage.tsx — страница настроек
- src/shared/api/index.ts — мок-API (listEmployees, shuffle, history)
- src/shared/api/types.ts — типы Employee, Shuffle*
- src/shared/ui/Modal/Modal.tsx — общий модальный компонент
- src/styles.css — глобальные стили

## Заметки
- Все данные моковые, хранятся в памяти/LocalStorage
- Для интеграции с реальным бэком замените реализации в src/shared/api/index.ts, оставив типы неизменными

