'use strict';

import 'bootstrap/dist/css/bootstrap.css';
// import 'bootswatch/slate/bootstrap.css'; //uncomment to use dark theme
import '../css/custom.css';

import 'bootstrap';

import * as moment from 'moment';
import * as Highcharts from 'highcharts';
import * as boost from 'highcharts/modules/boost';
import * as HighchartsMore from 'highcharts/highcharts-more';
import * as dataModule from 'highcharts/modules/data';
import * as sunburst from 'highcharts/modules/sunburst';

boost(Highcharts);
dataModule(Highcharts);
HighchartsMore(Highcharts);
sunburst(Highcharts);

function addTimeLineGraph(graph, data)
{
  let maxTiming = 0;
  let minTiming = null;
  const simple = data.timings.reduce((res, timing) => {
    if (!timing.name)
    {
      return res;
    }
    if (timing.name.includes(' END '))
    {
      return res;
    }
    const name = timing.name.replace(' END', '').replace(' START', '').trim();
    const start = timing.time;
    if (minTiming === null || minTiming > start)
    {
      minTiming = start;
    }
    const endTiming = data.timings
      .find(timingSearch=>timingSearch.name && timingSearch.name.includes(' END')
        && timingSearch.name.replace(' END', ' START') === timing.name);
    let end;
    if (endTiming)
    {
      end = endTiming.time;
      if (maxTiming < end)
      {
        maxTiming = end;
      }
    }
    const obj = {name, start, end};
    res.push(obj);
    return res;
  }, []);
  simple.forEach((el)=>{
    if (!el.end)
    {
      el.end = maxTiming;
    }
    el.start -= minTiming;
    el.start /= 1000;
    el.end -= minTiming;
    el.end /= 1000;
  });
  const dataColumns = simple.map(data2 => data2.name);
  const valueColumns = simple.map(data2 => ([data2.start, data2.end]));
  const options = {
    chart: {
      type: 'columnrange',
      inverted: true,
      zoomType: 'x',
      renderTo: graph[0],
      events: {
        load: (chart) => {
          setTimeout(() => chart.target.reflow(), 1000);
        },
      },
    },
    title: {
      text: 'search speed',
    },
    subtitle: {
      // eslint-disable-next-line no-undef
      text: document.ontouchstart === undefined
        ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in',
    },
    xAxis: {
      categories: dataColumns,
    },
    yAxis: {
      title: {
        text: 'timing',
      },
    },
    legend: {
      enabled: false,
    },
    series: [{
      name: 'Timing',
      data: valueColumns,
    }],
  };
  Highcharts.chart(options);
}


$('#show').click(() => {
  $('#graphs').empty();
  $('textarea[name=timing]').each(function () {
    const graph = $('<div/>');
    const textarea = $(this);
    const raw = $(textarea).val().trim();
    if (!raw)
    {
      return;
    }
    const val = raw.substr(raw.indexOf('{')).trim();
    const data = JSON.parse(val);
    addTimeLineGraph(graph, data);
    $('#graphs').append(graph);
  });
});

$('#addTextarea').click(()=>{
  $('#timings').append('<textarea class="form-control" name="timing" style="height: 100px;"></textarea>');
});
