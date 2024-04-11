/*import './FeedPostDataMarkerView.css'*/
import React from 'react';
import { appParams } from "../../popup/Local_library";
import { 
  BarChartIcon, 
  LayersIcon } from "../../popup/widgets/SVGs";
import eventBus from "../../popup/EventBus";
import { Dropdown } from "flowbite-react";

export default class FeedPostDataMarkerView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };

    this.showFeedPostDataModal = this.showFeedPostDataModal.bind(this);
    
  }

  componentDidMount() {

  }

  showFeedPostDataModal(){

    eventBus.dispatch(eventBus.SHOW_FEED_POST_DATA_MODAL, {object: this.props.object});

  }

  render(){
    return (
      <>
        <div class={"shadow w-full inline-flex p-4 mb-4 py-1 text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800 "} role="alert">
            <div class="flex items-center">
              <svg class="flex-shrink-0 w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"></path>
              </svg>
              <span class="sr-only">Info</span>
              <h3 class="text-sm font-medium">LinkBeam</h3>
            </div>
            
            <div class="flex ml-auto">
              {/*<button onClick={() => {}} type="button" class="text-white bg-blue-800 hover:bg-blue-900 focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 mr-2 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                <svg class="-ml-0.5 mr-2 h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
                  <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"></path>
                </svg>
                
                {this.state.commentsCount != null && <span class="ml-1">{"("+this.state.commentsCount+")"}</span>}
              </button>*/}

              <Dropdown 
                label="" 
                dismissOnClick={false} 
                renderTrigger={() => 
                  <span 
                    class="handy-cursor mx-2 text-blue-800 bg-transparent border border-blue-800 hover:bg-blue-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-blue-600 dark:border-blue-600 dark:text-blue-400 dark:hover:text-white dark:focus:ring-blue-800"
                    title="Actions">
                    <LayersIcon 
                      size="12"
                      className=""/>
                  </span>
                }>
                <Dropdown.Item>Add reminder</Dropdown.Item>
              </Dropdown>


              <button 
                onClick={this.showFeedPostDataModal} 
                type="button" 
                class="text-blue-800 bg-transparent border border-blue-800 hover:bg-blue-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-blue-600 dark:border-blue-600 dark:text-blue-400 dark:hover:text-white dark:focus:ring-blue-800"
                title="See trend">
                <BarChartIcon 
                    size="12"
                    className=""/>
              </button>
            </div>
        </div>
      </>
    );
  }
}
