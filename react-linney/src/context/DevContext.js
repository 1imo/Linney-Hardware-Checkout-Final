import { createContext, useMemo, useState } from "react";



const DevContext = createContext();



export function DevContextHandler(props) {
    const apiUrl = "https://7218-2a00-23a8-843-c701-688c-2c95-cdad-9035.ngrok-free.app"


    const Context = {
        apiUrl
    }

    return (
        <DevContext.Provider value={Context}>
            {props.children}
        </DevContext.Provider>
    )
}

export default DevContext