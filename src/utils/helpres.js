import nodemailer from "nodemailer";
import Email from "email-templates";
import { Sequelize } from "sequelize-typescript";
import fs from "fs";
import HTTPStatus from "http-status";
import randomstring from "randomstring";

export const Error = "error";
export const Success = "success";
export const ROLE_ADMIN = "ADM";
export const ROLE_VETERINARIAN = "VTR";
export const ROLE_VISITOR = "VST";
export const ROLE_EMPLOYEE = "EMP";

export const hasRole = (user, roles) => {
  const userRole = user.type;
  if (!userRole) {
    return false;
  }
  return roles.some((role) => userRole === role);
};

const addDays = (date, days = 1) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const generateCode = () => {
  return randomstring.generate({
    length: 16,
    charset: "alphanumeric",
  });
};

require("dotenv").config();
let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL, // generated ethereal user
    pass: process.env.SMTP_PASSWORDEMAIL, // generated ethereal password
  },
  tls: { rejectUnauthorized: true },
});

export const sendMail = async ({
  title,
  to,
  from,
  subject,
  type,
  html,
  attachments,
  locals,
}) => {
  return new Promise((resolve, reject) => {
    try {
      const email = new Email({
        transport: transporter,
        send: true,
        preview: false,
      });

      email
        .send({
          template:
            type === "signup"
              ? "signup"
              : type === "pwd"
                ? "sendReiniPwd"
                : "origin",
          locals,
          message: {
            from: "Dokatis <admin@dokatisdev.com>",
            to: to,
            subject: subject,
            attachments: attachments,
          },
        })
        .then((e) => {
          resolve(true);
        })
        .catch((e) => {
          resolve(false);
        });
    } catch (e) {
      throw e;
    }
  });
};

export const formatJSONResponse = (code, type, message, data = null) => {
  return {
    code,
    type,
    message,
    data,
  };
};

export function field(key) {
  return key;
}

export const getFieldForMssql = (table, column) => `${table}.${column}`;

export const searchInsensitive = (fieldPath, targetField, value) =>
  Sequelize.where(
    Sequelize.literal(
      `${getFieldForMssql(fieldPath.join("->"), targetField)} `,
    ),
    "like",
    `%${value}%`,
  );
export const searchInsensitiveN = (fieldPath, targetField, value) =>
  Sequelize.where(
    Sequelize.literal(
      `${getFieldForMssql(fieldPath.join("->"), targetField)} `,
    ),
    "=",
    value,
  );
export const searchInsensitiveDate = (fieldPath, targetField, value, op) =>
  Sequelize.where(
    Sequelize.literal(
      `${getFieldForMssql(fieldPath.join("->"), targetField)} `,
    ),
    op,
    value,
  );
/**
 * Ensure keys of given object belongs to T
 */
export function fields(obj) {
  return obj;
}

/**
 * Format directly column name from join tables for sequelize group options
 * Workaround since column name is wrong (. separator instead of ->) when putting all models in group params like in order property
 */
export const getFieldForGroup = (fieldPath, targetField, castAs) => {
  const col = Sequelize.col(`${fieldPath.join("->")}.${targetField}`);
  if (castAs) return Sequelize.cast(col, castAs);
  return col;
};

export const isObject = (obj) => {
  return obj != null && obj.constructor.name === "Object";
};

export const addDirectory = (path) => {
  if (!fs.existsSync(path)) fs.mkdirSync(path);
};

export const addDocument = async (file, id, type) => {
  // eslint-disable-next-line camelcase
  await addDirectory(`./public/images/${type}`);
  await addDirectory(`./public/images/${type}/${id}`);
  const readAndWriteFile = (file) => {
    fs.readFile(file.path, (error, data) => {
      fs.writeFile(
        `./public/images/${type}/${id}/${file.originalname}`,
        data,
        (error) => {
          if (error) {
            return formatJSONResponse(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              "error",
              error,
            );
          }
        },
      );
    });
  };
  return await readAndWriteFile(file);
};
