import LabelDataCrd from "../components/LabelDataCrd";
import SignOutBtn from "../components/SignOutBtn";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import {useCookies} from 'react-cookie';
import DevContext from "../context/DevContext";
import UsrContext from "../context/UsrContext";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import classes from "./dash.module.css"

export default function Dash() {
    const [onLoan, setOnLoan] = useState(0)
    const [requested, setRequested] = useState(0)
    const [late, setLate] = useState(0)
    const DevCtx = useContext(DevContext)
    const UsrCtx = useContext(UsrContext)
    const [requests, setRequests] = useState("0")
    const [collectionReady, setCollectionReady] = useState("0")
    const [itemsOnLoan, setItemsOnLoan] = useState("0")
    const navigate = useNavigate()
    
    const process = async () => {
        let uuid = UsrCtx.currentUuid
        let geo = await UsrCtx.getUserData()
        let res = await axios.post(DevCtx.apiUrl + "/api/helper/dash/data", {
            uuid,
            geo
        })
        if(res.status == 400) {
            process()
        } else {
            console.log(res.data)

            try {
                setRequests(res.data.pendingProductRequests)
                setCollectionReady(res.data.readyForCollection)
                setItemsOnLoan(res.data.itemsOnLoan)
            } catch (e) {
                console.log(e)
            }
        }

    }



    useEffect(() => {
        process()
        
    }, [])

    



    return <section className={classes.page}>
        <section className={classes.content}>
            <div>
                <h2>YOUR DASHBOARD</h2>
                <LabelDataCrd label="Pending Requests" data={requests} location={"requested"} />
            </div>
            <div>
                <LabelDataCrd label="On Loan" location={"onLoan"} data={itemsOnLoan}/>
                <LabelDataCrd label="To Be Collected" data={collectionReady} location={"collect"}/>
                <LabelDataCrd label="Late" data="1" location={"late"}/>
            </div>
        </section>
        {/* <a href="http://172.20.10.13:3000/product/5Y0L438A-O7N4O5F6/DL10H9SQ4L6IR06E">product</a> */}

        <Footer />
        
    </section>
}