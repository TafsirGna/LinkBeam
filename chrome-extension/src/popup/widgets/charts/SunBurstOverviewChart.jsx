/*import './SunBurstOverviewChart.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { activateInCurrentTab, saveCanvas, dbDataSanitizer } from "../../Local_library";
import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';

export default class SunBurstOverviewChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      uuid: uuidv4(),
      data: null,
    };

    this.setChartData = this.setChartData.bind(this);
    this.getLanguageData = this.getLanguageData.bind(this);
    this.getEducationData = this.getEducationData.bind(this);
    this.getExperienceData = this.getExperienceData.bind(this);
    this.getCertificationData = this.getCertificationData.bind(this);
  }

  componentDidMount() {

    this.setChartData();

  }

  componentWillUnmount(){

  }

  getExperienceData(){

    var expChildren = [];
    // Experience data
    if (this.props.profile.experience){

      for (var experience of this.props.profile.experience){

        var company = dbDataSanitizer.preSanitize(experience.company), 
            title = dbDataSanitizer.preSanitize(experience.title);
        var itemIndex = expChildren.map(e => e.fullName).indexOf(company);
        if (itemIndex == -1){
          expChildren.push({
            fullName: company,
            name: this.cropLabel(company),
            children: [{"name": this.cropLabel(title), "value": 123}],
          });
        }
        else{
          expChildren[itemIndex].children.push({"name": this.cropLabel(title), "value": 123});
        }

      }

    }

    return expChildren;

  }

  getEducationData(){

    var edChildren = [];
    // Education data
    if (this.props.profile.education){

      for (var education of this.props.profile.education){

        var institutionName = dbDataSanitizer.preSanitize(education.institutionName), 
            degree = dbDataSanitizer.preSanitize(education.degree);
        var itemIndex = edChildren.map(e => e.fullName).indexOf(institutionName);
        if (itemIndex == -1){
          edChildren.push({
            fullName: institutionName,
            name: this.cropLabel(institutionName),
            children: [{"name": this.cropLabel(degree), "value": 123}],
          });
        }
        else{
          edChildren[itemIndex].children.push({"name": this.cropLabel(degree), "value": 123});
        }

      }

    }

    return edChildren;

  }

  getLanguageData(){

    var langChildren = [];

    // Languages
    if (this.props.profile.languages){
      for (var language of this.props.profile.languages){

        var languageName = dbDataSanitizer.preSanitize(language.name);
        var itemIndex = langChildren.map(e => e.fullName).indexOf(languageName);
        if (itemIndex == -1){
          langChildren.push({
            fullName: languageName,
            name: this.cropLabel(languageName),
            // "children": [],
            value: 123,
          });
        }

      }

    }

    return langChildren;

  }

  getCertificationData(){

    var certChildren = [];

    // Languages
    if (this.props.profile.certifications){
      for (var certification of this.props.profile.certifications){

        if (!certification.issuer || !certification.title){
          continue;
        }

        var issuerName = dbDataSanitizer.preSanitize(certification.issuer), 
            title = dbDataSanitizer.preSanitize(certification.title);
        var itemIndex = certChildren.map(e => e.fullName).indexOf(issuerName);
        if (itemIndex == -1){
          certChildren.push({
            fullName: issuerName,
            name: this.cropLabel(issuerName),
            children: [{"name": this.cropLabel(title), "value": 123}],
          });
        }
        else{
          certChildren[itemIndex].children.push({"name": this.cropLabel(title), "value": 123});
        }

      }

    }

    return certChildren;

  }

  cropLabel(str){
    return str.slice(0, 30) + (str.length >= 30 ? "..." : "")
  }

  setChartData(){

    var expChildren = this.getExperienceData(), 
        edChildren = this.getEducationData(), 
        langChildren = this.getLanguageData(),
        certChildren = this.getCertificationData();


    var data = {"name":"profile",
                "children":[
                  {"name":"experience","children": expChildren}, 
                  {"name":"education","children": edChildren}, 
                  {"name":"languages","children": langChildren},
                  {"name":"certifications","children": certChildren},
                ]};
    this.setState({data: data}, () => {
      this.drawChart();
    });

  }

  componentDidUpdate(prevProps, prevState){

  }

  drawChart(){

    if (!this.state.data){
      return;
    }

    // if a previous svg has laready been draw, no need to has one new
    var chartContainer = document.getElementById("chartTag_"+this.state.uuid);
    if (chartContainer.firstChild){
      return;
    }


    // Specify the chart’s dimensions.
    const width = 928;
    const height = width;
    const radius = width / 6;

    // Create the color scale.
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, this.state.data.children.length + 1));

    // Compute the layout.
    const hierarchy = d3.hierarchy(this.state.data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
    const root = d3.partition()
        .size([2 * Math.PI, hierarchy.height + 1])
      (hierarchy);
    root.each(d => d.current = d);

    // Create the arc generator.
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

    // Create the SVG container.
    const svg = d3.select("#chartTag_"+this.state.uuid).append("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, width])
        .style("font", "10px sans-serif");

    // Append the arcs.
    const path = svg.append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
        .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")

        .attr("d", d => arc(d.current));

    // Make them clickable if they have children.
    path.filter(d => d.children)
        .style("cursor", "pointer")
        .on("click", clicked);

    const format = d3.format(",d");
    path.append("title")
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

    const label = svg.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .text(d => d.data.name);

    const parent = svg.append("circle")
        .datum(root)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("click", clicked);

    // Handle zoom on click.
    function clicked(event, p) {
      parent.datum(p.parent || root);

      root.each(d => d.target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth)
      });

      const t = svg.transition().duration(750);

      // Transition the data on all arcs, even the ones that aren’t visible,
      // so that if this transition is interrupted, entering arcs will start
      // the next transition from the desired position.
      path.transition(t)
          .tween("data", d => {
            const i = d3.interpolate(d.current, d.target);
            return t => d.current = i(t);
          })
        .filter(function(d) {
          return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
          .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
          .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none") 

          .attrTween("d", d => () => arc(d.current));

      label.filter(function(d) {
          return +this.getAttribute("fill-opacity") || labelVisible(d.target);
        }).transition(t)
          .attr("fill-opacity", d => +labelVisible(d.target))
          .attrTween("transform", d => () => labelTransform(d.current));
    }
    
    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2 * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    return svg.node();
  
  }

  render(){
    return (
      <>

        { !this.state.data && <div class="text-center"><div class="mt-4"><div class="spinner-border spinner-border-sm text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    {/*<p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>*/}
                  </div>
                </div>}

        { this.state.data && <div id={"chartTag_"+this.state.uuid} class=""></div> }
      </>
    );
  }
}
