import React, { Component } from 'react'
import { footerItems } from './FooterItems'
import './Footer.css'

class FooterMain extends Component {
  state = { clicked: false }
  render() {
    return (
      <>
        <footer id='footer'>
          <div className='footer_content'>
            <p className='sticky_warning_text'>
              <i className='fa-solid fa-triangle-exclamation'></i>
              Investments can fall and rise.You may get back less than you invested.Past performance is no guarantee of
              future results.
            </p>

            <ul className={this.state.clicked ? 'foot-menu active' : 'foot-menu'}>
              {footerItems.map((item, index) => {
                return (
                  <div className='footItems'>
                    <li key={index} id={index}>
                      <span className={item.cName}>{item.title}</span>
                      <div className='factor'>
                        {Object.keys(item.data).map((keys) => {
                          return (
                            <a className={keys} href={keys}>
                              {item.data[keys]}
                            </a>
                          )
                        })}
                      </div>
                    </li>
                  </div>
                )
              })}
            </ul>
          </div>
          <div className='subfooter_content'>
            &copy; trade_bnb.com | 2022 Trade-BnB Financial LLC, All rights reserved
          </div>
        </footer>
      </>
    )
  }
}

export default FooterMain
