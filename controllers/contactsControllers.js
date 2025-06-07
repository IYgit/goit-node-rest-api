import contactsService from "../services/contactsServices.js";

// GET /api/contacts
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await contactsService.listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/contacts/:id
export const getOneContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await contactsService.getContactById(id);
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const removedContact = await contactsService.removeContact(id);
    if (!removedContact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(removedContact);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createContact = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const newContact = await contactsService.addContact(name, email, phone);
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateContact = async (req, res) => {
  try {
    // Якщо body порожній або не містить жодного з полів
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Body must have at least one field" });
    }

    const { id } = req.params;
    const updatedContact = await contactsService.updateContact(id, req.body);

    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
