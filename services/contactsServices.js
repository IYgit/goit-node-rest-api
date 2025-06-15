import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import "../db/sequelize.js"
import Contact from '../models/contact.js';

// Додаємо ці рядки для отримання __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Формуємо правильний шлях до db/contacts.json від кореня проекту
const contactsPath = path.join(__dirname, '..', 'db', 'contacts.json');

async function listContacts() {
    return await Contact.findAll();
}

async function getContactById(contactId) {
    return await Contact.findByPk(contactId);
}

async function removeContact(contactId) {
    const contact = await Contact.findByPk(contactId);
    if (!contact) return null;
    await contact.destroy();
    return contact;
}

async function addContact(name, email, phone) {
    return await Contact.create({ name, email, phone });
}

async function updateContact(contactId, body) {
    const [updated] = await Contact.update(body, {
        where: { id: contactId },
        returning: true
    });
    if (!updated) return null;
    return await Contact.findByPk(contactId);
}

async function updateStatusContact(contactId, body) {
    const [updated] = await Contact.update(
        { favorite: body.favorite },
        {
            where: { id: contactId },
            returning: true
        }
    );
    if (!updated) return null;
    return await Contact.findByPk(contactId);
}

export default { 
    listContacts, 
    getContactById, 
    removeContact, 
    addContact, 
    updateContact,
    updateStatusContact 
};