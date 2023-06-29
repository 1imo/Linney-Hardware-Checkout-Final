import { useContext, useEffect, useState } from "react"
import DevContext from "../context/DevContext"
import UsrContext from "../context/UsrContext"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Browse() {
    const DevCtx = useContext(DevContext)
    const UsrCtx = useContext(UsrContext)
    const [products, setProducts] = useState([])
    const navigate = useNavigate()

    const startup = async () => {
        let uuid = UsrCtx.currentUuid
        
        
        const res = await axios.post(DevCtx.apiUrl + "/api/fetch/products", {
            uuid
        })

        console.log(res.data)
        if(res.data) {
            setProducts(res.data)
        }
    }


    useEffect(() => {
        let res = startup()
        // setProducts(res)
    }, [])


    return <section>
        <section>
        {products.map((product, index) => {
            return <div key={index} style={{color: "#fff"}} onClick={() => navigate("/product/"+product.org+"/"+product.uuid)}>
                <img style={{height: 200, width: 200, objectFit: "cover"}} src={DevCtx.apiUrl + "/api/helper/product/image/" + product?.uuid} alt="" />
                <div>
                    <h2>{product?.name}</h2>
                    <h4>{product?.quantity}</h4>
                </div>
            </div>
        })}
        </section>
    </section>
}