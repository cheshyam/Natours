const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText =require('html-to-text');

module.exports = class Email{
    constructor(user,url){
     this.to = user.email;
     this.firstName=user.name;
     this.url = url;
     this.from= `Milan Togadiya <${process.env.EMAIL_FROM}>`;
    }

    newTransport(){
        if(process.env.NODE_ENV === 'production '){
            console.log("development");
         return nodemailer.createTransport({
            service:'sendGrid',
            auth:{
                user:process.env.SENDGRID_USERNAME,
                pass:process.env.SENDGRID_PASSWORD
            }
         })
        }
        
        
        
        return nodemailer.createTransport({
            host:process.env.EMAIL_HOST,
            port:process.env.EMAIL_PORT,
            auth:{
                user:process.env.EMAIL_USERNAME,
                pass:process.env.EMAIL_PASSWORD 
            }
            
        });
    }

    async send(template, subject) {
        
        try{
            // 1) Render HTML based on a pug template
            const html = pug.renderFile(`${__dirname}/../views/eemail/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
            });
            
            const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                html,
                text: htmlToText.fromString(html)
            };
            
            // 3) Create a transport and send email
            await this.newTransport().sendMail(mailOptions);
        }catch(err){
            console.log(err);
        }     
    } 
     
    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
        
    }   
    
    async sendResetPassword(){
        await this.send('passwordReset','your password is reset into 10 minutes')
    }
}







