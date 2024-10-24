const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'learnfuse.ai@gmail.com',
    pass: process.env.EMAIL_PASS || 'ryjv agbg blki pzfx', // make ENV
  },
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'learnfuse.ai@gmail.com',
      to: process.env.RECIPIENT_EMAIL || 'learnfuse.ai@gmail.com',
      subject: `Contact Form Submission from ${name}`,
      text: `
                Name: ${name}
                Email: ${email}
                Message: ${message}
            `,
      html: `
                <h2>Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong> ${message}</p>
            `,
    };

    await transporter.sendMail(mailOptions);

    // Remove log
    console.log('Contact form submission:', { name, email, message });

    res.json({
      success: true,
      message: 'Message sent successfully!',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
    });
  }
});

module.exports = router;
