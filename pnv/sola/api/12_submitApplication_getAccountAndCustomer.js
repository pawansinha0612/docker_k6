import jwtUtil from './jwt.js'
import { check } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'
import logger from './util.js'
// import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js'

let transName = '12_submitApplication_getAccountAndCustomer'
let T01pass_Rate = new Rate('12_submitApplication_getAccountAndCustomer_Pass_Rate')
let T01failed_Count = new Counter('12_submitApplication_getAccountAndCustomer_Fail_Count')
let T01pass_Count = new Counter('12_submitApplication_getAccountAndCustomer_Pass_Count')
let getSubmit = new Trend('12_submitApplication_getAccountAndCustomer')
let errorRate = new Rate('errors')

const getsubmitAccountAndCustomerQuery = JSON.parse(open('./../payload/12_submitApplication_getAccountAndCustomer.json'))

let submitApplication_getAccountAndCustomerF = function () {

    getsubmitAccountAndCustomerQuery.variables['traceID'] = jwtUtil.create_UUID()
    getsubmitAccountAndCustomerQuery.variables.orderNumbers = orderNumber

    logger.Logger(JSON.stringify(getsubmitAccountAndCustomerQuery))
    logger.Logger('Starting 12_submitApplication_getAccountAndCustomer for Iteration ' + (__ITER + 1))
    let res = jwtUtil.PostWithValidJwt(baseURL + '/apply', getsubmitAccountAndCustomerQuery, configJson)
    let validateData = JSON.parse(res.body)
    logger.Logger('12_submitApplication_getAccountAndCustomer status code is :: ' + res.status)
    logger.Logger('Post 12_submitApplication_getAccountAndCustomer Body is :: ' + res.body)

    check(res, {
        'status was 200': (res) => res.status == 200,
        'transaction time OK': (res) => res.timings.duration < config.SLA.submitApplication_getAccountAndCustomerF,
        'content OK for 12_submitApplication_getAccountAndCustomer': (res) => {
            if (res.status == 200) {
                if (Object.keys(JSON.parse(res.body)) == 'data') {
                    TranStatus = 'PASS'
                    getSubmit.add(res.timings.duration)
                    logger.Logger('response time for 12_submitApplication_getAccountAndCustomer:' + (res.timings.duration))
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
    submitApplication_getAccountAndCustomerF
})
