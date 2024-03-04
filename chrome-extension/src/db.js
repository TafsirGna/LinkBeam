// db.js
import { appParams } from "./popup/Local_library";
import Dexie from 'dexie';

export const db = new Dexie(appParams.appDbName);

db.version(1).stores({
  visits: '++id, url, date, tabId',
  profiles: '++id, url, fullName, title',
  keywords: '++id, name, createdOn',
  reminders: '++id, url, createdOn, activated, date',
  settings: '++id',
  bookmarks: '++id, url, createdOn',
  feedPosts: '++id',
});