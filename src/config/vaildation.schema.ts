import Joi from 'joi';

export const validation = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
});
