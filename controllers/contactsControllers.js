import contactsService from "../services/contactsServices.js";

// GET /api/contacts
export const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await contactsService.listContacts(req.user.id);
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};

// GET /api/contacts/:id
export const getOneContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await contactsService.getContactById(id);
    if (!contact) {
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
    const removedContact = await contactsService.removeContact(id);
    if (!removedContact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(removedContact);
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const owner = req.user.id; // Отримуємо ID користувача з req.user
    const newContact = await contactsService.addContact(name, email, phone, owner);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Body must have at least one field" });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const updatedContact = await contactsService.updateContact(id, req.body, userId);

    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

export const updateStatusContact = async (req, res, next) => {
    try {
        const { contactId } = req.params;
        const updatedContact = await contactsService.updateStatusContact(contactId, req.body);
        if (!updatedContact) {
            return res.status(404).json({ message: "Not found" });
        }
        res.status(200).json(updatedContact);
    } catch (error) {
        next(error);
    }
};
