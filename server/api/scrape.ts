import { defineEventHandler } from 'h3';
import puppeteer from 'puppeteer';

export default defineEventHandler(async () => {
  // Puppeteerを起動
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // 目的のURLに移動
  await page.goto('https://fushinsha-joho.co.jp/search.cgi?pref=%E4%BA%AC%E9%83%BD%E5%BA%9C'); // 京都府の情報

  // データを取得してフィルタリング
  const data = await page.evaluate(() => {
    const elements = document.querySelectorAll('.headline');
    return Array.from(elements).map(element => {
      const dateElement = element.querySelector('span') as HTMLElement;
      const textElement = element as HTMLElement;
      const linkElement = element as HTMLAnchorElement;
      return {
        date: dateElement ? dateElement.innerText : '',
        text: textElement.innerText,
        link: linkElement.href
      };
    });
  });

  const filteredData = data.filter(item => {
    return item.text.indexOf('京都市左京区') != -1;
  });
  //console.log('Filtered data in ts:', filteredData);

  // Puppeteerを終了
  await browser.close();
  return filteredData;
});