import nodemailer from "nodemailer";

export const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "yeajcwgbvqcj2izd@ethereal.email",
      pass: "ypBN3PuvSTaZ6qJt37",
    },
  });

  const info = await transporter.sendMail({
    from: '"Fred Foo" <foo@example.com>',
    to,
    subject: "hehe",
    html,
  });

  console.log("Message sent", info.messageId);

  console.log("Preview URL", nodemailer.getTestMessageUrl(info));
};
