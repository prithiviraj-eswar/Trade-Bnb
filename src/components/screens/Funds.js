import React, { useState, useContext, useEffect } from 'react'
import { SopForm } from '../layout/CreditCard/CreditCard'
import axios from 'axios'
import Navbar2 from '../layout/Navbar2/Navbar2'
import { BrowserRouter as Routes, Outlet, Route, Link, useNavigate, useParams, useRouteMatch } from 'react-router-dom'
import './Funds.css'

const Funds = () => {
  const navigate = useNavigate()
  const [privateData, setPrivateData] = useState('')

  const sopRequestJSON = {
    firstName: 'First Name',
    lastName: 'lastName',
    card_accountNumber: '5555 5555 5555 5555',
    srcSystemMessageId: '12345',
  }

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      navigate('/login')
    }
    // debugger
    const fetchPrivateData = async () => {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      }
      const { data } = await axios.get('/api/private', config)
      setPrivateData(data.data)
      // try {
      //   const { data } = await axios.get('/api/private', config)
      //   setPrivateData(data.data)
      // } catch (error) {
      //   localStorage.removeItem('authToken')
      //   setError('You are not authorized please login')
      // }
    }
    // document.body.innerHTML = document.body.innerHTML.replace('MUI X: Missing license key', '')

    fetchPrivateData()
  }, [navigate])

  const logoutHandler = () => {
    localStorage.setItem('authtoken', undefined)
    localStorage.removeItem('authToken')
    // removeSessionStorageItem({ item: 'tickerList' })
    navigate('/login')
  }
  return (
    <>
      <section className='funds-wrapper'>
        <div className='sub_header'>
          <Navbar2 />
          <i className='fa-solid fa-power-off logout' onClick={logoutHandler}></i>
          <br></br>
          <br></br>
        </div>
        <div className='main-wrapper'>
          <div className='sticky-warning_warning'></div>

          <SopForm sopRequestJSON={sopRequestJSON} />
        </div>
      </section>
      {/* <Navbar /> */}
    </>
  )
}

export default Funds
