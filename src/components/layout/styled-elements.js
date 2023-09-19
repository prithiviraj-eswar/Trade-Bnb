import styled from 'styled-components'

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: rgba(246, 246, 246, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 500px;
  height: 300px;
  background: #333333;
  border-radius: 10px;
`

const RadioContainer = styled.div`
  position: relative;
  display: flex;
  flex-wrape: wrap;
  width: 100%;
  height: 70px;
  justify-content: space-between;
  padding: 0 80px;
  align-items: center;
  background: #231815;
`

const Radio = styled.input`
  cursor: pointer;
`

const Label = styled.label``

const Button = styled.button`
  width: 200px;
  height: 50px;
  background: #cbcbcb;
  border-radius: 3px;
  cursor: pointer;
`

export { Container, Form, RadioContainer, Radio, Label, Button }
