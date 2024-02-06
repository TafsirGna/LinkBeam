/*import './SunBurstOverviewChart.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
	saveCanvas, 
	dbDataSanitizer,
	computePeriodTimeSpan,
	shuffle,
} from "../../Local_library";
import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';
import moment from 'moment';
import { AlertCircleIcon } from "../SVGs";

const length = (path) => d3.create("svg:path").attr("d", path).node().getTotalLength();

export default class ConnectedScatterplot extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      uuid: uuidv4(),
      chartData: null,
    };

    this.setChartData = this.setChartData.bind(this);
    // this.drawChart = this.drawChart.bind(this);
  }

  componentDidMount() {

  	eventBus.on(eventBus.DOWNLOAD_CHART_IMAGE, (data) =>
      {
        if (data.carrouselItemIndex != this.props.carrouselIndex){
          return;
        }

        saveCanvas(this.state.uuid, "Connected-scatterplot.png", saveAs);
      }
    );

    this.setChartData();

    setInterval(
      () => {
        this.drawChart();
      }, 
      12000
    );

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.DOWNLOAD_CHART_IMAGE);

  }

  setChartData(){

  	if (!this.props.objects){
  		return;
  	}

  	var sides = ["bottom", "right", "left", "top"];
  	var chartData = [];

  	for (var search of this.props.objects){

  		var index = chartData.map(e => e.url).indexOf(search.url);
  		if (index == -1){
  			chartData.push({
  				side: shuffle(sides)[0],
  				url: search.url,
  				label: dbDataSanitizer.preSanitize(search.profile.fullName).split(" ")[0],
  				experience: computePeriodTimeSpan(search.profile.experience, "experience", {moment: moment}),
  				time: search.timeCount,
  			});
  		}
  		else{
  			chartData[index].time += search.timeCount;
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

    // if a previous svg has already been drawn, no need to has one new
    var chartContainer = document.getElementById("chartTag_"+this.state.uuid);

    if (!chartContainer){
    	return;
    }

    if (chartContainer.firstChild){
    	chartContainer.removeChild(chartContainer.firstChild);
    }


    // Declare the chart dimensions and margins.
		const width = 928;
		const height = 520;
		const marginTop = 20;
		const marginRight = 30;
		const marginBottom = 30;
		const marginLeft = 40;

		// Declare the positional encodings.
		const x = d3.scaleLinear()
		  .domain(d3.extent(this.state.chartData, d => d.experience)).nice()
		  .range([marginLeft, width - marginRight]);

		const y = d3.scaleLinear()
		  .domain(d3.extent(this.state.chartData, d => d.time)).nice()
		  .range([height - marginBottom, marginTop]);

		const line = d3.line()
		  .curve(d3.curveCatmullRom)
		  .x(d => x(d.experience))
		  .y(d => y(d.time));

		const svg = d3.select("#chartTag_"+this.state.uuid).append("svg")
		  .attr("width", width)
		  .attr("height", height)
		  .attr("viewBox", [0, 0, width, height])
		  .attr("style", "max-width: 100%; height: auto;");

		const l = length(line(this.state.chartData));

		svg.append("g")
		  .attr("transform", `translate(0,${height - marginBottom})`)
		  .call(d3.axisBottom(x).ticks(width / 80))
		  .call(g => g.select(".domain").remove())
		  .call(g => g.selectAll(".tick line").clone()
		      .attr("y2", -height)
		      .attr("stroke-opacity", 0.1))
		  .call(g => g.append("text")
		      .attr("x", width - 4)
		      .attr("y", -4)
		      .attr("font-weight", "bold")
		      .attr("text-anchor", "end")
		      .attr("fill", "currentColor")
		      .text("Miles per person per year"));

		svg.append("g")
		.attr("transform", `translate(${marginLeft},0)`)
		.call(d3.axisLeft(y).ticks(null, "$.2f"))
		.call(g => g.select(".domain").remove())
		.call(g => g.selectAll(".tick line").clone()
		    .attr("x2", width)
		    .attr("stroke-opacity", 0.1))
		.call(g => g.select(".tick:last-of-type text").clone()
		    .attr("x", 4)
		    .attr("text-anchor", "start")
		    .attr("font-weight", "bold")
		    .text("Cost per gallon"));

		svg.append("path")
		  .datum(this.state.chartData)
		  .attr("fill", "none")
		  .attr("stroke", "black")
		  .attr("stroke-width", 2.5)
		  .attr("stroke-linejoin", "round")
		  .attr("stroke-linecap", "round")
		  .attr("stroke-dasharray", `0,${l}`)
		  .attr("d", line)
		.transition()
		  .duration(5000)
		  .ease(d3.easeLinear)
		  .attr("stroke-dasharray", `${l},${l}`);

		svg.append("g")
		  .attr("fill", "white")
		  .attr("stroke", "black")
		  .attr("stroke-width", 2)
		.selectAll("circle")
		.data(this.state.chartData)
		.join("circle")
		  .attr("cx", d => x(d.experience))
		  .attr("cy", d => y(d.time))
		  .attr("r", 3);

		const label = svg.append("g")
		  .attr("font-family", "sans-serif")
		  .attr("font-size", 10)
		.selectAll()
		.data(this.state.chartData)
		.join("text")
		  .attr("transform", d => `translate(${x(d.experience)},${y(d.time)})`)
		  .attr("fill-opacity", 0)
		  .text(d => d.label)
		    .attr("stroke", "white")
		    .attr("paint-order", "stroke")
		    .attr("fill", "currentColor")
		    .each(function(d) {
		      const t = d3.select(this);
		      switch (d.side) {
		        case "top": t.attr("text-anchor", "middle").attr("dy", "-0.7em"); break;
		        case "right": t.attr("dx", "0.5em").attr("dy", "0.32em").attr("text-anchor", "start"); break;
		        case "bottom": t.attr("text-anchor", "middle").attr("dy", "1.4em"); break;
		        case "left": t.attr("dx", "-0.5em").attr("dy", "0.32em").attr("text-anchor", "end"); break;
		      }
		    });

		label.transition()
		  .delay((d, i) => length(line(this.state.chartData.slice(0, i + 1))) / l * (5000 - 125))
		  .attr("fill-opacity", 1);

		return svg.node();
  
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

        { this.state.chartData && this.state.chartData.length == 0 && <div class="text-center m-5 mt-4">
                      <AlertCircleIcon size="100" className="text-muted"/>
                      <p><span class="badge text-bg-primary fst-italic shadow">No data to show yet</span></p>
                    </div>}

        { this.state.chartData && this.state.chartData.length != 0 && 
        		<div>
        			<div id={"chartTag_"+this.state.uuid} class=""></div>
        			{ this.props.displayLegend && this.props.displayLegend == true && <p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">Chart of profiles by their experience and time spent</p> }
        		</div> }
      </>
    );
  }
}
