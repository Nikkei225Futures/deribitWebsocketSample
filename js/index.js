import * as lib from './lib.js';

var deribitAPI = new WebSocket('wss://www.deribit.com/ws/api/v2');
let CURRENCY = "BTC";

lib.showInstruments(lib.getAllInstrument(CURRENCY, false, deribitAPI));



/*============================================================================================*/
/*============================================================================================*/
/*============================================CHART===========================================*/
/*============================================================================================*/
/*============================================================================================*/

let chartArea = document.getElementById("chart");

var chart = LightweightCharts.createChart(document.getElementById("chart"), {
	width: chartArea.offsetWidth - 2,
    height: chartArea.offsetHeight - 2,
	layout: {
		backgroundColor: '#131722',
		textColor: 'rgba(255, 255, 255, 0.9)',
	},
	grid: {
		vertLines: {
			color: 'rgba(197, 203, 206, 0)',
		},
		horzLines: {
			color: 'rgba(197, 203, 206, 0)',
		},
	},
	crosshair: {
		mode: LightweightCharts.CrosshairMode.Normal,
	},
	rightPriceScale: {
		borderColor: 'rgba(197, 203, 206, 0.8)',
	},
	timeScale: {
		borderColor: 'rgba(197, 203, 206, 0.8)',
	},
    timeScale: {
        timeVisible: true,
    },
});

var candleSeries = chart.addCandlestickSeries({
  upColor: '#87cefa',
  downColor: '#fa8072',
  borderDownColor: '#fa8072',
  borderUpColor: '#87cefa',
  wickDownColor: '#fa8072',
  wickUpColor: '#87cefa',
});

candleSeries.setData([
	{ time: 1636242480, open: 180.34, high: 180.99, low: 178.57, close: 179.85 },
	{ time: 1636242481, open: 180.82, high: 181.40, low: 177.56, close: 178.75 },
	{ time: 1636242482, open: 175.77, high: 179.49, low: 175.44, close: 178.53 },
	{ time: 1636242483, open: 178.58, high: 182.37, low: 176.31, close: 176.97 },
	{ time: 1636242484, open: 177.52, high: 180.50, low: 176.83, close: 179.07 },
	{ time: 1636242485, open: 176.88, high: 177.34, low: 170.91, close: 172.23 },
	{ time: 1636242486, open: 173.74, high: 175.99, low: 170.95, close: 173.20 },
	{ time: 1636242487, open: 173.16, high: 176.43, low: 172.64, close: 176.24 },
	{ time: 1636242488, open: 177.98, high: 178.85, low: 175.59, close: 175.88 },
	{ time: 1636242489, open: 176.84, high: 180.86, low: 175.90, close: 180.46 }
]);
