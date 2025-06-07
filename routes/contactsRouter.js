import express from "express";
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
} from "../controllers/contactsControllers.js";
import validateBody from "../helpers/validateBody.js";
import { contactSchema, updateContactSchema } from "../schemas/contactsSchemas.js";

const router = express.Router();

router.get("/", getAllContacts);
router.get("/:id", getOneContact);
router.post("/", validateBody(contactSchema), createContact);
router.delete("/:id", deleteContact);
router.put("/:id", validateBody(updateContactSchema), updateContact);

export default router;