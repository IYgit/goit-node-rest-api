import express from "express";
import authenticate from '../middleware/authenticate.js';
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateStatusContact,
} from "../controllers/contactsControllers.js";
import validateBody from "../helpers/validateBody.js";
import { contactSchema, updateContactSchema, updateFavoriteSchema } from "../schemas/contactsSchemas.js";

const router = express.Router();

// Додаємо middleware authenticate до всіх маршрутів
router.use(authenticate);

router.get("/", getAllContacts);
router.get("/:id", getOneContact);
router.post("/", validateBody(contactSchema), createContact);
router.delete("/:id", deleteContact);
router.put("/:id", validateBody(updateContactSchema), updateContact);
router.patch("/:contactId/favorite", validateBody(updateFavoriteSchema), updateStatusContact);

export default router;