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


/*import './FeedProfilesNetworkGraphChart.css'*/
import React from 'react';
// import { dbDataSanitizer } from "../../Local_library";
import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid';
// import {Swatches} from "@d3/color-legend";
import { db } from "../../../db";


function linkArc(d) {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
};

var drag = simulation => {
  
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
};

export default class FeedProfilesNetworkGraphChart extends React.Component{

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

  async setChartData(){

    var chartData = [];

    for (const feedPostView of this.props.objects.filter((value, index, self) => self.findIndex(object => object.htmlElId == value.htmlElId) === index)){

    	if (!feedPostView.profile){
    		continue;
    	}

    	const source = feedPostView.profile.name,
    		  	target = feedPostView.feedPost.profile.name;	

  		if (chartData.findIndex(d => d.source == source && d.target == target) == -1
  					&& chartData.findIndex(d => d.source == target && d.target == source) == -1){
  			chartData.push({
  				source: source,
  				target: target,
  				type: "null",
  			});
  		}

    }

    this.setState({chartData: chartData}, () => {
      this.drawChart();
    });

  }

  componentDidUpdate(prevProps, prevState){

  	if (prevProps.objects != this.props.objects){
  		this.setChartData();
  	}

  }

  drawChart(){

    if (!this.state.chartData){
      return;
    }

    const width = 928;
		const height = 600;
		const types = Array.from(new Set(this.state.chartData.map(d => d.type)));
		const nodes = Array.from(new Set(this.state.chartData.flatMap(l => [l.source, l.target])), id => ({id}));
		const links = this.state.chartData.map(d => Object.create(d))

		const color = d3.scaleOrdinal(types, d3.schemeCategory10);

		const simulation = d3.forceSimulation(nodes)
		  .force("link", d3.forceLink(links).id(d => d.id))
		  .force("charge", d3.forceManyBody().strength(-400))
		  .force("x", d3.forceX())
		  .force("y", d3.forceY());

		const svg = d3.select(`#chartTag_${this.state.uuid}`).append("svg")
		  .attr("viewBox", [-width / 2, -height / 2, width, height])
		  .attr("width", width)
		  .attr("height", height)
		  .attr("style", "max-width: 100%; height: auto; font: 12px sans-serif;");

		// Per-type markers, as they don't inherit styles.
		svg.append("defs").selectAll("marker")
		.data(types)
		.join("marker")
		  .attr("id", d => `arrow-${d}`)
		  .attr("viewBox", "0 -5 10 10")
		  .attr("refX", 15)
		  .attr("refY", -0.5)
		  .attr("markerWidth", 6)
		  .attr("markerHeight", 6)
		  .attr("orient", "auto")
		.append("path")
		  .attr("fill", color)
		  .attr("d", "M0,-5L10,0L0,5");

		const link = svg.append("g")
		  .attr("fill", "none")
		  .attr("stroke-width", 1.5)
		.selectAll("path")
		.data(links)
		.join("path")
		  .attr("stroke", d => color(d.type))
		  .attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`);

		const node = svg.append("g")
		  .attr("fill", "currentColor")
		  .attr("stroke-linecap", "round")
		  .attr("stroke-linejoin", "round")
		.selectAll("g")
		.data(nodes)
		.join("g")
		  .call(drag(simulation));

		node.append("circle")
		  .attr("stroke", "white")
		  .attr("stroke-width", 1.5)
		  .attr("r", 4);

		node.append("text")
		  .attr("x", 8)
		  .attr("y", "0.31em")
		  .text(d => d.id)
		.clone(true).lower()
		  .attr("fill", "none")
		  .attr("stroke", "white")
		  .attr("stroke-width", 3);

		simulation.on("tick", () => {
		link.attr("d", linkArc);
		node.attr("transform", d => `translate(${d.x},${d.y})`);
		});

		// invalidation.then(() => simulation.stop());

		return Object.assign(svg.node(), {scales: {color}});
  
  }

  render(){
    return (
      <>

        { !this.state.chartData && <div class="text-center"><div class="mt-4"><div class="spinner-border spinner-border-sm text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    {/*<p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>*/}
                  </div>
                </div>}

        { this.state.chartData && <div id={`chartTag_${this.state.uuid}`} class="shadow-sm rounded border border-2"></div> }

      </>
    );
  }
}
