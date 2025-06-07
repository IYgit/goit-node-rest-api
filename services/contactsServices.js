import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Додаємо ці рядки для отримання __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Формуємо правильний шлях до db/contacts.json від кореня проекту
const contactsPath = path.join(__dirname, '..', 'dbc', 'contacts.json');

async function listContacts() {
    const data = await fs.readFile(contactsPath, 'utf-8');
    return JSON.parse(data);
}

async function getContactById(contactId) {
    const contacts = await listContacts();
    return contacts.find(contact => contact.id === contactId) || null;
}

async function removeContact(contactId) {
    const contacts = await listContacts();
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));
    return contacts.find(contact => contact.id === contactId) || null;
}

async function addContact(name, email, phone) {
    const contacts = await listContacts();
    const newContact = { id: Date.now().toString(), name, email, phone };
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return newContact;
}

async function updateContact(contactId, body) {
    const contacts = await listContacts();
    const idx = contacts.findIndex(contact => contact.id === contactId);
    if (idx === -1) {
        return null;
    }
    // Оновлюємо лише передані поля
    contacts[idx] = { ...contacts[idx], ...body };
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return contacts[idx];
}

export default { listContacts, getContactById, removeContact, addContact, updateContact };