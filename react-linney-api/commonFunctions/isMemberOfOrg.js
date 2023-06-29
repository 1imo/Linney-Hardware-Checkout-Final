const db = require("../db.js")

async function isMemberOf(org, user) {
    if(!org || !user) {
        return false
    }
    let res = await db.collection("users").doc(user).collection("memberOf").where("org", ">=", "").get()
    containsString = res.docs.some(doc => doc.get('org').includes(org))

    return containsString
    
}

module.exports = isMemberOf