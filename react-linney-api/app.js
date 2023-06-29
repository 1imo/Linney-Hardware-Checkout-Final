const express = require("express");
// const passportSetup = require("./passport")
const cors = require("cors");
const multer  = require('multer')
const nodemailer = require("nodemailer");
const ejs = require('ejs');
const db = require("./db.js")
const isMemberOf = require("./commonFunctions/isMemberOfOrg")
const productRequestHandler = require("./commonFunctions/productRequestHandler")
const bcrypt = require("bcrypt");
const { Worker } = require("worker_threads")
const fs = require("fs")
const path = require('path');
const storage = multer.diskStorage({
    destination: (d, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (d, file, cb) => {
      cb(null, file.originalname);
    }
  });
  const upload = multer({ storage: storage });

const clientUrl =  "https://a6ba-2a00-23a8-843-c701-688c-2c95-cdad-9035.ngrok-free.app"

const cleanUpWorker = new Worker("./workers/cleanupWorker.js")
const overdueWorker = new Worker("./workers/overdueWorker.js")
const emailWorker = new Worker("./workers/emailWorker.js")
  
function scheduleFunction() {
  const targetTime = new Date();
  targetTime.setHours(0);
  targetTime.setMinutes(0);
  targetTime.setSeconds(0);

  let timeUntilTarget = targetTime - new Date();
  console.log(timeUntilTarget)


  if (timeUntilTarget < 0) {
    timeUntilTarget += 24 * 60 * 60 * 1000; 
  }

  setInterval(() => {
    const currentTime = new Date();
    if (currentTime >= targetTime) {
      cleanUpWorker.postMessage(1)
      overdueWorker.postMessage(1)
      targetTime.setDate(targetTime.getDate() + 1);
    }
  }, timeUntilTarget);
}

scheduleFunction();

// const authRoute = require("./routes/auth")
const app = express()
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.use(cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE"
  })
);


//authentication should have been included through the use of middleware throughout

const auth = async (req, res, next) => {
    console.log("CHECK")
    next()
}

app.use(auth)

app.post("/api/helper/login", upload.none(), async (req, res) => {
    console.log(req.body)

    let querySnapshot = await db.collection("users").where('email', '>=', "").get();
    let containsString = querySnapshot.docs.some(doc => doc.get('email').includes(req.body.email));
    if (!containsString) {
        return res.sendStatus(409)
    }
    // console.log(containsString)

    db.collection("users").where("email", "==", req.body.email).get()
            .then((querySnapshot) => {
                querySnapshot.docs.map(doc => {
                    console.log(doc.data())

                    let user = doc.data()

                    console.log(doc.data().verified)

                    if(!doc.data().verified) {
                        return res.send("here").sendStatus(401)
                    }



                    bcrypt.compare(req.body.password, user.password, (err, result) => {
                        if(result) {
                            verifyUser(doc.id, req.body.geo).then(result => {
                                if(!result) {
                                    emailWorker.postMessage({recipient: user.email, messageType: "verify"})
                                    return res.sendStatus(403)
                                } else {
                                    return res.send({
                                        token: doc.data().uuid,
                                        userData: {
                                            fn: user.fn ?? 0,
                                            ln: user.ln ?? 0,
                                            email: user.email,
                
                
                                
                                        }
                                    })

                                }
                            })
                        } else {
                            res.sendStatus(401)
                        }
                    })
                    
                })
            })

})

app.post("/api/helper/login/link", upload.none(), async (req, res) => {
    console.log(req.body)
    let dateNow = new Date()

    try {
        let data = req.body.token.split(";")
        console.log(data)
        dateNow = new Date()
        const requestedAt = new Date(data[1])
        const diff = Math.abs(dateNow - requestedAt)
        const within10Minutes = diff <= 600000

        console.log(within10Minutes)
        console.log(diff)
        console.log(dateNow, requestedAt)

        if(within10Minutes) {

            let querySnapshot = await db.collection("users").where('email', '>=', "").get();
            let containsString = querySnapshot.docs.some(doc => doc.get('email').includes(data[0]));
            if (!containsString) {
                return res.sendStatus(409)
            }


            db.collection("users").where("email", "==", data[0]).get()
            .then((querySnapshot) => {
                querySnapshot.docs.map(doc => {
                    console.log(doc.data())

                    let user = doc.data()


                    db.collection("users").doc(doc.id).update({
                        verified: true
                    })

                    db.collection("users").doc(doc.id).collection("geo").add({
                        ...req.body.geo
                    })

                    

                    return res.send({
                        token: doc.data().uuid,
                        userData: {
                            fn: user.fn ?? 0,
                            ln: user.ln ?? 0,
                            email: user.email,


                
                        }
                    })
                })
            })

            // console.log(userData)

            


                } else {
                    return res.sendStatus(500)
                }
   } catch(e) {
        console.log(e)
    }
})

