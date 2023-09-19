import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'
import Navbar2 from '../../layout/Navbar2/Navbar2'
import { BrowserRouter as Routes, Outlet, Route, Link, useNavigate, useParams, useRouteMatch } from 'react-router-dom'

import DownloadLink from 'react-download-link'
import hist from '../../DataIsland/Files/historicalTransactions.pdf'
import itr from '../../DataIsland/Files/itrForm.pdf'
import pnl from '../../DataIsland/Files/pnlForm.pdf'

const Download = () => {
  const navigate = useNavigate()
  const [privateData, setPrivateData] = useState('')

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

  const downloadTxtFile = () => {
    const element = document.createElement('a')
    const file = new Blob([document.getElementById('input').value], {
      type: 'text/plain;charset=utf-8}',
    })
    element.href = '../../DataIsland/Files/historicalTransactions.pdf'
    element.download = 'historicalTransactions.pdf'
    element.click()
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
        <div className='App'>
          <h1>Download Files:</h1>

          {/* <input id='input' /> */}
          {/* <button onClick={downloadTxtFile}>Download</button> */}
          <DownloadLink
            label='download historical transaction'
            filename='historicalTransactions.pdf'
            exportFile={() => hist}
          />
          <DownloadLink label='down load ITR File' filename='itrForm.pdf' exportFile={() => itr} />
          <DownloadLink label='down load pnl File' filename='pnlForm.pdf' exportFile={() => pnl} />
        </div>
      </section>
    </>
  )
}

export default Download
