import { useState, useRef, useEffect, useContext } from "react"
import axios from "axios"
import {useCookies} from 'react-cookie';
import DevContext from "../context/DevContext"



export default function Onboarding() {
    const fn = useRef()
    const ln = useRef()
    const join = useRef()
    const create = useRef()
    const varVal = useRef()
    const [joinType, setJoinType] = useState(0)
    const placeholders = ["Join Code:", "Organisation Name:"]
    const [cookies, setCookies] = useCookies()
    const DevCtx = useContext(DevContext)

    const [content, setContent] = useState(<form onSubmit={(e) => submit(e)}>
    <h4>Onboarding</h4>
    <input type="text" placeholder="First Name:" ref={fn}/>
    <input type="text" placeholder="Last Name:" ref={ln}/>
    <br />
    <input type="radio" id="join" name="option" value="join" onClick={() => setJoinType(0)}/>
    <label for="join">Join Organisation</label>
    <input type="radio" id="create" name="option" value="create" onClick={() => setJoinType(1)}/>
    <label for="create">Create Organisation</label>
    <input type="text" placeholder={placeholders[joinType]} ref={varVal}/>
    <button type="submit">Continue</button>
</form>)

useEffect(() => {
    console.log(joinType)
}, [joinType])


    console.log(cookies._auth)
    const uuid = cookies._auth
    const lastSignIn = cookies._auth_storage
    console.log(uuid, lastSignIn)

    const submit = async (e) => {
        e.preventDefault()
        

        console.log(fn.current.value,
            ln.current.value,
            joinType,
            varVal.current.value)

            try {
                axios.post(DevCtx.apiUrl+"/api/helper/usr/update", {
                    uuid: uuid,
                    lastSignIn: lastSignIn,
                    fn: fn.current.value,
                    ln: ln.current.value,
                    joinType: joinType,
                    varVal: varVal.current.value
                })
            } catch(e) {
                console.log(e)

                if(e.response.status === 500) {
                    setContent(<h2>Incorrect SignUp Code</h2>)

                    setTimeout(() => {
                        <form onSubmit={(e) => submit(e)}>
                            <h4>Onboarding</h4>
                            <input type="text" placeholder="First Name:" ref={fn}/>
                            <input type="text" placeholder="Last Name:" ref={ln}/>
                            <br />
                            <input type="radio" id="join" name="option" value="join" onClick={() => setJoinType(0)}/>
                            <label for="join">Join Organisation</label>
                            <input type="radio" id="create" name="option" value="create" onClick={() => setJoinType(1)}/>
                            <label for="create">Create Organisation</label>
                            <input type="text" placeholder={placeholders[joinType]} ref={varVal}/>
                            <button type="submit">Continue</button>
                        </form>
                    }, 1500)
                }
            }

        

    

    }





    return <form onSubmit={(e) => submit(e)}>
    <h4>Onboarding</h4>
    <input type="text" placeholder="First Name:" ref={fn}/>
    <input type="text" placeholder="Last Name:" ref={ln}/>
    <br />
    <input type="radio" id="join" name="option" value="join" onClick={() => setJoinType(0)}/>
    <label for="join">Join Organisation</label>
    <input type="radio" id="create" name="option" value="create" onClick={() => setJoinType(1)}/>
    <label for="create">Create Organisation</label>
    <input type="text" placeholder={placeholders[joinType]} ref={varVal}/>
    <button type="submit">Continue</button>
</form>
}