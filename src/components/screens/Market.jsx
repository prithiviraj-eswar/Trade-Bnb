import React, { useState, useContext, useEffect } from 'react'
import '../screens/Market.css'
import Navbar2 from '../layout/Navbar2/Navbar2'
import axios from 'axios'
import { MarketHeaderItems } from '../layout/MarketSubHeader/MarketHeaderItems'
import { BrowserRouter as Routes, Outlet, Route, Link, useNavigate, useParams, useRouteMatch } from 'react-router-dom'

const Market = (props) => {
  // debugger
  const [clickState, setClickState] = useState(false)
  const [currUrl, setUrlState] = useState('')

  let { marketId } = useParams()

  function handleClick() {
    setClickState({ clickState: !this.state.clickState })
  }

  return (
    <>
      <section className='dashboard_wrapper'>
        <div className='sub_header'>
          <Navbar2 />
          <br></br>
        </div>
        {/* <MarketHeader /> */}
        <nav className='marketHeaderItems'>
          <div className='menu-icon' onClick={handleClick}>
            <i className={clickState ? 'fas fa2-times' : 'fas fa2-bars'}></i>
          </div>
          <div className={clickState ? 'nav3-menu active' : 'nav3-menu'}>
            <Link
              className='nav3-links'
              // activeClassName='active'
              to='/market'
              // onSelect={(e) => setUrlState(item.url)}
            >
              North America
            </Link>
            <Link
              className='nav3-links'
              // activeClassName='active'
              to='/market/EU'
              // onSelect={(e) => setUrlState(item.url)}
            >
              Europe
            </Link>
            <Link
              className='nav3-links'
              // activeClassName='active'
              to='/market/AS'
              // onSelect={(e) => setUrlState(item.url)}
            >
              Asia
            </Link>
            <Link
              className='nav3-links'
              // activeClassName='active'
              to='/market/CR'
              // onSelect={(e) => setUrlState(item.url)}
            >
              Crypto
            </Link>
            <Link
              className='nav3-links'
              // activeClassName='active'
              to='/market/global'
              // onSelect={(e) => setUrlState(item.url)}
            >
              Global
            </Link>
          </div>
          {/* <ul className={clickState ? 'nav3-menu active' : 'nav3-menu'}>
            {MarketHeaderItems.map((item, index) => {
              return (
                <li key={index}>
                  <Link
                    className={item.clsName}
                    activeClassName='active'
                    to={item.url}
                    onSelect={(e) => setUrlState(item.url)}
                  >
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul> */}
        </nav>
        <Outlet />
        {/* <NorthAmerica data={NASDAQData} news={getNewsData} /> */}

        {/* <NorthAmerica
          dailyDJA={dailyDJAData}
          dailyIXIC={dailyIXICData}
          dailySPY={dailySPYData}
          news={newsData}
          gainer={gainersData}
          loser={losersData}
          active={activeData}
        /> */}

        <div className='dashboard_content_1'></div>
      </section>
    </>
  )
}

export default Market
