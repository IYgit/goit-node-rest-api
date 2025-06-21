import contactsService from "../services/contactsServices.js";

// GET /api/contacts
export const getAllContacts = async (req, res, next) => {
  try {
    const ownerId = req.user.id; // From authenticate middleware
    const contacts = await contactsService.listContacts(ownerId);
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};

// GET /api/contacts/:id
export const getOneContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const contact = await contactsService.getContactById(id, ownerId);
    if (!contact) {
      // This means either not found OR user does not own it. Consistent 404.
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const removedContact = await contactsService.removeContact(id, ownerId);
    if (!removedContact) {
      return res.status(404).json({ message: "Not found" });
    }
    // Return 200 with deleted contact data, or 204 No Content
    res.status(200).json({ message: "Contact deleted", contact: removedContact });
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const ownerId = req.user.id;
    const newContact = await contactsService.addContact(name, email, phone, ownerId);
    res.status(201).json(newContact);
  } catch (error) {
    // Handle potential Sequelize validation errors (e.g., unique constraint if email is per user)
    // For now, basic error forwarding
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Body must have at least one field to update" });
    }

    const { id } = req.params;
    const ownerId = req.user.id;
    const updatedContact = await contactsService.updateContact(id, req.body, ownerId);

    if (!updatedContact) {
      return res.status(404).json({ message: "Not found or not authorized to update" });
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

export const updateStatusContact = async (req, res, next) => {
    try {
        const { contactId } = req.params; // Make sure param name matches route
        const ownerId = req.user.id;
        // Validate that req.body.favorite is a boolean, schema validation should handle this.
        if (typeof req.body.favorite !== 'boolean') {
             return res.status(400).json({ message: "Field 'favorite' must be a boolean." });
        }

        const updatedContact = await contactsService.updateStatusContact(contactId, req.body, ownerId);
        if (!updatedContact) {
            return res.status(404).json({ message: "Not found or not authorized" });
        }
        res.status(200).json(updatedContact);
    } catch (error) {
        next(error);
    }
};
