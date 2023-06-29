import { useContext, useRef, useState } from "react"
import { useSignIn } from "react-auth-kit"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import DevContext from "../context/DevContext"
import UsrContext from "../context/UsrContext"
import Footer from "../components/Footer"
import classes from "../components/footer.module.css"
import styles from "./auth.module.css"

export default function Login() {
    const emailRef = useRef()
    const passwordRef = useRef()
    const signIn = useSignIn()
    const navigate = useNavigate()
    const [content, setContent] = useState(<section className={styles.content}>
        <h2>HI THERE</h2>
        <form onSubmit={(e) => login(e)}>
            <input type="text" placeholder="Email:" ref={emailRef}/>
            <input type="password" placeholder="------" ref={passwordRef}/>
            <button type="submit">Continue</button>
        </form>

    
    </section>)
    const DevCtx = useContext(DevContext)
    const UsrCtx = useContext(UsrContext)

    const login = async (e) => {
        e.preventDefault()
        console.log(emailRef.current.value, passwordRef.current.value)
        

        
        try {

            let geo = await UsrCtx.getUserData()
            console.log(geo, emailRef.current.value, passwordRef.current.value)
            
            const response = await axios.post(DevCtx.apiUrl + "/api/helper/login", {
                email: emailRef.current.value,
                password: passwordRef.current.value,
                geo: geo
            })
            

            signIn({
                token: response.data.token,
                expiresIn: 4320,
                tokenType: "Bearer",
                authState: {...response.data.userData}
            })

            if(!response.data.userData.fn && !response.data.userData.ln) {
                navigate("/onboarding")
            } else {
            
                navigate("/")
            }

        } catch (error) {
            console.log(error)
            console.log("ERROR")

            if(error?.response?.status === 403) {
                setContent(<h2>We couldn't verify that you're the user <br /> An email with a sign-in link has been sent to you</h2>)
                setTimeout(() => {
                    setContent(<section className={styles.content}>
                        <h2>HI THERE</h2>
                        <form onSubmit={(e) => login(e)}>
                            <input type="text" placeholder="Email:" ref={emailRef}/>
                            <input type="password" placeholder="------" ref={passwordRef}/>
                            <button type="submit">Continue</button>
                        </form>
                
                       
                    </section>)
                }, 1500)
            } else {
                setContent(<h2>Incorrect Email, Password or unverified account</h2>)
                // I know this is bad for UX but I'm prototyping
                setTimeout(() => {
                    setContent(<section className={styles.content}>
                        <h2>HI THERE</h2>
                        <form onSubmit={(e) => login(e)}>
                            <input type="text" placeholder="Email:" ref={emailRef}/>
                            <input type="password" placeholder="------" ref={passwordRef}/>
                            <button type="submit">Continue</button>
                        </form>
                        
                    
                    </section>)
                }, 1500)
            }

            
            
        }




    }

    console.log(styles)
    return <section className={styles.page}>
        {content}
        <Footer />
    </section>
    
    
}   