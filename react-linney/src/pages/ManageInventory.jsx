import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { useContext } from "react"
import UsrContext from "../context/UsrContext"
import DevContext from "../context/DevContext"
import Footer from "../components/Footer"
import classes from "./manage.module.css"

export default function ManageInventory() {
    const UsrCtx = useContext(UsrContext)
    const DevCtx = useContext(DevContext)
    const [options, setOptions] = useState([])
    const chosenCompany = useRef()
    const category = useRef()
    const [file, setFile] = useState()
    const [orgUuid, setOrgUuid] = useState("")
    const [requests, setRequests] = useState([])
    const [categories, setCategories] = useState([])
    const [catsState, setCatsState] = useState(<select name="category" ref={category} onChange={() => categoryChange()}>
    {categories.map((category, index) => {
        return <option key={index} value={category}>{category}</option>
    })}
    <option value="newCat1">Create New Category1</option>
    <option value="newCat">Create New Category</option>
</select>)
    // console.log(UsrCtx.uuid)
    // UsrCtx.verifyUser()

    const categoryChange = () => {
        // console.log(category.current.value)
        if(category.current.value == "newCat") {
            setCatsState(
                
                    <input name="category" type="text" ref={category} placeholder="Name of Category:"/>

               
            )
        }
    }

    useEffect(() => {
        if(category.current.value == "newCat") {
            setCatsState(
                
                    <input name="category" type="text" ref={category} placeholder="Name of Category:"/>

               
            )
        }
    }, [category?.current?.value])
    
    
    useEffect(() => {
        if(UsrCtx.uuid){
        axios.post(DevCtx.apiUrl + "/api/helper/manageOrgs", {
        uuid: UsrCtx.currentUuid

    }).then(async (response) => {
        // console.log(response.data)
        setOptions(response.data)

        let res = await axios.post(DevCtx.apiUrl + "/api/helper/manageRequests", {
            orgUuid: response.data[0].uuid,
            user: UsrCtx.uuid
        })



        console.log(res.data)
        setRequests(res.data)

    })}
    }, [UsrCtx.uuid])



    useEffect(() => {
        if(chosenCompany.current.value) {
            setOrgUuid(chosenCompany.current.value)
            let res = axios.post(DevCtx.apiUrl + "/api/helper/categories", {
                orgUuid: chosenCompany.current.value,
                user: UsrCtx.uuid
            })
            setCategories([])
            console.log(res.data)
            


        }
        console.log(chosenCompany.current.value)
    }, [chosenCompany])

    // useEffect(() => {
    //     if(chosenCompany.current.value) {
    //         setOrgUuid(chosenCompany.current.value)
    //         axios.post("http://" + DevCtx.apiUrl + "/api/helper/manageRequests", {
    //             orgUuid: chosenCompany.current.value
    //         })


    //     }
       
    // }, [options])



    const changeData = async () => {
        let res = await axios.post(DevCtx.apiUrl + "/api/helper/manageRequests", {
                orgUuid: chosenCompany.current.value,
                user: UsrCtx.uuid
            })

        console.log(res.data)
        setRequests(res.data)



    }
    

    

    // useEffect(() => console.log(file), [file])

    const authorize = async (transaction) => {
        let uuid = UsrCtx.uuid
        let res = await axios.post(DevCtx.apiUrl + "/api/helper/product/request", {
            uuid: uuid,
            transaction: transaction,
            orgUuid: chosenCompany.current.value
        })

        console.log(res.data)

    }

    
        
    
    return <section className={classes.page}>
        <h2>Manage Inventory</h2>
        <h4>FOR
        <select name="orgSelect" ref={chosenCompany} onChange={() => changeData()}>
            {options.map((org, index) => {
                return <option key={index} value={org.uuid}>{org.name}</option>
            })}
        </select>
            
            </h4>
        <div>
            <div>
                <form action={DevCtx.apiUrl + "/api/helper/create"} encType="multipart/form-data" method="post">
                    <h4>Add Item</h4>
                    <input type="text" style={{display: "none"}} name="org" value={chosenCompany?.current?.value}/>
                    <input type="text" name="name" placeholder="Name:" />
                    <input type="text" name="description" placeholder="Description:" />
                    <input type="file" name="image" accept=".jpg, .jpeg, .png" onChange={(e) => setFile(e.target.files[0])}/>
                    <input type="number" name="quantity" placeholder="Quantity:" />
                    {catsState}
                    
                    <button type="submit">Create</button>
                    {/* <input type="text" name="location" placeholder="Quantity:" /> */}


                </form>
            </div>
            <div>
                {requests.map((request, index) => {
                    return <div key={index} style={{display: "flex"}}>
                        <div>{request.quantity}x {request.name}</div>
                        <button onClick={() => authorize(request.id)}>Authorize</button>
                    </div>
                })}

            </div>
        </div>

    </section>
}