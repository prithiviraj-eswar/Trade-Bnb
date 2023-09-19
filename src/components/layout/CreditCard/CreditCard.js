import * as React from 'react'
import * as Payment from 'payment'

const responseJSON = {
  timestamp: '2019-04-17 23:43:56',
  status: 'FAILURE',
  rejectResponse: {
    reasonCode: 500,
    reasonMessage: ' One or more fields in the request contains invalid data.',
    invalidFields: ['billTo_postalCode'],
  },
}

/* Util functions used for RCI Payment form */

const getRciSopPaymentFormConfig = {
  ORIG_SYSTEM_CODE_ID: 39,
  BILLING_DISPLAY_FLG: 'Y',
  oscrecords: [
    {
      CREDIT_CARD_TYPE_DESC: '001',
      CREDIT_CARD_TYPE_NAME: 'Visa',
      CVN_DISPLAY_FLG: 'Y',
      WEEKS_CARD_TYPE_CODE: 'V',
      POINTS_CARD_TYPE_CODE: 'VS',
    },
    {
      CREDIT_CARD_TYPE_DESC: '002',
      CREDIT_CARD_TYPE_NAME: 'Master Card',
      CVN_DISPLAY_FLG: 'N',
      WEEKS_CARD_TYPE_CODE: 'M',
      POINTS_CARD_TYPE_CODE: 'MC',
    },
    {
      CREDIT_CARD_TYPE_DESC: '003',
      CREDIT_CARD_TYPE_NAME: 'Amex',
      CVN_DISPLAY_FLG: 'Y',
      WEEKS_CARD_TYPE_CODE: 'A',
      POINTS_CARD_TYPE_CODE: 'AX',
    },
  ],
}

const isEmpty = (value) => {
  return value === null || value === undefined || value.length === 0
}

const isObject = (value) => {
  return value !== null && typeof value === 'object'
}

const isArray = (value) => {
  return Array.isArray(value)
}

const keys = (obj) => {
  return Object.keys(obj)
}

const has = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

const set = (obj, path, value) => {
  if (!isObject(obj)) return obj
  if (isEmpty(path)) return obj
  const keys = path.split('.'),
    length = keys.length,
    lastIndex = length - 1
  let index = -1,
    nested = obj
  while (nested !== null && ++index < length) {
    const key = keys[index]
    if (index === lastIndex) {
      nested[key] = value
    }
    nested = nested[key]
  }
  return nested
}

const get = (obj, path, defaultValue) => {
  defaultValue = defaultValue || ''
  if (!isObject(obj)) return defaultValue
  if (isEmpty(path)) return defaultValue
  const keys = path.split('.'),
    length = keys.length
  let index = 0,
    nested = obj
  while (nested !== null && index < length) {
    const key = keys[index++]
    nested = has(nested, key) ? nested[key] : null
  }

  return index && index === length ? nested || defaultValue : defaultValue
}

/* Validators Used for RCI payment form fields validations */

class Validators {
  static required(control) {
    const { value } = control
    if (isEmpty(value)) {
      return { required: true }
    }
    return null
  }

  static min(min) {
    return (control) => {
      const { value } = control
      if (isEmpty(value) || isEmpty(min)) {
        return null
      }
      const parsedValue = parseFloat(value)
      if (!isNaN(parsedValue) && parsedValue < min) {
        return { min, value }
      }
      return null
    }
  }

  static pattern(pattern, reverse) {
    return (control) => {
      const { value } = control
      const regex = typeof pattern === 'string' ? new RegExp(`^${pattern}$`) : pattern
      if (!pattern || isEmpty(value)) {
        return null
      }
      return regex.test(value) ? null : { pattern: true }
    }
  }
}

class CCValidators {
  static number(control) {
    const { value } = control
    if (!isEmpty(value)) {
      const valid = Payment.fns.validateCardNumber(value)
      if (!valid) {
        return { CREDIT_NUMBER_INVALID: true }
      }
    }
    return null
  }

  static expiry(control) {
    const { value } = control
    if (!isEmpty(value)) {
      const valid = Payment.fns.validateCardExpiry(value)
      if (!valid) {
        return { CREDIT_EXPIRY_INVALID: true }
      }
    }
    return null
  }

  static cvv(control) {
    if (control.updateOn === 'blur') {
      const { value } = control
      if (!isEmpty(value)) {
        let valid = false
        if (control.parent) {
          const ccNameControl = control.parent.get('cc_name')
          valid = Payment.fns.validateCardCVC(value, ccNameControl.value)
        }
        if (!valid) {
          return { CREDIT_CVV_INVALID: true }
        }
      }
    }
    return null
  }
}

class Formatters {
  static upperCase({ value }) {
    return isEmpty(value) ? '' : value.toUpperCase()
  }

  static lowerCase({ value }) {
    return isEmpty(value) ? '' : value.toLowerCase()
  }

