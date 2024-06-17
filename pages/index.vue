<template>
  <v-app id="inspire">
    <v-system-bar color="indigo" height="40">
      <v-app-bar-nav-icon size="x-large" @click.stop="mydrawer = !mydrawer"></v-app-bar-nav-icon>
      <v-spacer></v-spacer>
    </v-system-bar>
    <v-navigation-drawer v-model="mydrawer" absolute bottom temporary width="400">
      <v-sheet class="pa-4" color="indigo-lighten-3" width="400">
        <div>各機能</div>
      </v-sheet>
      <v-list elevation="2">
        <v-list-item key="mdi-account" prepend-icon="mdi-account" title="メンバー一覧確認" @click="toggleShowAll"></v-list-item>
        <v-list-item key="mdi-account-plus" prepend-icon="mdi-account-plus" title="メンバー登録" @click="plusAccount = !plusAccount"></v-list-item>
        <v-list-item key="mdi-account-minus" prepend-icon="mdi-account-minus" title="メンバー削除(MACアドレスから)" @click="deleteMACAccount = !deleteMACAccount"></v-list-item>
        <v-list-item key="mdi-account-minus" prepend-icon="mdi-account-minus" title="メンバー削除(名前から)" @click="deleteNameAccount = !deleteNameAccount"></v-list-item>
        <v-list-item key="mdi-alert" prepend-icon="mdi-alert" title="京工繊周辺の不審者情報" @click="showStranger = !showStranger"></v-list-item>
        <v-list-item key="mdi-ping" prepend-icon="mdi-send" @click="runPing">{{ pingStatus }}</v-list-item>
        <v-list-item key="mdi-refresh" prepend-icon="mdi-refresh" @click="getMembers">{{ memberStatus }}</v-list-item>
        <v-list-item key="mdi-switch" prepend-icon="mdi-switch" title="ロック" @click="lockDevice(true)"></v-list-item>
        <v-list-item key="mdi-switch" prepend-icon="mdi-switch" title="アンロック" @click="lockDevice(false)"></v-list-item>
        <v-list-item key="mdi-switch" prepend-icon="mdi-switch" @click="updateLockState()">{{ lockState }}</v-list-item>
        <v-list-item key="mdi-help" prepend-icon="mdi-help" title="使い方" @click="showHelp = !showHelp"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-bottom-sheet v-model="showAll">
      <v-sheet class="text-center" height="48%">
        <p style="padding: 2rem;">メンバー一覧確認</p>
        <div v-if="getAllName.length === 0">メンバーが登録されていません</div>
        <div v-else>
          <div v-for="(getEachName, index) in getAllName" :key="getEachName.mac">
            <v-card class="mx-auto" max-width="400" outlined>
              <v-list-item>
                {{ index+1 }}
                <v-icon>mdi-account</v-icon>
                {{ getEachName.name }}
                <v-list-item-title class="headline">MAC:{{ getEachName.mac }}</v-list-item-title>
                Time:{{ getEachName.day.substring(24, -1) }}
                <v-divider></v-divider>
              </v-list-item>
            </v-card>
          </div>
        </div>
      </v-sheet>
    </v-bottom-sheet>

    <v-bottom-sheet v-model="plusAccount">
      <v-sheet class="text-center" height="48%">
        <p style="padding: 2rem;"> MACアドレスを登録する</p>
        <div style="padding: 2rem;">
          <v-text-field counter placeholder="MACアドレス" v-model="macAddress" />
          <v-text-field counter placeholder="名前" v-model="name" />
          <v-spacer></v-spacer>
          <v-btn class="mr-auto" color="pink" dark @click="plusAccount = !plusAccount">
            閉じる
          </v-btn>
          <v-btn class="ml-auto" color="blue" dark @click="registerMembers">
            {{registerStatus}}
          </v-btn>
        </div>
      </v-sheet>
    </v-bottom-sheet>

    <v-bottom-sheet v-model="deleteMACAccount">
      <v-sheet class="text-center" height="48%">
        <p style="padding: 2rem;"> MACアドレスから登録情報を削除する</p>
        <div style="padding: 2rem;">
          <v-text-field counter placeholder="MACアドレス" v-model="macAddressID" />
          <v-spacer></v-spacer>
          <v-btn class="mr-auto" color="pink" dark @click="deleteMACAccount = !deleteMACAccount">
            閉じる
          </v-btn>
          <v-btn class="ml-auto" color="blue" dark @click="deleteMembersByMAC">
            {{deleteMACStatus}}
          </v-btn>
        </div>
      </v-sheet>
    </v-bottom-sheet>

    <v-bottom-sheet v-model="deleteNameAccount">
      <v-sheet class="text-center" height="48%">
        <p style="padding: 2rem;"> 名前から登録情報を削除する</p>
        <div style="padding: 2rem;">
          <v-text-field counter placeholder="名前" v-model="nameID" />
          <v-spacer></v-spacer>
          <v-btn class="mr-auto" color="pink" dark @click="deleteNameAccount = !deleteNameAccount">
            閉じる
          </v-btn>
          <v-btn class="ml-auto" color="blue" dark @click="deleteMembersByName">
            {{deleteNameStatus}}
          </v-btn>
        </div>
      </v-sheet>
    </v-bottom-sheet>

    <v-bottom-sheet v-model="showStranger">
      <v-sheet class="text-center" height="48%">
        <p style="padding: 2rem;">京工繊周辺の不審者情報</p>
        <div v-if="scrapedData.length === 0">不審者情報はありません</div>
        <div v-else>
          <div v-for="scrape_item in scrapedData" :key="scrape_item.text">
            <v-card class="mx-auto" max-width="400">
              <v-list-item>
                  <v-list-item-subtitle>
                    <v-list-item-title><a :href="scrape_item.link" target="_blank">{{ scrape_item.text }}</a></v-list-item-title>
                  </v-list-item-subtitle>
              </v-list-item>
            </v-card>
          </div>
        </div>
      </v-sheet>
    </v-bottom-sheet>

    <v-bottom-sheet v-model="showHelp">
      <v-sheet class="text-center" height="48%">
        <p style="padding: 2rem;">メンバー管理の見方</p>
            <p>最新のLAN内の端末情報を確認するためにまずその端末と通信している必要があります.</p>
            <p>そのため「在室メンバー探索」ボタンを押してから, 「メンバー更新」ボタンを押してください.</p>
      </v-sheet>
    </v-bottom-sheet>

    <v-main>
      <v-card-title class="text-h6 text-md-h5 text-lg-h4">在室管理</v-card-title>
      <v-container class="py-8 px-6" fluid>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-list lines="two">
                <v-list-subheader>在室中のメンバー</v-list-subheader>
                <div v-if="isLoading">
                  <v-card height="190" class="text-center">
                    <v-progress-circular
                      :indeterminate="isLoading"
                      :size="100"
                      color="primary"
                      class="mt-4 "
                    >Loading...
                    </v-progress-circular>
                  </v-card>
                </div>
                <div v-else>
                  <div v-if="getExistingName.length === 0">在室しているメンバーはいません</div>
                  <div v-else>
                    <div v-for="name_item in getExistingName" :key="name_item.name">
                      <v-list-item>
                        <v-icon>mdi-account</v-icon>
                        <v-list-item-title>{{ name_item.name }}</v-list-item-title>
                      </v-list-item>
                      <v-divider></v-divider>
                    </div>
                  </div>
                </div>
              </v-list>
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-card>
              <v-list lines="two">
                <v-list-subheader>今日在室していたメンバー</v-list-subheader>
                <div v-if="isLoading">
                  <v-card height="190" class="text-center">
                    <v-progress-circular
                      :indeterminate="isLoading"
                      :size="100"
                      color="primary"
                      class="mt-4 "
                    >Loading...
                    </v-progress-circular>
                  </v-card>
                </div>
                <div v-else>
                  <div v-if="getTodayExistingName.length === 0">今日在室していたメンバーはいません</div>
                  <div v-else>
                    <div v-for="todayName_item in getTodayExistingName" :key="todayName_item.name">
                      <v-list-item>
                          <v-icon>mdi-account</v-icon>
                          <v-list-item-title>{{ todayName_item.name }}</v-list-item-title>
                          <v-list-item-subtitle>
                            <v-icon left>mdi-clock</v-icon>
                            {{ formatTime(todayName_item.day) }}
                          </v-list-item-subtitle>
                      </v-list-item>
                    </div>
                  </div>
                </div>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
