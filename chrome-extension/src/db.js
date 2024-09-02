/*******************************************************************************

    LinkBeam - a basic extension for your linkedin browsing experience
    Copyright (C) 2024-present Stoic Beaver

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/TafsirGna/LinkBeam
*/

// db.js
import { appParams } from "./popup/Local_library";
import Dexie from 'dexie';

// creating the database
export const db = new Dexie(appParams.appDbName);

// Defining database version 1 stores
const version1Stores = {
  visits: '++id, url, date, tabId',
  keywords: '++id, &name, createdOn',
  reminders: '++id, &objectId, createdOn, active, date',
  settings: '++id',
  bookmarks: '++id, &url, createdOn',
  feedPosts: '++id, &uid, estimatedDate, linkedPostId',
  feedPostViews: '++id, feedPostId, uid, date, visitId, category',
  tags: '++id, &name, createdOn',
  folders: '++id, &name, createdOn',
};

db.version(1)
  .stores(version1Stores);


// Defining database version 2 stores
const version2Stores = {
  ...version1Stores,
  quotes: '++id, createdOn',
  profileNotes: '++id, createdOn, section, url',
  feedProfiles: '++id, name, picture, url',
}

db.version(appParams.appDbVersion /*2*/)
  .stores(version2Stores)
  .upgrade(trans => {

});