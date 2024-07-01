
<div align="center">
		<img src="https://github.com/TafsirGna/LinkBeam/blob/main/chrome-extension/src/assets/app_logo.png" height="38" width="38">
	<h1>Linkbeam</h1>
</div>

<p align="center">
	<a href="https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm"><img src="https://user-images.githubusercontent.com/585534/107280622-91a8ea80-6a26-11eb-8d07-77c548b28665.png" alt="Get Linkbeam for Chromium"></a>
</p>

[Linkbeam](https://www.tensorflow.org/) is a basic chrome extension that assists you in your linkedin browsing experience. The idea is to have a chrome extension that stores some of the informations that appear on your screen, locally in your browser [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)  database. These stored data can then be processed back to you in a friendlier way.

To this end, Linkbeam makes a heavy use of tools like [ChartJS](https://www.chartjs.org/) and [D3 JS](https://d3js.org/) to display charts based on the stored data; [Dexie JS](https://dexie.org/) to help with some abstractions in the management of the IndexedDB operations; [React JS](https://react.dev/) to develop all the necessary interfaces and [Bootstrap CSS](https://www.getbootstrap.com) plus  [Tailwind CSS](https://tailwindcss.com/) for everything pertaining to the look. A big shoutout for the graphists of https://www.flaticon.com/ (Smashicons, juicy_fish, surang, pancaza, freepik) for their icons.

## Install

To install this project, you will need to have a node package manager like [NPM](https://www.npmjs.com/)  installed on your machine. If so, you can proceed by downloading the project with:
```
$ git clone https://github.com/TafsirGna/LinkBeam.git
```
Then install all the dependencies present in the file `package.json` with 
```
$ npm install
```
Once, you have updated the code, the compilation is done thanks to the next command line. A shell script named `build_prod.sh` can come handy in this case. It details all the steps leading to the ultimate code. The permission of the file has first to be changed accordingly. 
```
$ ./build_prod.sh
```

## Features
Linkbeam can basically: 
*   provide some stats on the profiles they've visited;
*   allow the classification of the visited profiles in folders along with a tag feature;
* neatly store some informations for them to revisit (such as the number of posts they've been exposed to for a specific period, what share of these posts was new posts or suggestions, ...);
* track posts on their feed to show them how they perform every time they've encountered them;
* let them see the post that draw their attention (time) the most and list their most active connections;
* set reminders on posts and profiles as well as keywords to be highlighted in the interface;
* regroup all the media associated with the posts in a unique interface for the user to view and search;
* import/export your data in json format.
explore some previous related posts when viewing a post right from the feed interface;
* list all the previous copycats (that the user may have encountered in the past on their feed) of the current post (a beta feature)

Linkbeam doesn't:
* help in any ad marketing use cases;
* interact with any of linkedin APIs (only the browser DOM);
* send any of the data on a remote server (everything's stored locally at the current state);
* trigger any action on your behalf;

## License

[Apache License 3.0](LICENSE)