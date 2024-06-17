import fs from 'fs';
import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const macText = body.mac;
  const nameText = body.name;

  const registered_mac_name_json = JSON.parse(fs.readFileSync('data/database_mac_name.json', 'utf-8'));
  registered_mac_name_json.push({ mac: macText, name: nameText, day: "" });  // 追加する形式に合わせて修正
  fs.writeFileSync('data/database_mac_name.json', JSON.stringify(registered_mac_name_json, null, 2), 'utf-8');

  return { message: 'Success' };
});
