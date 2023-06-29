const { parentPort } = require("worker_threads")
const nodemailer = require("nodemailer");
const ejs = require('ejs')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'timhoy05@gmail.com',
      pass: ''
    }
  })

const url = 'https://a6ba-2a00-23a8-843-c701-688c-2c95-cdad-9035.ngrok-free.app'

parentPort.on("message", async (message) => {

    const {recipient, messageType} = message
    let date = new Date()

    let embeddedLink = ""

    switch(messageType) {
        case "verify":
            embeddedLink = url + "/usr/verify/" + recipient + ";" + date

            ejs.renderFile(__dirname + "/../views/email.ejs", {link: embeddedLink}, (err, data) => {
                const mailOptions = {
                  from: 'your_email@gmail.com',
                  to: recipient,
                  subject: "Robot?",
                  html: data
                };

                
                
            transporter.sendMail(mailOptions, (error, info) => {
                console.log('Email sent: ' + info.response);
                    
                })
            })

            break
        
            case "overdue":
                ejs.renderFile(__dirname + "/../views/lateEmail.ejs", {link: embeddedLink, name: message.item }, (err, data) => {
                const mailOptions = {
                  from: 'your_email@gmail.com',
                  to: recipient,
                  subject: "Overdue Item",
                  html: data
                };
            
            
                transporter.sendMail(mailOptions, (error, info) => {
                    console.log('Email sent: ' + info.response);
                    res.status(200).send('Email sent successfully');
                
                });
            })

            case "request":

            ejs.renderFile(__dirname + "/../views/requestEmail.ejs", {link: embeddedLink, items: message.items }, (err, data) => {
              const mailOptions = {
                from: 'your_email@gmail.com',
                to: recipient,
                subject: "Item Request Notification",
                html: data
              };
          
          
              transporter.sendMail(mailOptions, (error, info) => {
                  console.log('Email sent: ' + info.response);
                  res.status(200).send('Email sent successfully');
              
              });
          })

          case "accepted":

            ejs.renderFile(__dirname + "/../views/acceptedEmail.ejs", {item: message.item }, (err, data) => {
              const mailOptions = {
                from: 'your_email@gmail.com',
                to: recipient,
                subject: "Come And Collect Now",
                html: data
              };
          
          
              transporter.sendMail(mailOptions, (error, info) => {
                  console.log('Email sent: ' + info.response);
                  console.log(error)
                  res.status(200).send('Email sent successfully');
              
              });
          })

            
        }

        
    })


    

    


  
