/*import './ProfileAboutSectionView.css'*/
import React from 'react';
import { OverlayTrigger } from "react-bootstrap";
import Collapse from 'react-bootstrap/Collapse';
import ProfileAboutBubbleChart from './Charts/ProfileAboutBubbleChart';
import { 
	dbDataSanitizer,
	setLocalProfiles
} from "../Local_library";
import eventBus from "../EventBus";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ProfileSingleItemDonutChart from "./Charts/ProfileSingleItemDonutChart";
import { AlertCircleIcon } from "./SVGs";
import { db } from "../../db";


export default class ProfileAboutSectionView extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			collapseInfoOpen: false,
			wordsData: null,
			donutChartModalShow: false,
			donutChartModalItemData: null,
		};

		this.setDonutChartData = this.setDonutChartData.bind(this);
	}

	componentDidMount() {

    if (this.props.profile.info){

      // setting sanitizedProfileAbout
      const sanitizedProfileAbout = dbDataSanitizer.profileAbout(this.props.profile.info);

      var wordsData = {};
      for (var word of sanitizedProfileAbout.split(" ")){
          if (!word.length){
              continue;
          }

          wordsData[word] = !(word in wordsData) ? 1 : wordsData[word] + 1;
      }

      this.setState({wordsData: wordsData});
      
    }

	}

	componentDidUpdate(prevProps, prevState){

	}

	handleDonutChartModalClose = () => {
		this.setState({donutChartModalShow: false})
	};

	handleDonutChartModalShow = () => {

		if (!this.props.profile.info){
			return;
		}

		this.setState({donutChartModalShow: true}, async () => {

			setLocalProfiles(this, db, eventBus, ["info"], "setDonutChartData");

		});

	};

	setDonutChartData(){

		if (!this.state.donutChartModalItemData){

			var donutChartModalItemData = {
				label: "Intro length",
				value: 0,
			}

			var refLength = dbDataSanitizer.preSanitize(this.props.profile.info).length;
			for (var profile of this.props.localDataObject.profiles){

				if (profile.url == this.props.profile.url){
					continue;
				}

				if (!profile.info
						|| (profile.info && dbDataSanitizer.preSanitize(profile.info).length <= refLength)){
					donutChartModalItemData.value += 1;
				}

			}

			donutChartModalItemData.value /= this.props.localDataObject.profiles.length;
			donutChartModalItemData.value *= 100;

			this.setState({donutChartModalItemData: donutChartModalItemData});

		}

	}

	render(){
		return (
			<>
				{ !this.state.wordsData && <div class="text-center m-5 mt-2">
									 <AlertCircleIcon size="100" className="text-muted"/>
									 <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">No About data to show</span></p>
								 </div> } 

				{ this.state.wordsData && <div class="m-4">

																			<div class="row">

																				{[{
																					cardText: "Word count",
																					cardTitle: dbDataSanitizer.profileAbout(this.props.profile.info).split(" ").filter(word => word.length).length,
																					onClickFunc: null,
																				},
																				{
																					cardText: "Character count",
																					cardTitle: dbDataSanitizer.preSanitize(this.props.profile.info).length,
																					onClickFunc: null,
																				},
																				{
																					cardText: "Average word length",
																					cardTitle: (Object.keys(this.state.wordsData).map(word => word.length).reduce((acc, a) => acc + a, 0) / Object.keys(this.state.wordsData).length).toFixed(1),
																					onClickFunc: null,
																				},
																				{
																					cardText: "Unique words",
																					cardTitle: `${(((Object.keys(this.state.wordsData).filter(word => this.state.wordsData[word] == 1).length * 100) / Object.keys(this.state.wordsData).length)).toFixed(1)}%`,
																					onClickFunc: null,
																				}].map(item => (<div class=/*handy-cursor*/" card mb-3 shadow small text-muted col mx-2 border border-1" /*onClick={() => {this.handleDonutChartModalShow({label: "WORD_COUNT", value: this.wordCount()})}}*/>
																															<div class="card-body">
																																<h5 class="card-title">{item.cardTitle}</h5>
																																<p class="card-text">{item.cardText}</p>
																															</div>
																														</div>))}
																			</div>

																			{this.state.wordsData && <div class="border border-1 mb-3 mt-2 shadow rounded">
																																							<ProfileAboutBubbleChart 
																																								objectData={this.state.wordsData}/>
																																						</div>}

																			<div>
																				<span class="handy-cursor">
																					
																					{ !this.state.collapseInfoOpen && <svg
																																											onClick={() => {this.setState({collapseInfoOpen: !this.state.collapseInfoOpen})}}
																																											aria-controls="collapseInfo"
																																											aria-expanded={this.state.collapseInfoOpen} 
																																											viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 ms-2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
																					
																					{ this.state.collapseInfoOpen && <svg 
																																											onClick={() => {this.setState({collapseInfoOpen: !this.state.collapseInfoOpen})}}
																																											aria-controls="collapseInfo"
																																											aria-expanded={this.state.collapseInfoOpen} 
																																											viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 ms-2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>}
																				</span>
																				<Collapse in={this.state.collapseInfoOpen}>
																					<div id="collapseInfo">
																						<div class="bg-light border fw-light border-1 text-muted rounded shadow p-3 small mt-2">
																							{this.props.profile.info}
																						</div>
																					</div>
																				</Collapse>
																			</div>
																		 </div> } 



				<Modal 
					show={this.state.donutChartModalShow} 
					onHide={this.handleDonutChartModalClose}
					// size="lg"
					>
					<Modal.Header closeButton>
						<Modal.Title>Intro Length</Modal.Title>
					</Modal.Header>
					<Modal.Body>

						{ !this.state.donutChartModalItemData && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
											{/*<span class="visually-hidden">Loading...</span>*/}
										</div>
										<p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
									</div>
								</div>}
						
						{ this.state.donutChartModalItemData && <div>
																											<div class="text-center col-6 offset-3">
																												<ProfileSingleItemDonutChart data={this.state.donutChartModalItemData}/>
																											</div>
																										<p class="shadow-sm border mt-4 rounded p-2 text-muted fst-italic small">
																											{dbDataSanitizer.preSanitize(this.props.profile.fullName)+"'s intro is longer than "}
																											<span class="badge text-bg-primary">{(this.state.donutChartModalItemData.value).toFixed(1)}</span>
																											{"% of all the profiles you've visited so far." }
																										</p>
																										</div>}

					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" size="sm" onClick={this.handleDonutChartModalClose} className="shadow">
							Close
						</Button>
					</Modal.Footer>
				</Modal>
			</>
		);
	}
}
