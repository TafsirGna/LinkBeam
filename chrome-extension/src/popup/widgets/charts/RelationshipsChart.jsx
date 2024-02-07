/*import './RelationshipsChart.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
	activateInCurrentTab, 
	saveCanvas, 
	dbDataSanitizer,
	performLanguageComparison, 
	performCertComparison,
  performEdInstitutionComparison,
  performCompanyComparison
} from "../../Local_library";
import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';
import { AlertCircleIcon } from "../SVGs";
import Offcanvas from 'react-bootstrap/Offcanvas';
import default_user_icon from '../../../assets/user_icons/default.png';

export default class RelationshipsChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      uuid: uuidv4(),
      data: null,
      linkedObjects: null,
    };

    this.setSuggestionsData = this.setSuggestionsData.bind(this);
    this.drawArcDiagram = this.drawArcDiagram.bind(this);
    this.drawDirectedGraph = this.drawDirectedGraph.bind(this);
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

    if (prevProps.displayCriteria != this.props.displayCriteria){
      this.setState({linkedObjects: null}, () => {
        this.drawChart();
      });
    }

    if (prevProps.profiles != this.props.profiles){
      this.drawChart();
    }

  }

  setSuggestionsData(){

  	var chartData = {
          nodes: [],
          links: [],
        }, 
        linkedObjects = [];

    for (var profile of this.props.objects){

      var source = dbDataSanitizer.preSanitize(profile.fullName);
      chartData.nodes.push({
        id: source,
        group: 1,
      });

      var suggestions = profile.profileSuggestions;
      linkedObjects = suggestions;

      if (suggestions){
        for (var suggestion of suggestions){

          if (suggestion.name.indexOf(":") != -1){
            continue;
          }

          var target = dbDataSanitizer.preSanitize(suggestion.name);

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

    return {chartData: chartData, objects: linkedObjects};

  }

  setLanguagesData(){

  	if (!this.props.profiles){
    	return {chartData: null, linkedObjects: null};
    }

  	var chartData = {
          nodes: [],
          links: [],
        },
        linkedObjects = [];

    for (var profile of this.props.objects){

  		var source = dbDataSanitizer.preSanitize(profile.fullName);

      if (chartData.nodes.map(e => e.url).indexOf(profile.url) == -1){

    		chartData.nodes.push({
    			id: source,
    			group: "prime",
          url: profile.url,
    		});

      }

  		if (!profile.languages){
  			continue;
  		}

  		for (var language of profile.languages){

  			var languageName = dbDataSanitizer.preSanitize(language.name);
  			var langProfiles = performLanguageComparison(profile, languageName, this.props.profiles);

  			for (var langProfile of langProfiles){

          var target = dbDataSanitizer.preSanitize(langProfile.fullName);

          if (chartData.nodes.map(e => e.url).indexOf(langProfile.url) == -1){

    				chartData.nodes.push({
    					id: target,
    					group: languageName,
              url: langProfile.url,
    				});

          }

  				chartData.links.push({
  					source: source,
  					target: target,
  					value: Math.floor(Math.random() * 5) + 1,
  				});

          // filling the linkedObjects variables
          var index = linkedObjects.map(e => e.profile.url).indexOf(langProfile.url);
          if (index == -1){
            linkedObjects.push({
              profile: langProfile,
              links: [languageName],
            });
          }
          else{
            linkedObjects[index].links.push(languageName);
          }

  			}

  		}
    }

    return {chartData: chartData, objects: linkedObjects};

  }

  setCertificationsData(){

  	if (!this.props.profiles){
    	return {chartData: null, linkedObjects: null};
    }

  	var chartData = {
          nodes: [],
          links: [],
        },
        linkedObjects = [];

    for (var profile of this.props.objects){

  		var source = dbDataSanitizer.preSanitize(profile.fullName);

      if (chartData.nodes.map(e => e.url).indexOf(profile.url) == -1){

    		chartData.nodes.push({
    			id: source,
    			group: "prime",
          url: profile.url,
    		});

      }

  		if (!profile.certifications){
  			continue;
  		}

  		for (var certification of profile.certifications){

        if (!certification.title){
          continue;
        }

  			var certName = dbDataSanitizer.preSanitize(certification.title);
  			var certProfiles = performCertComparison(profile, certName, this.props.profiles);

  			for (var certProfile of certProfiles){

          var target = dbDataSanitizer.preSanitize(certProfile.fullName);

          if (chartData.nodes.map(e => e.url).indexOf(certProfile.url) == -1){

    				chartData.nodes.push({
    					id: target,
    					group: certName,
              url: certProfile.url,
    				});

          }

  				chartData.links.push({
  					source: source,
  					target: target,
  					value: Math.floor(Math.random() * 5) + 1,
  				});

          // filling the linkedObjects variables
          var index = linkedObjects.map(e => e.profile.url).indexOf(certProfile.url);
          if (index == -1){
            linkedObjects.push({
              profile: certProfile,
              links: [certName],
            });
          }
          else{
            linkedObjects[index].links.push(certName);
          }

  			}

  		}

    }

    return {chartData: chartData, objects: linkedObjects};

  }

  setEducationData(){

    if (!this.props.profiles){
      return {chartData: null, linkedObjects: null};
    }

    var chartData = {
          nodes: [],
          links: [],
        },
        linkedObjects = [];

    for (var profile of this.props.objects){

      var source = dbDataSanitizer.preSanitize(profile.fullName);

      if (chartData.nodes.map(e => e.url).indexOf(profile.url) == -1){

        chartData.nodes.push({
          id: source,
          group: "prime",
          url: profile.url,
        });

      }

      if (!profile.education){
        continue;
      }

      for (var education of profile.education){

        var institutionName = dbDataSanitizer.preSanitize(education.institutionName);
        var edProfiles = performEdInstitutionComparison(profile, institutionName, this.props.profiles);

        for (var edProfile of edProfiles){

          var target = dbDataSanitizer.preSanitize(edProfile.fullName);

          if (chartData.nodes.map(e => e.url).indexOf(edProfile.url) == -1){

            chartData.nodes.push({
              id: target,
              group: institutionName,
              url: edProfile.url,
            });

          }

          chartData.links.push({
            source: source,
            target: target,
            value: Math.floor(Math.random() * 5) + 1,
          });

          // filling the linkedObjects variables
          var index = linkedObjects.map(e => e.profile.url).indexOf(edProfile.url);
          if (index == -1){
            linkedObjects.push({
              profile: edProfile,
              links: [institutionName],
            });
          }
          else{
            linkedObjects[index].links.push(institutionName);
          }

        }

      }
      
    }

    return {chartData: chartData, objects: linkedObjects};

  }

  setExperienceData(){

    if (!this.props.profiles){
      return {chartData: null, linkedObjects: null};
    }

    var chartData = {
          nodes: [],
          links: [],
        },
        linkedObjects = [];

    for (var profile of this.props.objects){

      var source = dbDataSanitizer.preSanitize(profile.fullName);

      if (chartData.nodes.map(e => e.url).indexOf(profile.url) == -1){

        chartData.nodes.push({
          id: source,
          group: "prime",
          url: profile.url,
        });

      }

      if (!profile.experience){
        continue;
      }

      for (var experience of profile.experience){

        var company = dbDataSanitizer.preSanitize(experience.company);
        var expProfiles = performCompanyComparison(profile, company, this.props.profiles);

        for (var expProfile of expProfiles){

          var target = dbDataSanitizer.preSanitize(expProfile.fullName);

          if (chartData.nodes.map(e => e.url).indexOf(expProfile.url) == -1){

            chartData.nodes.push({
              id: target,
              group: company,
              url: expProfile.url,
            });

          }

          chartData.links.push({
            source: source,
            target: target,
            value: Math.floor(Math.random() * 5) + 1,
          });

          // filling the linkedObjects variables
          var index = linkedObjects.map(e => e.profile.url).indexOf(expProfile.url);
          if (index == -1){
            linkedObjects.push({
              profile: expProfile,
              links: [company],
            });
          }
          else{
            linkedObjects[index].links.push(company);
          }

        }

      }
      
    }

    return {chartData: chartData, objects: linkedObjects};

  }

  setData(callback){

  	var data = null;

  	switch(this.props.displayCriteria){
  		case "suggestions":{
  			data = this.setSuggestionsData();
  			break;
  		}
  		case "languages":{
  			data = this.setLanguagesData();
  			break;
  		}
  		case "experience":{
  			data = this.setExperienceData();
  			break;
  		}
  		case "education":{
  			data = this.setEducationData();
  			break;
  		}
  		case "certifications":{
  			data = this.setCertificationsData();
  			break;
  		}
  	}

  	if (!data.chartData){
  		return;
  	}


    if (this.props.objects.length == 1){
       
      const degree = d3.rollup(
        data.chartData.links.flatMap(({ source, target, value }) => [
          { node: source, value },
          { node: target, value }
        ]),
        (v) => d3.sum(v, ({ value }) => value),
        ({ node }) => node
      );
      data.chartData["orders"] = new Map([
        ["by name", d3.sort(data.chartData.nodes.map((d) => d.id))],
        ["by group", d3.sort(data.chartData.nodes, ({group}) => group, ({id}) => id).map(({id}) => id)],
        //    ["input", nodes.map(({id}) => id)],
        ["by degree", d3.sort(data.chartData.nodes, ({id}) => degree.get(id), ({id}) => id).map(({id}) => id).reverse()]
      ]);
      
    }

    this.setState({data: data.chartData, linkedObjects: data.objects}, () => { callback(); });

  }

  drawDirectedGraph = () => {

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

  drawArcDiagram = () => {

    var increment = 0, 
        orderCriteria = ["by name", "by group", "by degree"];

    setInterval(
      () => {
        increment += 1;
        update(this.state.data.orders.get(orderCriteria[increment % orderCriteria.length]));
      }, 
      7000
    );

    const width = 640;
    const step = 14;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 20;
    const marginLeft = 400;
    const height = (this.state.data.nodes.length - 1) * step + marginTop + marginBottom;
    const y = d3.scalePoint(this.state.data.orders.get(orderCriteria[0]), [marginTop, height - marginBottom]);

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
        .attr("width", /*window.innerWidth*/width)
        .attr("height", /*window.innerHeight*/height)
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

  drawChart(){

    if (!this.props.objects || this.props.objects.length == 0){
      return;
    }

    this.setData(() => {

      // if a previous svg has laready been draw, no need to has one new
      var chartContainer = document.getElementById("chartTag_"+this.state.uuid);
      if (chartContainer.firstChild){
        chartContainer.removeChild(chartContainer.firstChild);
      }

      if (this.props.objects.length == 1){
    	 this.drawArcDiagram();
      }
      else{
        this.drawDirectedGraph();
      }

    });
  
  }

  render(){
    return (
      <>

        { !this.props.objects && <div class="text-center"><div class="mt-4"><div class="spinner-border spinner-border-sm text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    {/*<p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>*/}
                  </div>
                </div> }

        { this.props.objects && this.props.objects.length == 0 && <div class="text-center m-5 mt-4">
                      <AlertCircleIcon size="100" className=""/>
                      <p><span class="badge text-bg-primary fst-italic shadow">No data to show.</span></p>
                    </div> }

        { this.props.objects && 
                  <div>

                    <div id={"chartTag_"+this.state.uuid} class=""></div> 

                    { this.props.displayLegend && this.props.displayLegend == true && <p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">Chart of profiles with their relationships</p> }

                  </div> }


        <Offcanvas show={this.props.offCanvasShow} onHide={this.props.handleOffCanvasClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              Linked Profiles: 
              { this.props.displayCriteria == "suggestions" && <span> Recommandations</span> }
              { this.props.displayCriteria == "experience" && <span> Experience</span> }
              { this.props.displayCriteria == "certifications" && <span> Certifications</span> }
              { this.props.displayCriteria == "languages" && <span> Languages</span> }
              { this.props.displayCriteria == "education" && <span> Education</span> }
              </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>

            { !this.state.linkedObjects && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div> }

            { this.state.linkedObjects && this.state.linkedObjects.length == 0 && <div class="text-center m-5 mt-4">
                  <AlertCircleIcon size="100" className="mb-3 text-muted" />
                  <p><span class="badge text-bg-primary fst-italic shadow">No linked objects found </span></p>
                </div>}

            { this.state.linkedObjects && this.state.linkedObjects.length != 0 && <div>
                                          {/*Suggestions*/}
                                          { this.props.displayCriteria == "suggestions" && this.state.linkedObjects.map((object, index) => (object.name.indexOf(":") == -1 && <div class={"list-group list-group-radio d-grid gap-2 border-0 small " + (index == 0 ? "" : "mt-3")}>
                                                      <div class="position-relative shadow rounded">
                                                        <label class="list-group-item py-3 pe-5" for="listGroupRadioGrid1">
                                                          {/*<p class="mt-0 mb-2">
                                                                                                                      <span class="border shadow-sm rounded text-primary badge border-warning-subtle">Linkedin suggestions</span>
                                                                                                                    </p>*/}
                                                          <span class="shadow-sm badge align-items-center p-1 pe-3 text-secondary-emphasis bg-secondary-subtle border border-secondary-subtle rounded-pill">
                                                            <img class="rounded-circle me-1" width="24" height="24" src={object.picture ? object.picture.backgroundImage.slice(object.picture.backgroundImage.indexOf("http"), (object.picture.backgroundImage.length - 2)) : default_user_icon} alt=""/>
                                                            {dbDataSanitizer.preSanitize(object.name)}
                                                          </span>
                                                          {/*<strong class="fw-semibold">{dbDataSanitizer.suggestionName(object.name)}</strong>*/}
                                                          <span class="d-block small opacity-75 mt-2">With support text underneath to add more detail</span>
                                                        </label>
                                                      </div>
                                                    </div>))}

                                          {/*Experience*/}
                                          { (this.props.displayCriteria == "experience" 
                                              || this.props.displayCriteria == "education"
                                              || this.props.displayCriteria == "languages"
                                              || this.props.displayCriteria == "certifications") && this.state.linkedObjects.map((object, index) => (Object.hasOwn(object, "profile") && <div class={"list-group list-group-radio d-grid gap-2 border-0 small " + (index == 0 ? "" : "mt-3")}>
                                                      <div class="position-relative shadow rounded">
                                                        <label class="list-group-item py-3 pe-5" for="listGroupRadioGrid1">
                                                          <span class="shadow-sm badge align-items-center p-1 pe-3 text-secondary-emphasis bg-secondary-subtle border border-secondary-subtle rounded-pill">
                                                            <img class="rounded-circle me-1" width="24" height="24" src={object.profile.avatar ? object.profile.avatar : default_user_icon} alt=""/>
                                                            {dbDataSanitizer.preSanitize(object.profile.fullName)}
                                                          </span>
                                                          <strong class="d-block small opacity-75 mt-2">{dbDataSanitizer.preSanitize(object.profile.title)}</strong>
                                                          <p class="mt-2 mb-0">
                                                            { object.links.map((link) => (<span class="border shadow-sm rounded text-primary badge border-warning-subtle">{link}</span>)) }                                                            
                                                          </p>
                                                        </label>
                                                      </div>
                                                    </div>))}
                                          </div>}
            
          </Offcanvas.Body>
        </Offcanvas>

      </>
    );
  }
}
