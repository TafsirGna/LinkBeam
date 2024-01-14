/*import './RelationshipsChart.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { activateInCurrentTab, saveCanvas, dbDataSanitizer } from "../../Local_library";
import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';

const data = {"name":"flare","children":[{"name":"analytics","children":[{"name":"cluster","children":[{"name":"AgglomerativeCluster","size":3938,"imports":["flare.animate.Transitioner","flare.vis.data.DataList","flare.util.math.IMatrix","flare.analytics.cluster.MergeEdge","flare.analytics.cluster.HierarchicalCluster","flare.vis.data.Data"]},{"name":"CommunityStructure","size":3812,"imports":["flare.analytics.cluster.HierarchicalCluster","flare.animate.Transitioner","flare.vis.data.DataList","flare.analytics.cluster.MergeEdge","flare.util.math.IMatrix"]},{"name":"HierarchicalCluster","size":6714,"imports":["flare.vis.data.EdgeSprite","flare.vis.data.NodeSprite","flare.vis.data.DataList","flare.vis.data.Tree","flare.util.Arrays","flare.analytics.cluster.MergeEdge","flare.util.Sort","flare.vis.operator.Operator","flare.util.Property","flare.vis.data.Data"]},{"name":"MergeEdge","size":743,"imports":[]}]},{"name":"graph","children":[{"name":"BetweennessCentrality","size":3534,"imports":["flare.animate.Transitioner","flare.vis.data.NodeSprite","flare.vis.data.DataList","flare.util.Arrays","flare.vis.data.Data","flare.util.Property","flare.vis.operator.Operator"]},{"name":"LinkDistance","size":5731,"imports":["flare.animate.Transitioner","flare.vis.data.NodeSprite","flare.vis.data.EdgeSprite","flare.analytics.graph.ShortestPaths","flare.vis.data.Data","flare.util.Property","flare.vis.operator.Operator"]},{"name":"MaxFlowMinCut","size":7840,"imports":["flare.animate.Transitioner","flare.vis.data.NodeSprite","flare.vis.data.EdgeSprite","flare.vis.data.Data","flare.util.Property","flare.vis.operator.Operator"]},{"name":"ShortestPaths","size":5914,"imports":["flare.vis.data.EdgeSprite","flare.vis.data.NodeSprite","flare.animate.Transitioner","flare.vis.operator.Operator","flare.util.heap.HeapNode","flare.util.heap.FibonacciHeap","flare.util.Property","flare.vis.data.Data"]},{"name":"SpanningTree","size":3416,"imports":["flare.animate.Transitioner","flare.vis.data.NodeSprite","flare.vis.operator.IOperator","flare.vis.Visualization","flare.vis.data.TreeBuilder","flare.vis.operator.Operator"]}]},{"name":"optimization","children":[{"name":"AspectRatioBanker","size":7074,"imports":["flare.animate.Transitioner","flare.util.Arrays","flare.vis.data.DataSprite","flare.scale.Scale","flare.vis.axis.CartesianAxes","flare.vis.Visualization","flare.util.Property","flare.vis.operator.Operator"]}]}]},{"name":"animate","children":[{"name":"Easing","size":17010,"imports":["flare.animate.Transition"]},{"name":"FunctionSequence","size":5842,"imports":["flare.util.Maths","flare.animate.Transition","flare.util.Arrays","flare.animate.Sequence","flare.animate.Transitioner"]},{"name":"interpolate","children":[{"name":"ArrayInterpolator","size":1983,"imports":["flare.util.Arrays","flare.animate.interpolate.Interpolator"]},{"name":"ColorInterpolator","size":2047,"imports":["flare.animate.interpolate.Interpolator"]},{"name":"DateInterpolator","size":1375,"imports":["flare.animate.interpolate.Interpolator"]},{"name":"Interpolator","size":8746,"imports":["flare.animate.interpolate.NumberInterpolator","flare.animate.interpolate.ColorInterpolator","flare.animate.interpolate.PointInterpolator","flare.animate.interpolate.ObjectInterpolator","flare.animate.interpolate.MatrixInterpolator","flare.animate.interpolate.RectangleInterpolator","flare.animate.interpolate.DateInterpolator","flare.util.Property","flare.animate.interpolate.ArrayInterpolator"]},{"name":"MatrixInterpolator","size":2202,"imports":["flare.animate.interpolate.Interpolator"]},{"name":"NumberInterpolator","size":1382,"imports":["flare.animate.interpolate.Interpolator"]},{"name":"ObjectInterpolator","size":1629,"imports":["flare.animate.interpolate.Interpolator"]},{"name":"PointInterpolator","size":1675,"imports":["flare.animate.interpolate.Interpolator"]},{"name":"RectangleInterpolator","size":2042,"imports":["flare.animate.interpolate.Interpolator"]}]},{"name":"ISchedulable","size":1041,"imports":["flare.animate.Scheduler"]},{"name":"Parallel","size":5176,"imports":["flare.animate.Easing","flare.animate.Transition","flare.util.Arrays"]},{"name":"Pause","size":449,"imports":["flare.animate.Transition"]},{"name":"Scheduler","size":5593,"imports":["flare.animate.ISchedulable","flare.animate.Pause","flare.animate.Transition"]},{"name":"Sequence","size":5534,"imports":["flare.animate.Easing","flare.util.Maths","flare.animate.Transition","flare.util.Arrays"]},{"name":"Transition","size":9201,"imports":["flare.animate.Transitioner","flare.animate.TransitionEvent","flare.animate.Scheduler","flare.animate.Pause","flare.animate.Parallel","flare.animate.Easing","flare.animate.Sequence","flare.animate.ISchedulable","flare.util.Maths","flare.animate.Tween"]},{"name":"Transitioner","size":19975,"imports":["flare.util.IValueProxy","flare.animate.Parallel","flare.animate.Easing","flare.animate.Sequence","flare.animate.Transition","flare.animate.Tween","flare.util.Property"]},{"name":"TransitionEvent","size":1116,"imports":["flare.animate.Transition"]},{"name":"Tween","size":6006,"imports":["flare.animate.Transitioner","flare.animate.Transition","flare.animate.interpolate.Interpolator","flare.util.Property"]}]},{"name":"data","children":[{"name":"converters","children":[{"name":"Converters","size":721,"imports":["flare.data.converters.IDataConverter","flare.data.converters.GraphMLConverter","flare.data.converters.JSONConverter","flare.data.converters.DelimitedTextConverter"]},{"name":"DelimitedTextConverter","size":4294,"imports":["flare.data.DataSet","flare.data.DataUtil","flare.data.DataTable","flare.data.converters.IDataConverter","flare.data.DataSchema","flare.data.DataField"]},{"name":"GraphMLConverter","size":9800,"imports":["flare.data.DataSet","flare.data.DataUtil","flare.data.DataTable","flare.data.converters.IDataConverter","flare.data.DataSchema","flare.data.DataField"]},{"name":"IDataConverter","size":1314,"imports":["flare.data.DataSet","flare.data.DataSchema"]},{"name":"JSONConverter","size":2220,"imports":["flare.data.DataSet","flare.data.DataUtil","flare.data.DataTable","flare.data.converters.IDataConverter","flare.data.DataSchema","flare.data.DataField","flare.util.Property"]}]},{"name":"DataField","size":1759,"imports":["flare.data.DataUtil"]},{"name":"DataSchema","size":2165,"imports":["flare.data.DataField","flare.util.Arrays"]},{"name":"DataSet","size":586,"imports":["flare.data.DataTable"]},{"name":"DataSource","size":3331,"imports":["flare.data.converters.IDataConverter","flare.data.converters.Converters","flare.data.DataSchema"]},{"name":"DataTable","size":772,"imports":["flare.data.DataSchema"]},{"name":"DataUtil","size":3322,"imports":["flare.data.DataField","flare.data.DataSchema"]}]},{"name":"display","children":[{"name":"DirtySprite","size":8833,"imports":[]},{"name":"LineSprite","size":1732,"imports":["flare.display.DirtySprite"]},{"name":"RectSprite","size":3623,"imports":["flare.util.Colors","flare.display.DirtySprite"]},{"name":"TextSprite","size":10066,"imports":["flare.display.DirtySprite"]}]},{"name":"flex","children":[{"name":"FlareVis","size":4116,"imports":["flare.display.DirtySprite","flare.data.DataSet","flare.vis.Visualization","flare.vis.axis.CartesianAxes","flare.vis.axis.Axes","flare.vis.data.Data"]}]},{"name":"physics","children":[{"name":"DragForce","size":1082,"imports":["flare.physics.Simulation","flare.physics.Particle","flare.physics.IForce"]},{"name":"GravityForce","size":1336,"imports":["flare.physics.Simulation","flare.physics.Particle","flare.physics.IForce"]},{"name":"IForce","size":319,"imports":["flare.physics.Simulation"]},{"name":"NBodyForce","size":10498,"imports":["flare.physics.Simulation","flare.physics.Particle","flare.physics.IForce"]},{"name":"Particle","size":2822,"imports":[]},{"name":"Simulation","size":9983,"imports":["flare.physics.Particle","flare.physics.NBodyForce","flare.physics.DragForce","flare.physics.GravityForce","flare.physics.Spring","flare.physics.SpringForce","flare.physics.IForce"]},{"name":"Spring","size":2213,"imports":["flare.physics.Particle"]},{"name":"SpringForce","size":1681,"imports":["flare.physics.Simulation","flare.physics.Particle","flare.physics.Spring","flare.physics.IForce"]}]},{"name":"query","children":[{"name":"AggregateExpression","size":1616,"imports":["flare.query.Expression"]},{"name":"And","size":1027,"imports":["flare.query.CompositeExpression","flare.query.Expression"]},{"name":"Arithmetic","size":3891,"imports":["flare.query.BinaryExpression","flare.query.Expression"]},{"name":"Average","size":891,"imports":["flare.query.Expression","flare.query.AggregateExpression"]},{"name":"BinaryExpression","size":2893,"imports":["flare.query.Expression"]},{"name":"Comparison","size":5103,"imports":["flare.query.Not","flare.query.BinaryExpression","flare.query.Expression","flare.query.Or"]},{"name":"CompositeExpression","size":3677,"imports":["flare.query.Expression","flare.query.If"]},{"name":"Count","size":781,"imports":["flare.query.Expression","flare.query.AggregateExpression"]},{"name":"DateUtil","size":4141,"imports":["flare.query.Fn"]},{"name":"Distinct","size":933,"imports":["flare.query.Expression","flare.query.AggregateExpression"]},{"name":"Expression","size":5130,"imports":["flare.query.Variable","flare.query.IsA","flare.query.ExpressionIterator","flare.util.IPredicate","flare.query.Literal","flare.util.IEvaluable","flare.query.If"]},{"name":"ExpressionIterator","size":3617,"imports":["flare.query.Expression"]},{"name":"Fn","size":3240,"imports":["flare.query.DateUtil","flare.query.CompositeExpression","flare.query.Expression","flare.query.StringUtil"]},{"name":"If","size":2732,"imports":["flare.query.Expression"]},{"name":"IsA","size":2039,"imports":["flare.query.Expression","flare.query.If"]},{"name":"Literal","size":1214,"imports":["flare.query.Expression"]},{"name":"Match","size":3748,"imports":["flare.query.BinaryExpression","flare.query.Expression","flare.query.StringUtil"]},{"name":"Maximum","size":843,"imports":["flare.query.Expression","flare.query.AggregateExpression"]},{"name":"methods","children":[{"name":"add","size":593,"imports":["flare.query.methods.or","flare.query.Arithmetic"]},{"name":"and","size":330,"imports":["flare.query.And","flare.query.methods.or"]},{"name":"average","size":287,"imports":["flare.query.Average","flare.query.methods.or"]},{"name":"count","size":277,"imports":["flare.query.Count","flare.query.methods.or"]},{"name":"distinct","size":292,"imports":["flare.query.Distinct","flare.query.methods.or"]},{"name":"div","size":595,"imports":["flare.query.methods.or","flare.query.Arithmetic"]},{"name":"eq","size":594,"imports":["flare.query.Comparison","flare.query.methods.or"]},{"name":"fn","size":460,"imports":["flare.query.methods.or","flare.query.Fn"]},{"name":"gt","size":603,"imports":["flare.query.Comparison","flare.query.methods.or"]},{"name":"gte","size":625,"imports":["flare.query.Comparison","flare.query.methods.gt","flare.query.methods.eq","flare.query.methods.or"]},{"name":"iff","size":748,"imports":["flare.query.methods.or","flare.query.If"]},{"name":"isa","size":461,"imports":["flare.query.IsA","flare.query.methods.or"]},{"name":"lt","size":597,"imports":["flare.query.Comparison","flare.query.methods.or"]},{"name":"lte","size":619,"imports":["flare.query.Comparison","flare.query.methods.lt","flare.query.methods.eq","flare.query.methods.or"]},{"name":"max","size":283,"imports":["flare.query.Maximum","flare.query.methods.or"]},{"name":"min","size":283,"imports":["flare.query.Minimum","flare.query.methods.or"]},{"name":"mod","size":591,"imports":["flare.query.methods.or","flare.query.Arithmetic"]},{"name":"mul","size":603,"imports":["flare.query.methods.lt","flare.query.methods.or","flare.query.Arithmetic"]},{"name":"neq","size":599,"imports":["flare.query.Comparison","flare.query.methods.eq","flare.query.methods.or"]},{"name":"not","size":386,"imports":["flare.query.Not","flare.query.methods.or"]},{"name":"or","size":323,"imports":["flare.query.Or"]},{"name":"orderby","size":307,"imports":["flare.query.Query","flare.query.methods.or"]},{"name":"range","size":772,"imports":["flare.query.methods.max","flare.query.Range","flare.query.methods.or","flare.query.methods.min"]},{"name":"select","size":296,"imports":["flare.query.Query"]},{"name":"stddev","size":363,"imports":["flare.query.methods.and","flare.query.Variance","flare.query.methods.or"]},{"name":"sub","size":600,"imports":["flare.query.methods.or","flare.query.Arithmetic"]},{"name":"sum","size":280,"imports":["flare.query.Sum","flare.query.methods.or"]},{"name":"update","size":307,"imports":["flare.query.Query"]},{"name":"variance","size":335,"imports":["flare.query.Variance","flare.query.methods.or"]},{"name":"where","size":299,"imports":["flare.query.Query","flare.query.methods.lt","flare.query.methods.lte"]},{"name":"xor","size":354,"imports":["flare.query.Xor","flare.query.methods.or"]},{"name":"_","size":264,"imports":["flare.query.Literal","flare.query.methods.or"]}]},{"name":"Minimum","size":843,"imports":["flare.query.Expression","flare.query.AggregateExpression"]},{"name":"Not","size":1554,"imports":["flare.query.Expression"]},{"name":"Or","size":970,"imports":["flare.query.CompositeExpression","flare.query.Expression"]},{"name":"Query","size":13896,"imports":["flare.query.Variable","flare.query.Sum","flare.query.Expression","flare.util.Sort","flare.query.Not","flare.query.AggregateExpression","flare.query.Literal","flare.util.Filter","flare.util.Property","flare.query.If"]},{"name":"Range","size":1594,"imports":["flare.query.And","flare.query.Comparison","flare.query.Expression"]},{"name":"StringUtil","size":4130,"imports":["flare.query.Fn"]},{"name":"Sum","size":791,"imports":["flare.query.Expression","flare.query.AggregateExpression"]},{"name":"Variable","size":1124,"imports":["flare.query.Expression","flare.util.Property"]},{"name":"Variance","size":1876,"imports":["flare.query.Expression","flare.query.AggregateExpression"]},{"name":"Xor","size":1101,"imports":["flare.query.CompositeExpression","flare.query.Expression"]}]},{"name":"scale","children":[{"name":"IScaleMap","size":2105,"imports":["flare.scale.Scale"]},{"name":"LinearScale","size":1316,"imports":["flare.util.Maths","flare.util.Strings","flare.scale.Scale","flare.scale.QuantitativeScale","flare.scale.ScaleType"]},{"name":"LogScale","size":3151,"imports":["flare.util.Maths","flare.util.Strings","flare.scale.Scale","flare.scale.QuantitativeScale","flare.scale.ScaleType"]},{"name":"OrdinalScale","size":3770,"imports":["flare.scale.ScaleType","flare.util.Arrays","flare.scale.Scale"]},{"name":"QuantileScale","size":2435,"imports":["flare.util.Maths","flare.util.Strings","flare.scale.Scale","flare.scale.ScaleType"]},{"name":"QuantitativeScale","size":4839,"imports":["flare.util.Maths","flare.util.Strings","flare.scale.Scale"]},{"name":"RootScale","size":1756,"imports":["flare.util.Maths","flare.util.Strings","flare.scale.Scale","flare.scale.QuantitativeScale","flare.scale.ScaleType"]},{"name":"Scale","size":4268,"imports":["flare.scale.ScaleType","flare.util.Strings"]},{"name":"ScaleType","size":1821,"imports":["flare.scale.Scale"]},{"name":"TimeScale","size":5833,"imports":["flare.util.Maths","flare.util.Dates","flare.scale.Scale","flare.scale.ScaleType"]}]},{"name":"util","children":[{"name":"Arrays","size":8258,"imports":["flare.util.IValueProxy","flare.util.Property","flare.util.IEvaluable"]},{"name":"Colors","size":10001,"imports":["flare.util.Filter"]},{"name":"Dates","size":8217,"imports":["flare.util.Maths"]},{"name":"Displays","size":12555,"imports":["flare.util.IValueProxy","flare.util.Filter","flare.util.Property","flare.util.IEvaluable","flare.util.Sort"]},{"name":"Filter","size":2324,"imports":["flare.util.IPredicate","flare.util.Property"]},{"name":"Geometry","size":10993,"imports":[]},{"name":"heap","children":[{"name":"FibonacciHeap","size":9354,"imports":["flare.util.heap.HeapNode"]},{"name":"HeapNode","size":1233,"imports":["flare.util.heap.FibonacciHeap"]}]},{"name":"IEvaluable","size":335,"imports":[]},{"name":"IPredicate","size":383,"imports":[]},{"name":"IValueProxy","size":874,"imports":[]},{"name":"math","children":[{"name":"DenseMatrix","size":3165,"imports":["flare.util.math.IMatrix"]},{"name":"IMatrix","size":2815,"imports":[]},{"name":"SparseMatrix","size":3366,"imports":["flare.util.math.IMatrix"]}]},{"name":"Maths","size":17705,"imports":["flare.util.Arrays"]},{"name":"Orientation","size":1486,"imports":[]},{"name":"palette","children":[{"name":"ColorPalette","size":6367,"imports":["flare.util.palette.Palette","flare.util.Colors"]},{"name":"Palette","size":1229,"imports":[]},{"name":"ShapePalette","size":2059,"imports":["flare.util.palette.Palette","flare.util.Shapes"]},{"name":"SizePalette","size":2291,"imports":["flare.util.palette.Palette"]}]},{"name":"Property","size":5559,"imports":["flare.util.IPredicate","flare.util.IValueProxy","flare.util.IEvaluable"]},{"name":"Shapes","size":19118,"imports":["flare.util.Arrays"]},{"name":"Sort","size":6887,"imports":["flare.util.Arrays","flare.util.Property"]},{"name":"Stats","size":6557,"imports":["flare.util.Arrays","flare.util.Property"]},{"name":"Strings","size":22026,"imports":["flare.util.Dates","flare.util.Property"]}]},{"name":"vis","children":[{"name":"axis","children":[{"name":"Axes","size":1302,"imports":["flare.animate.Transitioner","flare.vis.Visualization"]},{"name":"Axis","size":24593,"imports":["flare.animate.Transitioner","flare.scale.LinearScale","flare.util.Arrays","flare.scale.ScaleType","flare.util.Strings","flare.display.TextSprite","flare.scale.Scale","flare.util.Stats","flare.scale.IScaleMap","flare.vis.axis.AxisLabel","flare.vis.axis.AxisGridLine"]},{"name":"AxisGridLine","size":652,"imports":["flare.vis.axis.Axis","flare.display.LineSprite"]},{"name":"AxisLabel","size":636,"imports":["flare.vis.axis.Axis","flare.display.TextSprite"]},{"name":"CartesianAxes","size":6703,"imports":["flare.animate.Transitioner","flare.display.RectSprite","flare.vis.axis.Axis","flare.display.TextSprite","flare.vis.axis.Axes","flare.vis.Visualization","flare.vis.axis.AxisGridLine"]}]},{"name":"controls","children":[{"name":"AnchorControl","size":2138,"imports":["flare.vis.controls.Control","flare.vis.Visualization","flare.vis.operator.layout.Layout"]},{"name":"ClickControl","size":3824,"imports":["flare.vis.events.SelectionEvent","flare.vis.controls.Control"]},{"name":"Control","size":1353,"imports":["flare.vis.controls.IControl","flare.util.Filter"]},{"name":"ControlList","size":4665,"imports":["flare.vis.controls.IControl","flare.util.Arrays","flare.vis.Visualization","flare.vis.controls.Control"]},{"name":"DragControl","size":2649,"imports":["flare.vis.controls.Control","flare.vis.data.DataSprite"]},{"name":"ExpandControl","size":2832,"imports":["flare.animate.Transitioner","flare.vis.data.NodeSprite","flare.vis.controls.Control","flare.vis.Visualization"]},{"name":"HoverControl","size":4896,"imports":["flare.vis.events.SelectionEvent","flare.vis.controls.Control"]},{"name":"IControl","size":763,"imports":["flare.vis.controls.Control"]},{"name":"PanZoomControl","size":5222,"imports":["flare.util.Displays","flare.vis.controls.Control"]},{"name":"SelectionControl","size":7862,"imports":["flare.vis.events.SelectionEvent","flare.vis.controls.Control"]},{"name":"TooltipControl","size":8435,"imports":["flare.animate.Tween","flare.display.TextSprite","flare.vis.controls.Control","flare.vis.events.TooltipEvent"]}]},{"name":"data","children":[{"name":"Data","size":20544,"imports":["flare.vis.data.EdgeSprite","flare.vis.data.NodeSprite","flare.util.Arrays","flare.vis.data.DataSprite","flare.vis.data.Tree","flare.vis.events.DataEvent","flare.data.DataSet","flare.vis.data.TreeBuilder","flare.vis.data.DataList","flare.data.DataSchema","flare.util.Sort","flare.data.DataField","flare.util.Property"]},{"name":"DataList","size":19788,"imports":["flare.animate.Transitioner","flare.vis.data.NodeSprite","flare.util.Arrays","flare.util.math.DenseMatrix","flare.vis.data.DataSprite","flare.vis.data.EdgeSprite","flare.vis.events.DataEvent","flare.util.Stats","flare.util.math.IMatrix","flare.util.Sort","flare.util.Filter","flare.util.Property","flare.util.IEvaluable","flare.vis.data.Data"]},{"name":"DataSprite","size":10349,"imports":["flare.util.Colors","flare.vis.data.Data","flare.display.DirtySprite","flare.vis.data.render.IRenderer","flare.vis.data.render.ShapeRenderer"]},{"name":"EdgeSprite","size":3301,"imports":["flare.vis.data.render.EdgeRenderer","flare.vis.data.DataSprite","flare.vis.data.NodeSprite","flare.vis.data.render.ArrowType","flare.vis.data.Data"]},{"name":"NodeSprite","size":19382,"imports":["flare.animate.Transitioner","flare.util.Arrays","flare.vis.data.DataSprite","flare.vis.data.EdgeSprite","flare.vis.data.Tree","flare.util.Sort","flare.util.Filter","flare.util.IEvaluable","flare.vis.data.Data"]},{"name":"render","children":[{"name":"ArrowType","size":698,"imports":[]},{"name":"EdgeRenderer","size":5569,"imports":["flare.vis.data.EdgeSprite","flare.vis.data.NodeSprite","flare.vis.data.DataSprite","flare.vis.data.render.IRenderer","flare.util.Shapes","flare.util.Geometry","flare.vis.data.render.ArrowType"]},{"name":"IRenderer","size":353,"imports":["flare.vis.data.DataSprite"]},{"name":"ShapeRenderer","size":2247,"imports":["flare.util.Shapes","flare.vis.data.render.IRenderer","flare.vis.data.DataSprite"]}]},{"name":"ScaleBinding","size":11275,"imports":["flare.scale.TimeScale","flare.scale.ScaleType","flare.scale.LinearScale","flare.scale.LogScale","flare.scale.OrdinalScale","flare.scale.RootScale","flare.scale.Scale","flare.scale.QuantileScale","flare.util.Stats","flare.scale.QuantitativeScale","flare.vis.events.DataEvent","flare.vis.data.Data"]},{"name":"Tree","size":7147,"imports":["flare.vis.data.EdgeSprite","flare.vis.events.DataEvent","flare.vis.data.NodeSprite","flare.vis.data.Data"]},{"name":"TreeBuilder","size":9930,"imports":["flare.vis.data.EdgeSprite","flare.vis.data.NodeSprite","flare.vis.data.Tree","flare.util.heap.HeapNode","flare.util.heap.FibonacciHeap","flare.util.Property","flare.util.IEvaluable","flare.vis.data.Data"]}]},{"name":"events","children":[{"name":"DataEvent","size":2313,"imports":["flare.vis.data.EdgeSprite","flare.vis.data.NodeSprite","flare.vis.data.DataList","flare.vis.data.DataSprite"]},{"name":"SelectionEvent","size":1880,"imports":["flare.vis.events.DataEvent"]},{"name":"TooltipEvent","size":1701,"imports":["flare.vis.data.EdgeSprite","flare.vis.data.NodeSprite"]},{"name":"VisualizationEvent","size":1117,"imports":["flare.animate.Transitioner"]}]},{"name":"legend","children":[{"name":"Legend","size":20859,"imports":["flare.animate.Transitioner","flare.vis.data.ScaleBinding","flare.util.palette.SizePalette","flare.scale.ScaleType","flare.vis.legend.LegendItem","flare.display.RectSprite","flare.display.TextSprite","flare.scale.Scale","flare.vis.legend.LegendRange","flare.util.Displays","flare.util.Orientation","flare.util.palette.ShapePalette","flare.util.palette.Palette","flare.util.palette.ColorPalette"]},{"name":"LegendItem","size":4614,"imports":["flare.util.Shapes","flare.display.TextSprite","flare.vis.legend.Legend","flare.display.RectSprite"]},{"name":"LegendRange","size":10530,"imports":["flare.util.Colors","flare.vis.legend.Legend","flare.display.RectSprite","flare.display.TextSprite","flare.scale.Scale","flare.util.Stats","flare.scale.IScaleMap","flare.util.Orientation","flare.util.palette.ColorPalette"]}]},{"name":"operator","children":[{"name":"distortion","children":[{"name":"BifocalDistortion","size":4461,"imports":["flare.vis.operator.distortion.Distortion"]},{"name":"Distortion","size":6314,"imports":["flare.animate.Transitioner","flare.vis.data.DataSprite","flare.vis.events.VisualizationEvent","flare.vis.axis.Axis","flare.vis.axis.CartesianAxes","flare.vis.operator.layout.Layout","flare.vis.data.Data"]},{"name":"FisheyeDistortion","size":3444,"imports":["flare.vis.operator.distortion.Distortion"]}]},{"name":"encoder","children":[{"name":"ColorEncoder","size":3179,"imports":["flare.animate.Transitioner","flare.scale.ScaleType","flare.vis.operator.encoder.Encoder","flare.util.palette.Palette","flare.util.palette.ColorPalette","flare.vis.data.Data"]},{"name":"Encoder","size":4060,"imports":["flare.animate.Transitioner","flare.vis.data.DataSprite","flare.vis.operator.Operator","flare.vis.data.ScaleBinding","flare.util.palette.Palette","flare.util.Filter","flare.util.Property","flare.vis.data.Data"]},{"name":"PropertyEncoder","size":4138,"imports":["flare.animate.Transitioner","flare.vis.data.DataList","flare.vis.data.Data","flare.vis.operator.encoder.Encoder","flare.util.Filter","flare.vis.operator.Operator"]},{"name":"ShapeEncoder","size":1690,"imports":["flare.util.palette.Palette","flare.scale.ScaleType","flare.util.palette.ShapePalette","flare.vis.operator.encoder.Encoder","flare.vis.data.Data"]},{"name":"SizeEncoder","size":1830,"imports":["flare.util.palette.Palette","flare.scale.ScaleType","flare.vis.operator.encoder.Encoder","flare.util.palette.SizePalette","flare.vis.data.Data"]}]},{"name":"filter","children":[{"name":"FisheyeTreeFilter","size":5219,"imports":["flare.animate.Transitioner","flare.vis.data.NodeSprite","flare.vis.data.DataSprite","flare.vis.data.EdgeSprite","flare.vis.data.Tree","flare.vis.operator.Operator","flare.vis.data.Data"]},{"name":"GraphDistanceFilter","size":3165,"imports":["flare.animate.Transitioner","flare.vis.data.NodeSprite","flare.vis.operator.Operator","flare.vis.data.DataSprite","flare.vis.data.EdgeSprite"]},{"name":"VisibilityFilter","size":3509,"imports":["flare.vis.operator.Operator","flare.animate.Transitioner","flare.util.Filter","flare.vis.data.DataSprite","flare.vis.data.Data"]}]},{"name":"IOperator","size":1286,"imports":["flare.animate.Transitioner","flare.vis.Visualization","flare.vis.operator.Operator"]},{"name":"label","children":[{"name":"Labeler","size":9956,"imports":["flare.animate.Transitioner","flare.vis.data.DataSprite","flare.display.TextSprite","flare.vis.operator.Operator","flare.util.Shapes","flare.util.Filter","flare.util.Property","flare.util.IEvaluable","flare.vis.data.Data"]},{"name":"RadialLabeler","size":3899,"imports":["flare.vis.operator.label.Labeler","flare.util.Shapes","flare.display.TextSprite","flare.vis.data.DataSprite","flare.vis.data.Data"]},{"name":"StackedAreaLabeler","size":3202,"imports":["flare.vis.operator.label.Labeler","flare.display.TextSprite","flare.vis.data.DataSprite","flare.vis.data.Data"]}]},{"name":"layout","children":[{"name":"AxisLayout","size":6725,"imports":["flare.scale.ScaleType","flare.vis.data.DataSprite","flare.vis.axis.CartesianAxes","flare.vis.data.ScaleBinding","flare.util.Property","flare.vis.operator.layout.Layout","flare.vis.data.Data"]},{"name":"BundledEdgeRouter","size":3727,"imports":["flare.animate.Transitioner","flare.vis.data.NodeSprite","flare.util.Arrays","flare.vis.data.DataSprite","flare.vis.data.EdgeSprite","flare.util.Shapes","flare.vis.operator.layout.Layout","flare.vis.operator.Operator"]},{"name":"CircleLayout","size":9317,"imports":["flare.vis.data.NodeSprite","flare.vis.data.DataList","flare.vis.data.ScaleBinding","flare.util.Property","flare.vis.operator.layout.Layout","flare.vis.data.Data"]},{"name":"CirclePackingLayout","size":12003,"imports":["flare.vis.data.NodeSprite","flare.vis.data.render.ShapeRenderer","flare.util.Shapes","flare.util.Sort","flare.vis.operator.layout.Layout","flare.vis.data.Data"]},{"name":"DendrogramLayout","size":4853,"imports":["flare.util.Property","flare.vis.data.NodeSprite","flare.util.Orientation","flare.vis.operator.layout.Layout","flare.vis.data.EdgeSprite"]},{"name":"ForceDirectedLayout","size":8411,"imports":["flare.physics.Simulation","flare.animate.Transitioner","flare.vis.data.NodeSprite","flare.vis.data.DataSprite","flare.physics.Particle","flare.physics.Spring","flare.vis.operator.layout.Layout","flare.vis.data.EdgeSprite","flare.vis.data.Data"]},{"name":"IcicleTreeLayout","size":4864,"imports":["flare.vis.data.NodeSprite","flare.util.Orientation","flare.vis.operator.layout.Layout"]},{"name":"IndentedTreeLayout","size":3174,"imports":["flare.animate.Transitioner","flare.vis.data.NodeSprite","flare.util.Arrays","flare.vis.operator.layout.Layout","flare.vis.data.EdgeSprite"]},{"name":"Layout","size":7881,"imports":["flare.animate.Transitioner","flare.vis.data.NodeSprite","flare.vis.data.DataList","flare.vis.data.DataSprite","flare.vis.data.EdgeSprite","flare.vis.Visualization","flare.vis.axis.CartesianAxes","flare.vis.axis.Axes","flare.animate.TransitionEvent","flare.vis.operator.Operator"]},{"name":"NodeLinkTreeLayout","size":12870,"imports":["flare.vis.data.NodeSprite","flare.util.Arrays","flare.util.Orientation","flare.vis.operator.layout.Layout"]},{"name":"PieLayout","size":2728,"imports":["flare.vis.data.DataList","flare.vis.data.DataSprite","flare.util.Shapes","flare.util.Property","flare.vis.operator.layout.Layout","flare.vis.data.Data"]},{"name":"RadialTreeLayout","size":12348,"imports":["flare.vis.data.NodeSprite","flare.util.Arrays","flare.vis.operator.layout.Layout"]},{"name":"RandomLayout","size":870,"imports":["flare.vis.operator.layout.Layout","flare.vis.data.DataSprite","flare.vis.data.Data"]},{"name":"StackedAreaLayout","size":9121,"imports":["flare.scale.TimeScale","flare.scale.LinearScale","flare.util.Arrays","flare.scale.OrdinalScale","flare.vis.data.NodeSprite","flare.scale.Scale","flare.vis.axis.CartesianAxes","flare.util.Stats","flare.util.Orientation","flare.scale.QuantitativeScale","flare.util.Maths","flare.vis.operator.layout.Layout"]},{"name":"TreeMapLayout","size":9191,"imports":["flare.animate.Transitioner","flare.vis.data.NodeSprite","flare.util.Property","flare.vis.operator.layout.Layout"]}]},{"name":"Operator","size":2490,"imports":["flare.animate.Transitioner","flare.vis.operator.IOperator","flare.util.Property","flare.util.IEvaluable","flare.vis.Visualization"]},{"name":"OperatorList","size":5248,"imports":["flare.animate.Transitioner","flare.util.Arrays","flare.vis.operator.IOperator","flare.vis.Visualization","flare.vis.operator.Operator"]},{"name":"OperatorSequence","size":4190,"imports":["flare.animate.Transitioner","flare.util.Arrays","flare.vis.operator.IOperator","flare.vis.operator.OperatorList","flare.animate.FunctionSequence","flare.vis.operator.Operator"]},{"name":"OperatorSwitch","size":2581,"imports":["flare.animate.Transitioner","flare.vis.operator.OperatorList","flare.vis.operator.IOperator","flare.vis.operator.Operator"]},{"name":"SortOperator","size":2023,"imports":["flare.vis.operator.Operator","flare.animate.Transitioner","flare.util.Arrays","flare.vis.data.Data"]}]},{"name":"Visualization","size":16540,"imports":["flare.animate.Transitioner","flare.vis.operator.IOperator","flare.animate.Scheduler","flare.vis.events.VisualizationEvent","flare.vis.data.Tree","flare.vis.events.DataEvent","flare.vis.axis.Axes","flare.vis.axis.CartesianAxes","flare.util.Displays","flare.vis.operator.OperatorList","flare.vis.controls.ControlList","flare.animate.ISchedulable","flare.vis.data.Data"]}]}]};

// function linkArc(d) {
//   const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
//   return `
//     M${d.source.x},${d.source.y}
//     A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
//   `;
// };

// const drag = simulation => {
  
//   function dragstarted(event, d) {
//     if (!event.active) simulation.alphaTarget(0.3).restart();
//     d.fx = d.x;
//     d.fy = d.y;
//   }
  
//   function dragged(event, d) {
//     d.fx = event.x;
//     d.fy = event.y;
//   }
  
//   function dragended(event, d) {
//     if (!event.active) simulation.alphaTarget(0);
//     d.fx = null;
//     d.fy = null;
//   }
  
//   return d3.drag()
//       .on("start", dragstarted)
//       .on("drag", dragged)
//       .on("end", dragended);
// };









const colornone = "#ccc";
const colorout = "#f00";
const colorin = "#00f";

function id(node) {
  return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`;
}

function bilink(root) {
  const map = new Map(root.leaves().map(d => [id(d), d]));
  for (const d of root.leaves()) d.incoming = [], d.outgoing = d.data.imports.map(i => [d, map.get(i)]);
  for (const d of root.leaves()) for (const o of d.outgoing) o[1].incoming.push(o);
  return root;
}

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

    // var chartData = {
    //       nodes: [],
    //       links: [],
    //     };

    // for (var profile of this.props.objects){

    //   var source = dbDataSanitizer.fullName(profile.fullName);
    //   chartData.nodes.push({
    //     id: source,
    //     group: 1,
    //   });

    //   var suggestions = profile.profileSuggestions;
    //   if (suggestions){
    //     for (var suggestion of suggestions){
    //       var target = dbDataSanitizer.suggestionName(suggestion.name);

    //       chartData.nodes.push({
    //         id: target,
    //         group: 2,
    //       });

    //       chartData.links.push({
    //         source: source,
    //         target: target,
    //         value: Math.floor(Math.random() * 5) + 1,
    //       });
    //     }
    //   }
    // }

    var chartData = { name: "", children: []};

    // if (this.props.objects.length == 1){
       
    //   const degree = d3.rollup(
    //     chartData.links.flatMap(({ source, target, value }) => [
    //       { node: source, value },
    //       { node: target, value }
    //     ]),
    //     (v) => d3.sum(v, ({ value }) => value),
    //     ({ node }) => node
    //   );
    //   chartData["orders"] = new Map([
    //     ["by name", d3.sort(chartData.nodes.map((d) => d.id))],
    //     ["by group", d3.sort(chartData.nodes, ({group}) => group, ({id}) => id).map(({id}) => id)],
    //     //    ["input", nodes.map(({id}) => id)],
    //     ["by degree", d3.sort(chartData.nodes, ({id}) => degree.get(id), ({id}) => id).map(({id}) => id).reverse()]
    //   ]);
      
    // }

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

    const drawEdgeBundling = () => {

      const width = 954;
      const radius = width / 2;

      const tree = d3.cluster()
        .size([2 * Math.PI, radius - 100]);
      const root = tree(bilink(d3.hierarchy(data)
          .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name))));

      const svg = d3.select("#chartTag_"+this.state.uuid).append("svg")
          .attr("width", width)
          .attr("height", width)
          .attr("viewBox", [-width / 2, -width / 2, width, width])
          .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

      const node = svg.append("g")
        .selectAll()
        .data(root.leaves())
        .join("g")
          .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        .append("text")
          .attr("dy", "0.31em")
          .attr("x", d => d.x < Math.PI ? 6 : -6)
          .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
          .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
          .text(d => d.data.name)
          .each(function(d) { d.text = this; })
          .on("mouseover", overed)
          .on("mouseout", outed)
          .call(text => text.append("title").text(d => `${id(d)}
    ${d.outgoing.length} outgoing
    ${d.incoming.length} incoming`));

      const line = d3.lineRadial()
        .curve(d3.curveBundle.beta(0.85))
        .radius(d => d.y)
        .angle(d => d.x);

      const link = svg.append("g")
          .attr("stroke", colornone)
          .attr("fill", "none")
        .selectAll()
        .data(root.leaves().flatMap(leaf => leaf.outgoing))
        .join("path")
          .style("mix-blend-mode", "multiply")
          .attr("d", ([i, o]) => line(i.path(o)))
          .each(function(d) { d.path = this; });

      function overed(event, d) {
        link.style("mix-blend-mode", null);
        d3.select(this).attr("font-weight", "bold");
        d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", colorin).raise();
        d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", colorin).attr("font-weight", "bold");
        d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", colorout).raise();
        d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", colorout).attr("font-weight", "bold");
      }

      function outed(event, d) {
        link.style("mix-blend-mode", "multiply");
        d3.select(this).attr("font-weight", null);
        d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", null);
        d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", null).attr("font-weight", null);
        d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", null);
        d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", null).attr("font-weight", null);
      }

      return svg.node();

    };

    // const drawGraph = () => {

    //   // Specify the dimensions of the chart.
    //   const width = 928;
    //   const height = 600;

    //   // Specify the color scale.
    //   const color = d3.scaleOrdinal(d3.schemeCategory10);

    //   // The force simulation mutates links and nodes, so create a copy
    //   // so that re-evaluating this cell produces the same result.
    //   const links = this.state.data.links.map(d => ({...d}));
    //   const nodes = this.state.data.nodes.map(d => ({...d}));

    //   // Create a simulation with several forces.
    //   const simulation = d3.forceSimulation(nodes)
    //       .force("link", d3.forceLink(links).id(d => d.id))
    //       .force("charge", d3.forceManyBody())
    //       .force("center", d3.forceCenter(width / 2, height / 2))
    //       .on("tick", ticked);

    //   // Create the SVG container.
    //   const svg = d3.select("#chartTag_"+this.state.uuid).append("svg")
    //       .attr("width", width)
    //       .attr("height", height)
    //       .attr("viewBox", [0, 0, width, height])
    //       .attr("style", "max-width: 100%; height: auto;");

    //   // Add a line for each link, and a circle for each node.
    //   const link = svg.append("g")
    //       .attr("stroke", "#999")
    //       .attr("stroke-opacity", 0.6)
    //     .selectAll()
    //     .data(links)
    //     .join("line")
    //       .attr("stroke-width", d => Math.sqrt(d.value));

    //   const node = svg.append("g")
    //       .attr("stroke", "#fff")
    //       .attr("stroke-width", 1.5)
    //     .selectAll()
    //     .data(nodes)
    //     .join("circle")
    //       .attr("r", 5)
    //       .attr("fill", d => color(d.group));

    //   node.append("title")
    //       .text(d => d.id);

    //   // Add a drag behavior.
    //   node.call(d3.drag()
    //         .on("start", dragstarted)
    //         .on("drag", dragged)
    //         .on("end", dragended));

    //   // Set the position attributes of links and nodes each time the simulation ticks.
    //   function ticked() {
    //     link
    //         .attr("x1", d => d.source.x)
    //         .attr("y1", d => d.source.y)
    //         .attr("x2", d => d.target.x)
    //         .attr("y2", d => d.target.y);

    //     node
    //         .attr("cx", d => d.x)
    //         .attr("cy", d => d.y);
    //   }

    //   // Reheat the simulation when drag starts, and fix the subject position.
    //   function dragstarted(event) {
    //     if (!event.active) simulation.alphaTarget(0.3).restart();
    //     event.subject.fx = event.subject.x;
    //     event.subject.fy = event.subject.y;
    //   }

    //   // Update the subject (dragged node) position during drag.
    //   function dragged(event) {
    //     event.subject.fx = event.x;
    //     event.subject.fy = event.y;
    //   }

    //   // Restore the target alpha so the simulation cools after dragging ends.
    //   // Unfix the subject position now that it’s no longer being dragged.
    //   function dragended(event) {
    //     if (!event.active) simulation.alphaTarget(0);
    //     event.subject.fx = null;
    //     event.subject.fy = null;
    //   }

    //   // When this cell is re-run, stop the previous simulation. (This doesn’t
    //   // really matter since the target alpha is zero and the simulation will
    //   // stop naturally, but it’s a good practice.)
    //   // invalidation.then(() => simulation.stop());

    //   return svg.node();

    // };

    if (!this.state.data){
      this.setData(() => {
        // if (this.props.objects.length == 1){
          drawEdgeBundling();
        // }
        // else{
        //   drawGraph();
        // }
      });
      return;
    }

    // if (this.props.objects.length == 1){
      drawEdgeBundling();
    // }
    // else{
    //   drawGraph();
    // }
  
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
