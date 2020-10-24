import jwtUtil from './jwt.js'
import { check } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'
import logger from './util.js'
// import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js'

let T01pass_Rate = new Rate('06_addContactNumber_Pass_Rate')
let T01failed_Count = new Counter('06_addContactNumber_Fail_Count')
let T01pass_Count = new Counter('06_addContactNumber_Pass_Count')
let getContact = new Trend('06_addContactNumber')
let errorRate = new Rate('errors')

const getContactQuery = JSON.parse(open('./../payload/06_addContactNumber.json'))
const getContactNumber = JSON.parse(open("./../data/contactNumbers.json"))

let getContactF = function () {

	contactDataCount = contactDataCount + 1
	if (contactDataCount == getContactNumber.length) {
		contactDataCount = 0
	}
	mobileNumber = getContactNumber[contactDataCount].mobileNumber

	getContactQuery.variables.appData.contactNumbers.mobileNumber = mobileNumber
	getContactQuery.variables.ids.orderIDIn[0].orderNumber = orderNumber
	getContactQuery.variables.ids.orderIDIn[0].version = versionContact
	getContactQuery.variables.product.mapping[0].product[0].productType = productType
	getContactQuery.variables.product.mapping[0].product[0].appSourceCode = appSourceCode
	getContactQuery.variables.appData.personal.title = title
	getContactQuery.variables.appData.personal.gender = gender
	getContactQuery.variables.appData.personal.firstName = firstName
	getContactQuery.variables.appData.personal.middleName = middleName
	getContactQuery.variables.appData.personal.lastName = lastName
	getContactQuery.variables.appData.personal.dateOfBirth = dateOfBirth
	getContactQuery.variables.appData.personal.email = email
	getContactQuery.variables.ids.basket = basketID
	getContactQuery.variables.ids['traceID'] = jwtUtil.create_UUID();

	logger.Logger('Starting 06_addContactNumber for Iteration ' + (__ITER + 1))
	let res = jwtUtil.PostWithValidJwt(baseURL + '/apply', getContactQuery, configJson)
	logger.Logger('06_addContactNumber status code is :: ' + res.status)
	logger.Logger('Post 06_addContactNumber Body is :: ' + res.body)

	let content = JSON.parse(res.body)
	versionResidency = content.data.submitApplication.orders[0].orderID.version

	check(res, {
		'status was 200': (res) => res.status == 200,
		'transaction time OK': (res) => res.timings.duration < config.SLA.getContactF,
		'content OK for 06_addContactNumber': (res) => {
			if (res.status == 200) {
				if (Object.keys(JSON.parse(res.body)) == 'data') {
					TranStatus = 'PASS'
					getContact.add(res.timings.duration)
					logger.Logger('response time for 06_addContactNumber:' + (res.timings.duration))
					T01pass_Rate.add(1)
					T01pass_Count.add(1)
					return true
				}
				else {
					TranStatus = 'FAIL'
					T01pass_Rate.add(0)
					T01failed_Count.add(1)
					return false
				}
			}
			else {
				TranStatus = 'FAIL'
				T01pass_Rate.add(0)
				T01failed_Count.add(1)
				return false
			}
		}
	}) || errorRate.add(1)
}

export default Object.freeze({
	getContactF
})
