/*import './HomeMenu.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { activateInCurrentTab } from "../Local_library";
import * as d3 from "d3";

export default class ProfileAboutSectionBubbleChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

    this.drawChart();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objectData != this.props.objectData){
      this.drawChart();
    }

  }

  drawChart(){

    if (!this.props.objectData){
      return;
    }

    console.log("¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ : ", this.props.objectData);

    // Specify the dimensions of the chart.
    const width = 928;
    const height = width;
    const margin = 1; // to avoid clipping the root circle stroke

    // Specify the number format for values.
    const format = d3.format(",d");

    // Create a categorical color scale.
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    // Create the pack layout.
    const pack = d3.pack()
        .size([width - margin * 2, height - margin * 2])
        .padding(1);

    // Compute the hierarchy from the (flat) data; expose the values
    // for each node; lastly apply the pack layout.
    const root = pack(d3.hierarchy({children: this.props.objectData})
        .sum(d => d.count));

    // Create the SVG container.
    const svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-margin, -margin, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
        .attr("text-anchor", "middle");

    // Place each (leaf) node according to the layout’s x and y values.
    const node = svg.append("g")
      .selectAll()
      .data(root.leaves())
      .join("g")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    // Add a title.
    node.append("title")
        .text(d => `${d.data.word}\n${format(d.data.count)}`);

    // Add a filled circle.
    node.append("circle")
        .attr("fill-opacity", 0.7)
        .attr("fill", (d, i) => color(i))
        .attr("r", d => d.r);

    // Add a label.
    const text = node.append("text")
        .attr("clip-path", d => `circle(${d.r})`);
    ;

    // Add a tspan for each CamelCase-separated word.
    text// .selectAll()
      // .data(d => d.word)
      // .join("tspan")
        .append("tspan")
        .attr("x", 0)
        .attr("y", (d, i, nodes) => `${0.35}em`)
        .text(d => d.data.word);

    // Add a tspan for the node’s value.
    // text.append("tspan")
    //     .attr("x", 0)
    //     .attr("y", d => `${1 / 2 + 0.35}em`)
    //     .attr("fill-opacity", 0.7)
    //     .text(d => d.data.count);
    
  }

  render(){
    return (
      <>

        { !this.props.objectData && <div class="text-center"><div class="mt-4"><div class="spinner-border text-primary" role="status">
                      {/*<span class="visually-hidden">Loading...</span>*/}
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                  </div>
                </div>}

        <div id="chart" class="p-3">
        </div>
      </>
    );
  }
}
