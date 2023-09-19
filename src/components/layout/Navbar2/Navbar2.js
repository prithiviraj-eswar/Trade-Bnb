import React, { Component } from 'react'
import { MenuItems2 } from './Menuitems2'
import './Navbar2.css'

class Navbar2 extends Component {
  state = { clicked: false }

  handleClick = () => {
    this.setState({ clicked: !this.state.clicked })
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
      <nav className='navbar2Items'>
        <h1 className='navbar2-logo'>
          {/* <a href='#'>
            <img src='lightning.png' alt='alternate_text' width='32px' height='32px' />
          </a> */}
          Trade-BnB
          <i className='fa-solid fa-bolt'></i>
        </h1>
        <div className='menu-icon' onClick={this.handleClick}>
          <i className={this.state.clicked ? 'fas fa2-times' : 'fas fa2-bars'}></i>
        </div>
        <ul className={this.state.clicked ? 'nav2-menu active' : 'nav2-menu'}>
          {MenuItems2.map((item, index) => {
            return (
              // <li key={index} onClick={this.routeHandler}>
              <li key={index}>
                <a className={item.clsName} href={item.url}>
                  {item.title}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }
}

export default Navbar2
