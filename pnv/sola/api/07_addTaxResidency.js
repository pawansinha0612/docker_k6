import jwtUtil from './jwt.js'
import { check } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'
import logger from './util.js'
// import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js'

let T01pass_Rate = new Rate('07_addTaxResidency_Pass_Rate')
let T01failed_Count = new Counter('07_addTaxResidency_Fail_Count')
let T01pass_Count = new Counter('07_addTaxResidency_Pass_Count')
let getResidency = new Trend('07_addTaxResidency')
let errorRate = new Rate('errors')

const getTaxResidencyQuery = JSON.parse(open('./../payload/07_addTaxResidency.json'))

let getTaxResidencyF = function () {

	getTaxResidencyQuery.variables.appData.contactNumbers.mobileNumber = mobileNumber
	getTaxResidencyQuery.variables.ids.orderIDIn[0].orderNumber = orderNumber
	getTaxResidencyQuery.variables.ids.orderIDIn[0].version = versionResidency
	getTaxResidencyQuery.variables.product.mapping[0].product[0].productType = productType
	getTaxResidencyQuery.variables.product.mapping[0].product[0].appSourceCode = appSourceCode
	getTaxResidencyQuery.variables.ids.basket = basketID
	getTaxResidencyQuery.variables.appData.personal.title = title
	getTaxResidencyQuery.variables.appData.personal.gender = gender
	getTaxResidencyQuery.variables.appData.personal.firstName = firstName
	getTaxResidencyQuery.variables.appData.personal.middleName = middleName
	getTaxResidencyQuery.variables.appData.personal.lastName = lastName
	getTaxResidencyQuery.variables.appData.personal.dateOfBirth = dateOfBirth
	getTaxResidencyQuery.variables.appData.personal.email = email
	getTaxResidencyQuery.variables.ids['traceID'] = jwtUtil.create_UUID();

	logger.Logger('Starting 07_addTaxResidency for Iteration ' + (__ITER + 1))
	let res = jwtUtil.PostWithValidJwt(baseURL + '/apply', getTaxResidencyQuery, configJson)
	logger.Logger('07_addTaxResidency status code is :: ' + res.status)
	logger.Logger('Post 07_addTaxResidency Body is :: ' + res.body)

	let content = JSON.parse(res.body)
	versionSecurity = content.data.submitApplication.orders[0].orderID.version

	check(res, {
		'status was 200': (res) => res.status == 200,
		'transaction time OK': (res) => res.timings.duration < config.SLA.getTaxResidencyF,
		'content OK for 07_addTaxResidency': (res) => {
			if (res.status == 200) {
				if (Object.keys(JSON.parse(res.body)) == 'data') {
					TranStatus = 'PASS'
					getResidency.add(res.timings.duration)
					logger.Logger('response time for 07_addTaxResidency:' + (res.timings.duration))
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
	getTaxResidencyF
})
