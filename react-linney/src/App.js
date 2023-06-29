import { BrowserRouter, Routes, Route, Link } from "react-router-dom"

import Login from "./pages/Login";
import Register from "./pages/Register";
import { RequireAuth } from "react-auth-kit";
import Dash from "./pages/Dash";
import Verify from "./pages/Verify";
import Onboarding from "./pages/Onboarding";
import ManageInventory from "./pages/ManageInventory";
import Product from "./pages/Product";
import Requested from "./pages/Requested";
import Loaned from "./pages/Loaned";
import Collection from "./pages/Collection";
import Browse from "./pages/Browse";

function App() {
  return (
      <Routes>
        <Route path="/" element={<RequireAuth loginPath="/auth/login"><Dash /></RequireAuth>}/>
        <Route path="/auth/login" element={<Login />}/>
        <Route path="/auth/register" element={<Register />}/>
        <Route path="/usr/verify/:id" element={<Verify />}/>
        <Route path="/manage" element={<RequireAuth loginPath="/auth/login"><ManageInventory /></RequireAuth>}/>
        <Route path="/onboarding" element={<RequireAuth loginPath="/auth/login"><Onboarding /></RequireAuth>}/>
        <Route path="/browse" element={<RequireAuth loginPath="/auth/login"><Browse /></RequireAuth>}/>
        <Route path="/product/:org/:id" element={<RequireAuth loginPath="/auth/login"><Product /></RequireAuth>}/>
        <Route path="/requested" element={<RequireAuth loginPath="/auth/login"><Requested /></RequireAuth>}/>
        <Route path="/onLoan" element={<RequireAuth loginPath="/auth/login"><Loaned /></RequireAuth>}/>
        <Route path="/collect" element={<RequireAuth loginPath="/auth/login"><Collection /></RequireAuth>}/>
      </Routes>
  )
}

export default App;
