import jwtUtil from './jwt.js'
import { check } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'
import logger from './util.js'
// import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js'

let T01pass_Rate = new Rate('04_getOrderAboutYou_Pass_Rate')
let T01failed_Count = new Counter('04_getOrderAboutYou_Fail_Count')
let T01pass_Count = new Counter('04_getOrderAboutYou_Pass_Count')
let getOrder = new Trend('04_getOrderAboutYou')
let errorRate = new Rate('errors')

const getOrderQuery = JSON.parse(open('./../payload/04_getOrderAboutYou.json'))
const getPersonalDetails = JSON.parse(open("./../data/personal.json"))

let getOrderF = function () {

	personalDataCount = personalDataCount + 1
	if (personalDataCount == getPersonalDetails.length) {
		personalDataCount = 0
	}
	title = getPersonalDetails[personalDataCount].title
	gender = getPersonalDetails[personalDataCount].gender
	firstName = getPersonalDetails[personalDataCount].firstName
	middleName = getPersonalDetails[personalDataCount].middleName
	lastName = getPersonalDetails[personalDataCount].lastName
	dateOfBirth = getPersonalDetails[personalDataCount].dateOfBirth
	email = getPersonalDetails[personalDataCount].email

	getOrderQuery.variables.product.mapping[0].product[0].productType = productType
	getOrderQuery.variables.product.mapping[0].product[0].appSourceCode = appSourceCode
	getOrderQuery.variables.appData.personal.title = title
	getOrderQuery.variables.appData.personal.gender = gender
	getOrderQuery.variables.appData.personal.firstName = firstName
	getOrderQuery.variables.appData.personal.middleName = middleName
	getOrderQuery.variables.appData.personal.lastName = lastName
	getOrderQuery.variables.appData.personal.dateOfBirth = dateOfBirth
	getOrderQuery.variables.appData.personal.email = email
	getOrderQuery.variables.ids['traceID'] = jwtUtil.create_UUID();

	logger.Logger('Starting 04_getOrderAboutYou for Iteration ' + (__ITER + 1))
	let res = jwtUtil.PostWithValidJwt(baseURL + '/apply', getOrderQuery, configJson)
	logger.Logger('04_getOrderAboutYou status code is :: ' + res.status)
	logger.Logger('Post 04_getOrderAboutYou Body is :: ' + res.body)

	let content = JSON.parse(res.body)
	orderNumber = content.data.submitApplication.orders[0].orderID.orderNumber
	versionAddress = content.data.submitApplication.orders[0].orderID.version
	basketID = content.data.submitApplication.basket

	check(res, {
		'status was 200': (res) => res.status == 200,
		'transaction time OK': (res) => res.timings.duration < config.SLA.getOrderF,
		'content OK for 04_getOrderAboutYou': (res) => {
			if (res.status == 200) {
				if (Object.keys(JSON.parse(res.body)) == 'data') {
					TranStatus = 'PASS'
					getOrder.add(res.timings.duration)
					logger.Logger('response time for 04_getOrderAboutYou:' + (res.timings.duration))
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
	getOrderF
})
