import { useSignOut } from "react-auth-kit"
import { useNavigate } from "react-router-dom"

export default function SignOutBtn() {
    const navigate = useNavigate()
    const logOut = useSignOut()
    const signOut = () => {
        logOut()
        navigate("/auth/login")
    }

    return <button onClick={() => signOut()}>Sign Out</button>
}