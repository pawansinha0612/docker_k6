import http from 'k6/http'

let applyReqHeaders = {
	'accept': '*/*',
	'content-type': 'content-type: application/json',
	'accept-language': 'en-US,en;q=0.9',
	'sec-fetch-dest': 'empty',
	'sec-fetch-mode': 'cors',
	'referer': 'https://apply-onyx.apps-qa.dev.anz/?apptype=ind&customertype=ntb&producttype=aa&schema=sola&sourcecode_1=QVM',
	'sec-fetch-site': 'cross-site',
	'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36'
}

function PostWithValidJwt(endpoint, body, env) {
	applyReqHeaders['origin'] = env.url
	applyReqHeaders['Authorization'] = JWTToken
	// Default Timeout is 1 min for K6, its increased to 3 mins to wait until response comes back
        let res = http.post(endpoint, JSON.stringify(body), {headers: applyReqHeaders, timeout: 180000})
	return res
}

function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

export default Object.freeze({
	PostWithValidJwt,
	create_UUID
})
