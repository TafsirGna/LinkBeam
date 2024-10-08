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

/*import './HashtagTangledTreeChart.css'*/
import React from 'react'
import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid';
import lodash from 'lodash';
import { 
  getHashtagText,
  isReferenceHashtag,
} from "../../Local_library";


const constructTangleLayout = (levels, options={}) => {
  // precompute level depth
  levels.forEach((l, i) => l.forEach(n => (n.level = i)));

  var nodes = levels.reduce((a, x) => a.concat(x), []);
  var nodes_index = {};
  nodes.forEach(d => (nodes_index[d.id] = d));

  // objectification
  nodes.forEach(d => {
    d.parents = (d.parents === undefined ? [] : d.parents).map(
      p => nodes_index[p]
    );
  });

  // precompute bundles
  levels.forEach((l, i) => {
    var index = {};
    l.forEach(n => {
      if (n.parents.length == 0) {
        return;
      }

      var id = n.parents
        .map(d => d.id)
        .sort()
        .join('-X-');
      if (id in index) {
        index[id].parents = index[id].parents.concat(n.parents);
      } else {
        index[id] = { id: id, parents: n.parents.slice(), level: i, span: i - d3.min(n.parents, p => p.level) };
      }
      n.bundle = index[id];
    });
    l.bundles = Object.keys(index).map(k => index[k]);
    l.bundles.forEach((b, i) => (b.i = i));
  });

  var links = [];
  nodes.forEach(d => {
    d.parents.forEach(p =>
      links.push({ source: d, bundle: d.bundle, target: p })
    );
  });

  var bundles = levels.reduce((a, x) => a.concat(x.bundles), []);

  // reverse pointer from parent to bundles
  bundles.forEach(b =>
    b.parents.forEach(p => {
      if (p.bundles_index === undefined) {
        p.bundles_index = {};
      }
      if (!(b.id in p.bundles_index)) {
        p.bundles_index[b.id] = [];
      }
      p.bundles_index[b.id].push(b);
    })
  );

  nodes.forEach(n => {
    if (n.bundles_index !== undefined) {
      n.bundles = Object.keys(n.bundles_index).map(k => n.bundles_index[k]);
    } else {
      n.bundles_index = {};
      n.bundles = [];
    }
    n.bundles.sort((a,b) => d3.descending(d3.max(a, d => d.span), d3.max(b, d => d.span)))
    n.bundles.forEach((b, i) => (b.i = i));
  });

  links.forEach(l => {
    if (l.bundle.links === undefined) {
      l.bundle.links = [];
    }
    l.bundle.links.push(l);
  });

  // layout
  const padding = 8;
  const node_height = 22;
  const node_width = 70;
  const bundle_width = 14;
  const level_y_padding = 16;
  const metro_d = 4;
  const min_family_height = 22;
  
  options.c ||= 16;
  const c = options.c;
  options.bigc ||= node_width+c;

  nodes.forEach(
    n => (n.height = (Math.max(1, n.bundles.length) - 1) * metro_d)
  );

  var x_offset = padding;
  var y_offset = padding;
  levels.forEach(l => {
    x_offset += l.bundles.length * bundle_width;
    y_offset += level_y_padding;
    l.forEach((n, i) => {
      n.x = n.level * node_width + x_offset;
      n.y = node_height + y_offset + n.height / 2;

      y_offset += node_height + n.height;
    });
  });

  var i = 0;
  levels.forEach(l => {
    l.bundles.forEach(b => {
      b.x =
        d3.max(b.parents, d => d.x) +
        node_width +
        (l.bundles.length - 1 - b.i) * bundle_width;
      b.y = i * node_height;
    });
    i += l.length;
  });

  links.forEach(l => {
    l.xt = l.target.x;
    l.yt =
      l.target.y +
      l.target.bundles_index[l.bundle.id].i * metro_d -
      (l.target.bundles.length * metro_d) / 2 +
      metro_d / 2;
    l.xb = l.bundle.x;
    l.yb = l.bundle.y;
    l.xs = l.source.x;
    l.ys = l.source.y;
  });
  
  // compress vertical space
  var y_negative_offset = 0;
  levels.forEach(l => {
    y_negative_offset +=
      -min_family_height +
        d3.min(l.bundles, b =>
          d3.min(b.links, link => link.ys - 2*c - (link.yt + c))
        ) || 0;
    l.forEach(n => (n.y -= y_negative_offset));
  });

  // very ugly, I know
  links.forEach(l => {
    l.yt =
      l.target.y +
      l.target.bundles_index[l.bundle.id].i * metro_d -
      (l.target.bundles.length * metro_d) / 2 +
      metro_d / 2;
    l.ys = l.source.y;
    l.c1 = l.source.level - l.target.level > 1 ? Math.min(options.bigc, l.xb-l.xt, l.yb-l.yt)-c : c;
    l.c2 = c;
  });

  var layout = {
    width: d3.max(nodes, n => n.x) + node_width + 2 * padding,
    height: d3.max(nodes, n => n.y) + node_height / 2 + 2 * padding,
    node_height,
    node_width,
    bundle_width,
    level_y_padding,
    metro_d
  };

  return { levels, nodes, nodes_index, links, bundles, layout };
}

