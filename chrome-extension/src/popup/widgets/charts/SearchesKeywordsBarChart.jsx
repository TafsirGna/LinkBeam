/*import './About.css'*/
import React from 'react';
import { Bar, getElementAtEvent } from 'react-chartjs-2';
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
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';

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
      chartRef: React.createRef(),
			barData: null,
      uuid: uuidv4(),
		};
    this.setChartData = this.setChartData.bind(this);
    this.onChartClick = this.onChartClick.bind(this);

	}

	componentDidMount() {

    eventBus.on(eventBus.DOWNLOAD_CHART_IMAGE, (data) =>
      {
        if (data.carrouselItemIndex != this.props.carrouselIndex){
          return;
        }

        this.saveCanvas();
      }
    );

    if (this.props.globalData.keywordList){
      this.setChartData();
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
        this.setChartData();
      }
    }

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.DOWNLOAD_CHART_IMAGE);

  }

	setChartData(){

    if (!this.props.objects){
      return;
    }

    var barData = [];
    for (var keyword of this.props.globalData.keywordList){ 
      var profiles = [];
      for (var search of this.props.objects){
        // console.log('++++++++++++++++ : ', search);
        // console.log("%%%%%%%%%%%%%% : ", JSON.stringify(search.profile).toLowerCase());
        if (JSON.stringify(search.profile).toLowerCase().indexOf(keyword.name.toLowerCase()) != -1){
          profiles.push(search.profile);
        }
      }
      barData.push({label: keyword.name, profiles: profiles}); 
    }

  	var colors = getChartColors(barData.length);

  	this.setState({barData: {
    		labels: barData.map((obj) => obj.label),
    		datasets: [
	        {
	          label: 'Dataset',
	          data: barData.map((obj) => obj.profiles.length),
	          backgroundColor: colors.backgrounds,
            borderColor: colors.borders,
            borderWidth: 2,
	        },
      	],
  	}});
  }

  // setCanvasEventListener(){

  //   document.getElementById("chartTag_"+this.state.uuid).onclick = function(evt)
  //   {   
  //       var activePoints = chart.getElementsAtEvent(evt);

  //       if(activePoints.length > 0)
  //       {
  //         //get the internal index of slice in pie chart
  //         var clickedElementindex = activePoints[0]["_index"];

  //         //get specific label by index 
  //         var label = chart.data.labels[clickedElementindex];

  //         //get value by index      
  //         var value = chart.data.datasets[0].data[clickedElementindex];

  //         /* other stuff that requires slice's label and value */
  //      }
  //   }

  // }

  onChartClick(event){
    console.log(getElementAtEvent(this.state.chartRef.current, event));
  }

	render(){
		return (
			<>
        <div class="text-center">

          { !this.state.barData && <div class="spinner-border spinner-border-sm" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                          </div> }
				  { this.state.barData && <Bar 
                                    ref={this.state.chartRef}
                                    id={"chartTag_"+this.state.uuid} 
                                    options={barOptions} 
                                    data={this.state.barData}
                                    onClick={this.onChartClick} /> }

        </div>
			</>
		);
	}
}
