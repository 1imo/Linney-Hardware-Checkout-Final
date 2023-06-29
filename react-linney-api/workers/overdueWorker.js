const { parentPort } = require("worker_threads")
const db = require("../db.js")
const nodemailer = require("nodemailer");
const {Worker} = require("worker_threads");

const emailWorker = new Worker(__dirname + "/emailWorker.js")




parentPort.on("message", async (message) => {
    // console.log(message.input)

    
    if(message === 1) {
        const date = new Date
        db.collection('users').get().then((querySnapshot) => {
            parentPort.postMessage("Running InventoryCheck")
            querySnapshot.forEach((doc) => {
              for(item in doc.data().onLoan) {
                if((date - item.date) >= 0) {
                    db.collection("users").doc(doc.id).update({
                        late: [...doc.data().late, item]
                    })

                    emailWorker.postMessage({recipient: req.body.email, messageType: "overdue", item: item.name})

                   
          
        
                }
              }
            })
          })
    }
})