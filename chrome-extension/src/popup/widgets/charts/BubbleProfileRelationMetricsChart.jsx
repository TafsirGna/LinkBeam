/*import './About.css'*/
import React from 'react';
import { Bubble } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { 
	sendDatabaseActionMessage, 
	getChartColors, 
	startMessageListener, 
	ack, 
	messageParams, 
	dbData,
	appParams, 
	dbDataSanitizer,
} from "../../Local_library";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import moment from 'moment';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const options = {
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export default class BubbleProfileRelationMetricsChart extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			scatterData: null,
			stringId:"profile-relations-bubble-chart",

			bubbleData: {
			  datasets: [
			    {
			      label: 'Dataset',
			      data: [],
			      backgroundColor: getChartColors(1).borders,
			    },
			  ],
			},

		};

		this.onProfilesDataReceived = this.onProfilesDataReceived.bind(this);

	}

	componentDidMount() {

		this.listenToMessages();

		this.getProfilesData();

	}

	getProfilesData(){

		var timePeriod = null;
		switch(this.props.viewChoice){
			case 0: {
				timePeriod = this.getLastDaysTimePeriod();
				break;
			}

			case 1: {
				timePeriod = this.getLastMonthTimePeriod();
				break;
			}

			case 2: {
				timePeriod = this.getLastYearTimePeriod();
				break;
			}
		}

		sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.SEARCHES, {timePeriod: timePeriod, context: [appParams.COMPONENT_CONTEXT_NAMES.STATISTICS, this.state.stringId].join("-")});

	}

	getLastDaysTimePeriod(){

		var endDate = (new Date()),
				startDate = moment().subtract(6, 'days').toDate();

		return [startDate, "to", endDate];

	}

	getLastMonthTimePeriod(){

		var endDate = (new Date()),
				startDate = moment().subtract(1, 'months').toDate();

		return [startDate, "to", endDate];

	}

	getLastYearTimePeriod(){

		var endDate = (new Date()),
				startDate = moment().subtract(1, 'years').toDate();

		return [startDate, "to", endDate];

	}

	componentDidUpdate(prevProps, prevState){

		// everytime the view choice is changed, the chart is reset
		if (prevProps.viewChoice != this.props.viewChoice){

			this.getProfilesData();

		}

	}

	onProfilesDataReceived(message, sendResponse){

		var context = message.data.objectData.context;
    if (context.indexOf(this.state.stringId) == -1){
    	return;
    }

		// acknowledge receipt
    ack(sendResponse);    

    var searches = message.data.objectData.list;
    var results = [];

    for (let search of searches){

    		var itemIndex = results.map(e => e.url).indexOf(search.profile.url);
    		if (itemIndex >= 0){
    			(results[itemIndex]).r += 1;
    		}
    		else{
    			var followerCount = search.profile.nFollowers ? dbDataSanitizer.followers(search.profile.nFollowers) : 0,
    					connectionCount = search.profile.nConnections ? dbDataSanitizer.connections(search.profile.nConnections) : 0;

    			results.push({
    				url: search.profile.url,
    				fullName: search.profile.fullName,
    				r: 1,
    				x: followerCount,
    				y: connectionCount,
    			})
    		}

    }

    this.setState({bubbleData: {
			  datasets: [
			    {
			      label: 'Dataset',
			      data: results,
			      backgroundColor: getChartColors(1).borders,
			    },
			  ],
			}});

	}

	listenToMessages(){

		startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.SEARCHES].join(messageParams.separator), 
        callback: this.onProfilesDataReceived
      },
    ]);
    
	}

	render(){
		return (
			<>
				<Bubble options={options} data={this.state.bubbleData} />
			</>
		);
	}
}
