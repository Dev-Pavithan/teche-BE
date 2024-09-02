import nodemailer from 'nodemailer';

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service provider
  auth: {
    user: 'techeai24@gmail.com', // Your email address
    pass: 'ukistu20', // Your email password or app password
  },
});

export const sendMail = (from, subject, text) => {
  const mailOptions = {
    to: 'techeai24@gmail.com', 
    from,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
};