  static pattern(pattern, replaceValue) {
    replaceValue = replaceValue || ''
    return ({ value }) => {
      if (!pattern || isEmpty(value)) {
        return ''
      }
      const regex = typeof pattern === 'string' ? new RegExp(`^${pattern}$`, 'gi') : pattern

      const formattedValue = String(value).replace(regex, replaceValue)
      return formattedValue
    }
  }
}

class CCFormatters {
  static number({ value }) {
    if (isEmpty(value)) {
      return value
    }
    return Payment.fns.formatCardNumber(value)
  }
}

/* RCI Payment form validation */

const VALID = 'valid'
const INVALID = 'invalid'

class AbstractControl {
  constructor(validators) {
    this.validators = validators
    this.status = VALID
    this.errors = {}
    this.reasons = {}
    this.touched = false
  }

  get valid() {
    return this.status === VALID
  }

  get invalid() {
    return this.status === INVALID
  }

  get parent() {
    return this._parent
  }

  get(path) {
    if (isEmpty(path)) return null
    path = path.split('.')
    return path.reduce((acc, name) => {
      if (acc instanceof FormGroup) {
        return acc.controls[name] || null
      }
      return null
    }, this)
  }

  _updateValue() {}

  setParent(parent) {
    this._parent = parent
  }

  setValue(value) {
    this.value = value
    this.updateValidity()
  }

  setErrors(errors) {
    this.errors = errors
  }

  hasErrors() {
    return keys(this.errors || {}).length > 0
  }

  hasError(errCode) {
    return this.errors && this.errors[errCode] === true
  }

  clearValidators() {
    this.validators = []
  }

  setValidators(validators) {
    this.validators = validators
  }

  updateValidity(options) {
    options || (options = {})
    const { onlySelf } = options
    this._updateValue()
    this.errors = this._validate()
    this.status = this._calculateStatus()
    if (this.parent && !onlySelf) this.parent.updateValidity(options)
  }

  _calculateStatus() {
    if (keys(this.errors).length) return INVALID
    return this._calculateControlsStatus()
  }

  _calculateControlsStatus() {
    if (this.controls) {
      return keys(this.controls).reduce((v, name) => {
        if (v === VALID) {
          v = this.controls[name].status
        }
        return v
      }, VALID)
    }
    return VALID
  }

  _validate() {
    const errors = {}
    const validators = isArray(this.validators) ? this.validators : [this.validators]
    validators.filter(Boolean).forEach((validator) => {
      const error = validator(this)
      if (error) keys(error).forEach((key) => (errors[key] = error[key]))
    })
    return errors
  }
}

class FormControl extends AbstractControl {
  constructor({ name, value }, validators, options) {
    super(validators)
    this.name = name
    this.value = value
    this.options = options || (options = {})
  }

  applyOnChangeCallback(value) {
    if (this.options.onChange) {
      this.options.onChange(value, this)
    }
  }

  onChange(e) {
    e.preventDefault()
    this.touched || (this.touched = true)
    this.updateOn = 'change'
    this.applyOnChangeCallback(e.target.value)
    this.setValue(e.target.value)
  }

  applyOnBlurCallback() {
    if (this.options.onBlur) {
      this.options.onBlur(this.value, this)
    }
  }

  onBlur(e) {
    e.preventDefault()
    this.updateOn = 'blur'
    this.touched || (this.touched = true)
    this.applyOnBlurCallback()
    this.updateValidity()
  }
}

class FormGroup extends AbstractControl {
  constructor(controls, validators) {
    super(validators)
    this.controls = {}
    this.value = {}
    this.addControls(controls)
    this.updateValidity({ onlySelf: true })
  }

  _updateValue() {
    this.value = keys(this.controls).reduce((acc, name) => {
      acc[name] = this.controls[name].value
      return acc
    }, {})
  }

  _calculateControlsStatus() {
    return keys(this.controls).reduce((acc, name) => {
      if (acc === VALID) {
        acc = this.controls[name].status
      }
      return acc
    }, VALID)
  }

  applyOnChangeCallbacks() {
    keys(this.controls).forEach((name) => {
      const control = this.controls[name]
      control.applyOnChangeCallback(control.value)
      control.updateValidity({ onlySelf: true })
    })
  }

  addControls(controls) {
    keys(controls).forEach((name) => {
      this.addControl(name, controls[name])
    })
    this.applyOnChangeCallbacks()
    this.updateValidity({ onlySelf: true })
  }

  addControl(name, options) {
    const [value, validators, opts] = options
    const control = new FormControl({ name, value }, validators, opts)
    control.setParent(this)
    this.controls[name] = control
    this.value[name] = value
  }
}

/* RCI Payment Form options */

const sopFormOptions = {}

