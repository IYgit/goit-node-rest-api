import "../db/sequelize.js"
import Contact from '../models/contact.js';

async function listContacts(ownerId) {
    return await Contact.findAll({ where: { owner: ownerId } });
}

async function getContactById(contactId, ownerId) {
    return await Contact.findOne({ where: { id: contactId, owner: ownerId } });
}

async function removeContact(contactId, ownerId) {
    const contact = await Contact.findOne({ where: { id: contactId, owner: ownerId } });
    if (!contact) return null;
    await contact.destroy();
    return contact; // The object that was deleted
}

async function addContact(name, email, phone, ownerId) {
    return await Contact.create({ name, email, phone, owner: ownerId });
}

async function updateContact(contactId, body, ownerId) {
    const contact = await Contact.findOne({ where: { id: contactId, owner: ownerId } });
    if (!contact) {
        return null; // Or throw an error indicating not found or not authorized
    }
    // Only update allowed fields, prevent owner field from being changed via body
    const { name, email, phone, favorite } = body;
    const allowedUpdates = {};
    if (name !== undefined) allowedUpdates.name = name;
    if (email !== undefined) allowedUpdates.email = email;
    if (phone !== undefined) allowedUpdates.phone = phone;
    if (favorite !== undefined) allowedUpdates.favorite = favorite;

    if (Object.keys(allowedUpdates).length === 0) {
        // Or return contact as is, if no valid fields to update were provided
        return contact;
    }

    return await contact.update(allowedUpdates);
}

async function updateStatusContact(contactId, body, ownerId) {
    const contact = await Contact.findOne({ where: { id: contactId, owner: ownerId } });
    if (!contact) {
        return null;
    }
    // Ensure only 'favorite' status is updated
    if (body.favorite === undefined) {
        // Or throw an error that 'favorite' field is required
        return contact; // No change if favorite not provided
    }
    return await contact.update({ favorite: body.favorite });
}

export default {
    listContacts,
    getContactById, 
    removeContact, 
    addContact, 
    updateContact,
    updateStatusContact 
};