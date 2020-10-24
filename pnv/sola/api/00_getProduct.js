import jwtUtil from './jwt.js'
import { check } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'
import logger from './util.js'
// import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js'

let T01pass_Rate = new Rate('00_getProduct_Pass_Rate')
let T01failed_Count = new Counter('00_getProduct_Fail_Count')
let T01pass_Count = new Counter('00_getProduct_Pass_Count')
let getProducts = new Trend('00_getProduct')
let errorRate = new Rate('errors')

const getProduct_POST = JSON.parse(open('./../payload/00_getProduct.json'))
const getProductDetails = JSON.parse(open('./../data/product.json'))

let getProductF = function () {
	if (seq == getProductDetails.length) {
		seq = 0
	}
	seq = seq + 1
	productType = getProductDetails[seq].productType
	appSourceCode = getProductDetails[seq].appSourceCode
	getProduct_POST.variables.req['productType'] = productType
	getProduct_POST.variables.req['traceID'] = jwtUtil.create_UUID();
	logger.Logger('Starting 00_getProduct for Iteration ' + (__ITER + 1))
	let res = jwtUtil.PostWithValidJwt(baseURL + '/apply', getProduct_POST, configJson)
	logger.Logger('00_getProduct status code is :: ' + res.status)
	logger.Logger('Post 00_getProduct Body is :: ' + res.body)

	check(res, {
		'status was 200': (res) => res.status == 200,
		'transaction time OK': (res) => res.timings.duration < config.SLA.getProductF,
		'content OK for 00_getProduct': (res) => {
			if (res.status == 200) {
				if (Object.keys(JSON.parse(res.body)) == 'data') {
					TranStatus = 'PASS'
					getProducts.add(res.timings.duration)
					logger.Logger('response time for 00_getProduct:' + (res.timings.duration))
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
	getProductF
})
