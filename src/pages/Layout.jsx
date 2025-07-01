import React from 'react'
import Navbar from './navbar'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'

export const Layout = () => {
  return (
<>
<Navbar/>
<Outlet/>
<Footer/>
</>

)
}