sopFormOptions.cards = {
  VS: {
    type: 'visa',
    imageSource: 'http://www.credit-card-logos.com/images/visa_credit-card-logos/new_visa.gif',
  },
  MC: {
    type: 'mastercard',
    imageSource: 'http://www.credit-card-logos.com/images/mastercard_credit-card-logos/mastercard_logo_8.gif',
  },
  AX: {
    type: 'amex',
    imageSource:
      'http://www.credit-card-logos.com/images/american_express_credit-card-logos/american_express_logo_5.gif',
  },
  DI: {
    type: 'discover',
    imageSource: 'http://www.credit-card-logos.com/images/discover_credit-card-logos/discover_network1.jpg',
  },
}

sopFormOptions.csvImages = {
  amex: {
    name: 'amex',
    imageSource: 'https://vw-superiorthreads.storage.googleapis.com/uploads/2012/01/11/images/american-express-cvv.jpg',
  },
  other: {
    name: 'other',
    imageSource: 'https://www.shredstationva.com/images/cvv-visa.gif',
  },
}

sopFormOptions.countryOptions = [
  { code: 'AFGHANISTAN', name: 'AFGHANISTAN' },
  { code: 'ALBANIA', name: 'ALGERIA' },
  { code: 'ANDORRA', name: 'ANDORRA' },
  { code: 'USA', name: 'United States' },
  { code: 'CANADA', name: 'CANADA' },
  { code: 'MEXICO', name: 'MEXICO' },
  { code: 'IN', name: 'India' },
  { code: 'SG', name: 'Singapore' },
]

sopFormOptions.usaStates = {
  AL: 'Alabama',
  AK: 'Alaska',
  AS: 'American Samoa',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
}

sopFormOptions.canadaStates = {
  AB: 'Alberta',
  BC: 'BritishColumbia',
  NS: 'NorthwestTerr.',
  NU: 'Nunavut',
  OTHER: 'OTHER',
  QC: 'Quebec',
}

sopFormOptions.states = {
  USA: keys(sopFormOptions.usaStates).map((key) => ({
    code: key,
    name: sopFormOptions.usaStates[key],
  })),
  CANADA: keys(sopFormOptions.canadaStates).map((key) => ({
    code: key,
    name: sopFormOptions.canadaStates[key],
  })),
}

sopFormOptions.currentYear = new Date().getFullYear()
sopFormOptions.expiryYearOptions = Array(...Array(15)).map((_, i) => sopFormOptions.currentYear + i)

/* PubSub is used to communicate the state .... Still in tesing */

const pubSub = (function () {
  const topics = {}

  return { subscribe, publish }

  function subscribe(topic, listener) {
    if (!has(topics, topic)) topics[topic] = []
    const index = topics[topic].push(listener) - 1
    return {
      unsubscribe() {
        delete topics[topic][index]
      },
    }
  }

  function publish(topic, data) {
    if (!has(topics, topic)) return
    topics[topic].forEach((listener) => listener(data))
  }
})()

export class SopForm extends React.Component {
  constructor(props, context) {
    super()
    this.state = {
      loading: true,
      showBilling: true,
      displayCVV: true,
      form: {
        value: {},
      },
    }

    this.formatters = {
      billTo_firstName: [Formatters.pattern(/[^a-zA-Z\s]/gi), Formatters.upperCase],
      billTo_lastName: [Formatters.pattern(/[^a-zA-Z\s]/gi), Formatters.upperCase],
      billTo_street1: [Formatters.lowerCase],
      billTo_street2: [Formatters.lowerCase],
      billTo_city: [Formatters.pattern(/[^a-zA-Z\s]/gi), Formatters.upperCase],
      billTo_phoneNumber: [Formatters.pattern(/[^\d]/g), Formatters.pattern(/(\d{3})(\d{3})(\d{4})/gi, '$1/$2-$3')],
    }

    this.cards = props.cards
    this.stateOptions = []
  }

  setCcNumberRef(el) {
    this.ccNumberRef = el
    setTimeout(() => Payment.formatCardNumber(this.ccNumberRef, 16), 10)
  }

  updateState(state) {
    this.setState(state)
  }