app.post("/api/helper/verify/link/manager", upload.none(), async (req, res) => {

    let token = req.body.email.split(";")
    const date = new Date()

    let querySnapshot = await db.collection("users").where('email', '>=', "").get();
    let containsString = querySnapshot.docs.some(doc => doc.get('email').includes(token[0]))
    if(containsString) {
        emailWorker.postMessage({recipient: token[0], messageType: "verify"})

    res.sendStatus(200)
    } else {
        res.sendStatus(409)
    }


    
})

app.post("/api/helper/register", upload.none(),  async (req, res) => {
    console.log(req.body)

    console.log(db)

    let querySnapshot = await db.collection("users").where('email', '>=', "").get();
    let containsString = querySnapshot.docs.some(doc => doc.get('email').includes(req.body.email));
        if (containsString) {
            return res.sendStatus(409)
        } 

    let uuid = []
    const createUUID = async () => {
        for (let i = 0; i < 16; i++) {
            let type = Math.random() - 0.5

            if(type > 0) {
                uuid.push(String.fromCharCode(Math.floor(Math.random() * 26) + 65))
            } else {
                uuid.push(String.fromCharCode(Math.floor(Math.random() * 10) + 48))
            }
        }

        console.log(uuid)

        let querySnapshot = await db.collection("users").where('uuid', '>=', "").get();
        let containsString = querySnapshot.docs.some(doc => doc.get('uuid').includes(uuid.join("")));
        if (containsString) {
          createUUID()
        } else {
            db.collection("users").doc(uuid.join("")).set({
                email: req.body.email,
                uuid: uuid.join(""),
                password: bcrypt.hashSync(req.body.password, 10),
                verified: false,
                lastSignIn: req.body.lastSignIn
            })

            db.collection("users").doc(uuid.join("")).collection("geo").add({
                ...req.body.geo
            })
        }

        
    }

    createUUID()

    const date = new Date()

    emailWorker.postMessage({recipient: req.body.email, messageType: "verify"})

    



    // res.sendStatus(200)
})

