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

const eventBus = {

  PROFILE_SHOW_REMINDER_OBJECT: "showReminder",
  SHOW_ED_EXP_TIME_CHART_MODAL: "showEdExpTimeChartModal",

  DOWNLOAD_CHART_IMAGE: "downloadChartImage",
  SWITCH_TO_VIEW: "switchToView",
  SET_APP_GLOBAL_DATA: "SET_APP_GLOBAL_DATA",
  SET_PROFILE_DATA: "SET_PROFILE_DATA", 
  SET_APP_SUBSCRIPTION: "SET_APP_SUBSCRIPTION",
  SET_PROFILE_LOCAL_DATA: "SET_PROFILE_LOCAL_DATA",
  SHOW_FEED_POST_DATA_MODAL: "SHOW_FEED_POST_DATA_MODAL",
  SET_MATCHING_POSTS_DATA: "SET_MATCHING_POSTS_DATA",
  POST_REMINDER_DELETED: "POST_REMINDER_DELETED",
  POST_REMINDER_ADDED: "POST_REMINDER_ADDED",
  PAGE_IDLE_SIGNAL: "PAGE_IDLE_SIGNAL",
  SHOW_FEED_POST_RELATED_POSTS_MODAL: "SHOW_FEED_POST_RELATED_POSTS_MODAL",

  on(event, callback) {
    document.addEventListener(event, (e) => callback(e.detail));
  },
  dispatch(event, data) {
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
  remove(event, callback) {
    document.removeEventListener(event, callback);
  },
};

export default eventBus;