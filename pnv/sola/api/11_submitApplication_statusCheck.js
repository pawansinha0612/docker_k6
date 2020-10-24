import jwtUtil from './jwt.js'
import { check } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'
import logger from './util.js'
// import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js'

let transName = '11_submitApplication_statusCheck'
let T01pass_Rate = new Rate('11_submitApplication_statusCheck_Pass_Rate')
let T01failed_Count = new Counter('11_submitApplication_statusCheck_Fail_Count')
let T01pass_Count = new Counter('11_submitApplication_statusCheck_Pass_Count')
let getSubmit = new Trend('11_submitApplication_statusCheck')
let errorRate = new Rate('errors')

const getsubmitStatusCheckQuery = JSON.parse(open('./../payload/11_submitApplication_statusCheck.json'))

let submitApplication_statusCheckF = function () {

	getsubmitStatusCheckQuery.variables['traceID'] = jwtUtil.create_UUID()
	getsubmitStatusCheckQuery.variables.orderNumbers = orderNumber

	logger.Logger(JSON.stringify(getsubmitStatusCheckQuery))
	logger.Logger('Starting 11_submitApplication_statusCheck for Iteration ' + (__ITER + 1))
	let res = jwtUtil.PostWithValidJwt(baseURL + '/apply', getsubmitStatusCheckQuery, configJson)
	let validateData = JSON.parse(res.body)
	logger.Logger('11_submitApplication_statusCheck status code is :: ' + res.status)
	logger.Logger('Post 11_submitApplication_statusCheck Body is :: ' + res.body)

	check(res, {
		'status was 200': (res) => res.status == 200,
		'transaction time OK': (res) => res.timings.duration < config.SLA.submitApplication_statusCheckF,
		'content OK for 11_submitApplication_statusCheck': (res) => {
			if (res.status == 200) {
				if (Object.keys(JSON.parse(res.body)) == 'data') {
					if (((validateData.data.getOrderState.orders[0].status)) == 'completed') {
						flagaddupdate = 'completed'
					}
					TranStatus = 'PASS'
					getSubmit.add(res.timings.duration)
					logger.Logger('response time for 11_submitApplication_statusCheck:' + (res.timings.duration))
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
	submitApplication_statusCheckF
})
