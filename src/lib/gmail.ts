import nodemailer from 'nodemailer';

// Create Gmail transporter
export const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
gmailTransporter.verify((error, success) => {
  if (error) {
    console.error('Gmail transporter verification failed:', error);
  } else {
    console.log('Gmail transporter is ready to send emails');
  }
});
