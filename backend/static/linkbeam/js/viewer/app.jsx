import 'vite/modulepreload-polyfill';
import { createRoot } from 'react-dom/client';
/*import { useState } from 'react';*/
import React from 'react';
import NavGroupButton from "../react_components/nav_group_button";
import UserInfosCard from "../react_components/user_infos_card";
import EducationItems from "../react_components/education_items";

const root = createRoot(document.getElementById('root_component'));


// Error wigdet code
export function ErrorWidget(props){

	return (<div class="text-center">
				<svg viewBox="0 0 24 24" width="200" height="200" stroke="gray" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
				<p class="mt-2 fst-italic">
					{props.message}
				</p>
			</div>);
}

// Main App
export default class ViewerApp extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			activeItemIndex: 0,
			user_profile: null,
		};
	};

	componentDidMount(){
		fetch("/profile_query_api")
	      .then(res => res.json())
	      .then(
	        (result) => {
	          this.setState({
	            user_profile: result,
	          });
	        },
	        (error) => {
	          this.setState({
	            user_profile: "undefined",
	          });
	        }
	      )
	};

	onItemPick = (itemIndex) => {
		this.setState({activeItemIndex: parseInt(itemIndex)});
	};

	render(){

		return(
			<>
				{
					this.state.user_profile == null ?
						(<div class="text-center">
							<div class="spinner-border mt-5 mb-2" role="status">
							  <span class="visually-hidden">Loading...</span>
							</div>
							<p class="fst-italic small">Loading</p>
						</div>)						
					:
						this.state.user_profile == "undefined" ? 
							<ErrorWidget message="An error occured. You are invited to try again later or check the link entered !"/>
						:
							Object.keys(this.state.user_profile).length == 0 ?
								<ErrorWidget message="An error occured. You are invited to try again later or check the link entered !"/>
							:
								(<div>
									<div className="text-center mb-4">
										<NavGroupButton onItemPick={this.onItemPick} activeItemIndex={this.state.activeItemIndex}/>
									</div>
									<div>
										<UserInfosCard active={this.state.activeItemIndex == 0}/>
										<EducationItems active={this.state.activeItemIndex == 1}/>
									</div>
								</div>)
				}
			</>
		);
	};
};

root.render(<ViewerApp/>);