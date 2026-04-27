import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    burst: {
      executor: 'constant-arrival-rate',
      rate: 100,           // 100 requests per second
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 50,
    },
  },
};

const PAYLOAD = JSON.stringify({
  events: [
    {
      type: 'message',
      message: {
        type: 'text',
        text: '@visitor-loadtest1 reply from line',
      },
    },
  ],
});

export default function () {
  const url = `${__ENV.WEBHOOK_URL || 'http://localhost:3000'}/webhook`;
  const res = http.post(url, PAYLOAD, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'status 200': (r) => r.status === 200 });
}