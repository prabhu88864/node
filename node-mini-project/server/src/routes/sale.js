// routes/saleRoutes.js
import express from 'express';
import Sale from '../models/Sale.js';
import saleQueue from '../queues/saleQueue.js';

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { category, discount, startTime, endTime } = req.body;

    // parse times to ms
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    const nowMs = Date.now();

    // validation
    if (isNaN(startMs) || isNaN(endMs)) {
      return res.status(400).json({ error: 'Invalid startTime or endTime. Use ISO 8601.' });
    }
    if (endMs <= startMs) {
      return res.status(400).json({ error: 'endTime must be after startTime' });
    }

    // compute safe (non-negative) delays
    const startDelay = Math.max(0, startMs - nowMs);
    const endDelay = Math.max(0, endMs - nowMs);

    console.log('Scheduling sale (handler):', {
      category,
      discount,
      startTime: new Date(startMs).toISOString(),
      endTime: new Date(endMs).toISOString(),
      startDelay,
      endDelay
    });

    // persist sale (initially inactive)
    const sale = await Sale.create({
      category,
      discount,
      startTime: new Date(startMs),
      endTime: new Date(endMs),
      isActive: false
    });

    // schedule start job (log job id)
    try {
      const job1 = await saleQueue.add(
        'startSale',
        { saleId: sale._id.toString(), category, discount },
        {
          delay: startDelay,
          removeOnComplete: true,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 }
        }
      );
      console.log('startSale job added:', job1.id);
      console.log("WORKER Sale collection =", Sale.collection.collectionName);
    } catch (err) {
      console.error('Error adding startSale job:', err);
      // optionally decide whether to delete sale or return an error; here we proceed
    }

    // schedule end job (log job id)
    try {
      const job2 = await saleQueue.add(
        'endSale',
        { saleId: sale._id.toString(), category },
        {
          delay: endDelay,
          removeOnComplete: true,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 }
        }
      );
      console.log('endSale job added:', job2.id);
    } catch (err) {
      console.error('Error adding endSale job:', err);
    }

    return res.status(201).json({ message: 'Sale scheduled successfully', sale });
  } catch (err) {
    console.error('Error creating sale (handler):', err);
    return res.status(500).json({ error: err.message });
  }
});

router.get('/jobs/counts', async (req, res) => {
  try {
    const counts = await saleQueue.getJobCounts();
    res.json(counts);
  } catch (err) {
    console.error('Error getting job counts:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json({ count: sales.length, sales });
  } catch (err) {
    console.error('Error listing sales:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /sale/jobs  (shows jobs by state and minimal meta)
router.get('/jobs', async (req, res) => {
  try {
    // getJobs accepts array of states: 'waiting','active','completed','failed','delayed','paused'
    const states = ['waiting','active','completed','failed','delayed','paused'];
    const jobs = await saleQueue.getJobs(states, 0, 100); // up to 100 jobs
    // map to small object to avoid huge JSON
    const out = jobs.map(j => ({
      id: j.id,
      name: j.name,
      data: j.data,
      state: j._state || j.opts?.state, // best-effort
      timestamp: j.timestamp,
      delay: j.delay,
      attemptsMade: j.attemptsMade,
      finishedOn: j.finishedOn,
      processedOn: j.processedOn
    }));
    res.json({ count: out.length, jobs: out });
  } catch (err) {
    console.error('Error listing jobs:', err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
