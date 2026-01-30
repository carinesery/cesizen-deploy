import nodemailer from "nodemailer";

export const sendConfirmationEmail = async (to: string, confirmUrl: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: parseInt(process.env.MAILTRAP_PORT!),
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"CESIZen" <no-reply@cesizen.com>',
    to,
    subject: "Confirme ton email",
    html: `
      <p>Bonjour,</p>
      <p>Merci de t'être inscrit. Clique sur ce lien pour confirmer ton email :</p>
      <a href="${confirmUrl}">${confirmUrl}</a>
    `,
  });
};