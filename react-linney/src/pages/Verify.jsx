import { useParams, useNavigate } from "react-router-dom"
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useSignIn } from "react-auth-kit";
import UsrContext from "../context/UsrContext";
import DevContext from "../context/DevContext";

export default function Verify() {
    const params = useParams();
    const navigate = useNavigate();
    const signIn = useSignIn()
    console.log(params)
    const UsrCtx = useContext(UsrContext)
    const DevCtx = useContext(DevContext);
    const [content, setContent] = useState(<div>Loading...</div>)

    const login = async () => {
        let geo = await UsrCtx.getUserData()
        console.log(geo)
        
        try {
            const response = await axios.post( DevCtx.apiUrl + "/api/helper/login/link", {
                token: params.id,
                geo
            })

            console.log(response)

            if (response.status !== 200) {
                throw new Error(response.status)
            }
            signIn({
                token: response.data.token,
                expiresIn: 360000,
                tokenType: "Bearer",
                authState: {...response.data.userData}
            })

            // console.log(Object.keys(response.data.userData).length)

            // if(Object.keys(response.data.userData).length === 0) {
            //     navigate("/onboarding")
            // } else {

            //     navigate("/")
            // }

            if(!response.data.userData.fn && !response.data.userData.ln) {
                    navigate("/onboarding")
            } else {

                navigate("/")
            }
            

        } catch (error) {
            console.log("NO ERRO")
            console.log(error)
            console.log(error.response.status)
            if(error.response.status === 500) {
                console.log(UsrCtx)
                console.log(geo)

                const resendEmail = () => {
                    axios.post(DevCtx.apiUrl + "/api/helper/verify/link/manager", {
                        email: params.id,
                        geo
                    })

                }
                console.log("SENT")


                setContent(<section>
                    <h2>Your Link Has Expired</h2>
                    <button onClick={() => resendEmail()}>Resend Verification Link</button>
                </section>)
            } else {
                // window.location.reload()

            }

        }

    }

    useEffect(() => {

        login()
    }, [])


    return content
}