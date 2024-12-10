import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: 465, // Use 587 for local gmail email ids
//     secure: true, // Use false for local gmail email ids
//     requireTLS: true,
//     // tls: {
//     //     rejectUnauthorized: false
//     //   },
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
//     logger: true
// });

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587, // Use 587 for local gmail email ids
    secure: false, // Use false for local gmail email ids
    requireTLS: true,
    // tls: {
    //     rejectUnauthorized: false
    //   },
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    logger: true
});

const sendForgotPassword = (link: any, email: string) => {
    return new Promise((resolve, reject) => {
        const message = {
            from: process.env.SENDER_EMAIL_ADDRESS,
            to: email,
            subject: 'Reset Password',
            text: `To reset your password, please click the link below.\n\n ${link}`
        };

        //send email
        transporter.sendMail(message, function (err, info) {
            if (err) {
                console.log(err);
                resolve(false);
            }
            else {
                console.log('sent');
                resolve(true);
            }
        });
    });
}

const sendActivationEmail = (link: any, email: string) => {
    return new Promise((resolve, reject) => {
        const message = {
            from: process.env.SENDER_EMAIL_ADDRESS,
            to: email,
            subject: 'Verify Email',
            text: `Verify your email to activate your account, please click on the link below to activate.\n\n ${link}`
        };

        //send email
        transporter.sendMail(message, function (err, info) {
            if (err) {
                console.log(err);
                resolve(false);
            }
            else {
                console.log('sent');
                resolve(true);
            }
        });
    });
}

const sendInvitationEmail = (link: any, email: string) => {
    return new Promise((resolve, reject) => {
        const message = {
            from: process.env.SENDER_EMAIL_ADDRESS,
            to: email,
            subject: 'Invitation Email',
            text: `You are invited by a Seller, please click on the link below to access all products under this seller.\n\n ${link}`
        };

        //send email
        transporter.sendMail(message, function (err, info) {
            if (err) {
                console.log(err);
                resolve(false);
            }
            else {
                console.log('sent');
                resolve(true);
            }
        });
    });
}

const sendEmail = (html: any, email: any, subject: any, cc?: any, attachment?: any) => {
    return new Promise((resolve, reject) => {
        const message = {
            from: process.env.SENDER_EMAIL_ADDRESS,
            to: email,
            subject: subject,
            html: html,
            cc: cc,
            attachments: attachment
        };

        //send email
        transporter.sendMail(message, function (err, info) {
            if (err) {
                console.log(err);
                resolve(false);
            }
            else {
                console.log('sent');
                resolve(true);
            }
        });
    });
}

export { sendForgotPassword, sendEmail, sendActivationEmail, sendInvitationEmail }