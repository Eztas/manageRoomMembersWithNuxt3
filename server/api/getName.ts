import { defineEventHandler } from 'h3';
import fs from 'fs';

export default defineEventHandler(async () => {
  // 名前をjsonから取得
  const name_json = JSON.parse(fs.readFileSync('data/name_list.json', 'utf-8'));
  return name_json;
});