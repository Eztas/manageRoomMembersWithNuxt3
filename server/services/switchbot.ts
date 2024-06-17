import crypto from 'crypto';

const token: string = process.env.SWITCHBOT_TOKEN as string;
const secret: string = process.env.SWITCHBOT_SECRET as string;
const baseUrl = 'https://api.switch-bot.com';

const mydevices = {
  lock: {
    deviceId: process.env.SWITCHBOT_LOCK_DEVICE_ID,
  },
};

const checkLockDeviceId = (): string | undefined => {
  if (!mydevices.lock.deviceId) {
    console.log("Need to set environment variables SWITCHBOT_LOCK_DEVICE_ID for lock device id.");
    return undefined;
  }
  return process.env.SWITCHBOT_LOCK_DEVICE_ID;
};

const generateSignature = (): { sign: string, nonce: string, t: string } => {
  const t: number = Date.now();
  const nonce: string = crypto.randomUUID();
  const data: string = token + t + nonce;
  const signTerm: Buffer = crypto
    .createHmac("sha256", secret)
    .update(Buffer.from(data, "utf-8"))
    .digest();
  const sign: string = signTerm.toString("base64");
  return { sign, nonce, t: t.toString() };
};

const devices = async () => {
  const url = `${baseUrl}/v1.1/devices`;
  const method = 'GET';
  const { sign, nonce, t } = generateSignature();

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: token!,
        sign: sign,
        nonce: nonce,
        t: t,
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json();
    console.log('------ devices -----');
    console.log(JSON.stringify(json, null, ' '));
  } catch (error) {
    console.error('Error fetching devices:', error);
  }
};

const lock = async (enable: boolean) => {
  if (!checkLockDeviceId()) return;

  const url = `${baseUrl}/v1.1/devices/${mydevices.lock.deviceId}/commands`;
  const method = 'POST';
  const { sign, nonce, t } = generateSignature();

  const body = JSON.stringify({
    command: enable ? 'lock' : 'unlock',
    parameter: 'default',
    commandType: 'command',
  });

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: token!,
        sign: sign,
        nonce: nonce,
        t: t,
        'Content-Type': 'application/json',
        'Content-Length': body.length.toString(),
      },
      body: body,
    });
    const json = await response.json();
    console.log(`------ lock command (${enable ? 'lock' : 'unlock'}) (deviceId: ${mydevices.lock.deviceId}) -----`);
    console.log(JSON.stringify(json, null, ' '));
  } catch (error) {
    console.error('Error sending lock command:', error);
  }
};

const getLockState = async (): Promise<string | null> => {
  if (!checkLockDeviceId()) return null;

  const url = `${baseUrl}/v1.1/devices/${mydevices.lock.deviceId}/status`;
  const method = 'GET';
  const { sign, nonce, t } = generateSignature();

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: token!,
        sign: sign,
        nonce: nonce,
        t: t,
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json();
    console.log(`------ lock status (deviceId: ${mydevices.lock.deviceId}) -----`);
    console.log(JSON.stringify(json, null, ' '));
    return json.body.lockState as string;
  } catch (error) {
    console.error('Error fetching lock status:', error);
    return null;
  }
};

export { devices, lock, getLockState };