app.post("/api/helper/usr/update", upload.none(), (req, res) => {
    console.log(req.body)
    const uuid = []

    if(req.body.joinType === 1) {
        const createUUID = async () => {
            for (let i = 0; i < 16; i++) {
                let type = Math.random() - 0.5
    
                if(type > 0) {
                    uuid.push(String.fromCharCode(Math.floor(Math.random() * 26) + 65))
                } else {
                    uuid.push(String.fromCharCode(Math.floor(Math.random() * 10) + 48))
                }
            }
    
                
            let querySnapshot = await db.collection("orgs").where('uuid', '>=', "").get();
            let containsString = querySnapshot.docs.some(doc => doc.get('uuid').includes([uuid.join("").slice(0, 8), uuid.join("").slice(8, 16)].join("-")));
            if (containsString) {
              createUUID()
            } else {

                const genHyphCode = (size) => {
                    const code = []
                    for(let i = 0; i < size; i++) {
                        let type = Math.random() - 0.5
    
                        if(type > 0) {
                            code.push(String.fromCharCode(Math.floor(Math.random() * 26) + 65))
                        } else {
                            code.push(String.fromCharCode(Math.floor(Math.random() * 10) + 48))
                        }
                    }
                    // console.log(code)

                    let formattedCode = []

                    for(let i = 0; i < code.length; i++) {
                        if(i % 4 == 0) {
                            formattedCode.push(code.join("").slice(i, i + 4))
                        }
                    }

                    // console.log(formattedCode.join("-"))

                    codeType = size == 8 ? "joinCode" : "adminCode"

                    db.collection("orgs").where(codeType, "==", 
                    formattedCode.join("-")).get().then(querySnapshot => {
                        if(querySnapshot.docs.length == 0) {
                            // console.log(formattedCode.join("-"))
                            // return formattedCode.join("-")

                            if(size === 16) {
                                db.collection("orgs").doc(orgId).update({
                                    adminCode: formattedCode.join("-")
                                })
                            } else {
                                db.collection("orgs").doc(orgId).update({
                                    joinCode: formattedCode.join("-")
                                })
                            }

                        } else {
                            genHyphCode(size)
                        }
                    })
                }





                let orgId = [uuid.join("").slice(0, 8), uuid.join("").slice(8, 16)].join("-")
                console.log(orgId, req.body.varVal)
                db.collection("orgs").doc(orgId).set({
                    name: req.body.varVal,
                    uuid: orgId
                }).catch(e => {
                    console.log(e)
                })

                genHyphCode(16)
                genHyphCode(8)

                db.collection("orgs").doc(orgId).collection("admins").add({
                    user: req.body.uuid
                }).catch(e => {
                    console.log(e)
                })

                let formattedCode = []

                for(let i = 0; i < uuid.length; i++) {
                    if(i % 8 == 0) {
                        formattedCode.push(uuid.join("").slice(i, i + 8))
                    }
                    console.log(formattedCode)
                }

                db.collection("users").doc(req.body.uuid).collection("memberOf")
                .add({
                    org: formattedCode.join("-")
                    
                })

               

            }
            
        }
        
        createUUID()
        
    } else {
        db.collection("orgs").where(req.body.varVal.length == 19 ? "adminCode" : "joinCode",
        "==", req.body.varVal).get().then(querySnapshot => {
            if(querySnapshot.docs.length == 0) {
                console.log(querySnapshot.docs)
                console.log("RETURN")
                return res.sendStatus(500)
            } else {
                uuid.push(querySnapshot.docs[0].id)
                console.log(uuid)
                if(req.body.varVal.length == 19) {
                    db.collection("orgs").doc(querySnapshot.docs[0].id)
                    .collection("admins").add({
                        user: req.body.uuid
                    })
                } else {
                    db.collection("orgs").doc(querySnapshot.docs[0].id)
                    .collection("users").add({
                        user: req.body.uuid
                    }).then(() => console.log("ADDED"))
                }

                db.collection("users").doc(req.body.uuid).collection("memberOf")
                .add({
                    org: uuid[0]

                })
            }
        })
    }

    db.collection("users").doc(req.body.uuid).update({
        fn: req.body.fn,
        ln: req.body.ln,
        lastSignIn: req.body.lastSignIn
    })

     
        
    // res.sendStatus(200)
})

app.post("/api/helper/manageAccount", upload.none(), (req, res) => {
    try {
        db.collection("users").doc(req.body.uuid).get().then(doc => {
            let data = doc.data()

            if(data.lastSignIn != req.body.lastSignIn) {
                return res.sendStatus(403)
            } else {
                res.send({
                    fn: data.fn,
                    ln: data.ln
                })
            }
        })
    } catch(e) {
        res.sendStatus(500)
    }
})

app.post("/api/helper/service/verify", upload.none(), (req, res) => {
    console.log(req.body)
    res.sendStatus(200)
})

async function verifyUser(uuid, data) {

    console.log(uuid, data)
    console.log("LOOK ABOVE")

    let newData = Object.entries(data)
    let recordedData = []
    let dataMean = []
    let ready = await db.collection('users').doc(uuid).collection("geo").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // console.log()
            recordedData.push(Object.entries(doc.data()))
            // return Object.entries(doc.data())
        
        })
        return true
    })

    if(ready) {
        // return true
        let likelihood = 0
            for(let y = 0; y < recordedData.length; y++) {
                for(let i = 0; i < Math.max(recordedData[y].length, newData.length) ; i++) {
                    for(let j = 0; j < Math.max(recordedData[y].length, newData.length); j++) {
                        if(recordedData[y][i][0] == newData[j][0]) {
                            if(recordedData[y][i][1] == newData[j][1]) {
                                likelihood+=100/16
                            
                                // I'd use Logical OR but I've a 60% keyboard
                            } else if (recordedData[y][i][0] == "lat" || recordedData[y][i][0] == "lon") {
                                if(recordedData[y][i][1] + 0.5 >= newData[j][1]) {
                                    likelihood+=100/16
                                } else if(recordedData[y][i][1] - 0.5 <=newData[j][1]) {
                                    likelihood+=100/16
                                }
                            }
                        }
                    }
                    if(i == Math.max(recordedData[y].length, newData.length) - 1) {
                        dataMean.push(likelihood)
                        likelihood = 0
                    }
                }
                if(y == recordedData.length - 1) {
                    console.log(dataMean)
                    if(dataMean.includes(100)) {
                        return true
                    } else {
                        let mean = dataMean.reduce((acc, curr) => acc + curr, 0) / dataMean.length
                        console.log(mean)
                        console.log("MEANN")
                        if(mean > 80) {
                            return true
                        } else {
                            return false
                            }
                        }

                    }

        }
        
    }
   
    }

