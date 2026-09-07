import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(3400),
  APP_NAME: Joi.string().default("LumiSchool"),
  FRONTEND_URL: Joi.string().uri().required(),

  // Database
  MONGODB_URI: Joi.string().required(),

  // JWT
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default("8h"),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default("7d"),

  // Redis
  REDIS_URL: Joi.string().required(),

  // MPESA Daraja
  MPESA_CONSUMER_KEY: Joi.string().required(),
  MPESA_CONSUMER_SECRET: Joi.string().required(),
  MPESA_SHORTCODE: Joi.string().required(),
  MPESA_PASSKEY: Joi.string().required(),
  MPESA_CALLBACK_URL: Joi.string().uri().required(),
  MPESA_ENV: Joi.string().valid("sandbox", "production").default("sandbox"),

  // Africa's Talking SMS
  AFRICASTALKING_API_KEY: Joi.string().default(""),
  AFRICASTALKING_USERNAME: Joi.string().default("sandbox"),

  // AWS S3 / Cloudflare R2
  AWS_ACCESS_KEY_ID: Joi.string().default(""),
  AWS_SECRET_ACCESS_KEY: Joi.string().default(""),
  AWS_S3_BUCKET: Joi.string().default("lumischool-uploads"),
  AWS_REGION: Joi.string().default("af-south-1"),

  // SendGrid
  SENDGRID_API_KEY: Joi.string().default(""),
});
