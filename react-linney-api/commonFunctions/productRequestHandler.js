const db = require("../db")
const { Worker } = require("worker_threads")
const emailWorker = new Worker("./workers/emailWorker.js")



async function productRequestHandler(item, user, org, quantity) {
    console.log("BELOW")
    console.log(item, user, org)
    try {
        db.collection("orgs").doc(org).collection("products").doc(item).get().then(async querySnapshot => {
            console.log(querySnapshot.data())

            let product = querySnapshot.data()

            if(parseInt(product.quantity) >= parseInt(quantity)) {
                console.log("ALLOWED")

                let id = await uuidGen(item, user, org)
                console.log(id)


                
                db.collection("orgs").doc(org).collection("pendingProductRequests").doc(id).set({
                    item,
                    user,
                    quantity,
                    id,
                    name: product.name,
                    org
                })

                db.collection("users").doc(user).collection("requests").doc(id).set({
                    item,
                    org,
                    quantity,
                    id,
                    name: product.name,
                }).then(async() => {



                    
                   db.collection("users").doc(user).get().then(querySnapshot => {
                    db.collection("orgs").doc(org).collection("products").doc(item).get().then(doc => {
                        emailWorker.postMessage({recipient: querySnapshot.data().email, messageType: "request", items: [doc.data().name]})

                    })
                   })

                })
            } else {
                throw new Error("Insufficient quantity")
            }

            return true 
        })
    } catch(e) {
        return false
    }
}

const uuidGen = async (item, user, org) => {
    const uuid = []
    for (let i = 0; i < 32; i++) {
        let type = Math.random() - 0.5

        if(type > 0) {
            uuid.push(String.fromCharCode(Math.floor(Math.random() * 26) + 65))
        } else {
            uuid.push(String.fromCharCode(Math.floor(Math.random() * 10) + 48))
        }
    }

    

    let querySnapshot = await db.collection("orgs").doc(org).collection("pendingProductRequests").where('id', '>=', "").get();
    let containsString = querySnapshot.docs.some(doc => doc.get('id').includes(uuid.join("")));
    if (!containsString) {
        return uuid.join("")
    } else {
        uuidGen()
    }

}

module.exports = productRequestHandler