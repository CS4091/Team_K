const nodemailer = require("nodemailer");

const sendEmail = async (userEmail, token) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "minerboard4@gmail.com",
                pass: "yryj lozz yvye tdop"
            },
        })
        const mail = {
            from: "minerboard4@gmail.com",
            to: userEmail,
            subject: "Verify your Email",
            html: `
                <div>
                    <h2>hello nerd: {token}</h2>
                </div>
                `,
        }

        await transporter.sendMail(mail)
        console.log("verification sent too: ", userEmail)
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = sendEmail