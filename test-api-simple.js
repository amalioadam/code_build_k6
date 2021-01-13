// Call example:  k6 run test-api-simple.js -e MY_TEST_URL=https://test-api.k6.io/public/crocodiles/1/
import http from 'k6/http';
import { sleep } from 'k6';
export let options = {
    vus: 10,
    duration: '10s',
    thresholds: {
        // 90% of requests must finish within 100ms.
        http_req_duration: ['p(90) < 100'],
    },
};
export default function () {
    http.get(`${__ENV.MY_TEST_URL}`);
    sleep(1);
}