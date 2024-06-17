import { H3Event, defineEventHandler, getQuery } from 'h3';
import { lock, getLockState, devices } from '../services/switchbot';

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event);

  if (query.action === 'lock') {
    const enable = query.enable === 'true';
    await lock(enable);
    return { status: 'success', message: `Lock ${enable ? 'enabled' : 'disabled'}` };
  } else if (query.action === 'lockState') {
    const lockState = await getLockState();
    return { status: 'success', message: 'Lock state checked', lockState };
  } else if (query.action === 'devices') {
    await devices();
    return { status: 'success', message: 'Devices fetched' };
  }

  return { status: 'error', message: 'Invalid action' };
});
