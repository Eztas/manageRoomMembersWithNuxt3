import cron from 'node-cron';
import fetch from 'node-fetch';
import { lock } from './services/switchbot';

// メンバーの型を定義
interface Member {
  name: string;
}
// リアクティブな変数を作成
let getExistingName: Member[] = [];

// 毎日23時にジョブを実行する
cron.schedule('0 23 * * *', async () => {
  try {
    const response = await fetch('http://localhost:3000/api/getMembers');
    if (!response.ok) {
      throw new Error(`Failed to fetch members: ${response.statusText}`);
    }

    const name: Member[] = await response.json();
    getExistingName = name;
    console.log(getExistingName)
    console.log(getExistingName.length)

    if (getExistingName.length === 0) {
      await lock(true);
      console.log('Lock enabled');
    } else {
      console.log('Lock not enabled, members present:', name);
    }
  } catch (error) {
    console.error('Error in scheduled job:', error);
  }
});