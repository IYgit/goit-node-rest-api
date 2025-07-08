
import nodemailer from 'nodemailer';

const config = {
    host: 'smtp.ukr.net',
    port: 465,
    secure: true,
    auth: {
        user: 'iyanc@ukr.net',
        pass: process.env.UKR_NET_PASSWORD,
    },
};

const transporter = nodemailer.createTransport(config);

export const sendEmail = async ({ to, subject, html }) => {
    const email = {
        from: 'iyanc@ukr.net',
        to,
        subject,
        html,
    };

    await transporter.sendMail(email);
};