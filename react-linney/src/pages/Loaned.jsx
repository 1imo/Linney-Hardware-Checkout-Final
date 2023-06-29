import { useContext, useEffect, useState } from "react"
import axios from "axios"
import DevContext from "../context/DevContext"
import UsrContext from "../context/UsrContext"
import QRCode from "qrcode.react"


export default function Loaned() {
    const DevCtx = useContext(DevContext)
    const UsrCtx = useContext(UsrContext)
    const [data, setData] = useState([])

    const getData = async () => {
        let geo = await UsrCtx.getUserData()
        let res = await axios.post(DevCtx.apiUrl + "/api/helper/usr/loaned", {
            geo,
            uuid: UsrCtx.currentUuid
        })
        console.log(res.data)
        setData(res.data)
    }

    useEffect(() => {
        getData()
    }, [])
    return <section>
        {data.map((item, index) => {
            return <div key={index} style={{display: "flex", alignItems: "center", columnGap: 50}}>
                <h2>{item.quantity}x {item.name}</h2>
                <QRCode value={item.id} size={100}/>
                {/* <p>{}</p> */}
            </div>
        })}
    </section>
}