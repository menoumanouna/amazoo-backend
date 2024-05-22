import nodemailer from "nodemailer";
import { Error } from "../../utils/helpres";
import APIError from "../../services/error";
import httpStatus from "http-status";

export const sendEmail = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, description } = req.body;

    if (!name || !email || !phoneNumber || !description) {
      throw new APIError(
        httpStatus.BAD_REQUEST,
        Error,
        "Détails requis manquants : Nom | Email | Numéro de téléphone | Contenu",
      );
    }

    let transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const htmlContent = `
        <html>
        <body>
            <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                    <th>Nom complet</th>
                    <td>${name}</td>
                </tr>
                <tr>
                    <th>Adresse email</th>
                    <td>${email}</td>
                </tr>
                <tr>
                    <th>Numéro de téléphone</th>
                    <td>${phoneNumber}</td>
                </tr>
                <tr>
                    <th>Contenu du message</th>
                    <td>${description}</td>
                </tr>
            </table>
        </body>
        </html>
    `;

    let mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: process.env.EMAIL_ADMIN,
      subject: "Contact site",
      html: htmlContent,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("Message envoyé : %s", info.messageId);
    res.status(200).json({
      status: httpStatus.OK,
      result: "success",
      data: `Email envoyé`,
    });
  } catch (err) {
    err.status = httpStatus.BAD_REQUEST;
    return next(err);
  }
};
