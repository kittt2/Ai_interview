import React from 'react'
import Navbar from './navbar'
import { Outlet } from 'react-router-dom'

export const Layout = () => {
  return (
<>
<Navbar/>
<Outlet/>
</>

)
}
