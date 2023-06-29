import { useContext, useRef, useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import UsrContext from "../context/UsrContext"
import DevContext from "../context/DevContext"
import classes from "../components/footer.module.css"
import styles from "./auth.module.css"
import Footer from "../components/Footer"

export default function Register() {
    const emailRef = useRef()
    const passwordRef = useRef()
    const confirmPasswordRef = useRef()
    const [content, setContent] = useState(<section className={styles.content}>
        <h2>HEYYY</h2><form onSubmit={(e) => register(e)}>
        <input type="email" placeholder="Email:" ref={emailRef}/>
        <input type="password" placeholder="------" ref={passwordRef}/>
        <input type="password" placeholder="Confirm Password" ref={confirmPasswordRef}/>
        
            <button type="submit">Continue</button>
        </form></ section>)
    const UsrCtx = useContext(UsrContext)
    const DevCtx = useContext(DevContext)


    const register = async (e) => {
        e.preventDefault()
        let geo = await UsrCtx.getUserData()
        console.log(emailRef.current.value, passwordRef.current.value)
        if(passwordRef.current.value === confirmPasswordRef.current.value) {
            try {
                let res = await axios.post(DevCtx.apiUrl + "/api/helper/register", {
                    email: emailRef.current.value,
                    password: passwordRef.current.value,
                    geo: geo,
                    lastSignIn: new Date()
                })

                console.log(res.status)

                if (res.status === 200) {
                    setContent(<h2>An Email Has Been Sent To {emailRef.current.value} <br />Verify Your Email To Continue</h2>)
                }
            } catch (error) {
                console.log(error)

                if(error.response.status === 409) {
                    setContent(<h2>Email Already Exists</h2>)
                    // I know this is bad for UX but I'm prototyping

                    setTimeout(() => {
                        setContent(<section className={styles.content}>
                            <h2>HEYYY</h2><form onSubmit={(e) => register(e)}>
                        <input type="email" placeholder="Email:" ref={emailRef}/>
                        <input type="password" placeholder="------" ref={passwordRef}/>
                        <input type="password" placeholder="Confirm Password" ref={confirmPasswordRef}/>
                        
                        <button type="submit">Continue</button>
                    </form></ section>)
                    }, 1500)
                }

            }
        }


    }
    return <section className={classes.page}>
        {content}
        <Footer />
    </section>
    // content
}   