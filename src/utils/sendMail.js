const nodemailer = require("nodemailer");
/**
 * 通过user邮箱发送Mail到to的邮箱
 * @param data
 * @returns {Promise<void>}
 */
const sendMail = async (data) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.163.com",
    port: "465",
    secureConnection: true,
    auth: {
      user: process.env.user,
      pass: process.env.pass,
    },
  });

  data.from = `"${data.from}" ${process.env.user}`;
  await transporter.sendMail(data);
};

module.exports = sendMail;
