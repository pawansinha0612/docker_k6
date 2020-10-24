import jwtUtil from './jwt.js'
import { check } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'
import logger from './util.js'
// import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js'

let T01pass_Rate = new Rate('02_getSchema_Pass_Rate')
let T01failed_Count = new Counter('02_getSchema_Fail_Count')
let T01pass_Count = new Counter('02_getSchema_Pass_Count')
let getReference = new Trend('02_getSchema')
let errorRate = new Rate('errors')

const getSchemaQuery = JSON.parse(open('./../payload/02_getSchema.json'))

let getSchemaF = function () {

	getSchemaQuery.variables.schemaReq['traceID'] = jwtUtil.create_UUID();
	getSchemaQuery.variables.schemaReq.authDataIn['jwtToken'] = JWTToken
	logger.Logger('Starting 02_getSchema for Iteration ' + (__ITER + 1))
	let res = jwtUtil.PostWithValidJwt(baseURL + '/apply', getSchemaQuery, configJson)
	logger.Logger('02_getSchema status code is :: ' + res.status)
	logger.Logger('Post 02_getSchema Body is :: ' + res.body)

	check(res, {
		'status was 200': (res) => res.status == 200,
		'transaction time OK': (res) => res.timings.duration < config.SLA.getSchemaF,
		'content OK for 02_getSchema': (res) => {
			if (res.status == 200) {
				if (Object.keys(JSON.parse(res.body)) == 'data') {
					TranStatus = 'PASS'
					getReference.add(res.timings.duration)
					logger.Logger('response time for 02_getSchema:' + (res.timings.duration))
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
	getSchemaF
})
