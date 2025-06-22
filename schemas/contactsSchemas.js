import Joi from "joi";

export const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean()
});

export const updateContactSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  favorite: Joi.boolean()
}).min(1); // Ensure at least one field is provided

export const updateFavoriteSchema = Joi.object({
    favorite: Joi.boolean().required(),
});