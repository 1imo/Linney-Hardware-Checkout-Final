import { createContext, useMemo, useState } from "react";
import {useCookies} from 'react-cookie';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSignOut } from "react-auth-kit";
import { useEffect } from "react";


const UsrContext = createContext();

export function UsrContextHandler(props) {
    const [cookies, setCookies] = useCookies()
    const navigate = useNavigate()
    const logOut = useSignOut()

    let apiUrl = "https://7218-2a00-23a8-843-c701-688c-2c95-cdad-9035.ngrok-free.app"


    

    const [firstName, setFirstName] = useState()
    const [lastName, setLastName] = useState()
    const [cookieExpiryDate, setCookieExpiryDate] = useState()
    const [uuid, setUuid] = useState()



useEffect(() => {
    try {
        setFirstName(cookies["_auth_state"].fn)
        setLastName(cookies["_auth_state"].ln)
        setCookieExpiryDate(cookies["_auth_storage"])
        setUuid(cookies["_auth"])
    } catch(e) {
        console.log(e)
    }
}, [])

// setUuid(cookies["_auth"])

let currentUuid = cookies["_auth"]

    console.log(cookies)

    const updateCookies = async () => {
        try {
            let res = await axios.post(apiUrl +"/api/helper/manageAccount", {
                cookieExpiryDate,
                uuid
            })

            console.log(res.data)
        } catch(e) {
            console.log("ERR")
            signOut()
        }

    }

    const verifyUser = async () => {
        try {
            
            let userData = getUserData()

            axios.post(apiUrl + "/api/helper/service/verify", {
                userData: userData,
                uuid,
                cookieExpiryDate,
            })


        } catch(e) {
            console.log()
        }
    }

    const getUserData = async () => {
        try {
            let userData = await axios.get("http://ip-api.com/json/?fields=status,message,continent,countryCode,region,city,district,zip,lat,lon,timezone,offset,isp,org,as,proxy,query")
            console.log(userData.data)
            return userData.data
        } catch(e) {
            return {}
        }
    }
        
    

    const signOut = () => {
        logOut()
        navigate("/auth/login")

    }

    




    const Context = {
        firstName,
        lastName,
        cookieExpiryDate,
        uuid,
        updateCookies,
        verifyUser,
        getUserData,
        signOut,
        currentUuid
        
    }

    return <UsrContext.Provider value={Context}>
        {props.children}
        </ UsrContext.Provider>
}

export default UsrContext