// https://vuetifyjs.com/en/getting-started/installation/#using-nuxt-3
import { ref, onMounted, watchEffect } from 'vue';

const mydrawer = ref(false);
const plusAccount = ref(false);
const deleteMACAccount = ref(false);
const deleteNameAccount = ref(false);
const showStranger = ref(false);
const showHelp = ref(false);
const showAll = ref(false);
const macAddress = ref('');
const name = ref('');
const macAddressID = ref('');
const nameID = ref('');

const scrapedData = ref([]);
const getExistingName = ref([]);
const getTodayExistingName = ref([]);
const getAllName = ref([]);
const isLoading = ref(true);

const pingStatus = ref('在室メンバー探索');
const memberStatus = ref('メンバー更新');
const registerStatus = ref('登録する');
const deleteMACStatus = ref('削除する');
const deleteNameStatus = ref('削除する');
const lockState = ref('ロック状態確認');

const runPing = async () => {
  pingStatus.value = '在室メンバー探索中...(数分かかります)';
  try {
    const response = await fetch('/api/runPing');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    console.log('Ping executed successfully');
    pingStatus.value = '在室メンバー探索完了';
  } catch (error) {
    console.error('Error executing ping:', error);
    pingStatus.value = '在室メンバー探索失敗';
  }
};

