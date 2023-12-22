/*import './About.css'*/
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { sendDatabaseActionMessage, getChartColors, messageParams, dbData, appParams } from "../../Local_library";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const barOptions = {
  responsive: true,
  /*layout: {
    padding: {
      left: 30,
      right: 30
    }
  }*/
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Keywords Bar Chart',
    },
  },
};

export default class SearchesKeywordsBarChart extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			barLabels: null,
			barData: null,
		};

    this.setChartLabels = this.setChartLabels.bind(this);
    this.setChartData = this.setChartData.bind(this);

	}

	componentDidMount() {

    if (this.props.globalData.keywordList){
      this.setChartLabels();
    }
    else{
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.KEYWORDS, { context: appParams.COMPONENT_CONTEXT_NAMES.STATISTICS});
    }

	}

  componentDidUpdate(prevProps, prevState){
    
    if (prevProps.objects != this.props.objects){
      this.setChartData();
    }

    if (prevProps.globalData != this.props.globalData){
      if (prevProps.globalData.keywordList != this.props.globalData.keywordList){
        this.setChartLabels();
      }
    }

  }

  setChartLabels(){

    let labels = [];
    for (var keyword of this.props.globalData.keywordList){ labels.push(keyword.name); }
    
    // setting the new value
    this.setState({barLabels: labels}, () => {this.setChartData()});

  }

	setChartData(){

    if (!this.state.barLabels){
      return;
    }

  	let labels = this.state.barLabels;

  	var colors = getChartColors(labels.length);

  	this.setState({barData: {
    		labels,
    		datasets: [
	        {
	          label: 'Dataset',
	          data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
	          backgroundColor: colors.backgrounds,
            borderColor: colors.borders,
            borderWidth: 2,
	        },
      	],
  	}});
}

	render(){
		return (
			<>
				{ this.state.barData && <Bar options={barOptions} data={this.state.barData} /> }
			</>
		);
	}
}