  componentDidMount() {
    const { sopRequestJSON } = this.props

    console.log(sopRequestJSON)
    console.log('component did mount')
    const rawValues = [
      { name: 'billTo_firstName', value: 'hopRequestJSON.firstName' },
      { name: 'billTo_lastName', value: 'hopRequestJSON.lastName' },
      { name: 'billTo_street1', value: 'hopRequestJSON.street1' },
      { name: 'billTo_street2', value: 'hopRequestJSON.street2' },
      { name: 'billTo_country', value: 'USA' },
      { name: 'billTo_state', value: '' },
      { name: 'billTo_city', value: 'hopRequestJSON.city' },
      { name: 'billTo_postalCode', value: '46240' },
      { name: 'billTo_phoneNumber', value: '228/563-3034' },
    ].reduce((obj, item) => {
      obj[item.name] = item.value
      return obj
    }, {})

    let billing = true
    if (getRciSopPaymentFormConfig) {
      const { BILLING_DISPLAY_FLG, oscrecords } = getRciSopPaymentFormConfig
      billing = this.state.showBilling = BILLING_DISPLAY_FLG === 'Y'
      this.cards = (oscrecords || [])
        .filter((record) => has(sopFormOptions.cards, record.POINTS_CARD_TYPE_CODE))
        .map((record) => {
          const { POINTS_CARD_TYPE_CODE, CVN_DISPLAY_FLG, CREDIT_CARD_TYPE_DESC, CREDIT_CARD_TYPE_NAME } = record
          const code = POINTS_CARD_TYPE_CODE
          const card = get(sopFormOptions.cards, code)
          card.displayCVV = CVN_DISPLAY_FLG === 'Y'
          card.code = code
          card.desc = CREDIT_CARD_TYPE_DESC
          card.name = CREDIT_CARD_TYPE_NAME
          return card
        })
        .filter(Boolean)
    }
    this.buildForm(rawValues, { billing })
    this.updateState({ loading: false })
  }

  setStateOptions(value) {
    const { states } = sopFormOptions
    this.stateOptions = has(states, value) ? states[value] : []
  }

  ccNumberValidator(control) {
    if (control.updateOn === 'blur') {
      let { value } = control
      const cardValue = Payment.fns.cardType(value)
      const card = this.cards.find((card) => card.type === cardValue)
      if (!isEmpty(value)) {
        if (!card) {
          return { CREDIT_CARD_NOT_AVAILABLE: true }
        }
        // return CCValidators.number(control);
        const pCards = Payment.getCardArray()
        const pCard = pCards.find((c) => c.type === cardValue)
        let valid = true
        value = (value + '').replace(/\s+|-/g, '')
        const ref = value.length
        if (pCard) {
          valid = Array.prototype.indexOf.call(pCard.length, ref) >= 0
        }
        if (!valid) {
          return { CREDIT_NUMBER_LENGTH_INVALID: true }
        }
      }
    }
    return null
  }

  expiryMonthValidator(control) {
    const { value, parent } = control
    if (!isEmpty(value)) {
      if (parent) {
        const expiryYear = parent.get('cc_expiryYear')
        const expiry = parent.get('cc_expiry')
        if (isEmpty(expiryYear.value)) {
          return null
        }
        expiry.value = parent.value['cc_expiry'] = `${value}/${expiryYear.value}`
        const error = CCValidators.expiry(expiry)
        if (error === null) {
          expiryYear.setErrors({})
          control.setErrors({})
        }
        return error
      }
    }
    return null
  }

  expiryYearValidator(control) {
    const { value, parent } = control
    if (!isEmpty(value)) {
      if (control.parent) {
        const expiryMonth = parent.get('cc_expiryMonth')
        const expiry = parent.get('cc_expiry')
        if (isEmpty(expiryMonth.value)) {
          return null
        }
        expiry.value = parent.value['cc_expiry'] = `${expiryMonth.value}/${value}`
        const error = CCValidators.expiry(expiry)
        if (error === null) {
          expiryMonth.setErrors({})
          control.setErrors({})
        }
        return error
      }
    }
    return null
  }

