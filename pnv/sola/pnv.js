import { group, sleep } from 'k6'
import getProduct from './api/00_getProduct.js'
import getToken from './api/01_getJWT.js'
import getSchema from './api/02_getSchema.js'
import getReferenceData from './api/03_getReferenceData.js'
import getOrder from './api/04_getOrderAboutYou.js'
import getAddress from './api/05_addAddressDetails.js'
import getContact from './api/06_addContactNumber.js'
import getTaxResidency from './api/07_addTaxResidency.js'
import addIdentityAndSecurity from './api/08_addIdentityAndSecurity.js'
import addCardColor from './api/09_addCardColor.js'
import submitApplication from './api/10_submitApplication.js'
import submitApplication_statusCheck from './api/11_submitApplication_statusCheck.js'
import submitApplication_getAccountAndCustomer from './api/12_submitApplication_getAccountAndCustomer.js'

const configFile = JSON.parse(open('./config/env.json'))
const config = JSON.parse(open('./config.json'))
var env = `${__ENV.ENVIRONMENT}`
let configJson = configFile[env]
let baseURL = configJson.url
let thinkTime = config.thinkTime
let thinkTime1 = config.thinkTime1

var LoggerTag = config.log

var TranStatus
var JWTToken = null
var orderNumber = 0
var versionAddress = 0
var basketID = 0
var versionContact = 0
var versionResidency = 0
var versionSecurity = 0
var seq = 0
var productType = 0
var appSourceCode = 0
var personalDataCount = 0
var gender = 0
var firstName = 0
var middleName = 0
var lastName = 0
var dateOfBirth = 0
var email = 0
var title = 0
var count = 0
var contactDataCount = 0
var mobileNumber = 0
var versionColor = 0
var versionSubmit = 0
var flagaddupdate = 'notset'
var statusCount = 0

export default function () {

	group('00_getProduct', getProduct.getProductF), sleep(thinkTime)
	group('01_getJWT', getToken.getJWT), sleep(thinkTime)
	group('02_getSchema', getSchema.getSchemaF), sleep(thinkTime)
	group('03_getReferenceData', getReferenceData.getReferenceDataF), sleep(thinkTime)
	group('04_getOrderAboutYou', getOrder.getOrderF), sleep(thinkTime)
	group('05_addAddressDetails', getAddress.getAddressF), sleep(thinkTime)
	group('06_addContactNumber', getContact.getContactF), sleep(thinkTime)
	group('07_addTaxResidency', getTaxResidency.getTaxResidencyF), sleep(thinkTime)
	group("08_addIdentityAndSecurity", addIdentityAndSecurity.addIdentityAndSecurityF), sleep(thinkTime)
	group("09_addCardColor", addCardColor.addCardColorF), sleep(thinkTime)
	group('10_submitApplication', submitApplication.submitApplicationF), sleep(thinkTime)
	group('11_submitApplication_statusCheck', submitApplication_statusCheck.submitApplication_statusCheckF), sleep(thinkTime1)
	while (flagaddupdate != 'completed') {
		statusCount++
		group('11_submitApplication_statusCheck', submitApplication_statusCheck.submitApplication_statusCheckF), sleep(thinkTime1)
		if (statusCount == 5) {
			flagaddupdate = 'completed'
		}
	}
	group('12_submitApplication_getAccountAndCustomer', submitApplication_getAccountAndCustomer.submitApplication_getAccountAndCustomerF), sleep(thinkTime)


}
