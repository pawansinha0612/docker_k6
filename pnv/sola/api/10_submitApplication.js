import jwtUtil from './jwt.js'
import { check } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'
import logger from './util.js'
// import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js'

let transName = '10_submitApplication'
let T01pass_Rate = new Rate('10_submitApplication_Pass_Rate')
let T01failed_Count = new Counter('10_submitApplication_Fail_Count')
let T01pass_Count = new Counter('10_submitApplication_Pass_Count')
let getSubmit = new Trend('10_submitApplication')
let errorRate = new Rate('errors')

const getsubmitApplicationQuery = JSON.parse(open('./../payload/10_submitApplication.json'))

let submitApplicationF = function () {

	getsubmitApplicationQuery.variables.appData.contactNumbers.mobileNumber = mobileNumber
	getsubmitApplicationQuery.variables.product.mapping[0].product[0].productType = productType
	getsubmitApplicationQuery.variables.product.mapping[0].product[0].appSourceCode = appSourceCode
	getsubmitApplicationQuery.variables.appData.personal.title = title
	getsubmitApplicationQuery.variables.appData.personal.gender = gender
	getsubmitApplicationQuery.variables.appData.personal.firstName = firstName
	getsubmitApplicationQuery.variables.appData.personal.middleName = middleName
	getsubmitApplicationQuery.variables.appData.personal.lastName = lastName
	getsubmitApplicationQuery.variables.appData.personal.dateOfBirth = dateOfBirth
	getsubmitApplicationQuery.variables.appData.personal.email = email
	getsubmitApplicationQuery.variables.ids['traceID'] = jwtUtil.create_UUID()

	getsubmitApplicationQuery.variables.ids.orderIDIn[0].orderNumber = orderNumber
	getsubmitApplicationQuery.variables.ids.orderIDIn[0].version = versionSubmit
	getsubmitApplicationQuery.variables.ids.basket = basketID
	logger.Logger(JSON.stringify(getsubmitApplicationQuery))
	logger.Logger('Starting 10_submitApplication for Iteration ' + (__ITER + 1))
	let res = jwtUtil.PostWithValidJwt(baseURL + '/apply', getsubmitApplicationQuery, configJson)
	logger.Logger('10_submitApplication status code is :: ' + res.status)
	logger.Logger('Post 10_submitApplication Body is :: ' + res.body)

	check(res, {
		'status was 200': (res) => res.status == 200,
		'transaction time OK': (res) => res.timings.duration < config.SLA.submitApplicationF,
		'content OK for 10_submitApplication': (res) => {
			if (res.status == 200) {
				if (Object.keys(JSON.parse(res.body)) == 'data') {
					TranStatus = 'PASS'
					getSubmit.add(res.timings.duration)
					logger.Logger('response time for 10_submitApplication:' + (res.timings.duration))
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
	submitApplicationF
})
