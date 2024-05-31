/*import './HashtagGraphChart.css'*/
import React from 'react';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
	saveCanvas, 
	dbDataSanitizer,
} from "../../Local_library";
import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { DateTime as LuxonDateTime } from "luxon";
// import { AlertCircleIcon } from "../SVGs";

export default class HashtagGraphChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      uuid: uuidv4(),
      chartData: null,
    };

    this.setChartData = this.setChartData.bind(this);
    this.drawChart = this.drawChart.bind(this);
  }

  componentDidMount() {

  	this.setChartData();

  }

  componentWillUnmount(){

  }

  componentDidUpdate(prevProps, prevState){

  	if (prevProps.objects != this.props.objects){
  		this.setChartData();
  	}

  }

  setChartData(){

  	if (!this.props.objects){
  		return;
  	}

  	var chartData = {
          nodes: [],
          links: [],
        };

    for (var reference of this.props.objects){

      if (chartData.nodes.map(e => e.id).indexOf(reference.text) == -1){

        chartData.nodes.push({
          id: reference.text,
          group: "group_1",
        });

      }

      for (var feedPost of reference.feedPosts){

        for (var subRef of feedPost.references){

        	if (subRef.text == reference.text){
        		continue;
        	}

        	if (!subRef.text.startsWith("#")){
            continue;
          }

          if (chartData.nodes.map(e => e.id).indexOf(subRef.text) == -1){

            chartData.nodes.push({
              id: subRef.text,
              group: "group_2",
            });

          }

          const index = chartData.links.findIndex(l => (l.source == reference.text && l.target == subRef.text)
          																								|| (l.source == subRef.text && l.target == reference.text));
          if (index == -1){

          	chartData.links.push({
	            source: reference.text,
	            target: subRef.text,
	            value: 1,
	            ids: [feedPost.id],
	          });

          }
          else{

          	if (chartData.links[index].ids.indexOf(feedPost.id) == -1){
          		chartData.links[index].value++;
          		chartData.links[index].push(feedPost.id)
          	}

          }

        }

      }
      
    }

  	this.setState({chartData: chartData}, () => {
  		this.drawChart();
  	});

  }

  drawChart(){

  	if (!this.props.objects){
  		this.setState({chartData: null});
  	}

    if (!this.state.chartData){
      return;
    }

    // Specify the dimensions of the chart.
    const width = 928;
    const height = 600;

    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const links = this.state.chartData.links.map(d => ({...d}));
    const nodes = this.state.chartData.nodes.map(d => ({...d}));

    // Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

    // Create the SVG container.
    const svg = d3.select("#chartTag_"+this.state.uuid).append("svg")
        .attr("width", /*window.innerWidth*/ width)
        .attr("height", /*window.innerHeight*/ height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    // Add a line for each link, and a circle for each node.
    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
      .selectAll()
      .data(links)
      .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
      .selectAll()
      .data(nodes)
      .join("circle")
        .attr("r", 5)
        .attr("fill", d => color(d.group));

    node.append("title")
        .text(d => d.id);

    // Add a drag behavior.
    node.call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

    // Set the position attributes of links and nodes each time the simulation ticks.
    function ticked() {
      link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

      node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
    }

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // When this cell is re-run, stop the previous simulation. (This doesn’t
    // really matter since the target alpha is zero and the simulation will
    // stop naturally, but it’s a good practice.)
    // invalidation.then(() => simulation.stop());

    return svg.node();

  }

  render(){
    return (
      <>

        { !this.state.chartData 
        		&& <div class="text-center"><div class="mt-4"><div class="spinner-border spinner-border-sm text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    {/*<p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>*/}
                  </div>
                </div>}

        { this.state.chartData 
        		&& <div>
        			<div id={"chartTag_"+this.state.uuid} class=""></div>
        		</div> }
      </>
    );
  }
}