const color = d3.scaleOrdinal(d3.schemeDark2);

const background_color = 'white';

const footnote = (referencingCellName, number, text) => {
  return html`<ol start=\"${number}"><li><a href="#${referencingCellName}">^</a> ${text}</li></ol>`;
}

export default class HashtagTangledTreeChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      uuid: uuidv4(),
      chartData: null,
    };

    this.setChartData = this.setChartData.bind(this);

  }

  componentDidMount() {
    this.setChartData();
  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.object != this.props.object){
      this.setChartData();
    }

  }

  setChartData(){

    if (!this.props.object){
      return;
    }

    var chartData = [
      [{id: this.props.object.text}],
      []
    ];

    for (var feedPost of this.props.object.feedPosts){
      for (const reference of feedPost.references){

        if (!isReferenceHashtag(reference)){
          continue;
        }

        if (getHashtagText(reference.text) == this.props.object.text){
          continue;
        }

        if (chartData[1].map(o => o.id).indexOf(getHashtagText(reference.text)) == -1){
          chartData[1].push({
            id: getHashtagText(reference.text),
            parents: [this.props.object.text],
          });
        }

      }
    }

    this.setState({chartData: chartData}, () => {
      this.drawChart(chartData);
    });

  }

  drawChart = (data, options={}) => {
    options.color ||= (d, i) => color(i)
    
    const tangleLayout = constructTangleLayout(lodash.cloneDeep(data), options);

    document.getElementById(`chartTag_${this.state.uuid}`).innerHTML = `<svg width="${tangleLayout.layout.width}" height="${
      tangleLayout.layout.height
    }" style="background-color: ${background_color}">
    <style>
      text {
        font-family: sans-serif;
        font-size: 10px;
      }
      .node {
        stroke-linecap: round;
      }
      .link {
        fill: none;
      }
    </style>

    ${tangleLayout.bundles.map((b, i) => {
      let d = b.links
        .map(
          l => `
        M${l.xt} ${l.yt}
        L${l.xb - l.c1} ${l.yt}
        A${l.c1} ${l.c1} 90 0 1 ${l.xb} ${l.yt + l.c1}
        L${l.xb} ${l.ys - l.c2}
        A${l.c2} ${l.c2} 90 0 0 ${l.xb + l.c2} ${l.ys}
        L${l.xs} ${l.ys}`
        )
        .join("");
      return `
        <path class="link" d="${d}" stroke="${background_color}" stroke-width="5"/>
        <path class="link" d="${d}" stroke="${options.color(b, i)}" stroke-width="2"/>
      `;
    })}

    ${tangleLayout.nodes.map(
      n => `
      <path class="selectable node" data-id="${
        n.id
      }" stroke="black" stroke-width="8" d="M${n.x} ${n.y - n.height / 2} L${
        n.x
      } ${n.y + n.height / 2}"/>
      <path class="node" stroke="white" stroke-width="4" d="M${n.x} ${n.y -
        n.height / 2} L${n.x} ${n.y + n.height / 2}"/>

      <text class="selectable" data-id="${n.id}" x="${n.x + 4}" y="${n.y -
        n.height / 2 -
        4}" stroke="${background_color}" stroke-width="2">${n.id}</text>
      <text x="${n.x + 4}" y="${n.y -
        n.height / 2 -
        4}" style="pointer-events: none;">${n.id}</text>
    `
    )}

    </svg>`;
  }

  render(){
    return (
      <>

        { !this.state.chartData 
            && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                      {/*<span class="visually-hidden">Loading...</span>*/}
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                  </div>
                </div>}

        { this.state.chartData 
            && <div>
                  <div id={`chartTag_${this.state.uuid}`} class=""></div>
                </div>}
      </>
    );
  }
}