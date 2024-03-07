// db.js
import { appParams } from "./popup/Local_library";
import Dexie from 'dexie';

export const db = new Dexie(appParams.appDbName);

db.version(appParams.appDbVersion).stores({
  visits: '++id, url, date, tabId',
  profiles: '++id, url, fullName, title',
  keywords: '++id, name, createdOn',
  reminders: '++id, url, createdOn, active, date',
  settings: '++id',
  bookmarks: '++id, url, createdOn',
  feedPosts: '++id',
});