app.post("/api/helper/manageOrgs", upload.none(), async (req, res) => {
    console.log(req.body)

    const adminOf = []

    let adminsOf = await db.collection("users").doc(req.body.uuid).collection("memberOf").get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            // console.log(doc.data())
            adminOf.push(doc.data().org)
            // console.log(adminsOf)
        })
        return true
    })

    let getData = async () => {
        let data = adminOf.map(async uuid => {
            let info = await db.collection("orgs").doc(uuid).get().then(doc => {
                return {name: doc.data().name, uuid:  uuid}
            })
            console.log(uuid)
            return info
        })
        console.log(adminOf)
        

        const results = await Promise.all(data)
        console.log(results)
        res.send(results)
        
        return results
    }

    if(adminOf) {
        console.log("SPLIT")
        console.log(adminOf)
        console.log(getData())
        // res.send(getData())
        // getData()

        
    }

    



    // res.send(adminsOf)
    


})

app.post("/api/helper/create", upload.fields([{ name: 'image' }, {name: "name"}, , {name: "description"}, {name: "quantity"}, {name: "org"}, {name: "category"}]), (req, res) => {

    console.log(req.body)

    const uuidGen = async () => {
        const uuid = []
        for (let i = 0; i < 16; i++) {
            let type = Math.random() - 0.5

            if(type > 0) {
                uuid.push(String.fromCharCode(Math.floor(Math.random() * 26) + 65))
            } else {
                uuid.push(String.fromCharCode(Math.floor(Math.random() * 10) + 48))
            }
        }

        

        let querySnapshot = await db.collection("orgs").doc(req.body.org).collection("products").where('uuid', '>=', "").get();
        let snap = await db.collection("orgs").doc(req.body.org).collection("products").get()
        snap.forEach(doc => console.log(doc.data()))
        console.log(snap.docs)
        // console.log(snap)
        let containsString = querySnapshot.docs.some(doc => doc.get('uuid').includes(uuid.join("")));
        if (!containsString) {
            db.collection("orgs").doc(req.body.org).collection("products").doc(uuid.join("")).set({
                uuid: uuid.join(""),
                name: req.body.name,
                description: req.body.description,
                quantity: req.body.quantity,
                org: req.body.org
            })

            
            fs.rename(req.files.image[0].path,  path.join('uploads/', uuid.join("")), (err) => {
                if (err) {
                  console.error(err);
                //   return res.send('Failed to rename file');
                } 

})
        } else {
            uuidGen()
        }

    }
    uuidGen()

    res.redirect(clientUrl + "/manage")
})


app.post("/api/helper/productInfo", upload.none(), async (req, res) => {
    console.log(req.body)

    if(!req.body.uuid) {
        return res.sendStatus(400)
    }
    let querySnapshot = await db.collection("users").doc(req.body.uuid).collection("memberOf").where('org', '>=', "").get()
    let containsString = querySnapshot.docs.some(doc => doc.get('org').includes(req.body.org))
    if(!containsString) {
        return res.sendStatus(403)
    } else {
        querySnapshot = await db.collection("orgs").doc(req.body.org).collection("products").where('uuid', '>=', "").get()
        containsString = querySnapshot.docs.some(doc => doc.get('uuid').includes(req.body.id))

        if(!containsString) {
            return res.sendStatus(404)
        } else {
            db.collection("orgs").doc(req.body.org).collection("products").doc(req.body.id).get().then(doc => {
                res.send(doc.data())
            })
            // res.send
        }
    }
    // res.sendStatus(200)
})

app.get("/api/helper/product/image/:id", (req, res) => {
    const uuid = req.params.id
    console.log("RE")
    console.log(uuid)
    res.sendFile(__dirname + '/uploads/' + uuid)
})



app.post("/api/helper/request/product", upload.none(), async (req, res) => {
    console.log(req.body)
    console.log("ABOVE")
    let r = await isMemberOf(req.body.org, req.body.uuid)
    if(r) {
        let verified = await verifyUser(req.body.uuid, req.body.geo)
        if(verified) {
            productRequestHandler(req.body.id, req.body.uuid, req.body.org, req.body.quantity).then(() => {
                db.collection("users").doc(req.body.uuid).get().then(doc => {
                    let email = doc.data().email
                    console.log(email)
                    return res.sendStatus(200)
                })

            })
        } else {
            return res.sendStatus(403)
        }
    } else {
        return res.sendStatus(401)
    }
    console.log(r)
})

