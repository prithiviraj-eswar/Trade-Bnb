import React, { Component } from 'react'
import { MarketHeaderItems } from './MarketHeaderItems'
import { BrowserRouter as Routes, useParams, Route, NavLink } from 'react-router-dom'
import MarketID from './MarketID'
import './MarketHeader.css'

class MarketHeader extends Component {
  state = { clicked: false }

  handleClick = () => {
    this.setState({ clicked: !this.state.clicked })
  }

  render() {
    return (
      <nav className='marketHeaderItems'>
        <div className='menu-icon' onClick={this.handleClick}>
          <i className={this.state.clicked ? 'fas fa2-times' : 'fas fa2-bars'}></i>
        </div>
        <ul className={this.state.clicked ? 'nav3-menu active' : 'nav3-menu'}>
          {MarketHeaderItems.map((item, index) => {
            return (
              <li key={index}>
                <NavLink className={item.clsName} activeClassName='active' to={item.url}>
                  {item.title}
                </NavLink>
              </li>
            )
          })}
        </ul>
        <Routes>
          <Route path=':markId/*' element={<MarketID />} />
        </Routes>
      </nav>
    )
  }
}

export default MarketHeader
