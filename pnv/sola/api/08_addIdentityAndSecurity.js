import jwtUtil from './jwt.js'
import { check } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'
import logger from './util.js'
// import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js'

let T01pass_Rate = new Rate('08_addIdentityAndSecurity_Pass_Rate')
let T01failed_Count = new Counter('08_addIdentityAndSecurity_Fail_Count')
let T01pass_Count = new Counter('08_addIdentityAndSecurity_Pass_Count')
let getSecurity = new Trend('08_addIdentityAndSecurity')
let errorRate = new Rate('errors')

const getIdentityAndSecurityQuery = JSON.parse(open('./../payload/08_addIdentityAndSecurity.json'))

let addIdentityAndSecurityF = function () {

	getIdentityAndSecurityQuery.variables.appData.contactNumbers.mobileNumber = mobileNumber
	getIdentityAndSecurityQuery.variables.ids.orderIDIn[0].orderNumber = orderNumber
	getIdentityAndSecurityQuery.variables.product.mapping[0].product[0].productType = productType
	getIdentityAndSecurityQuery.variables.product.mapping[0].product[0].appSourceCode = appSourceCode
	getIdentityAndSecurityQuery.variables.ids.orderIDIn[0].version = versionSecurity
	getIdentityAndSecurityQuery.variables.ids.basket = basketID

	getIdentityAndSecurityQuery.variables.appData.personal.title = title
	getIdentityAndSecurityQuery.variables.appData.personal.gender = gender
	getIdentityAndSecurityQuery.variables.appData.personal.firstName = firstName
	getIdentityAndSecurityQuery.variables.appData.personal.middleName = middleName
	getIdentityAndSecurityQuery.variables.appData.personal.lastName = lastName
	getIdentityAndSecurityQuery.variables.appData.personal.dateOfBirth = dateOfBirth
	getIdentityAndSecurityQuery.variables.appData.personal.email = email
	getIdentityAndSecurityQuery.variables.ids['traceID'] = jwtUtil.create_UUID();

	logger.Logger(JSON.stringify(getIdentityAndSecurityQuery))
	logger.Logger('Starting 08_addIdentityAndSecurity for Iteration ' + (__ITER + 1))
	let res = jwtUtil.PostWithValidJwt(baseURL + '/apply', getIdentityAndSecurityQuery, configJson)
	logger.Logger('08_addIdentityAndSecurity status code is :: ' + res.status)
	logger.Logger('Post 08_addIdentityAndSecurity Body is :: ' + res.body)

	let content = JSON.parse(res.body)
	versionColor = content.data.submitApplication.orders[0].orderID.version

	check(res, {
		'status was 200': (res) => res.status == 200,
		'transaction time OK': (res) => res.timings.duration < config.SLA.addIdentityAndSecurityF,
		'content OK for 08_addIdentityAndSecurity': (res) => {
			if (res.status == 200) {
				if (Object.keys(JSON.parse(res.body)) == 'data') {
					TranStatus = 'PASS'
					getSecurity.add(res.timings.duration)
					logger.Logger('response time for 08_addIdentityAndSecurity:' + (res.timings.duration))
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
	addIdentityAndSecurityF
})
