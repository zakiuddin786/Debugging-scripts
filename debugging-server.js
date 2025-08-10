const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

let globalCache = [];
let RequestCount = 0;
let memoryLeak = [];

app.use(express.json());

app.use((req, res, next) => {
  RequestCount++;
  console.log(`Request Count: ${RequestCount}`);
  console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
  globalCache[`request_${RequestCount}`] =  {
    method: req.method,
    url: req.url,
    headers: req.headers,
    timestamp: new Date(),
  };
  next();
}); 

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the debugging demo server!, please find the endpoint to test the debugging features.',
    requestCount: RequestCount,
    cache: globalCache,
    endpoint: [
      "GET /api/memory-leak - Simulates a memory leak",
      "GET /api/event-loop - Simulates an event loop issue",
      "GET /api/heavy - Simulates a heavy computation on CPU",
      "GET /api/health - Health check endpoint",
      "GET /api/clininc-bubbleprof/demo - View the cache of requests"
    ]
  });
});

app.get('/api/memory-leak', (req, res) => {
  // Simulate a memory leak by creating a large array that grows indefinitely
  const leak = [];
  
  // for (let i = 0; i < 1e6; i++) {
    leak.push(new Array(1000).fill('Memory Leak'));
  // } 
  memoryLeak.push(leak);
  console.log(`Memory leak created. Current memory leak size: ${memoryLeak.length}`);
  res.json({ message: 'Memory leak simulated. Check your memory usage.' });
});

app.get('/api/event-loop', (req, res) => {
  // Simulate an event loop issue by blocking the event loop for a while
  const start = Date.now();
  while (Date.now() - start < 5000) {
    // Busy-wait for 5 seconds
  }
  res.json({ message: 'Event loop blocked for 5 seconds.' });
});

const heavyComputation = () => {
  // Simulate a heavy computation
  let sum = 0;
  for (let i = 0; i < 1e4; i++) {
    sum += i;
  }
  return sum;
};


const asyncOperation = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Async operation completed');
    }, 2000);
  });
};

const memoryLeakFunction = () => {
  // Simulate a memory leak by creating a large array that grows indefinitely
  const leak = [];
  // for (let i = 0; i < 1e6; i++) {
    leak.push(new Array(1000).fill('Memory Leak'));
  // }
  memoryLeak.push(leak);
  console.log(`Memory leak created. Current memory leak size: ${memoryLeak.length}`);
};
// clinic bubbleprof --on-port 'autocannon -c 5 -a 500 localhost:$PORT' -- node
app.get("/api/bubble/demo", async (req, res) => {
  // Return the cache of requests for clinic bubbleprof
  let computationResult = heavyComputation();
  console.log(`Heavy computation result: ${computationResult}`);
  let asyncResult = await asyncOperation();
  console.log(`Async operation result: ${asyncResult}`);
  memoryLeakFunction(); // Simulate a memory leak
  console.log(`Memory leak function executed.`);

  res.json({
    message: 'Cache of requests for clinic bubbleprof',
    cache: globalCache,
  });
});

// clinic doctor --on-port 'autocannon localhost:$PORT/api/memory-leak' -- node  server.js 
// clinic doctor --on-port 'autocannon localhost:$PORT/api/memory-leak' -- node server.js 

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app; // Export the app for testing purposes