app.post("/api/helper/manageRequests", upload.none(), async (req, res) => {
    console.log(req.body)
    let authorised = await isMemberOf(req.body.orgUuid, req.body.user)
    if(!authorised) {
        return res.sendStatus(401)
    }

    const data = []

    db.collection("orgs").doc(req.body.orgUuid).collection("pendingProductRequests").get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            data.push(doc.data())
        })
    }).then(() => {
        res.send(data)
    })

    // res.sendStatus(200)
})

app.post("/api/helper/product/request", upload.none(), async (req, res) => {
    console.log(req.body)
    let date = new Date()
    let newDate = new Date(date.getTime() + (72 * 60 * 60 * 1000))

    try {
        db.collection("orgs").doc(req.body.orgUuid).collection("pendingProductRequests").doc(req.body.transaction).get()
        .then(doc => {
            console.log(doc.data())
            db.collection("orgs").doc(req.body.orgUuid).collection("collectionReady").doc(req.body.transaction).set({
                ...doc.data(),
                dueDate: newDate
            })
            db.collection("orgs").doc(req.body.orgUuid).collection("products").doc(doc.data().item).get().then(querySnapshot => {
                console.log()
                let num = parseInt(querySnapshot.data().quantity) - parseInt(doc.data().quantity)
                db.collection("orgs").doc(req.body.orgUuid).collection("products").doc(doc.data().item).update({
                    quantity: num
                }).then(() => {
                    db.collection("orgs").doc(req.body.orgUuid).collection("pendingProductRequests").doc(req.body.transaction).delete()

                })
            })
            db.collection("users").doc(doc.data().user).collection("requests").doc(req.body.transaction).get().then(docum => {
                console.log(docum.data())

                db.collection("users").doc(doc.data().user).get().then(document => {
                    let email = document.data().email

                    emailWorker.postMessage({recipient: email, messageType: "accepted", item: doc.data().name})
                })

                db.collection("users").doc(doc.data().user).collection("collectionReady").doc(req.body.transaction).set({
                    ...docum.data(),
                    dueDate: newDate
                })

                db.collection("users").doc(doc.data().user).collection("requests").doc(req.body.transaction).delete().then(() => {
                    res.sendStatus(200)
                })

            })
        })
    } catch(e) {
        console.log(e)
        res.sendStatus(500)
    }
})
    

app.post("/api/helper/dash/data", upload.none(), async (req, res) => {
    
    if(!req.body.uuid) {
        return res.sendStatus(400)
    }

    let authorised = await verifyUser(req.body.uuid, req.body.geo)

    if(!authorised) {
        console.log(authorised)
        return res.sendStatus(403)
    }

    const readyForCollection = await db.collection("users").doc(req.body.uuid).collection("collectionReady").get().then(querySnapshot => {
        // querySnapshot.forEach(doc => {
        //     console.log("DATA")
        //     console.log(doc.data())
        // })
        console.log(querySnapshot.docs.length)
        return querySnapshot.docs.length
    })

    const pendingProductRequests = await db.collection("users").doc(req.body.uuid).collection("requests").get().then(querySnapshot => {
        console.log(querySnapshot.docs.length)
        return querySnapshot.docs.length

    })

    const itemsOnLoan = await db.collection("users").doc(req.body.uuid).collection("onLoan").get().then(querySnapshot => {
        console.log(querySnapshot.docs.length)
        return querySnapshot.docs.length
    })


    // console.log(req.body)
    res.send({readyForCollection, pendingProductRequests, itemsOnLoan})
})

app.post("/api/helper/user/requests", upload.none(), async (req, res) => {
    console.log(req.body)

    if(!req.body.uuid) {
        return res.sendStatus(400)
    }

    let authorised = await verifyUser(req.body.uuid, req.body.geo)

    if(!authorised) {
        return res.sendStatus(403)
    }

    db.collection("users").doc(req.body.uuid).collection("requests").get().then(querySnapshot => {
        console.log(querySnapshot.docs.length)
        let data = querySnapshot.docs.map(doc => doc.data())
        return res.send(data)
    })
    // res.sendStatus(200)
})

