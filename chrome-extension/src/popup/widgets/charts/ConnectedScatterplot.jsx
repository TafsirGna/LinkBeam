/*import './SunBurstOverviewChart.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { activateInCurrentTab, saveCanvas, dbDataSanitizer } from "../../Local_library";
import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';

const length = (path) => d3.create("svg:path").attr("d", path).node().getTotalLength();

const driving = [{"side":"left","year":1956,"miles":3683.6965,"gas":2.3829},{"side":"right","year":1957,"miles":3722.7648,"gas":2.4026},{"side":"bottom","year":1958,"miles":3776.8595,"gas":2.2539},{"side":"top","year":1959,"miles":3912.0962,"gas":2.3079},{"side":"right","year":1960,"miles":3942.1488,"gas":2.2658},{"side":"bottom","year":1961,"miles":3984.2224,"gas":2.2526},{"side":"right","year":1962,"miles":4089.4064,"gas":2.2158},{"side":"bottom","year":1963,"miles":4230.6536,"gas":2.1237},{"side":"bottom","year":1964,"miles":4383.9219,"gas":2.1039},{"side":"bottom","year":1965,"miles":4546.2059,"gas":2.1368},{"side":"top","year":1966,"miles":4681.4425,"gas":2.1421},{"side":"bottom","year":1967,"miles":4837.716,"gas":2.1408},{"side":"right","year":1968,"miles":5048.0841,"gas":2.1263},{"side":"right","year":1969,"miles":5216.3787,"gas":2.0737},{"side":"right","year":1970,"miles":5384.6732,"gas":2.0118},{"side":"bottom","year":1971,"miles":5652.1412,"gas":1.9316},{"side":"bottom","year":1972,"miles":5979.7145,"gas":1.8737},{"side":"right","year":1973,"miles":6160.0301,"gas":1.9026},{"side":"left","year":1974,"miles":5946.6566,"gas":2.3447},{"side":"bottom","year":1975,"miles":6117.9564,"gas":2.3079},{"side":"bottom","year":1976,"miles":6400.4508,"gas":2.3237},{"side":"right","year":1977,"miles":6634.861,"gas":2.3592},{"side":"bottom","year":1978,"miles":6890.308,"gas":2.2288},{"side":"left","year":1979,"miles":6755.0714,"gas":2.6829},{"side":"left","year":1980,"miles":6670.9241,"gas":3.2974},{"side":"right","year":1981,"miles":6743.0503,"gas":3.2961},{"side":"right","year":1982,"miles":6836.2134,"gas":2.9197},{"side":"right","year":1983,"miles":6938.3921,"gas":2.6566},{"side":"right","year":1984,"miles":7127.7235,"gas":2.475},{"side":"right","year":1985,"miles":7326.0706,"gas":2.3618},{"side":"left","year":1986,"miles":7554.4703,"gas":1.7605},{"side":"top","year":1987,"miles":7776.8595,"gas":1.7553},{"side":"bottom","year":1988,"miles":8089.4064,"gas":1.6842},{"side":"left","year":1989,"miles":8395.9428,"gas":1.7473},{"side":"top","year":1990,"miles":8537.1901,"gas":1.8763},{"side":"right","year":1991,"miles":8528.1743,"gas":1.7776},{"side":"right","year":1992,"miles":8675.432,"gas":1.6855},{"side":"left","year":1993,"miles":8843.7265,"gas":1.5974},{"side":"bottom","year":1994,"miles":8906.837,"gas":1.5842},{"side":"bottom","year":1995,"miles":9144.2524,"gas":1.5987},{"side":"top","year":1996,"miles":9183.3208,"gas":1.6737},{"side":"right","year":1997,"miles":9405.71,"gas":1.6461},{"side":"bottom","year":1998,"miles":9577.0098,"gas":1.3881},{"side":"right","year":1999,"miles":9688.2044,"gas":1.4987},{"side":"top","year":2000,"miles":9706.2359,"gas":1.8947},{"side":"left","year":2001,"miles":9685.1991,"gas":1.7658},{"side":"bottom","year":2002,"miles":9802.4042,"gas":1.6381},{"side":"right","year":2003,"miles":9853.4936,"gas":1.8592},{"side":"left","year":2004,"miles":9991.7355,"gas":2.1421},{"side":"left","year":2005,"miles":10054.846,"gas":2.5329},{"side":"right","year":2006,"miles":10030.8039,"gas":2.7934},{"side":"right","year":2007,"miles":10012.7724,"gas":2.9487},{"side":"left","year":2008,"miles":9871.5252,"gas":3.3066},{"side":"bottom","year":2009,"miles":9652.1412,"gas":2.3776},{"side":"left","year":2010,"miles":9592.0361,"gas":2.6066}]

export default class ConnectedScatterplot extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      uuid: uuidv4(),
      data: null,
    };

    this.setChartData = this.setChartData.bind(this);
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
      10000
    );

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.DOWNLOAD_CHART_IMAGE);

  }

  setChartData(){

  	this.setState({data: []}, () => {
  		this.drawChart();
  	});

  }

  componentDidUpdate(prevProps, prevState){

  }

  drawChart(){

    if (!this.state.data){
      return;
    }

    // if a previous svg has already been drawn, no need to has one new
    var chartContainer = document.getElementById("chartTag_"+this.state.uuid);
    if (chartContainer.firstChild){
      return;
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
		  .domain(d3.extent(driving, d => d.miles)).nice()
		  .range([marginLeft, width - marginRight]);

		const y = d3.scaleLinear()
		  .domain(d3.extent(driving, d => d.gas)).nice()
		  .range([height - marginBottom, marginTop]);

		const line = d3.line()
		  .curve(d3.curveCatmullRom)
		  .x(d => x(d.miles))
		  .y(d => y(d.gas));

		const svg = d3.select("#chartTag_"+this.state.uuid).append("svg")
		  .attr("width", width)
		  .attr("height", height)
		  .attr("viewBox", [0, 0, width, height])
		  .attr("style", "max-width: 100%; height: auto;");

		const l = length(line(driving));

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
		  .datum(driving)
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
		.data(driving)
		.join("circle")
		  .attr("cx", d => x(d.miles))
		  .attr("cy", d => y(d.gas))
		  .attr("r", 3);

		const label = svg.append("g")
		  .attr("font-family", "sans-serif")
		  .attr("font-size", 10)
		.selectAll()
		.data(driving)
		.join("text")
		  .attr("transform", d => `translate(${x(d.miles)},${y(d.gas)})`)
		  .attr("fill-opacity", 0)
		  .text(d => d.year)
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
		  .delay((d, i) => length(line(driving.slice(0, i + 1))) / l * (5000 - 125))
		  .attr("fill-opacity", 1);

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
