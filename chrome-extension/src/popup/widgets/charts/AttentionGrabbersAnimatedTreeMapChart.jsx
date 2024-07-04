/*import './AttentionGrabbersAnimatedTreeMapChart.css'*/
import React from 'react';
// import { dbDataSanitizer } from "../../Local_library";
import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid';
// import {Swatches} from "@d3/color-legend";
import { db } from "../../../db";
import { DateTime as LuxonDateTime } from "luxon";
import { 
  dateBetweenRange,
  periodRange,
  dbDataSanitizer,
  appParams,
} from "../../Local_library";
import eventBus from "../../EventBus";

var count = 0;

export function DOM_uid(name) {
  return new Id("O-" + (name == null ? "" : name + "-") + ++count);
}

function Id(id) {
  this.id = id;
  this.href = new URL(`#${id}`, location) + "";
}

Id.prototype.toString = function() {
  return "url(" + this.href + ")";
};

export default class AttentionGrabbersAnimatedTreeMapChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      uuid: uuidv4(),
      chartData: null,
    };

    this.setChartData = this.setChartData.bind(this);
    this.drawChart = this.drawChart.bind(this);
    this.Scrubber = this.Scrubber.bind(this);
  }

  componentDidMount() {

    this.setChartData();

  }

  componentWillUnmount(){
  	eventBus.remove("ANIMATED_TREE_MAP_SCRUBBER_INPUT_CHANGE");
  }

  async setChartData(){

  	if (!this.props.profiles){
  		return;
  	}

    console.log("lllllllllllll 1 : ", this.props.profiles);

    var chartData = {
    			keys: [],
    			group: null,
    		},
    		profileData = this.props.profiles.filter(object => object.profile).map(object => ({
    			name: object.profile.name,
    			values: [],
    			url: object.profile.url,
    		}));

    console.log("lllllllllllll 2 : ", profileData);

    var feedPosts = [];

  	if (this.props.objects[0].date.split("T")[0] == this.props.objects[this.props.objects.length - 1].date.split("T")[0]){

  		for (const date of periodRange(LuxonDateTime.fromISO(this.props.objects[0].date).set({hours: 1, minutes: 0, seconds: 0}).toJSDate(), LuxonDateTime.fromISO(this.props.objects[0].date).set({hours: 23, minutes: 0, seconds: 0}).toJSDate(), 1, LuxonDateTime, "hours")){

  			chartData.keys.push(date.toFormat("hh a"));

  			var views = this.props.objects.filter(view => date.minus({hours: 1}) <= LuxonDateTime.fromISO(view.date)
  																															&& LuxonDateTime.fromISO(view.date) <= date);
  			await handleTimeSlotViews(views);

  		}

  	}
  	else{

  		for (const date of periodRange(LuxonDateTime.fromISO(this.props.objects[0].date).set({hours: 0, minutes: 0, seconds: 0}).plus({days: 1}).toJSDate(), LuxonDateTime.fromISO(this.props.objects[this.props.objects.length - 1].date).set({hours: 0, minutes: 0, seconds: 0}).plus({days: 1}).toJSDate(), 1, LuxonDateTime, "days")){

  			chartData.keys.push(date.toFormat("MMMM dd"));

  			var views = this.props.objects.filter(view => date.minus({days: 1}) <= LuxonDateTime.fromISO(view.date)
  																															&& LuxonDateTime.fromISO(view.date) <= date);
  			await handleTimeSlotViews(views);

  		}

  	}


  	chartData.group = new Map([["group1", profileData]]);

    this.setState({
    	chartData: chartData,
    }, () => {
      var chart = this.drawChart(this.Scrubber(d3.range(chartData.keys.length), {
																		  delay: 2500,
																		  loop: false,
																		  autoplay: false,
																		  initial: d3.range(chartData.keys.length).length - 1,
																		  format: i => chartData.keys[i]
																		}).value);
      eventBus.on("ANIMATED_TREE_MAP_SCRUBBER_INPUT_CHANGE", (data) => {
      	chart.update(data.value, 2500);
      });

    });

    async function handleTimeSlotViews(views){

  		for (var profile of profileData){ profile.values.push(!profile.values.length ? /*(Math.floor(Math.random() * 1000) + 100)*/ 0 : profile.values[profile.values.length - 1]);	}

    	for (var feedPostView of views){
				const feedPostIndex = feedPosts.findIndex(post => post.id == feedPostView.feedPostId);
				var feedPost = null;
				if (feedPostIndex == -1){
					feedPost = await db.feedPosts.where({id: feedPostView.feedPostId}).first();
					feedPosts.push(feedPost);
				}
				else{
					feedPost = feedPosts[feedPostIndex];
				}

				if (feedPostView.initiator && feedPostView.initiator.name){

					const profileIndex = profileData.findIndex(object => object.url.split("?")[0].slice(object.url.indexOf(appParams.LINKEDIN_ROOT_URL)) == feedPostView.initiator.url.split("?")[0].slice(feedPostView.initiator.url.indexOf(appParams.LINKEDIN_ROOT_URL)));	
					
					// i increment the last item's value
					// profileData[profileIndex].values[profileData[profileIndex].values.length - 1]++; // or 
					profileData[profileIndex].values[profileData[profileIndex].values.length - 1] += /*(Math.floor(Math.random() * 1000) + 100);*/ feedPostView.timeCount;
					

				}

				if (feedPost.author && feedPost.author.name){

					const profileIndex = profileData.findIndex(object => object.url.split("?")[0].slice(object.url.indexOf(appParams.LINKEDIN_ROOT_URL)) == feedPost.author.url.split("?")[0].slice(feedPost.author.url.indexOf(appParams.LINKEDIN_ROOT_URL)));	
					
					// i increment the last item's value
					// profileData[profileIndex].values[profileData[profileIndex].values.length - 1]++; // or 
					profileData[profileIndex].values[profileData[profileIndex].values.length - 1] += /*(Math.floor(Math.random() * 1000) + 100);*/ feedPostView.timeCount;
				

				}

			}

    }

  }

  componentDidUpdate(prevProps, prevState){

  	if (prevProps.profiles != this.props.profiles){
  		this.setChartData();
  	}

  }

  Scrubber(values, {
		  format = value => value,
		  initial = 0,
		  direction = 1,
		  delay = null,
		  autoplay = true,
		  loop = true,
		  loopDelay = null,
		  alternate = false
		} = {}) {
	  values = Array.from(values);
	  document.getElementById(`chartTag_${this.state.uuid}`).previousElementSibling.innerHTML = `<form style="font: 12px var(--sans-serif); font-variant-numeric: tabular-nums; display: flex; height: 33px; align-items: center;">
		  <button name=b type=button class="badge text-bg-secondary border"></button>
		  <label style="display: flex; align-items: center;">
		    <input name=i type=range min=0 max=${values.length - 1} value=${initial} step=1 style="width: 180px;">
		    <output name=o style="margin-left: 0.4em;"></output>
		  </label>
		</form>`;

		const form = document.getElementById(`chartTag_${this.state.uuid}`).previousElementSibling.querySelector("form");

	  let frame = null;
	  let timer = null;
	  let interval = null;
	  function start() {
	    form.b.textContent = "Pause";
	    if (delay === null) frame = requestAnimationFrame(tick);
	    else interval = setInterval(tick, delay);
	  }
	  function stop() {
	    form.b.textContent = "Play";
	    if (frame !== null) cancelAnimationFrame(frame), frame = null;
	    if (timer !== null) clearTimeout(timer), timer = null;
	    if (interval !== null) clearInterval(interval), interval = null;
	  }
	  function running() {
	    return frame !== null || timer !== null || interval !== null;
	  }
	  function tick() {
	    if (form.i.valueAsNumber === (direction > 0 ? values.length - 1 : direction < 0 ? 0 : NaN)) {
	      if (!loop) return stop();
	      if (alternate) direction = -direction;
	      if (loopDelay !== null) {
	        if (frame !== null) cancelAnimationFrame(frame), frame = null;
	        if (interval !== null) clearInterval(interval), interval = null;
	        timer = setTimeout(() => (step(), start()), loopDelay);
	        return;
	      }
	    }
	    if (delay === null) frame = requestAnimationFrame(tick);
	    step();
	  }
	  function step() {
	    form.i.valueAsNumber = (form.i.valueAsNumber + direction + values.length) % values.length;
	    form.i.dispatchEvent(new CustomEvent("input", {bubbles: true}));
	  }
	  form.i.oninput = event => {
	    if (event && event.isTrusted && running()) stop();
	    form.value = values[form.i.valueAsNumber];
	    form.o.value = format(form.value, form.i.valueAsNumber, values);

	    eventBus.dispatch("ANIMATED_TREE_MAP_SCRUBBER_INPUT_CHANGE", {value: form.value});

	  };
	  form.b.onclick = () => {
	    if (running()) return stop();
	    direction = alternate && form.i.valueAsNumber === values.length - 1 ? -1 : 1;
	    form.i.valueAsNumber = (form.i.valueAsNumber + direction) % values.length;
	    form.i.dispatchEvent(new CustomEvent("input", {bubbles: true}));
	    start();
	  };
	  form.i.oninput();
	  if (autoplay) start();
	  else stop();
	  // Inputs.disposal(form).then(stop);
	  return form;
	}

  drawChart(initIdx){

    if (!this.state.chartData){
      return;
    }

    const width = 928;
  	const height = width;

    // This is normally zero, but could be non-zero if this cell is
	  // re-evaluated after the animation plays.
	  const initialIndex = initIdx;

	  // To allow the transition to be interrupted and resumed, we parse
	  // the displayed text (the state population) to get the current
	  // value at the start of each transition; parseNumber and 
	  // formatNumber must be symmetric.
	  const parseNumber = string => +string.replace(/,/g, "");
	  const formatNumber = d3.format(",d");

	  // Get the maximum total population across the dataset. (We know
	  // for this dataset that it’s always the last value, but that isn’t
	  // true in general.) This allows us to scale the rectangles for
	  // each state to be proportional to the max total.
	  const max = d3.max(this.state.chartData.keys, (d, i) => d3.hierarchy(this.state.chartData.group).sum(d => d.values[i]).value);

	  // The category10 color scheme per state, but faded so that the
	  // text labels are more easily read.
	  const color = d3.scaleOrdinal()
	      .domain(this.state.chartData.group.keys())
	      .range(d3.schemeCategory10.map(d => d3.interpolateRgb(d, "white")(0.5)));

	  // Construct the treemap layout.
	  const treemap = d3.treemap()
	      .size([width, height])
	      .tile(d3.treemapResquarify) // to preserve orientation when animating
	      .padding(d => d.height === 1 ? 1 : 0) // only pad parents of leaves
	      .round(true);

	  // Compute the structure using the average value (since this
	  // orientation will be preserved using resquarify across the
	  // entire animation).
	  const root = treemap(d3.hierarchy(this.state.chartData.group)
	      .sum(d => Array.isArray(d.values) ? d3.sum(d.values) : 0)
	      .sort((a, b) => b.value - a.value));

	  const svg = d3.select(`#chartTag_${this.state.uuid}`).append("svg")
	      .attr("width", width)
	      .attr("height", height + 20)
	      .attr("viewBox", [0, -20, width, height + 20])
	      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif; overflow: visible;");

	  // Draw a box representing the total population for each time. Only
	  // show the boxes after the current time (to avoid distracting gray
	  // lines in between the padded treemap cells).
	  const box = svg.append("g")
	    .selectAll("g")
	    .data(this.state.chartData.keys.map((key, i) => {
	      const value = root.sum(d => d.values[i]).value;
	      return {key, value, i, k: Math.sqrt(value / max)};
	    }).reverse())
	    .join("g")
	      .attr("transform", ({k}) => `translate(${(1 - k) / 2 * width},${(1 - k) / 2 * height})`)
	      .attr("opacity", ({i}) => i >= initialIndex ? 1 : 0)
	      .call(g => g.append("text")
	          .attr("y", -6)
	          .attr("fill", "#777")
	        .selectAll("tspan")
	        .data(({key, value}) => [key, ` ${formatNumber(value)}`])
	        .join("tspan")
	          .attr("font-weight", (d, i) => i === 0 ? "bold" : null)
	          .text(d => d))
	      .call(g => g.append("rect")
	          .attr("fill", "none")
	          .attr("stroke", "#ccc")
	          .attr("width", ({k}) => k * width)
	          .attr("height", ({k}) => k * height));

	  // Render the leaf nodes of the treemap.
	  const leaf = svg.append("g")
	    .selectAll("g")
	    .data(layout(initialIndex))
	    .join("g")
	      .attr("transform", d => `translate(${d.x0},${d.y0})`);

	  leaf.append("rect")
	      .attr("id", d => (d.leafUid = DOM_uid("leaf")).id)
	      .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data[0]); })
	      .attr("width", d => d.x1 - d.x0)
	      .attr("height", d => d.y1 - d.y0);

	  // Clip the text to the containing node.
	  leaf.append("clipPath")
	      .attr("id", d => (d.clipUid = DOM_uid("clip")).id)
	    .append("use")
	      .attr("xlink:href", d => d.leafUid.href);

	  // Generate two tspans for two lines of text (name and value).
	  leaf.append("text")
	      .attr("clip-path", d => d.clipUid)
	    .selectAll("tspan")
	    .data(d => [d.data.name, formatNumber(d.value)])
	    .join("tspan")
	      .attr("x", 3)
	      .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
	      .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
	      .text(d => d);

	  leaf.append("title")
	      .text(d => d.data.name);

	  // Scale the treemap layout to fit within a centered box whose area
	  // is proportional to the total current value. This makes the areas
	  // of each state proportional for the entire animation.
	  function layout(index) {
	    const k = Math.sqrt(root.sum(d => d.values[index]).value / max);
	    const tx = (1 - k) / 2 * width;
	    const ty = (1 - k) / 2 * height;
	    return treemap.size([width * k, height * k])(root)
	      .each(d => (d.x0 += tx, d.x1 += tx, d.y0 += ty, d.y1 += ty))
	      .leaves();
	  }

	  // Expose an update method on the chart that allows the caller to
	  // initiate a transition. The given index represents the frame
	  // number (0 for the first frame, 1 for the second, etc.).

	  return Object.assign(svg.node(), {
	    update(index, duration) {
	      box.transition()
	          .duration(duration)
	          .attr("opacity", ({i}) => i >= index ? 1 : 0);

	      leaf.data(layout(index)).transition()
	          .duration(duration)
	          .ease(d3.easeLinear)
	          .attr("transform", d => `translate(${d.x0},${d.y0})`)
	          .call(leaf => leaf.select("rect")
	              .attr("width", d => d.x1 - d.x0)
	              .attr("height", d => d.y1 - d.y0))
	          .call(leaf => leaf.select("text tspan:last-child")
	              .tween("text", function(d) {
	                const i = d3.interpolate(parseNumber(this.textContent), d.value);
	                return function(t) { this.textContent = formatNumber(i(t)); };
	              }));
	    }
	  });
  
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

        <div>
        	<div>
					  <div class="alert alert-secondary d-flex align-items-center py-1 fst-italic small shadow-sm" role="alert">
						  <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:" width="16">
						    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path>
						  </svg>
						  <div>
						    The numbers displayed below represent the attention got by all the posts that these profiles have either edited or interacted with (in seconds)
							</div>
						</div>
					</div>
					<div></div>
					<div id={`chartTag_${this.state.uuid}`} class="shadow-sm rounded border"></div>
				</div> 

      </>
    );
  }
}
