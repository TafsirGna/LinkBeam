const eventBus = {

  RESET_TODAY_REMINDER_LIST: "resetTodayReminderList",
  PROFILE_SHOW_REMINDER_OBJECT: "showReminder",
  SHOW_ED_EXP_TIME_CHART_MODAL: "showEdExpTimeChartModal",

  DOWNLOAD_CHART_IMAGE: "downloadChartImage",
  ALL_VISITS_TAB_CLICKED: "allVisitsTabClicked",
  GET_ALL_VISITS: "getAllVisits",
  SWITCH_TO_VIEW: "switchToView",
  SET_APP_GLOBAL_DATA: "SET_APP_GLOBAL_DATA",
  SET_PROFILE_DATA: "SET_PROFILE_DATA", 

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