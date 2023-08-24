
export function saveCurrentPageTitle(pageTitle){

  // Saving the current page title
  sendDatabaseActionMessage("update-object", "settings", {property: "currentPageTitle", value: pageTitle});

}


export function sendDatabaseActionMessage(action, objectStoreName, objectData){

  // Send message to the background
  chrome.runtime.sendMessage({header: action, data: {objectStoreName: objectStoreName, objectData: objectData}}, (response) => {
    // Got an asynchronous response with the data from the service worker
    console.log(action + ' ' + objectStoreName + " request sent ", response, objectData);
  });

}

export function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function getChartColors(length){

  var indices = [];
  for (var i = 0; i < stickColors.length; i++){
    indices.push(i);
  }

  shuffle(indices);

  let backgrounds = []; let borders = [];
  for (var i = 0; i < length; i++){
    backgrounds.push(stickColors.at(i));
    borders.push(stickBorderColors.at(i));
  }
  
  return {borders: borders, backgrounds: backgrounds};

}

export const stickColors = ['rgba(255, 26, 104, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'];

export const stickBorderColors = [
          'rgba(255, 26, 104, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ];
