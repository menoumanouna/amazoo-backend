import { Joi } from "celebrate";

/**Validation Update Reset Password Body*/
export const validationBodyResetPassword = {
  code: Joi.string().required(),
  password: Joi.string()
    .min(8)
    .max(20)
    .regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})"))
    .required(),
};
export const createValidationBodyUser = {
  username: Joi.string().required(),
  type: Joi.valid("ADMIN", "EMPLOYE", "VETERINAIRE").required(),
  password: Joi.string()
    .min(8)
    .max(20)
    .regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})"))
    .required(),
};

export const updateValidationBodyUser = {
  username: Joi.string().allow(),
};
