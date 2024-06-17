import { defineEventHandler } from 'h3';
import fs from 'fs';

export default defineEventHandler(async () => {
  // 名前をjsonから取得
  const allData = JSON.parse(fs.readFileSync('data/database_mac_name.json', 'utf-8'));
  return allData;
});