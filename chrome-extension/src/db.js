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

export const db = new Dexie(appParams.appDbName);

db.version(appParams.appDbVersion).stores({
  visits: '++id, url, date, tabId',
  keywords: '++id, &name, createdOn',
  reminders: '++id, &objectId, createdOn, active, date',
  settings: '++id',
  bookmarks: '++id, &url, createdOn',
  feedPosts: '++id, &uid',
  feedPostViews: '++id, uid, date, tabId', /*feedPostId*/
  tags: '++id, &name, createdOn',
  folders: '++id, &name, createdOn',
  // media: '++id, postId, date',
});