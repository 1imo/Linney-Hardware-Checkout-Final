import axios from "axios";
import { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import DevContext from "../context/DevContext";
import UsrContext from "../context/UsrContext";
import classes from "./product.module.css"

export default function Product() {
    const { id, org } = useParams()
    const UsrCtx = useContext(UsrContext)
    const DevCtx = useContext(DevContext)
    const [product, setProduct] = useState({})
    const reqQuantity = useRef(0)
    // const [uuid, setUuid] = useState("")
    let uuid = UsrCtx.uuid

    const getData = async () => {
        let id = await UsrCtx.uuid
        console.log(id)
        // setUuid(id)
        uuid = id

        
    }

    useEffect(() => {
        getData()
        console.log("INIT")
    }, [])

    useEffect(() => {
        const fetchProduct = () => {
            axios.post( DevCtx.apiUrl + "/api/helper/productInfo", {
                uuid: UsrCtx.uuid,
                org,
                id
            }).then(res => {
                console.log(res.data)
                setProduct(res.data)

                if(res.status == 404) {
                    console.log("Not Found")
                }

                if(res.status == 403) {
                    console.log("Unauthorized")
                }

                if(res.status == 400) {
                    fetchProduct()
                }
    
            })
        }

        fetchProduct()
    }, [uuid])

    const requestItem = async () => {
        let geo = await UsrCtx.getUserData()
        let res = await axios.post(DevCtx.apiUrl + "/api/helper/request/product", {
            uuid: UsrCtx.uuid,
            org,
            id,
            quantity: reqQuantity.current.value ,
            geo
            
        })

        console.log(res.data)

    }
    
    

    

    return <section className={classes.page}>
        <img src={DevCtx.apiUrl + "/api/helper/product/image/" + product?.uuid} alt={product?.name} />
        <section>
            <div>
                <div>
                    <h2>{product?.name}</h2>
                    <h6>{product?.quantity} in stock</h6>
                </div>
                <p>{product?.description}</p>
            </div>
    <div>
            <input type="number" ref={reqQuantity} placeholder="Request Amount:"/>
            <button onClick={() => requestItem()}>Request</button>

    </div>

        </section>

    </section>
}