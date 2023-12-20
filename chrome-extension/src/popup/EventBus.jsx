const eventBus = {

  RESET_TODAY_REMINDER_LIST: "resetTodayReminderList",
  PROFILE_SHOW_REMINDER_OBJECT: "showReminder",
  PROFILE_SHOW_DOUGHNUT_MODAL: "showDoughnutModal",
  EMPTY_SEARCH_TEXT_ACTIVITY: "emptySearchTextActivity",
  EMPTY_SEARCH_TEXT_REMINDER: "emptySearchTextReminder",
  SHOW_ED_EXP_TIME_CHART_MODAL: "showEdExpTimeChartModal",

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