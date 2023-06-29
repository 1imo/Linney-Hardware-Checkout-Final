import { useContext, useEffect, useState } from "react"
import DevContext from "../context/DevContext"
import UsrContext from "../context/UsrContext"
import axios from "axios"
import {QRCodeSVG} from "qrcode.react"
import classes from "./info.module.css"

export default function Collection() {
    const DevCtx = useContext(DevContext)
    const UsrCtx = useContext(UsrContext)
    const [data, setData] = useState([])

    const getData = async () => {
        let geo = await UsrCtx.getUserData()
        let res = await axios.post(DevCtx.apiUrl + "/api/helper/usr/collect", {
            uuid: UsrCtx.currentUuid,
            geo: geo
        })
        console.log(res.data)
        setData(res.data)
    }

    useEffect(() => {
        getData()
    }, [])

    
    return <section className={classes.page}>
        {data.map((item, index) => {
            let date = new Date(item.dueDate._seconds * 1000)
            date.setTime(date.getTime() + (item.dueDate._nanoseconds / 1000000))
            
            // console.log(item.dueDate)
            return <div key={index} className={classes.crd}>
                <div className={classes.details}><span>{item.quantity}x</span> {item.name}</div>
                <div>Due: {date.toLocaleString()}</div>
                <QRCodeSVG value={item.id} size={60} />

            </div>
        })}
    </section> 
}