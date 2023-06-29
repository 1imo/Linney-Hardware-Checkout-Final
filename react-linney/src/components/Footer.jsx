import { Link } from "react-router-dom";
import classes from "./footer.module.css"

export default function Footer () {
    return <section className={classes.footer}>
        <div>
            <h3>Content-Management-System</h3>
            <div>Made by Timo Hoyland</div>
            <div>Linney Work-Placement 2023</div>
        </div>
        <div>
            <Link to={"/"}>Home</Link>
            <Link to={"/auth/register"}>Register</Link>
            <Link to={"/auth/login"}>Sign In</Link>
            <Link to={"/"}>Support</Link>
        </div>
        
    </section>
}