  buildForm(data, { billing }) {
    const defaultValues = {
      cc_name: '',
      cc_number: '',
      cc_expiryMonth: '',
      cc_expiryYear: '',
      cc_expiry: '',
      cc_cvv: '',
      billTo_firstName: '',
      billTo_lastName: '',
      billTo_street1: '',
      billTo_street2: '',
      billTo_country: '',
      billTo_state: '',
      billTo_city: '',
      billTo_postalCode: '',
      billTo_phoneNumber: '',
    }
    const values = keys({ ...defaultValues, ...data }).reduce((acc, name) => {
      acc[name] || (acc[name] = '')
      return acc
    }, data || {})
    this.formGroup = new FormGroup(
      {
        cc_name: [values.cc_name],
        cc_number: [
          values.cc_number,
          [Validators.required, this.ccNumberValidator.bind(this)],
          { onChange: this.onCcNumberChange.bind(this) },
        ],
        cc_expiryMonth: [values.cc_expiryMonth, [Validators.required, this.expiryMonthValidator.bind(this)]],
        cc_expiryYear: [values.cc_expiryYear, [Validators.required, this.expiryYearValidator.bind(this)]],
        cc_expiry: ['', [CCValidators.expiry]],
        cc_cvv: [values.cc_cvv, [Validators.required, CCValidators.cvv]],
      },
      []
    )

    if (billing) {
      this.formGroup.addControls({
        billTo_firstName: [values.billTo_firstName, [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
        billTo_lastName: [values.billTo_lastName, [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
        billTo_street1: [values.billTo_street1, [Validators.required]],
        billTo_street2: [values.billTo_street2],
        billTo_country: [
          values.billTo_country,
          [Validators.required],
          { onChange: this.onAddrCountryChange.bind(this) },
        ],
        billTo_state: [values.billTo_state, [Validators.required]],
        billTo_city: [values.billTo_city, [Validators.required]],
        billTo_postalCode: [values.billTo_postalCode, [Validators.required, Validators.pattern(/^[0-9]{5,6}$/)]],
        billTo_phoneNumber: [values.billTo_phoneNumber],
      })
      if (values.billTo_country) {
        this.setStateOptions(values.billTo_country)
      }
      this.formGroup.updateValidity({ onlySelf: true })
    }
  }

  onAddrCountryChange(value, control) {
    const { parent } = control
    const stateControl = parent.get('billTo_state')
    stateControl.setValue('')
    this.setStateOptions(value)
    if (isEmpty(this.stateOptions)) {
      stateControl.clearValidators()
    } else {
      stateControl.setValidators([Validators.required])
    }
    stateControl.touched = false
    stateControl.updateValidity({ onlySelf: true })
  }

  onCcNumberChange(value, control) {
    const { parent } = control
    const cvvControl = parent.get('cc_cvv')
    const { form } = this.state
    const cardValue = Payment.fns.cardType(value)
    this.card = this.cards.find((card) => card.type === cardValue)
    if (cvvControl) {
      if (value === '' || (this.card && this.card.displayCVV === true))
        cvvControl.setValidators([Validators.required, CCValidators.cvv])
      else cvvControl.clearValidators()
    }
    cvvControl.updateValidity({ onlySelf: true })
    this.state.displayCVV = value === '' || (this.card && this.card.displayCVV === true)
    if (this.card) {
      form.value.cc_desc = this.card.desc
      form.value.cc_type = this.card.name
    }
    if (parent) {
      parent.get('cc_name').value = cardValue || ''
    }
  }

  format(name, value) {
    const formatters = this.formatters[name]
    if (formatters && formatters.length) {
      formatters.forEach((formatter) => (value = formatter({ value })))
    }
    return value
  }

  updateFormState() {
    const { valid, invalid, status, value } = this.formGroup
    const { form } = this.state
    form.valid = valid
    form.invalid = invalid
    form.status = status
    form.value = value
    this.updateState({ form })
  }

  onChange(e, name) {
    e.preventDefault()
    const control = this.formGroup.get(name)
    if (control) {
      control.onChange(e)
      this.updateFormState()
    }
  }

  onBlur(e, name) {
    e.preventDefault()
    const control = this.formGroup.get(name)
    const value = this.format(name, e.target.value)
    if (control) {
      control.value = control.parent.value[name] = value
      control.onBlur(e)
      this.updateFormState()
    }
  }

  onResponse(resp) {
    if (resp.rejectResponse) {
      const { reasonCode, reasonMessage, invalidFields } = resp.rejectResponse
      this.formGroup.errors[`${reasonCode}`] = true
      this.formGroup.reasons[`${reasonCode}`] = reasonMessage

      const fieldMaps = {
        card_expirationMonth: 'cc_expiryMonth',
        billTo_postalCode: 'billTo_postalCode',
      }

      if (reasonCode === 102 && !isEmpty(invalidFields)) {
        invalidFields.forEach((name) => {
          name = has(fieldMaps, name) ? fieldMaps[name] : name
          const control = this.formGroup.get(name)
          if (control) {
            control.errors['invalid'] = true
            control.status = control._calculateStatus()
          }
        })
      }
      if (reasonCode === 231) {
        const control = this.formGroup.get('cc_number')
        control.errors['invalid'] = true
        control.status = control._calculateStatus()
      }
      if (reasonCode === 202) {
        const control = this.formGroup.get('cc_expiryMonth')
        control.errors['expired'] = true
        control.status = control._calculateStatus()
      }
      this.formGroup.status = this.formGroup._calculateStatus()
      this.updateFormState()
    }
  }

  onSubmit(e) {
    e.preventDefault()
    const { form } = this.state
    console.log('form..', form)
    setTimeout(() => {
      this.onResponse(responseJSON)
    }, 1000)
  }

  render() {
    const { loading, error, form, showBilling, displayCVV } = this.state
    const { countryOptions, expiryYearOptions, csvImages } = sopFormOptions
    const { stateOptions, cards, card } = this
    if (loading) return <span>....LOADING</span>
    if (error) return <span>${error}</span>

    const number = this.formGroup.get('cc_number')
    const name = this.formGroup.get('cc_name')
    const expiryMonth = this.formGroup.get('cc_expiryMonth')
    const expiryYear = this.formGroup.get('cc_expiryYear')
    const cvv = this.formGroup.get('cc_cvv')
    const firstName = this.formGroup.get('billTo_firstName')
    const lastName = this.formGroup.get('billTo_lastName')
    const street1 = this.formGroup.get('billTo_street1')
    const street2 = this.formGroup.get('billTo_street2')
    const country = this.formGroup.get('billTo_country')
    const state = this.formGroup.get('billTo_state')
    const city = this.formGroup.get('billTo_city')
    const postalcode = this.formGroup.get('billTo_postalCode')
    const phone = this.formGroup.get('billTo_phoneNumber')

    return (
      <div id='paymentFormDiv' className='col-sm-12 col-xs-12 paddingZero'>
        {keys(this.formGroup.errors).length > 0 && (
          <div className='alert alert-danger' role='alert'>
            {keys(this.formGroup.errors).map((code) => (
              <span>{get(this.formGroup, `reasons.${code}`)}</span>
            ))}
          </div>
        )}
        <form id='SopForm1' onSubmit={(e) => this.onSubmit(e)} noValidate autoComplete={'off'}>
          <input type='' name={'srcSystem_messageId'} value={this.props.srcSystemMessageId} />
          <input type='' name='form-status' value={form.status} />
          <div className='col-sm-12 col-xs-12 mainSopDiv paymentProcessForm'>
            <div>
              <p className='alignleft'>{'Payment Information'}</p>
              <p className='alignright bold'>{'All fields in bold are required'}</p>
            </div>
            <div className='clear' />
            <div className='seperator' />
            <div className='row'>
              <div className='form-group col-sm-6 visible-xs'>
                <label className='form-label bold' />
                <div>
                  {cards.map((card, index) => (
                    <img
                      key={`card_${index.toString()}`}
                      className={`credit-card-image ${card.type !== name.value ? 'inactive' : ''}`}
                      src={card.imageSource}
                      alt={card.type}
                    />
                  ))}
                </div>
              </div>
              <div className={`form-group col-sm-6`} id='card_number'>
                <label className='bold' htmlFor='id_cc_number'>
                  {'Credit Card Number'}
                </label>
                <input
                  ref={(el) => this.setCcNumberRef(el)}
                  type='text'
                  id='card_accountNumber'
                  className='form-control'
                  value={get(number, 'value')}
                  placeholder={'xxxx xxxx xxxx xxxx'}
                  name={'card_accountNumber'}
                  onChange={(e) => this.onChange(e, 'cc_number')}
                  onBlur={(e) => this.onBlur(e, 'cc_number')}
                />
                {number.touched && (
                  <div className='formError inline'>
                    {get(number, 'errors.required') && (
                      <div className='formErrorContent'>Credit card number is required</div>
                    )}
                    {get(number, 'errors.CREDIT_NUMBER_LENGTH_INVALID') && (
                      <div className='formErrorContent'>Credit card number length is invalid</div>
                    )}
                    {get(number, 'errors.CREDIT_CARD_NOT_AVAILABLE') && (
                      <div className='formErrorContent'>Credit card is not available</div>
                    )}
                    {get(number, 'errors.invalid') && (
                      <div className='formErrorContent'>The account number is invalid</div>
                    )}
                  </div>
                )}
              </div>
              <div className='form-group col-sm-6 hidden-xs'>
                <label className='form-label bold' />
                <div className={'credit-card-images'}>
                  {cards.map((card, index) => (
                    <img
                      key={`card_${index.toString()}`}
                      className={`credit-card-image ${card.type !== name.value ? 'inactive' : ''}`}
                      src={card.imageSource}
                      alt={card.type}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className='row'>
              <div className={`form-group col-sm-3`}>
                <label className='bold' htmlFor='id_cc_expiry_month'>
                  {'Expiration Date'}
                </label>
                <select
                  id='card_expirationMonth'
                  className='form-control'
                  value={get(expiryMonth, 'value')}
                  name={'card_expirationMonth'}
                  onChange={(e) => this.onChange(e, 'cc_expiryMonth')}
                  onBlur={(e) => this.onBlur(e, 'cc_expiryMonth')}
                >
                  <option value=''>{'Month'}</option>
                  <option value='01'>01 - Jan</option>
                  <option value='02'>02 - Feb</option>
                  <option value='03'>03 - Mar</option>
                  <option value='04'>04 - Apr</option>
                  <option value='05'>05 - May</option>
                  <option value='06'>06 - June</option>
                  <option value='07'>07 - July</option>
                  <option value='08'>08 - Aug</option>
                  <option value='09'>09 - Sept</option>
                  <option value='10'>10 - Oct</option> <option value='11'>11 - Nov</option>
                  <option value='12'>12 - Dec</option>
                </select>
                {expiryMonth.touched && (
                  <div className='formError inline'>
                    {get(expiryMonth, 'errors.required') && (
                      <div className='formErrorContent'>Credit card expiry month is required</div>
                    )}
                    {get(expiryMonth, 'errors.CREDIT_EXPIRY_INVALID') && (
                      <div className='formErrorContent'>Credit card expiry month is invalid</div>
                    )}
                    {get(expiryMonth, 'errors.expired') && <div className='formErrorContent'>The card has expired</div>}
                  </div>
                )}
              </div>

              <div className={`form-group col-sm-3`}>
                <label className='bold' htmlFor='id_cc_expiry_year'>
                  &nbsp;
                </label>
                <select
                  id='card_expirationYear'
                  className='form-control'
                  value={get(expiryYear, 'value')}
                  name={'card_expirationYear'}
                  onChange={(e) => this.onChange(e, 'cc_expiryYear')}
                  onBlur={(e) => this.onBlur(e, 'cc_expiryYear')}
                >
                  <option value=''>Year</option>
                  {expiryYearOptions.map((expiryYearOption, index) => (
                    <option key={`expiryYear_${index.toString()}`} value={expiryYearOption}>
                      {expiryYearOption}
                    </option>
                  ))}
                </select>
                {expiryYear.touched && (
                  <div className='formError inline'>
                    {get(expiryYear, 'errors.required') && (
                      <div className='formErrorContent'>Credit Card Expiry Year is required</div>
                    )}
                    {get(expiryYear, 'errors.CREDIT_EXPIRY_INVALID') && (
                      <div className='formErrorContent'>Credit card expiry Year is invalid</div>
                    )}
                  </div>
                )}
              </div>

              {displayCVV && (
                <div>
                  <div className={`form-group col-sm-2`}>
                    <label className='bold' htmlFor='id_cc_cvv'>
                      {'CVV'}
                    </label>
                    <input
                      type='text'
                      id='card_cvNumber'
                      className='form-control'
                      value={get(cvv, 'value')}
                      placeholder={'xxx'}
                      name={'cvv'}
                      onChange={(e) => this.onChange(e, 'cc_cvv')}
                      onBlur={(e) => this.onBlur(e, 'cc_cvv')}
                    />
                    {cvv.touched && (
                      <div className='formError inline'>
                        {get(cvv, 'errors.required') && (
                          <div className='formErrorContent'>Credit card secure code is required</div>
                        )}
                        {get(cvv, 'errors.CREDIT_CVV_INVALID') && (
                          <div className='formErrorContent'>Credit card secure code is invalid</div>
                        )}
                      </div>
                    )}
                  </div>
                  {card && (
                    <div className='col-sm-3 form-group'>
                      <label className='bold' />
                      <img
                        src={`${
                          card && card.type === 'amex' ? csvImages.amex.imageSource : csvImages.other.imageSource
                        }`}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {showBilling && (
              <div>
                <div>
                  <p>{'Billing Information'}</p>
                </div>
                <div className='seperator' />

                <div className='row'>
                  <div className={`form-group col-sm-6`}>
                    <label className='bold' htmlFor='id_addr_first_name'>
                      {'First Name'}
                    </label>
                    <input
                      type='text'
                      id='billTo_firstName'
                      className='form-control'
                      value={get(firstName, 'value')}
                      name={'billTo_firstName'}
                      onChange={(e) => this.onChange(e, 'billTo_firstName')}
                      onBlur={(e) => this.onBlur(e, 'billTo_firstName')}
                    />
                    {firstName.touched && (
                      <div className='formError inline'>
                        {get(firstName, 'errors.required') && (
                          <div className='formErrorContent'>First name required</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={`form-group col-sm-6`}>
                    <label className='bold' htmlFor='id_addr_last_name'>
                      {'Last Name'}
                    </label>
                    <input
                      type='text'
                      id='billTo_lastName'
                      className='form-control'
                      value={get(lastName, 'value')}
                      name={'billTo_lastName'}
                      onChange={(e) => this.onChange(e, 'billTo_lastName')}
                      onBlur={(e) => this.onBlur(e, 'billTo_lastName')}
                    />
                    {lastName.touched && (
                      <div className='formError inline'>
                        {get(lastName, 'errors.required') && <div className='formErrorContent'>Last name required</div>}
                      </div>
                    )}
                  </div>
                </div>

                <div className='row'>
                  <div className={`form-group col-sm-6`}>
                    <label className='bold' htmlFor='id_addr_street1'>
                      {'Street Address 1'}
                    </label>
                    <input
                      type='text'
                      id='billTo_street1'
                      className='form-control'
                      value={get(street1, 'value')}
                      name={'billTo_street1'}
                      onChange={(e) => this.onChange(e, 'billTo_street1')}
                      onBlur={(e) => this.onBlur(e, 'billTo_street1')}
                    />
                    {street1.touched && (
                      <div className='formError inline'>
                        {get(street1, 'errors.required') && (
                          <div className='formErrorContent'>Steet Address 1 is required</div>
                        )}
                        {get(street1, 'errors.pattern') && <div className='formErrorContent'>invalid</div>}
                      </div>
                    )}
                  </div>
                  <div className='form-group col-sm-6'>
                    <label htmlFor='id_addr_last_name'>{'Street Address 2'}</label>
                    <input
                      type='text'
                      id='billTo_street2'
                      className='form-control'
                      value={get(street2, 'value')}
                      name={'billTo_street2'}
                      onChange={(e) => this.onChange(e, 'billTo_street2')}
                      onBlur={(e) => this.onBlur(e, 'billTo_street2')}
                    />
                    {street2.touched && (
                      <div className='formError inline'>
                        {get(street1, 'errors.pattern') && <div className='formErrorContent'>invalid</div>}
                      </div>
                    )}
                  </div>
                </div>

                <div className='row'>
                  <div className={`form-group col-sm-6`}>
                    <label className='bold' htmlFor='id_addr_country'>
                      {'Country'}
                    </label>
                    <select
                      id='billTo_country'
                      className='form-control'
                      value={get(country, 'value')}
                      name={'billTo_country'}
                      onChange={(e) => this.onChange(e, 'billTo_country')}
                      onBlur={(e) => this.onBlur(e, 'billTo_country')}
                    >
                      <option value=''>Select Country</option>
                      {countryOptions.map((countryOption, index) => (
                        <option key={`countryOptions_${index.toString()}`} value={get(countryOption, 'code')}>
                          {get(countryOption, 'name')}
                        </option>
                      ))}
                    </select>
                    {country.touched && (
                      <div className='formError inline'>
                        {get(country, 'errors.required') && <div className='formErrorContent'>Country is required</div>}
                      </div>
                    )}
                  </div>
                  <div className={`form-group col-sm-6`}>
                    <label className='bold' htmlFor='id_addr_city'>
                      {'City'}
                    </label>
                    <input
                      type='text'
                      id='billTo_city'
                      className='form-control'
                      value={get(city, 'value')}
                      name={'billTo_city'}
                      onChange={(e) => this.onChange(e, 'billTo_city')}
                      onBlur={(e) => this.onBlur(e, 'billTo_city')}
                    />
                    {city.touched && (
                      <div className='formError inline'>
                        {get(city, 'errors.required') && <div className='formErrorContent'>City is required</div>}
                      </div>
                    )}
                  </div>
                </div>

                <div className='row'>
                  <div
                    className={`form-group col-sm-6 ${
                      isEmpty(get(country, 'value')) || isEmpty(stateOptions) ? 'hidden' : ''
                    }`}
                  >
                    <label className='bold' htmlFor='id_addr_state'>
                      {'State'}
                    </label>
                    <select
                      id='billTo_state'
                      className='form-control'
                      value={get(state, 'value')}
                      name={'billTo_state'}
                      onChange={(e) => this.onChange(e, 'billTo_state')}
                      onBlur={(e) => this.onBlur(e, 'billTo_state')}
                    >
                      <option value=''>Select State</option>
                      {stateOptions.map((stateOption, index) => (
                        <option key={`stateOption_${index.toString()}`} value={get(stateOption, 'code')}>
                          {get(stateOption, 'name')}
                        </option>
                      ))}
                    </select>
                    {state.touched && (
                      <div className='formError inline'>
                        {get(state, 'errors.required') && <div className='formErrorContent'>State is required</div>}
                      </div>
                    )}
                  </div>
                  <div className={`form-group col-sm-6`}>
                    <label className='bold' htmlFor='id_addr_postalcode'>
                      {'Postal Code'}
                    </label>
                    <input
                      type='text'
                      id='billTo_postalCode'
                      className='form-control'
                      value={get(postalcode, 'value')}
                      name={'billTo_postalCode'}
                      onChange={(e) => this.onChange(e, 'billTo_postalCode')}
                      onBlur={(e) => this.onBlur(e, 'billTo_postalCode')}
                    />
                    {postalcode.touched && (
                      <div className='formError inline'>
                        {get(postalcode, 'errors.required') && (
                          <div className='formErrorContent'>Postal code is required</div>
                        )}
                        {get(postalcode, 'errors.pattern') && <div className='formErrorContent'>invalid</div>}
                        {get(postalcode, 'errors.invalid') && (
                          <div className='formErrorContent'>The card has expired</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={`form-group col-sm-6`}>
                    <label htmlFor='id_addr_phone'>{'Phone Number'}</label>
                    <input
                      type='text'
                      id='billTo_phoneNumber'
                      className='form-control'
                      value={get(phone, 'value')}
                      name={'billTo_phoneNumber'}
                      onChange={(e) => this.onChange(e, 'billTo_phoneNumber')}
                      onBlur={(e) => this.onBlur(e, 'billTo_phoneNumber')}
                    />
                    {phone.touched && (
                      <div className='formError inline'>
                        {get(phone, 'errors.pattern') && <div className='formErrorContent'>invalid</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className='row'>
              {card && [
                <input type='hidden' name={'card_cardType'} value={card.desc} />,
                <input type='hidden' name={'methodOfPayment'} value={card.name} />,
              ]}
            </div>
            <div className='row'>
              <div className='col-sm-3'>
                <button type='submit' className='btn btn-primary' disabled={form.invalid}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }
}
