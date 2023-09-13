/*import './SearchListView.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
/*import 'bootstrap/dist/css/bootstrap.min.css';*/

export default class KeywordListView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      objectTags: null,
    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){


  }

  render(){
    return (
      <>
        { this.props.objects == null && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                      {/*<span class="visually-hidden">Loading...</span>*/}
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                  </div>
                </div>}

        { this.props.objects != null && this.props.objects.length == 0 && <div class="text-center m-5 mt-4">
                      <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      <p><span class="badge text-bg-primary fst-italic shadow">No keywords yet</span></p>
                    </div>}

        { this.props.objects != null && this.props.objects.length != 0 && 
                <ul class="list-unstyled mb-0 rounded shadow p-2">
                  {
                    this.props.objects.map((keyword, index) => (<li key={index}>
                            <a class="dropdown-item d-flex align-items-center gap-2 py-2" href="#" onClick={() => {this.props.onItemDeletion(keyword)}}>
                              <span class="d-inline-block bg-success rounded-circle p-1"></span>
                              {keyword.name}
                              <svg viewBox="0 0 24 24" width="14" height="14" stroke="#dc3545" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            </a>
                          </li>))
                  }
                </ul> }
      </>
    );
  }
}
