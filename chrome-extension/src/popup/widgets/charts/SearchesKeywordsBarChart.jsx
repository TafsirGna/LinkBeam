/*import './About.css'*/
import React from 'react';
import { Bar, getElementAtEvent } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { Offcanvas } from "react-bootstrap";
import moment from 'moment';
import { sendDatabaseActionMessage, getChartColors, messageParams, dbData, appParams, saveCanvas } from "../../Local_library";
import default_user_icon from '../../../assets/user_icons/default.png';
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
      offCanvasShow: false,
      selectedChartElementIndex: null,
      labelsData: null,
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

        saveCanvas(this.state.uuid, "Searches-keywords-bar-chart.png", saveAs);
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
        if (JSON.stringify(search.profile).toLowerCase().indexOf(keyword.name.toLowerCase()) != -1 
            && profiles.map(e => e.url).indexOf(search.url) == -1){
          profiles.push(search.profile);
        }
      }
      barData.push({label: keyword.name, profiles: profiles}); 
    }

  	var colors = getChartColors(barData.length);

  	this.setState({
      barData: {
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
      },
      labelsData: barData,
    });
  }

  onChartClick(event){

    var elements = getElementAtEvent(this.state.chartRef.current, event);
    console.log(elements, (elements[0]).index);

    if (elements.length != 0){
      this.handleOffCanvasShow((elements[0]).index);
    }

  }

  handleOffCanvasClose = () => { 
    this.setState({offCanvasShow: false}, 
    () => { this.setState({selectedChartElementIndex: null}); });
  };

  handleOffCanvasShow = (elementIndex) => { 
    this.setState({selectedChartElementIndex: elementIndex}, 
    () => { 
      this.setState({offCanvasShow: true});
    }
  )};

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

        <Offcanvas show={this.state.offCanvasShow} onHide={this.handleOffCanvasClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
             { (this.state.selectedChartElementIndex != null) ? ("Keyword: " + this.state.labelsData[this.state.selectedChartElementIndex].label) : "Title" }
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>

            { this.state.selectedChartElementIndex == null && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div>}

            { (this.state.selectedChartElementIndex != null && ((this.state.labelsData[this.state.selectedChartElementIndex]).profiles).length == 0) && <div class="text-center m-5 mt-2">
                    <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mb-3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">No corresponding profiles</span></p>
                  </div> }
            
            { (this.state.selectedChartElementIndex != null && ((this.state.labelsData[this.state.selectedChartElementIndex]).profiles).length != 0) && 
                <div class="list-group m-1 shadow-sm small">
                  { (this.state.labelsData[this.state.selectedChartElementIndex]).profiles.map((profile) => (<a class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                                    <img src={profile.avatar ? profile.avatar : default_user_icon} alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
                                    <div class="d-flex gap-2 w-100 justify-content-between">
                                      <div>
                                        <div class="d-flex gap-2 align-items-center">
                                          <h6 class="mb-0 d-flex align-items-center gap-1">
                                            <a class="text-decoration-none text-black" href={"/index.html?redirect_to=ProfileView&data=" + profile.url} target="_blank">{profile.fullName}</a> 
                                          </h6>
                                          
                                          <small class="opacity-50 text-nowrap ms-auto">{moment(profile.date, moment.ISO_8601).format("L")}</small>
                                        </div>
                                        <p class="mb-0 opacity-75 small">{profile.title}</p>
                                        <p class="shadow-sm fst-italic opacity-50 mb-0 badge bg-light-subtle text-light-emphasis rounded-pill border border-warning">{profile.nFollowers} · {profile.nConnections}</p>
                                      </div>
                                    </div>
                                  </a>)) }
                </div>}
          </Offcanvas.Body>
        </Offcanvas>
			</>
		);
	}
}
