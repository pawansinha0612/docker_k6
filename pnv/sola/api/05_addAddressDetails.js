import jwtUtil from './jwt.js'
import { check } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'
import logger from './util.js'
// import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js'

let T01pass_Rate = new Rate('05_addAddressDetails_Pass_Rate')
let T01failed_Count = new Counter('05_addAddressDetails_Fail_Count')
let T01pass_Count = new Counter('05_addAddressDetails_Pass_Count')
let getAddress = new Trend('05_addAddressDetails')
let errorRate = new Rate('errors')

const getAddressQuery = JSON.parse(open('./../payload/05_addAddressDetails.json'))

let getAddressF = function () {

	getAddressQuery.variables.ids.orderIDIn[0].orderNumber = orderNumber
	getAddressQuery.variables.ids.orderIDIn[0].version = versionAddress
	getAddressQuery.variables.product.mapping[0].product[0].productType = productType
	getAddressQuery.variables.product.mapping[0].product[0].appSourceCode = appSourceCode
	getAddressQuery.variables.ids.basket = basketID
	getAddressQuery.variables.appData.personal.title = title
	getAddressQuery.variables.appData.personal.gender = gender
	getAddressQuery.variables.appData.personal.firstName = firstName
	getAddressQuery.variables.appData.personal.middleName = middleName
	getAddressQuery.variables.appData.personal.lastName = lastName
	getAddressQuery.variables.appData.personal.dateOfBirth = dateOfBirth
	getAddressQuery.variables.appData.personal.email = email
	getAddressQuery.variables.ids['traceID'] = jwtUtil.create_UUID();

	logger.Logger('Starting 05_addAddressDetails for Iteration ' + (__ITER + 1))
	let res = jwtUtil.PostWithValidJwt(baseURL + '/apply', getAddressQuery, configJson)
	logger.Logger('05_addAddressDetails status code is :: ' + res.status)
	logger.Logger('Post 05_addAddressDetails Body is :: ' + res.body)

	let content = JSON.parse(res.body)
	versionContact = content.data.submitApplication.orders[0].orderID.version

	check(res, {
		'status was 200': (res) => res.status == 200,
		'transaction time OK': (res) => res.timings.duration < config.SLA.getAddressF,
		'content OK for 05_addAddressDetails': (res) => {
			if (res.status == 200) {
				if (Object.keys(JSON.parse(res.body)) == 'data') {
					TranStatus = 'PASS'
					getAddress.add(res.timings.duration)
					logger.Logger('response time for 05_addAddressDetails:' + (res.timings.duration))
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
	getAddressF
})
