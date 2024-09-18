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

/*import './PostsWithSameImageView.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.png';
import { OverlayTrigger, Tooltip, Popover } from "react-bootstrap";
import PageTitleView from "./widgets/PageTitleView";
import FullScreenImageModal from "./widgets/Modals/FullScreenImageModal";
import { AlertCircleIcon } from "./widgets/SVGs";
import Masonry from "react-responsive-masonry";
import ImageLoader from "./widgets/ImageLoader";
import Carousel from 'react-bootstrap/Carousel';
import { 
  appParams,
} from "./Local_library";
import { db } from "../db";
import { v4 as uuidv4 } from 'uuid';

const imgWidth = "200";
const imgHeight = "200";

function getBase64Image(img) {
  var canvas = document.createElement("canvas");
  canvas.width = imgWidth;
  canvas.height = imgHeight;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  var dataURL = canvas.toDataURL("image/png");
  return dataURL.replace(/^data:image\/?[A-z]*;base64,/);
}

const sandBoxSize = 5;
var decrement = 0;
var similarImageSrcList = [];
var fullyLoadedImageSrcList = [];
var imageSrcBase64 = null;

export default class PostsWithSameImageView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      imageSrc: null,
      imageSrcRef: React.createRef(),
      fsImage: null,
      imageSrcList: null, 
      testedImageSrcList: [],
      sandBoxImageSrcList: [],
      resultPosts: [],
    };

    this.getImageSrcList = this.getImageSrcList.bind(this);
    this.fillTheSandBox = this.fillTheSandBox.bind(this);
    this.sandBoxDoneLoading = this.sandBoxDoneLoading.bind(this);
    this.onImageLoaded = this.onImageLoaded.bind(this);
    this.onGivenImageLoaded = this.onGivenImageLoaded.bind(this);

  }

  componentDidMount() {
    (async () => {
      this.setState({imageSrc: (await chrome.storage.session.get(["imageSrc"])).imageSrc});
    }).bind(this)();
  }

  componentDidUpdate(prevProps, prevState){

  }

  fillTheSandBox(){
    const nextBatch = this.state.imageSrcList.slice(this.state.testedImageSrcList.length, (this.state.testedImageSrcList.length + sandBoxSize));
    decrement = nextBatch.length;
    console.log('Filling sandbox : ', decrement);
    if (!decrement){
      return;
    }
    this.setState({sandBoxImageSrcList: nextBatch}, () => {
      // if the network is slow for all the sandboxed images to be loaded
      setTimeout(() => {
        this.sandBoxDoneLoading();
      }, 5000);
    });
  }

  handleFsImageModalClose = () => this.setState({fsImage: null});
  handleFsImageModalShow = () => this.setState({fsImage: {src: this.state.imageSrc}});

  getSearchPercentage = () => this.state.imageSrcList?.length ? ((this.state.testedImageSrcList.length * 100) / this.state.imageSrcList.length).toFixed(1) : 0;

  async getImageSrcList(){
    var imageSrcList = [];
    await db.feedPosts.filter(feedPost => feedPost.media?.filter(medium => medium.src).length)
                      .each(feedPost => {
                        imageSrcList = imageSrcList.concat(feedPost.media.filter(medium => medium.src)
                                                                         .map(medium => medium.src));
                      });
    return imageSrcList.filter((value, index, self) => self.indexOf(value) === index).toReversed()/*.slice(0, 100)*/;
  }

  sandBoxDoneLoading(){

    this.setState({
      testedImageSrcList: [...this.state.testedImageSrcList].concat([...this.state.sandBoxImageSrcList]),
      sandBoxImageSrcList: [],
    }, () => {
      this.fillTheSandBox();
    });

  }


  onImageLoaded(imageSrc, base64){
    
    fullyLoadedImageSrcList.push(imageSrc);
    console.log("----- Image loaded : ", base64 === imageSrcBase64, imageSrc == this.state.imageSrc, imageSrc, this.state.imageSrc);

    if (base64 === imageSrcBase64){
      similarImageSrcList.push(imageSrc);
      console.log("similar images : ", imageSrc);

      (async () => {

        var posts = await db.feedPosts.filter(post => post.media?.filter(medium => medium.src == imageSrc).length)
                                        .toArray();
        for (var post of posts){
          post.profile = await db.feedProfiles.where({uniqueId: post.profileId}).first();
          post.view = await db.feedPostViews.where({feedPostId: post.uniqueId}).first();
        }

        this.setState({resultPosts: [...this.state.resultPosts].concat(posts)
                                                               /*.filter((value, index, self) => self.findIndex(v => v.uniqueId == value.uniqueId) === index)*/});  

      })();
    }

  }

  async onGivenImageLoaded(){

    imageSrcBase64 = getBase64Image(this.state.imageSrcRef.current);

    this.setState({imageSrcList: await this.getImageSrcList()}, () => {
      this.fillTheSandBox();
    });

  }

  render(){
    return (
      <>
        <div class="mt-5 pb-5 pt-3">

          <div class="text-center">
            <img src={app_logo}  alt="" width="40" height="40"/>
            <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.POSTS_WITH_SAME_IMAGE}/>
          </div>

          <div class="offset-2 col-8 mt-4 row">

            <div class="small shadow-sm mb-3 mt-2 p-1 fst-italic border-start border-warning ps-2 border-4 bg-warning-subtle text-muted">
              This beta feature may not perform as accurately as expected yet.
            </div>

            <div class="rounded border shadow-sm text-center pt-3">
              { this.state.imageSrc 
                  && <div class="">
                      <img 
                        class="rounded shadow" 
                        src={this.state.imageSrc} 
                        alt="" 
                        crossOrigin="*"
                        width={imgWidth}
                        height={imgHeight}
                        ref={this.state.imageSrcRef}
                        onLoad={this.onGivenImageLoaded}
                        onMouseEnter={this.handleFsImageModalShow}/>
                    </div>}
              { parseInt(this.getSearchPercentage()) != 100
                  && <div>
                      <div class="progress my-3 col-6 mx-auto" style={{height: ".5em"}}  role="progressbar" aria-label="Animated striped example" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" style={{width: "100%"}}></div>
                      </div>
                      <p>
                        <span>
                          <span class="badge text-bg-primary fst-italic shadow-sm">
                            {`Searching (${this.getSearchPercentage()} %) ...`}
                          </span>
                        </span>
                      </p> 
                    </div> }
                {/*<div class="clearfix mt-2">
                  <span class="float-end small fst-italic text-muted">Powered by Resemble JS</span>
                </div>*/}
            </div>
            { parseInt(this.getSearchPercentage()) != 0
                && <div class="rounded border shadow-sm my-3 text-muted small py-1">
                    {similarImageSrcList.length} result{similarImageSrcList.length <= 1 ? "" : "s"} for this image
                  </div> }

            <div class="my-3">
              <Masonry columnsCount={3} gutter="10px">
                { this.state.resultPosts.toReversed()
                                        .map(feedPost => <OverlayTrigger 
                                                            trigger="hover" 
                                                            placement="left" 
                                                            overlay={<Popover id="popover-basic">
                                                                        <Popover.Header 
                                                                          as="h3" 
                                                                          dangerouslySetInnerHTML={{__html: `${feedPost.profile.name} <span class="shadow-sm  badge bg-secondary-subtle border border-secondary-subtle text-info-emphasis rounded-pill">${feedPost.media[0].src ? "Image" : "Video"}</span>`}}>
                                                                            {/*{feedPost.profile.name}*/}
                                                                        </Popover.Header>
                                                                        {feedPost.innerContentHtml 
                                                                            && <Popover.Body dangerouslySetInnerHTML={{__html: feedPost.innerContentHtml /*highlightText(feedPost.innerContentHtml, this.state.searchText)*/}}>
                                                                                {}
                                                                              </Popover.Body>}
                                                                      </Popover>}
                                                            >
                                                            <a 
                                                              href={`${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${feedPost.htmlElId || feedPost.view?.htmlElId}`} 
                                                              target="_blank" 
                                                              title="View on linkedin">
                                                              <div 
                                                                class={`card shadow`} 
                                                                // style={feedPost.bookmarked ? {border: `4px solid ${hexToRgb(this.props.globalData.settings.postHighlightColor, "string")}`} : null}
                                                                >
                                                                { feedPost.media.length == 1
                                                                    && ((feedPost.media[0].src && feedPost.media[0].src.indexOf("data:image/") == -1) || !feedPost.media[0].src)
                                                                    && <ImageLoader
                                                                          imgSrc={feedPost.media[0].src || feedPost.media[0].poster} 
                                                                          imgClass="card-img-top"
                                                                          spinnerSize="small" /> }
                                                                { feedPost.media.length != 1
                                                                    && <Carousel controls={false} indicators={false}>
                                                                          {feedPost.media.map(medium => (<Carousel.Item>
                                                                                                          { ((medium.src && medium.src.indexOf("data:image/") == -1) || !medium.src)  
                                                                                                            && <ImageLoader 
                                                                                                                imgSrc={medium.src || medium.poster} 
                                                                                                                imgClass="card-img-top"
                                                                                                                spinnerSize="small"/>}
                                                                                                        </Carousel.Item>))}
                                                                      </Carousel>}
                                                                {/*<div class="card-body">
                                                                  <h5 class="card-title">Card title</h5>
                                                                  <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                                                                </div>
                                                                <div class="card-footer">
                                                                  <small class="text-body-secondary">Last updated 3 mins ago</small>
                                                                </div>*/}
                                                              </div>
                                                            </a>
                                                          </OverlayTrigger>) }
              </Masonry>
            </div>


          </div>

        </div>

        {/*The sand box*/}
        { <div class="d-none">
            { this.state.sandBoxImageSrcList.length != 0
                && this.state.sandBoxImageSrcList.map(imageSrc => {
                                                    const uuid = uuidv4();
                                                    return <img  
                                                            id={uuid}
                                                            src={imageSrc}
                                                            width={imgWidth}
                                                            height={imgHeight}
                                                            crossOrigin="*"
                                                            onLoad={() => {
                                                              this.onImageLoaded(imageSrc, getBase64Image(document.getElementById(uuid)));
                                                              if (!(--decrement)){ this.sandBoxDoneLoading(); }
                                                            }} />
                                                  }) }
          </div>}

        <FullScreenImageModal
          image={this.state.fsImage}
          onHide={this.handleFsImageModalClose}
          />

      </>
    );
  }
}
