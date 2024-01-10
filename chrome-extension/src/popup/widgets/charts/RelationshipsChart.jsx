/*import './RelationshipsChart.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { activateInCurrentTab, saveCanvas, dbDataSanitizer } from "../../Local_library";
import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';


function linkArc(d) {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
};

const drag = simulation => {
  
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

export default class RelationshipsChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      uuid: uuidv4(),
      data: null,
    };
  }

  componentDidMount() {

    eventBus.on(eventBus.DOWNLOAD_CHART_IMAGE, (data) =>
      {
        if (data.carrouselItemIndex != this.props.carrouselIndex){
          return;
        }

        saveCanvas(this.state.uuid, "Relationships-graph-chart.png", saveAs);
      }
    );

    this.drawChart();

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.DOWNLOAD_CHART_IMAGE);

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objects != this.props.objects){
      this.drawChart();
    }

  }

  setData(callback){

    var chartData = {
          nodes: [],
          links: [],
        };

    for (var profile of this.props.objects){

      var source = dbDataSanitizer.fullName(profile.fullName);
      chartData.nodes.push({
        id: source,
        group: 1,
      });

      var suggestions = profile.profileSuggestions;
      if (suggestions){
        for (var suggestion of suggestions){
          var target = dbDataSanitizer.suggestionName(suggestion.name);

          chartData.nodes.push({
            id: target,
            group: 2,
          });

          chartData.links.push({
            source: source,
            target: target,
            value: Math.floor(Math.random() * 5) + 1,
          });
        }
      }
    }

    if (this.props.objects.length == 1){
       
      const degree = d3.rollup(
        chartData.links.flatMap(({ source, target, value }) => [
          { node: source, value },
          { node: target, value }
        ]),
        (v) => d3.sum(v, ({ value }) => value),
        ({ node }) => node
      );
      chartData["orders"] = new Map([
        ["by name", d3.sort(chartData.nodes.map((d) => d.id))],
        ["by group", d3.sort(chartData.nodes, ({group}) => group, ({id}) => id).map(({id}) => id)],
        //    ["input", nodes.map(({id}) => id)],
        ["by degree", d3.sort(chartData.nodes, ({id}) => degree.get(id), ({id}) => id).map(({id}) => id).reverse()]
      ]);
      
    }

    this.setState({data: chartData}, () => { callback(); });

  }

  drawChart(){

    if (!this.props.objects){
      return;
    }

    // if a previous svg has laready been draw, no need to has one new
    var chartContainer = document.getElementById("chartTag_"+this.state.uuid);
    if (chartContainer.firstChild){
      return;
    }

    const drawArcDiagram = () => {


      const width = 640;
      const step = 14;
      const marginTop = 20;
      const marginRight = 20;
      const marginBottom = 20;
      const marginLeft = 130;
      const height = (this.state.data.nodes.length - 1) * step + marginTop + marginBottom;
      const y = d3.scalePoint(this.state.data.orders.get("by name"), [marginTop, height - marginBottom]);

      // A color scale for the nodes and links.
      const color = d3.scaleOrdinal()
        .domain(this.state.data.nodes.map(d => d.group).sort(d3.ascending))
        .range(d3.schemeCategory10)
        .unknown("#aaa");

      // A function of a link, that checks that source and target have the same group and returns
      // the group; otherwise null. Used to color the links.
      const groups = new Map(this.state.data.nodes.map(d => [d.id, d.group]));
      function samegroup({ source, target }) {
        return groups.get(source) === groups.get(target) ? groups.get(source) : null;
      }

      // Create the SVG container.
      const svg = d3.select("#chartTag_"+this.state.uuid).append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [0, 0, width, height])
          .attr("style", "max-width: 100%; height: auto;");

      // The current position, indexed by id. Will be interpolated.
      const Y = new Map(this.state.data.nodes.map(({id}) => [id, y(id)]));
      
      // Add an arc for each link.
      function arc(d) {
        const y1 = Y.get(d.source);
        const y2 = Y.get(d.target);
        const r = Math.abs(y2 - y1) / 2;
        return `M${marginLeft},${y1}A${r},${r} 0,0,${y1 < y2 ? 1 : 0} ${marginLeft},${y2}`;
      }
      const path = svg.insert("g", "*")
          .attr("fill", "none")
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(this.state.data.links)
        .join("path")
          .attr("stroke", d => color(samegroup(d)))
          .attr("d", arc);

      // Add a text label and a dot for each node.
      const label = svg.append("g")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("text-anchor", "end")
        .selectAll("g")
        .data(this.state.data.nodes)
        .join("g")
          .attr("transform", d => `translate(${marginLeft},${Y.get(d.id)})`)
          .call(g => g.append("text")
              .attr("x", -6)
              .attr("dy", "0.35em")
              .attr("fill", d => d3.lab(color(d.group)).darker(2))
              .text(d => d.id))
          .call(g => g.append("circle")
              .attr("r", 3)
              .attr("fill", d => color(d.group)));

      // Add invisible rects that update the class of the elements on mouseover.
      label.append("rect")
          .attr("fill", "none")
          .attr("width", marginLeft + 40)
          .attr("height", step)
          .attr("x", -marginLeft)
          .attr("y", -step / 2)
          .attr("fill", "none")
          .attr("pointer-events", "all")
          .on("pointerenter", (event, d) => {
            svg.classed("hover", true);
            label.classed("primary", n => n === d);
            label.classed("secondary", n => this.state.data.links.some(({source, target}) => (
              n.id === source && d.id == target || n.id === target && d.id === source
            )));
            path.classed("primary", l => l.source === d.id || l.target === d.id).filter(".primary").raise();
          })
          .on("pointerout", () => {
            svg.classed("hover", false);
            label.classed("primary", false);
            label.classed("secondary", false);
            path.classed("primary", false).order();
          });

      // Add styles for the hover interaction.
      svg.append("style").text(`
        .hover text { fill: #aaa; }
        .hover g.primary text { font-weight: bold; fill: #333; }
        .hover g.secondary text { fill: #333; }
        .hover path { stroke: #ccc; }
        .hover path.primary { stroke: #333; }
      `);

      // A function that updates the positions of the labels and recomputes the arcs
      // when passed a new order.
      function update(order) {
        y.domain(order);

        label
            .sort((a, b) => d3.ascending(Y.get(a.id), Y.get(b.id)))
            .transition()
            .duration(750)
            .delay((d, i) => i * 20) // Make the movement start from the top.
            .attrTween("transform", d => {
              const i = d3.interpolateNumber(Y.get(d.id), y(d.id));
              return t => {
                const y = i(t);
                Y.set(d.id, y);
                return `translate(${marginLeft},${y})`;
              }
            });

        path.transition()
            .duration(750 + this.state.data.nodes.length * 20) // Cover the maximum delay of the label transition.
            .attrTween("d", d => () => arc(d));
      }

      return Object.assign(svg.node(), {update});

    };

    const drawGraph = () => {

      // Specify the dimensions of the chart.
      const width = 928;
      const height = 600;

      // Specify the color scale.
      const color = d3.scaleOrdinal(d3.schemeCategory10);

      // The force simulation mutates links and nodes, so create a copy
      // so that re-evaluating this cell produces the same result.
      const links = this.state.data.links.map(d => ({...d}));
      const nodes = this.state.data.nodes.map(d => ({...d}));

      // Create a simulation with several forces.
      const simulation = d3.forceSimulation(nodes)
          .force("link", d3.forceLink(links).id(d => d.id))
          .force("charge", d3.forceManyBody())
          .force("center", d3.forceCenter(width / 2, height / 2))
          .on("tick", ticked);

      // Create the SVG container.
      const svg = d3.select("#chartTag_"+this.state.uuid).append("svg")
          .attr("width", width)
          .attr("height", height)
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

    };

    if (!this.state.data){
      this.setData(() => {
        if (this.props.objects.length == 1){
          drawArcDiagram();
        }
        else{
          drawGraph();
        }
      });
      return;
    }

    if (this.props.objects.length == 1){
      drawArcDiagram();
    }
    else{
      drawGraph();
    }
  
  }

  render(){
    return (
      <>

        { !this.props.objects && <div class="text-center"><div class="mt-4"><div class="spinner-border spinner-border-sm text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    {/*<p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>*/}
                  </div>
                </div>}

        { this.props.objects && <div id={"chartTag_"+this.state.uuid} class=""></div> }
      </>
    );
  }
}
