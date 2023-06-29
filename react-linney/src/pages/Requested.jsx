import { useContext, useEffect, useState } from "react"
import DevContext from "../context/DevContext"
import UsrContext from "../context/UsrContext"
import axios from "axios"
import CrudCrd from "../components/crudCrd"
import classes from "./info.module.css"

export default function Requested() {
    const DevCtx = useContext(DevContext)
    const UsrCtx = useContext(UsrContext)
    const [requests, setRequests] = useState([])

    const getData = async () => {
        let geo = await UsrCtx.getUserData()
        let res = await axios.post(DevCtx.apiUrl + "/api/helper/user/requests", {
            uuid: UsrCtx.currentUuid,
            geo
        })

        console.log(res.data)
        setRequests(res.data)
    }

    useEffect(() => {
        getData()
    }, [])
    return <section className={classes.page}>
        {requests.map((request, index) => {
            return <CrudCrd key={index} data={request}/>
        })}
    </section>
}