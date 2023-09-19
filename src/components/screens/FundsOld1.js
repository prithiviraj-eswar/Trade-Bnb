import React from 'react'
import ReactDOM from 'react-dom'
import './Funds.css'
import { Container, Form, RadioContainer, Radio, Label, Button } from '../layout/styled-elements'
import { Paypal, Google, KCP, Apple, Square } from '../layout/payments/index'
import axios from 'axios'
import Navbar2 from '../layout/Navbar2/Navbar2'
import { BrowserRouter as Routes, Outlet, Route, Link, useNavigate, useParams, useRouteMatch } from 'react-router-dom'

const locale = 'en'

const LocalePaymentOptions = {
  ko: [`kcp`, `paypal`, `square`, 'credit card'],
  zh: [`alipay`, `wechat`],
  en: [`google`, `apple`, `square`, 'credit card'],
}

const PaymentMethods = {
  paypal: <Paypal />,
  google: <Google />,
  kcp: <KCP />,
  apple: <Apple />,
  square: <Square />,
}

class Funds extends React.Component {
  state = {
    selectedOption: 'credit card',
  }

  handleRadioChange = (e) => {
    this.setState({
      selectedOption: e.target.value,
    })
  }

  render() {
    return (
      <Container>
        <Form>
          <RadioContainer>
            {LocalePaymentOptions[locale].map((payment) => (
              <Label htmlFor={payment}>
                <Radio
                  type='radio'
                  value={payment}
                  checked={this.state.selectedOption === payment}
                  onChange={this.handleRadioChange}
                />
                {payment}
              </Label>
            ))}
          </RadioContainer>
          {PaymentMethods[this.state.selectedOption]}
        </Form>
      </Container>
    )
  }
}

export default Funds
