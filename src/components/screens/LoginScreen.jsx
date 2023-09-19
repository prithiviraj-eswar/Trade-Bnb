import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../layout/Navbar/Navbar'
import LoginForm from '../layout/LoginForm/LoginForm'
import FooterMain from '../layout/Footer/Footer'
import './LoginScreen.css'

const LoginScreen = ({ history }) => {
  // debugger
  const navigate = useNavigate()
  const [isShowLogin, setIsShowLogin] = useState(false)

  useEffect(() => {
    // debugger
    if (localStorage.getItem('authToken')) {
      navigate('/market')
    }
  }, [navigate])

  const handleLoginClick = () => {
    setIsShowLogin((isShowLogin) => !isShowLogin)
  }

  return (
    <>
      <Navbar handleLoginClick={handleLoginClick} />
      <div className='login-screen'>
        <LoginForm isShowLogin={isShowLogin} />
        <div className='login_intro'>
          <h2>ZERO is Possible</h2>
          <p>0 Commissions and no deposit minimums.</p>
        </div>
        <div className='priviliges'>
          <h2 className='priv_header' aria-level='2'>
            Trading priviliges
          </h2>
          <p className='priv_content'>
            Diversifying your portfolio with a comprehensive suite of investment products <br /> including stocks,
            fractional shares, options, ETFs, and ADRs.
          </p>
          <div className='priv_content2'>
            <div className='stocks'>
              <i className='fa-solid fa-arrow-trend-up'></i>
              <h2>Stocks</h2>
              <p>
                Invest in thousands of companies. You may even buy{' '}
                <a href='https://www.forbes.com/advisor/investing/fractional-shares/'>
                  fractional shares with as little as $5
                </a>
                &nbsp; using our trading and analytics tools. Create your own portfolio now!
              </p>
            </div>
            <div className='options'>
              <i className='fa-solid fa-chart-column'></i>
              <h2>Options</h2>
              <p>
                Are you a pro? <br />
                Options provide a strategic alternative to purely investing in equities.
              </p>
            </div>
            <div className='ETF'>
              <i className='fa-solid fa-coins'></i>
              <h2>ETF</h2>
              <p>
                Diversify your holdings by investing into a group of stocks with the same convenience as trading a
                single stock.
              </p>
            </div>
            <div className='crypto'>
              <i className='fa-brands fa-bitcoin'></i>
              <h2>Crypto</h2>
              <p>
                Diversify your holdings by investing in digital currencies including Bitcoin, Ethereum, Bitcoin Cash and
                Litecoin.
              </p>
            </div>
          </div>
        </div>
        <div className='account'>
          <h2 className='acc_header'>Account Types</h2>
          <p className='acc_content'>
            Different types of brokerage accounts to satisfy your different investment objectives.
          </p>
          <div className='acc_content2'>
            <img
              src='acc_type_img.png'
              alt='alternate_text'
              width='400px'
              height='388px'
              margin-left='102px'
              box-shadow=' 0 1rem 2rem rgba(0, 0, 0, 0.2)'
              sizes='(max-width: 500px) calc(100vw - 2rem), (max-width: 700px) calc(100vw - 6rem),calc(100vw - 9rem - 200px)'
            />
            <div className='acc_content_right'>
              <div className='accountWrap1'>
                <i className='fa-solid fa-filter-circle-dollar'></i>
                <div className='ira_info'>
                  <h2 className='ira_header'>IRA</h2>
                  <p>Save for retirement with Trade-BnB Traditional Individual Retirement Account.</p>
                  <p className='learnmore'>
                    More<i className='fa-solid fa-caret-right'></i>
                  </p>
                </div>
              </div>
              <div className='accountWrap2'>
                <i className='fa-solid fa-user'></i>
                <div className='iba_info'>
                  <h2 className='iba_header'>IBA</h2>
                  <p>
                    Individual Brokerage Account is a General Account which allows
                    <br /> you to buy and sell securities and assets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='trade_bnb_acc'>
          <h2 className='trade_bnb_acc_header'>
            Open a Trade-BnB <br /> account now!
          </h2>
          <div className='trade_bnb_content'>
            <img
              src='trade_bnb_acc.png'
              alt='alternate_text'
              width='400px'
              height='388px'
              margin-left='102px'
              box-shadow=' 0 1rem 2rem rgba(0, 0, 0, 0.2)'
              sizes='(max-width: 500px) calc(100vw - 2rem), (max-width: 700px) calc(100vw - 6rem),calc(100vw - 9rem - 200px)'
            />
            <div className='trade_bnb_content_right'>
              <div className='trade_bnb_wrap'>
                <div className='trade_bnb_acc_wrapper1'>
                  <p>
                    <i className='fa-solid fa-chevron-right'></i>Open your Trade-BnB individual brokerage account and
                    IRAs now!
                  </p>
                </div>
                <div className='trade_bnb_acc_wrapper2'>
                  <p>
                    <i className='fa-solid fa-chevron-right'></i>
                    In order to verify your identity, a government issued ID card with your photo, name, and
                    <br /> date of birth is required to open an account with Trade-BnB. Please have the documents
                    <br />
                    prepared in advance.
                  </p>
                  <div className='openAccount'>
                    <i className='fa-solid fa-arrow-right'></i>
                    <a className='nav-links' href='/open_account'>
                      Open Account
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterMain />
    </>
  )
}

export default LoginScreen
