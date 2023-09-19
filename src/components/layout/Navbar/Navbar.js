import React, { Component } from 'react'
import { MenuItems } from './Menuitems'
import './Navbar.css'

class Navbar extends Component {
  state = { clicked: false }

  handleClick = () => {
    this.setState({ clicked: !this.state.clicked })
  }

  handleLogin = () => {
    this.props.handleLoginClick()
  }
  routeHandler = () => {
    localStorage.setItem('authtoken', undefined)
    localStorage.removeItem('authToken')
    // let history = useHistory();
    this.props.history.push('/open_account')
    // history.push('/open_account')
  }

  render() {
    return (
      <nav className='navbarItems'>
        <h1 className='navbar-logo'>
          {/* <a href='#'>
            <img src='lightning.png' alt='alternate_text' width='32px' height='32px' />
          </a> */}
          Trade-BnB
          <i className='fa-solid fa-bolt'></i>
        </h1>
        <div className='menu-icon' onClick={this.handleClick}>
          <i className={this.state.clicked ? 'fas fa-times' : 'fas fa-bars'}></i>
        </div>
        <ul className={this.state.clicked ? 'nav-menu active' : 'nav-menu'}>
          {MenuItems.map((item, index) => {
            return (
              // <li key={index} onClick={this.routeHandler}>
              <li key={index}>
                <a className={item.cName} href={item.url}>
                  {item.title}
                </a>
              </li>
            )
          })}
        </ul>
        <span className='loginIcon' onClick={this.handleLogin}>
          {' '}
          <img src='lightning.png' alt='alternate_text' width='32px' height='32px' />
        </span>
      </nav>
    )
  }
}

export default Navbar
