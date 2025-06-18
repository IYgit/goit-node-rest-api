# Домашня робота — Тема 6: PostgreSQL та Sequelize

## Гілка

- Створи гілку `03-postgresql` з гілки `master`.

## Завдання

Продовж створення **REST API** для роботи з колекцією контактів.

---

## ✅ Крок 1: Створення бази даних

1. Створи акаунт на [Render](https://render.com).
2. У своєму акаунті створи нову **базу даних PostgreSQL** з назвою **`db-contacts`**.

---

## ✅ Крок 2: Робота з pgAdmin

1. Встанови **графічний редактор pgAdmin**.
2. Підключись до створеної хмарної бази даних.
3. Створи таблицю `contacts`.

---

## ✅ Крок 3: Підключення Sequelize

1. Використай вихідний код з домашньої роботи **#2**.
2. Заміни зберігання контактів у JSON-файлі на базу даних PostgreSQL.
3. Створи підключення до PostgreSQL через **Sequelize**.

### Підключення до БД

```js
// database.js (приклад)
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres://USERNAME:PASSWORD@HOST:PORT/db-contacts');

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
```

### Модель Contact
```js
const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

const Contact = sequelize.define('contact', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  favorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Contact;

```

## ✅ Крок 4: Оновлення статусу `favorite`

У контактах з’явилося нове поле — `favorite`.  
Це поле приймає логічне значення: `true` або `false`.  
Воно вказує, чи є контакт обраним.

### 🔧 Необхідно реалізувати новий роут:
#### PATCH /api/contacts/:contactId/favorite


### 🔄 Логіка роуту:

- Отримує параметр `contactId`.
- Отримує `body` у форматі JSON з полем `favorite`.
- Якщо `body` валідний:
  - викликає функцію `updateStatusContact(contactId, body)` — ця функція оновлює контакт у базі.
- Якщо контакт успішно знайдено і оновлено:
  - повертає оновлений об'єкт контакту зі статусом `200`.
- Якщо контакт не знайдено:
  - повертає відповідь:

```json
{ "message": "Not found" }
```
зі статусом 404.



![Contacts API](./assets/img.png)
![Contacts API](./assets/img_1.png)
