import jwtUtil from './jwt.js'
import { check } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'
import logger from './util.js'
// import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js'

let T01pass_Rate = new Rate('09_addCardColor_Pass_Rate')
let T01failed_Count = new Counter('09_addCardColor_Fail_Count')
let T01pass_Count = new Counter('09_addCardColor_Pass_Count')
let getColor = new Trend('09_addCardColor')
let errorRate = new Rate('errors')

const getCardColorQuery = JSON.parse(open('./../payload/09_addCardColor.json'))

let addCardColorF = function () {

	getCardColorQuery.variables.appData.contactNumbers.mobileNumber = mobileNumber
	getCardColorQuery.variables.ids.orderIDIn[0].orderNumber = orderNumber
	getCardColorQuery.variables.ids.orderIDIn[0].version = versionResidency
	getCardColorQuery.variables.product.mapping[0].product[0].productType = productType
	getCardColorQuery.variables.product.mapping[0].product[0].appSourceCode = appSourceCode
	getCardColorQuery.variables.ids.basket = basketID
	getCardColorQuery.variables.appData.personal.title = title
	getCardColorQuery.variables.appData.personal.gender = gender
	getCardColorQuery.variables.appData.personal.firstName = firstName
	getCardColorQuery.variables.appData.personal.middleName = middleName
	getCardColorQuery.variables.appData.personal.lastName = lastName
	getCardColorQuery.variables.appData.personal.dateOfBirth = dateOfBirth
	getCardColorQuery.variables.appData.personal.email = email
	getCardColorQuery.variables.ids['traceID'] = jwtUtil.create_UUID();

	logger.Logger('Starting 09_addCardColor for Iteration ' + (__ITER + 1))
	let res = jwtUtil.PostWithValidJwt(baseURL + '/apply', getCardColorQuery, configJson)
	logger.Logger('09_addCardColor status code is :: ' + res.status)
	logger.Logger('Post 09_addCardColor Body is :: ' + res.body)

	let content = JSON.parse(res.body)
	versionSubmit = content.data.submitApplication.orders[0].orderID.version

	check(res, {
		'status was 200': (res) => res.status == 200,
		'transaction time OK': (res) => res.timings.duration < config.SLA.addCardColorF,
		'content OK for 09_addCardColor': (res) => {
			if (res.status == 200) {
				if (Object.keys(JSON.parse(res.body)) == 'data') {
					TranStatus = 'PASS'
					getColor.add(res.timings.duration)
					logger.Logger('response time for 09_addCardColor:' + (res.timings.duration))
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
	addCardColorF
})
