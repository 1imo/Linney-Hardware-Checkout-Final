const { parentPort } = require("worker_threads")
const db = require("../db.js")


parentPort.on("message", async (message) => {
    // console.log(message.input)

    
    if(message === 1) {
        db.collection('users').get().then((querySnapshot) => {
            parentPort.postMessage("Running CleanUp")
            querySnapshot.forEach((doc) => {
                if (!doc.data().verified) {
                    const date = new Date()
                    const signInLast = new Date(doc.data().lastSignIn)
                    const longerThan48 = (date - signInLast) / 60 * 60 * 1000 > 48 
                    if(longerThan48) {
                        db.collection("users").doc(doc.id).delete()
                    }

                }
            })
          })
    }
})