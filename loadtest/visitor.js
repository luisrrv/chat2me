import ws from 'k6/ws';
import { check } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

const ackLatency = new Trend('ack_latency_ms');
const msgsSent = new Counter('messages_sent');
const connectErrors = new Rate('connect_errors');

export const options = {
  scenarios: {
    ramp: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '30s', target: 300 },
        { duration: '30s', target: 500 },
        { duration: '1m',  target: 1000 },
        { duration: '2m',  target: 1000 }, // hold at peak
        { duration: '30s', target: 0 },
      ],
      gracefulStop: '10s',
    },
  },
  thresholds: {
    ack_latency_ms: ['p(95)<500', 'p(99)<1500'],
    connect_errors: ['rate<0.01'],
  },
};

export default function () {
  const base = __ENV.WS_URL || 'ws://localhost:3000';
  const visitorId = `loadtest-${__VU}-${Date.now()}`;
  const url = `${base}/?visitorId=${visitorId}`;

  const res = ws.connect(url, {}, (socket) => {
    socket.on('open', () => {
      socket.setInterval(() => {
        const sentAt = Date.now();
        socket.send(JSON.stringify({ _t: sentAt }));
        msgsSent.add(1);
      }, 6000); // respect frontend's 5s rate limit
    });

    socket.on('message', (data) => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'ack' && parsed._t) {
          ackLatency.add(Date.now() - parsed._t);
        }
      } catch (_) { /* server sends non-JSON frames in normal mode; ignore */ }
    });

    socket.setTimeout(() => socket.close(), 60000);
  });

  const ok = check(res, { 'ws connected (101)': (r) => r && r.status === 101 });
  if (!ok) connectErrors.add(1);
}