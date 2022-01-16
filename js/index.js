/**
 * @file index javascript file
 */
import * as lib from './lib.js';

var deribitAPI = new WebSocket('wss://www.deribit.com/ws/api/v2');
let initInstrumentName = "BTC-PERPETUAL";
let mainInstrument;
let btcInstrument = lib.getAllInstrument("BTC", false);
let ethInstrument = lib.getAllInstrument("ETH", false);
let allInstrument = btcInstrument.concat(ethInstrument);
lib.showInstruments(allInstrument);
let instrumentDivs = document.getElementsByClassName("instrument");
mainInstrument =  getCurrentMainInstrument(initInstrumentName);

//click event on instrument list
for(let i = 0; i < instrumentDivs.length; i++){
    instrumentDivs[i].addEventListener("click", e => {
        changeInstrument(instrumentDivs[i].id, false);
        e.stopPropagation();
    });
}

//click event on chartResolution-selector
let resolutionSelectors = document.getElementsByClassName("resolution");
for(let i = 0; i < resolutionSelectors.length; i++){
    resolutionSelectors[i].addEventListener("click", e => {
        changeInstrument(mainInstrument.name, resolutionSelectors[i].id);
        e.stopPropagation();
    });
}

//resize event, resize chart size
window.addEventListener("resize", () => {
    chart.resize(chartArea.offsetWidth-2, chartArea.offsetHeight-2);
}, false);

/**
 * event listener, subscribe BTC-PERPETUAL/throw request of heartbeat
 * @listens Websocket.open - when open event with deribit api
 */
deribitAPI.addEventListener("open", e => {
	subscribeInstrument(initInstrumentName);
	requestHeartBeat(300);
});

/**
 * event listerner, exe some func by type of message(order, trade, heartbeat)
 * @listens Websocket.message - when message arrived from deribit api
 */
deribitAPI.addEventListener("message", function (e) {
	let msg = JSON.parse(e.data);
	console.log(msg);

	let channel;
    if(JSON.stringify(msg).indexOf("channel") != -1){
        channel = msg.params.channel;
    }
    
	let method = msg.method;

	if(method == "subscription"){
		if(channel.indexOf("trades") != -1){
			if(channel.indexOf(mainInstrument.name) != -1){
				lib.tradeEvent(mainInstrument, msg, candleSeries);
			}
		}else if(channel.indexOf("book") != -1){
			if(channel.indexOf(mainInstrument.name) != -1){
				lib.orderEvent(mainInstrument, msg);
			}
		}
	}else if(method == "heartbeat"){
		responseHeartbeat();
	}
});

/**
 * event listener, display error msg on console
 * @listens Websocket.error - when websocket error
 */
deribitAPI.addEventListener("error", e => {
	console.error("websocket error");
});

/**
 * event listener, close connection with deribit api
 * @listens Websocket.close - when websocket closed
 */
deribitAPI.addEventListener("close", e => {
	if (window.navigator.onLine) {
        console.warn('websocket, lost connection to wss://www.deribit.com/ws/api/v2: ', e);
    } else {
        console.warn('websocket, lost connection to wss://www.deribit.com/ws/api/v2 due to network problem: ', e);
    }

    let currentTime = new Date();
    console.warn(`closed on: ${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}`);
    
    if(e.code == 1006){
        console.warn('reload page');
        location.reload();
    }

});

/**
 * request heartbeat msg
 * @param {int} duration - duration of heartbeat message
 * @function
 */
//duration = second
function requestHeartBeat(duration){
	let heartBeatReq =
	{
        "method": "public/set_heartbeat",
        "params": {
            "interval": duration
        },
        "jsonrpc": "2.0",
        "id": 2
    };
	
	deribitAPI.send(JSON.stringify(heartBeatReq));
	console.warn(`send heatbeat request`);
}

/**
 * response against heatbeat msg
 * @function
 */
function responseHeartbeat(){
    console.warn('heartbeat signal received');
    let response = 
    {
        "method": "public/test",
        "params": {},
        "jsonrpc": "2.0",
        "id": 111
    };
    deribitAPI.send(JSON.stringify(response));
    console.warn('sent response against heartbeat');
}

/**
 * subscribe instrument book, trades msg
 * @function
 * @param {string} instrumentName 
 */
function subscribeInstrument(instrumentName){
	let subscribeReq =
    {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "public/subscribe",
        "params": {
            "channels": [
                "book." + instrumentName + ".100ms",
                "trades." + instrumentName + ".100ms"
            ]
        }
	};

	deribitAPI.send(JSON.stringify(subscribeReq));
	console.warn(`send subscrbe request ${mainInstrument.name}`);
    
    let endTime = Date.now() + 60000;
    let msg = lib.getChartData(instrumentName, 0, endTime, mainInstrument.chartData.resolution);
    lib.updateChartPrecision(mainInstrument, candleSeries);
    lib.initChart(mainInstrument, msg, candleSeries);
}

/**
 * change instrument to subscribe
 * @funciton
 * @param {string} instrumentName - name of instrument 
 * @param {int | string} chartResolution - resolution of chart, <br>1,3,5,10,15,30,60(1H),120(2H),180(3H),360(6H),720(12H),"1D" is allowed
 * @returns {boolean} - if request of subscription is same as current subscription, return false
 */
function changeInstrument(instrumentName, chartResolution){
    if(instrumentName == mainInstrument.name && chartResolution == false){
        console.warn("the request of subscribe is same as current subscription");
        return false;
    }
    unsubscribeAll();
    let prevChartResolution = mainInstrument.chartData.resolution;

    mainInstrument = getCurrentMainInstrument(instrumentName);

    if(chartResolution != false){
        mainInstrument.chartData.resolution = chartResolution;
    }else{
        mainInstrument.chartData.resolution = prevChartResolution;
    }
    mainInstrument.tradeHistory.clearHistory();
    mainInstrument.orderBook.clearOrderBook();
    mainInstrument.chartData.clearData();
    lib.showCurrentHistory(mainInstrument);
    lib.showCurrentInstrumentName(mainInstrument.name);
    lib.changeChartWatermark(mainInstrument.name, mainInstrument.chartData.resolution, chart);

    subscribeInstrument(instrumentName);
}

/**
 * when window closed, close connection to deribit
 * @listens window.onunload - when window, tab closed
 */
window.onunload = function () {
    deribitAPI.close(1000, "window closed");
}

/**
 * search and return Instrument object which is matched to argument
 * @function
 * @param {string} instrumentName - name of instrument to get 
 * @returns {Instrument} - Instrument object which is matched to argument
 */
function getCurrentMainInstrument(instrumentName){
    let instrument;
    for(let i = 0; i < allInstrument.length; i++){
		if(allInstrument[i].name === instrumentName){
			instrument = allInstrument[i];
		}
	}
    return instrument;
}

/**
 * unsubscribe all subscriptions
 * @function
 */
function unsubscribeAll(){
    let unsubscribeReq =
    {
        "jsonrpc": "2.0",
        "id": 12,
        "method": "public/unsubscribe_all",
        "params": {
        }
    };
    deribitAPI.send(JSON.stringify(unsubscribeReq));
    console.warn("send unsubscribe request");
}


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
		timeVisible: true,
        secondsVisible: false,
	},
    localization: {
        locale: 'ja-JP',
    },
    watermark: {
        color: 'rgba(255, 255, 255, 0.1)',
        visible: true,
        text: initInstrumentName + ", 5m",
        fontSize: 70,
        horzAlign: 'center',
        vertAlign: 'center',
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

