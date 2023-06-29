import { useContext } from "react"
import UsrContext from "../context/UsrContext"
import DevContext from "../context/DevContext"
import axios from "axios"
import classes from "./crudCrd.module.css"

export default function CrudCrd(props) {
    const UserCtx = useContext(UsrContext)
    const DevCtx = useContext(DevContext)
    const remove = async () => {
        let geo = await UserCtx.getUserData()
        axios.post(DevCtx.apiUrl + "/api/helper/requests/remove", {
            id: props.data.id,
            org: props.data.org,
            uuid: UserCtx.currentUuid,
            geo
        })
    }

    return <div style={{display: "flex"}} className={classes.crd}>
        <div><span>{props.data.quantity}x</span> {props.data.name}</div>
        <button onClick={() => remove()}>Remove Request</button>
    </div>
}