app.post("/api/helper/requests/remove", upload.none(), async (req, res) => {
    console.log(req.body)

    if(!req.body.uuid) {
        return res.sendStatus(400)
    }

    let authorised = await verifyUser(req.body.uuid, req.body.geo)

    if(!authorised) {
        return res.sendStatus(403)
    }

    db.collection("orgs").doc(req.body.org).collection("pendingProductRequests").doc(req.body.id).delete().then(() => {
        db.collection("users").doc(req.body.uuid).collection("requests").doc(req.body.id).delete()
    }).then(() => {
        res.sendStatus(200)
    })
})

app.post("/api/helper/usr/loaned", upload.none(), async (req, res) => {
    console.log(req.body)

    if(!req.body.uuid) {
        return res.sendStatus(400)
    }

    let authorised = await verifyUser(req.body.uuid, req.body.geo)

    if(!authorised) {
        return res.sendStatus(403)
    }

    db.collection("users").doc(req.body.uuid).collection("onLoan").get().then(querySnapshot => {
        let data = querySnapshot.docs.map(doc => doc.data())
        return res.send(data)
    })
    // res.sendStatus(200)
})

app.post("/api/helper/usr/collect", upload.none(), async (req, res) => {
    console.log(req.body)

    if(!req.body.uuid) {
        return res.sendStatus(400)
    }

    let authorised = await verifyUser(req.body.uuid, req.body.geo)

    if(!authorised) {
        return res.sendStatus(403)
    }

    db.collection("users").doc(req.body.uuid).collection("collectionReady").get().then(querySnapshot => {
        let data = querySnapshot.docs.map(doc => doc.data())
        return res.send(data)
    })
    // res.sendStatus(200)
})

app.post("/api/helper/collection", upload.none(), async (req, res) => {
    console.log(req.body)
    db.collectionGroup("collectionReady").get().then(querySnapshot => {
        querySnapshot.forEach((doc) => {
            // console.log(doc.id, " => ", doc.data());
            if(doc.data().id === req.body.transaction) {
                console.log("TRUE")
                console.log(doc.data())

                try {
                    db.collection("orgs").doc(doc.data().org).collection("collectionReady").doc(req.body.transaction).delete()
                    db.collection("users").doc(doc.data().user).collection("collectionReady").doc(req.body.transaction).delete()

                    db.collection("orgs").doc(doc.data().org).collection("onLoan").doc(req.body.transaction).set({
                        ...doc.data(),
                        setDate: new Date()
                    })

                    db.collection("users").doc(doc.data().user).collection("onLoan").doc(req.body.transaction).set({
                        ...doc.data(),
                        setDate: new Date()
                    }).then(() => {
                        return res.sendStatus(200)
                    })
                } catch(e) {
                    console.log(e)

                    
                }

            }
        })
        // console.log("SCAN")
        // console.log(querySnapshot.docs)
    })

    try {
        db.collectionGroup("onLoan").get().then(querySnapshot => {
            querySnapshot.forEach((doc) => {
                if(doc.data().id === req.body.transaction) {
                    console.log("TRUE LOANED")

                    db.collection("orgs").doc(doc.data().org).collection("onLoan").doc(req.body.transaction).delete()
                    db.collection("users").doc(doc.data().user).collection("onLoan").doc(req.body.transaction).delete()

                    db.collection("orgs").doc(doc.data().org).collection("products").doc(doc.data().item).get().then(snapshot => {
                        let num = parseInt(snapshot.data().quantity) + parseInt(doc.data().quantity)
                        db.collection("orgs").doc(doc.data().org).collection("products").doc(doc.data().item).update({
                            quantity: num
                        })

                    })
    
                    // return res.sendStatus(200)
                }
            })
        })

    } catch(e) {
        console.log(e)
    }

})

app.post("/api/fetch/products", upload.none(), async (req, res) => {
    console.log(req.body)
    let joinedRaw = await db.collection("users").doc(req.body.uuid).collection("memberOf").get()
    let joined = []
    joinedRaw.forEach(doc => {
        joined.push(doc.data().org)
    })

    const products = []
    console.log(joined)

    joined.forEach(async org => {
        let productsRaw = await db.collection("orgs").doc(org).collection("products").get()

        productsRaw.forEach(doc => {
            products.push(doc.data())
        })
        res.send(products)
    })

    
    // console.log(joinedRaw.data()) 
})



app.listen("5000", ()=>{
    console.log("server is running!")
})