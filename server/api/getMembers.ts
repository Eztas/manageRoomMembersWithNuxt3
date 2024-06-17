import fs from 'fs';
import { defineEventHandler } from 'h3';
import { exec } from 'child_process';

const getArpData = async () => {
  var cmd = 'arp -a > data/arp.txt';
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('exec error: ${error}');
      return;
    }
  });
};

export default defineEventHandler(async () => {
  await getArpData();
  const arp_text = fs.readFileSync("data/arp.txt", 'utf8');
  const arp_list: string[] = arp_text.toString().split('\n');
  const current_ip_mac_list = arp_list.filter(data => data.startsWith('  111.11.1'));
  const current_ip_mac_json = current_ip_mac_list.map(ip_mac_set => {
    const part = ip_mac_set.trim().split(/\s+/);
    return { ip: part[0], mac: part[1] };
  });
  fs.writeFileSync("data/mac_list.json", JSON.stringify(current_ip_mac_json, null, 2), 'utf-8');

  console.log(current_ip_mac_json);
  const registered_mac_name_json = JSON.parse(fs.readFileSync('data/database_mac_name.json', 'utf-8'));
  const current_member_list: { name: string }[] = [];
  const currentDate = new Date();

  registered_mac_name_json.forEach((registered_data: { mac: string; name: string, day:String }) => {
    current_ip_mac_json.forEach((current_data: { mac: string }) => {
      if (current_data.mac === registered_data.mac) {
        current_member_list.push({ name: registered_data.name });
        registered_data.day = currentDate.toString();//"Wed Jun 05 2024 14:11:00 GMT+0900 (日本標準時)", String
      }
    });
  });
  fs.writeFileSync("data/name_list.json", JSON.stringify(current_member_list, null, 2), 'utf-8');
  fs.writeFileSync("data/database_mac_name.json", JSON.stringify(registered_mac_name_json, null, 2), 'utf-8');
  return current_member_list;
});
