// This is just simple example of performance test
// It consists of two phases
// * warm up
// * api test with constant throughput
// The test will fail when 95th percentile is not preserved or there is to many failed requests (response status is different then 200)
// Call example:  k6 run test-api.js -e URL=https://test-api.k6.io/public/crocodiles/1/ -e MAX_P95_MS=200 -e MAX_FAILED_RATE=0.01
import http from 'k6/http';
import { sleep } from 'k6';
import { Rate } from 'k6/metrics';
const myFailRate = new Rate('failed requests');
export let options = {
    scenarios: {
        warm_up: {
            executor: 'constant-vus',
            vus: 10,
            duration: '10s',
            exec: 'warmUp',
        },
        api_test: {
            startTime: '10s', // start after warm up
            executor: 'constant-arrival-rate',
            // Let's check p(95) when the our service is called with constant 10 req/sec
            rate: 10,
            timeUnit: '1s', // rate time unit
            duration: '10s',
            preAllocatedVUs: 10, // the size of the VU (i.e. worker) pool for this scenario
            exec: 'apiTest',
        }
    },
    thresholds: {
         //let's put threshold only on the right api_test scenario
        'http_req_duration{scenario:api_test}': [`p(95)<${__ENV.MAX_P95_MS}`],
        'failed requests{scenario:api_test}': [`rate<${__ENV.MAX_FAILED_RATE}`]
    },
};

export function warmUp() {
    http.get(`${__ENV.URL}`);
    sleep(1);
}
export function apiTest() {
    let res = http.get(`${__ENV.URL}`);
    myFailRate.add(res.status !== 200);
    // no need for sleep() here, the iteration pacing is controlled by the arrival-rate executors in this scenario
}