const getMembers = async () => {
  memberStatus.value = 'メンバー更新中...';
  try {
    const response_name = await fetch('/api/getMembers');
    const response_todayName = await fetch('/api/getTodayName');
    if (!response_name.ok || !response_todayName.ok) {
      throw new Error('Network response was not ok');
    }
    const name = await response_name.json();
    const todayName = await response_todayName.json();
    getExistingName.value = name;
    getTodayExistingName.value = todayName;
    memberStatus.value = 'メンバー更新完了';
  } catch (error) {
    console.error('Error executing ping:', error);
    memberStatus.value = 'メンバー更新失敗';
  }
};

const toggleShowAll = () => {
  showAll.value = !showAll.value;
  if (showAll.value) {
    getAllData();
  }
};

const getAllData = async () => {
  try {
    const response = await fetch('/api/getAllData');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    getAllName.value = data;
  } catch (error) {
    console.error('Error executing ping:', error);
  }
};

const registerMembers = async () => {
  registerStatus.value = "メンバー登録中..."
  try {
    const response = await fetch('/api/registerMembers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mac: macAddress.value, name: name.value })
    });
    if (!response.ok) {
      registerStatus.value = "通信失敗";
    }
    const result = await response.json();
    if(result.message == 'Success'){
      registerStatus.value = "登録完了";
    }
    else{
      registerStatus.value = "登録失敗";
    }
    macAddress.value = "";
    name.value = "";
  } catch (error) {
    registerStatus.value = "メンバー登録失敗";
  }
};

const deleteMembersByMAC = async () => {
  deleteMACStatus.value = 'メンバー削除中...';
  try {
    const response = await fetch('/api/deleteMembersByMAC', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mac: macAddressID.value})
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const text = await response.json();
    if(text.message == 'Failure'){
      deleteMACStatus.value = 'このMACアドレスは登録されていません';
    }
    else if(text.message == 'Success'){
      deleteMACStatus.value = '削除完了';
    }
    macAddressID.value = "";
  } catch (error) {
    console.error('Error delete:', error);
    deleteMACStatus.value = 'メンバー削除失敗';
  }
};

const deleteMembersByName = async () => {
  deleteNameStatus.value = 'メンバー削除中...';
  try {
    const response = await fetch('/api/deleteMembersByName', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: nameID.value})
    });
    if (!response.ok) {
      deleteNameStatus.value = '通信失敗';
    }
    const text = await response.json();
    if(text.message == 'Failure'){
      deleteNameStatus.value = 'この名前は登録されていません';
    }
    else if(text.message == 'Success'){
      deleteNameStatus.value = '削除完了';
    }
    nameID.value = "";
  } catch (error) {
    console.error('Error delete:', error);
    deleteNameStatus.value = 'メンバー削除失敗';
  }
};

const formatTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date.toTimeString().split(' ')[0];
};

const updateLockState = async () => {
  lockState.value = '確認中...'
  try {
    const response = await fetch('/api/switchbot?action=lockState');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    lockState.value = data.lockState; // ロックの状態を更新
  } catch (error) {
    console.error('Error updating lock state:', error);
  }
};

const lockDevice = async (enable) => {
  lockState.value = '確認中...'
  try {
    const response = await fetch(`/api/switchbot?action=lock&enable=${enable}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data.message);
    // 5秒後にupdateLockStateを実行する
    setTimeout(updateLockState, 5000);
  } catch (error) {
    console.error(`Error ${enable ? 'locking' : 'unlocking'} device:`, error);
  }
};


onMounted(async () => {
  try {
    const response_scrape = await fetch('/api/scrape');
    const response_name = await fetch('/api/getName');
    const response_todayName = await fetch('/api/getTodayName');
    if (!response_scrape.ok || !response_name.ok || !response_todayName.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response_scrape.json();
    const name = await response_name.json();
    const todayName = await response_todayName.json();
    
    scrapedData.value = data;
    getExistingName.value = name;
    getTodayExistingName.value = todayName;
  }
  catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
  finally {
    isLoading.value = false;
  }
});
</script>