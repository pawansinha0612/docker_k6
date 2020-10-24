import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from "k6/metrics";

var responseDuration = new Trend("duration");

export default function() {
  var url = __ENV.TARGET_URL;

  //payload for state code request for sola
  var payload = JSON.stringify({"query":"query getApplicationContext() {\n    getApplicationContext (\n        appRequest: {\n            orderType: sola\n            traceID: \"00e32378-fcf0-4568-982e-68dd954bf053\"\n            productRequest: {\n                featureType:\"sola\"\n                featureSetDefinition:\"solaID\"\n                featureTypeValue:\"AA\"\n            }\n            refDataRequests:[\n                stateCode,\n                streetType,\n            ]\n        })\n    {\n        authData{\n            jwtToken\n            expiresIn\n            uuid\n        }\n        productData{data}\n        refData{\n            stateCode{\n                code\n                value\n            }\n            streetType{\n                code\n                value\n            }\n        }\n    }\n}","variables":null})
  var params =  { headers: { "Content-Type": "application/json" } }

  var res = http.post(url, payload, params);

  check(res, {
     "is status 200": (r) => r.status === 200,
   });

  responseDuration.add(res.timings.duration);

};
