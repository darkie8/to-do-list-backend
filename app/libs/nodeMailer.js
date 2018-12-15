const nodemailer = require('nodemailer');
var events = require('events');
var em = new events.EventEmitter();
const issue_tracking_mail = require('./../../config/mailConfig')
const {
    google
} = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    issue_tracking_mail.web.client_id,
    issue_tracking_mail.web.client_secret,
    issue_tracking_mail.web.redirect_uris[0]
  );
  oauth2Client.setCredentials({
    refresh_token:  issue_tracking_mail.web.refreshToken
});
 async function messageSend(from, to, subject, message, html_element) {
    const accessToken = await oauth2Client.getAccessToken()
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: from,
            clientId: issue_tracking_mail.web.client_id,
            clientSecret: issue_tracking_mail.web.client_secret,
            refreshToken: issue_tracking_mail.web.refreshToken,
            accessToken: accessToken.token
          //  ,accessToken: accessToken
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: from, // sender address
        to: to, // list of receivers
        subject: `${subject}`, // Subject line
        text: `${message}`, // plain text body
        html: `${html_element}`,
        priority: 'high'
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, response) => {
        error ?  em.emit('mailsend', false) :  em.emit('mailsend', true);;
    
        transporter.close();
       
   });
  
};


module.exports = {
    messageSend: messageSend,
    em: em
}