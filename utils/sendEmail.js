// install nodemailer which is a mailing service taht uses sendgrid...can be used with other apps as well.
const nodemailer = require('nodemailer');

const sendEmail = (options) => {
    // the transporter takes in a set of properties/params
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth:{
            user: process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    })
    // we will be setting the above properties by creating a sendgrid account and then do that there
    // goto sendgrid.com and create the account
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject:options.subject,
        html:options.text
    }

    transporter.sendMail(mailOptions, function(err, info){
        if(err){
            console.log("error sending mail",err);
        }else{
            console.log("sent email info.", info);
        }
    })
}

module.exports = sendEmail;