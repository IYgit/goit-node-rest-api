import "../db/sequelize.js"
import Contact from '../models/contact.js';

async function listContacts(userId) {
    return await Contact.findAll({
        where: { owner: userId }
    });
}

async function getContactById(contactId, userId) {
    return await Contact.findOne({
        where: { 
            id: contactId,
            owner: userId
        }
    });
}

async function removeContact(contactId, userId) {
    const contact = await Contact.findOne({
        where: { 
            id: contactId,
            owner: userId
        }
    });
    if (!contact) return null;
    await contact.destroy();
    return contact;
}

async function addContact(name, email, phone, owner) {
    return await Contact.create({ 
        name, 
        email, 
        phone, 
        owner 
    });
}

async function updateContact(contactId, body, userId) {
    // First check if contact exists and belongs to user
    const contact = await Contact.findOne({
        where: { 
            id: contactId,
            owner: userId
        }
    });

    if (!contact) return null;

    // Update only provided fields
    const [updated] = await Contact.update(body, {
        where: { 
            id: contactId,
            owner: userId 
        },
        returning: true
    });

    if (!updated) return null;
    
    // Return updated contact
    return await Contact.findOne({
        where: { 
            id: contactId,
            owner: userId
        }
    });
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