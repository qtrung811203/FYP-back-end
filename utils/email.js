const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1 - create a transporter (service)
  var transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2 - define the email options
  const mailOptions = {
    from: 'quoctrung-application <hello@quoctrung.io>',
    to: options.email,
    subject: options.subject,
    html: options.html || `<p>${options.message}</p>`,
  };
  // 3 - actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
