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

/*import './LanguageListModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import { Offcanvas } from "react-bootstrap";
import ProfileListItemView from "../ProfileListItemView";
import { 
  dbDataSanitizer,
  shuffle,
  performLanguageComparison,
  appParams,
} from "../../Local_library";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie, getElementAtEvent } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);


export default class LanguageListModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      pieData: null,
      languageData: null,
      chartRef: React.createRef(),
      selectedChartElementIndex: null,
      collapseInfoOpen: false,
      offCanvasShow: false,
    };

    this.setChartData = this.setChartData.bind(this);
    this.onChartClick = this.onChartClick.bind(this);
    this.showBelowDeckInfos = this.showBelowDeckInfos.bind(this);
    this.openCollapse = this.openCollapse.bind(this);
    // this.onHide = this.onHide.bind(this);

  }

  componentDidMount() {

    this.setChartData();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.globalData != this.props.globalData){
      if (prevProps.globalData.profiles != this.props.globalData.profiles){
        if (this.state.selectedChartElementIndex){
          this.openCollapse();
        }
      }
    }

  }

  onChartClick(event){

    var elements = getElementAtEvent(this.state.chartRef.current, event);
    console.log(elements, (elements[0]).index);

    if (elements.length != 0){
      this.showBelowDeckInfos((elements[0]).index);
    }

  }

  handleOffCanvasClose = () => {this.setState({offCanvasShow: false})};

  handleOffCanvasShow = () => {
      // this.setState({collapseInfoOpen: false, selectedChartElementIndex: null}, () => {
        this.setState({offCanvasShow: true});
        this.props.onHide();
      // });
  };

  setChartData(){

    if (!this.props.profile.languages){
      return;
    }

    var languages = [];

    for (var languageObject of this.props.profile.languages){

      var value = null, proficiency = languageObject.proficiency.toLowerCase();

      if (proficiency.indexOf("native") != -1 || proficiency.indexOf("natale") != -1){ value = 5; }
      if (proficiency.indexOf("full professional") != -1 || proficiency.indexOf("professionnelle complète") != -1){ value = 4; }
      if (proficiency.indexOf("professional working") != -1 || proficiency.indexOf("professionnelle générale") != -1){ value = 3; }
      if (proficiency.indexOf("limited working") != -1 || proficiency.indexOf("limité") != -1){ value = 2; }
      if (proficiency.indexOf("elementary") != -1 || proficiency.indexOf("notions") != -1){ value = 1; }
      if (value == null){ value = 0.5; }

      languages.push({
        label: dbDataSanitizer.preSanitize(languageObject.name),
        value: (value / 5) * 100,
      });

    }

    var colors = [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ];

    colors = shuffle(colors);


    this.setState({
      languageData: languages,
      pieData: {
        labels: languages.map((l) => l.label),
        datasets: [
          {
            label: 'Languages (%)',
            data: languages.map((l) => l.value),
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1,
          },
        ],
      }
    });

  }


  openCollapse = () => {

    if (!Object.hasOwn(this.state.languageData[this.state.selectedChartElementIndex]), "linkedProfiles"){

      if (!this.props.globalData.profiles){
        sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.PROFILES, { context: appParams.COMPONENT_CONTEXT_NAMES.PROFILE });
        return;
      }

      var profiles = performLanguageComparison(this.props.profile,
                                              this.state.languageData[this.state.selectedChartElementIndex].label,
                                              this.props.globalData.profiles
                                              );

      this.state.languageData[this.state.selectedChartElementIndex].linkedProfiles = profiles;

    }
    
    this.setState({collapseInfoOpen: true});

  };


  showBelowDeckInfos = (elementIndex) => { 

    this.setState({selectedChartElementIndex: elementIndex}, () => {

      this.openCollapse();

    });

  }

  // onHide(){
  //   this.setState({collapseInfoOpen: false, selectedChartElementIndex: null});
  //   this.props.onHide();
  // }

  render(){
    return (
      <>
        <Modal 
          show={this.props.show} 
          onHide={this.props.onHide} 
          // size="lg"
          >
          <Modal.Header closeButton>
            <Modal.Title>Languages</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            { !this.state.pieData && <div class="spinner-border spinner-border-sm" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                          </div> }

            { this.state.pieData && <div class="row">
                                      <div class={"col-6 " + "offset-3"}>
                                        <Pie 
                                          ref={this.state.chartRef}
                                          data={this.state.pieData}
                                          onClick={this.onChartClick}
                                           />
                                      </div>
                                      <div class="col-6">
                                      </div>
                                    </div>}

            { this.state.selectedChartElementIndex != null && 
                                        <Collapse in={this.state.collapseInfoOpen}>
                                          <div id="collapseInfo">
                                            <p class="shadow-sm border mt-4 rounded p-2 text-muted fst-italic small">
                                              {dbDataSanitizer.preSanitize(this.props.profile.fullName)+" speaks "} 
                                              <span class="rounded p-1 border shadow-sm badge text-primary">{this.state.languageData[this.state.selectedChartElementIndex].label}</span> 
                                              {" as well as "}
                                              <span class="badge text-bg-primary">{ Object.hasOwn(this.state.languageData[this.state.selectedChartElementIndex], "linkedProfiles") ? ((this.state.languageData[this.state.selectedChartElementIndex].linkedProfiles.length / this.props.globalData.profiles.length) * 100).toFixed(1) : 0}</span>
                                              {"% of all the profiles you've visited so far." }
                                              {/*<span class="badge text-bg-primary handy-cursor ms-2" onClick={this.handleOffCanvasShow}>{"SHOW"}</span>*/}
                                            </p>
                                          </div>
                                        </Collapse>}


          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.props.onHide} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Offcanvas show={this.state.offCanvasShow} onHide={this.handleOffCanvasClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Linked Profiles</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            
            { this.state.selectedChartElementIndex == null && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div>}

            { (this.state.offCanvasShow && (this.state.languageData[this.state.selectedChartElementIndex]).linkedProfiles.length == 0) && <div class="text-center m-5 mt-2">
                            <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mb-3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">No corresponding profiles</span></p>
                          </div> }
                    
            { (this.state.offCanvasShow && (this.state.languageData[this.state.selectedChartElementIndex]).linkedProfiles.length != 0) && 
                <div class="list-group m-1 shadow-sm small">
                  { (this.state.languageData[this.state.selectedChartElementIndex]).linkedProfiles.map((profile) => (<ProfileListItemView profile={profile}/>)) }
                </div>}

          </Offcanvas.Body>
        </Offcanvas>

      </>
    );
  }
}
