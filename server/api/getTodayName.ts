import { defineEventHandler } from 'h3';
import fs from 'fs';

export default defineEventHandler(async () => {
  // 名前をjsonから取得
  const registered_mac_name_json = JSON.parse(fs.readFileSync('data/database_mac_name.json', 'utf-8'));
  const currentDate = new Date();
  const today = currentDate.toString().substring(15, -1); // 確認用に年月日のみ取得
  const today_member_list: { name: string, day:string }[] = [];
  registered_mac_name_json.forEach((registered_data: { name: string, day:string }) => {
      if (registered_data.day.indexOf(today) != -1) {
        today_member_list.push({ name: registered_data.name, day: registered_data.day});
      }
  });
  return today_member_list;
});