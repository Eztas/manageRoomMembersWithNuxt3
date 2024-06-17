import fs from 'fs';
import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const keyText = body.name;
  // 名前が存在するかのフラグ
  let nameFlag = false;
  const registered_mac_name_json = JSON.parse(fs.readFileSync('data/database_mac_name.json', 'utf-8'));
  registered_mac_name_json.forEach((registered_data: { name: string}) => {
    if (registered_data.name == keyText) {
      nameFlag = true;
    }
  });
  if(nameFlag == false){
    return { message: 'Failure' };
  }
  const new_mac_name_json = registered_mac_name_json.filter(item =>item.name != keyText);
  fs.writeFileSync('data/database_mac_name.json', JSON.stringify(new_mac_name_json, null, 2), 'utf-8');
  return { message: 'Success' };
});
