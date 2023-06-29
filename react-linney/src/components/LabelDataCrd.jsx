import { useNavigate } from "react-router-dom"
import classes from "./labeldata.module.css"

export default function LabelDataCrd(props) {
    const navigate= useNavigate()
    return <div className={classes.crd}
    onClick={() => navigate(props.location)}>
        <h3>{props.label}</h3>
        <h2>{props.data}</h2> 
    </div>
}