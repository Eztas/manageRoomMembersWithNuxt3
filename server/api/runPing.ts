import { defineEventHandler } from 'h3';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export default defineEventHandler(async (event) => {
  try {
    const pingPromises = [];
    for (let ping_id = 2; ping_id < 255; ping_id++) {
      const pingCommand = `ping 111.11.1.${ping_id} -n 1`;
      pingPromises.push(execPromise(pingCommand));
    }

    const results = await Promise.all(pingPromises);
    const successfulPings = results.filter(result => result.stdout.includes('Reply from'));

    return successfulPings.map(result => result.stdout);
  } catch (error) {
    return `Error: ${error.message}`;
  }
});