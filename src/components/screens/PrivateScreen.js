import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { setSessionStorageItem, getSessionStorageItem, removeSessionStorageItem } from '../../frontendUtils/utils.js'
import './PrivateScreen.css'
import Market from './Market'

const PrivateScreen = () => {
  // debugger
  const [error, setError] = useState('')
  const [privateData, setPrivateData] = useState('')

  const navigate = useNavigate()

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
      //   debugger
      //   const { data } = await axios.get('/api/private', config)
      //   setPrivateData(data.data)
      // } catch (error) {
      //   localStorage.removeItem('authToken')
      //   setError('You are not authorized please login')
      // }
    }

    fetchPrivateData()
  }, [navigate])

  const logoutHandler = () => {
    localStorage.setItem('authtoken', undefined)
    localStorage.removeItem('authToken')
    navigate('/login')
  }
  return error ? (
    <span className='error-message'>{error}</span>
  ) : (
    <>
      <div style={{ background: '#fff', color: '#000' }}>
        <i className='fa-solid fa-power-off logout' onClick={logoutHandler}></i>
        {<Market user={privateData} />}
      </div>
    </>
  )
}

export default PrivateScreen
