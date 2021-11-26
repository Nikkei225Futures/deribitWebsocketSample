import * as lib from './lib.js';

var deribitAPI = new WebSocket('wss://www.deribit.com/ws/api/v2');
let CURRENCY = "BTC";
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
        changeInstrument(instrumentDivs[i].id);
        e.stopPropagation();
    });
}

deribitAPI.addEventListener("open", e => {
	subscribeInstrument(initInstrumentName);
	requestHeartBeat(300);
});

deribitAPI.addEventListener("message", function (e) {
	let msg = JSON.parse(e.data);
	console.log(msg);

	let channel = msg.params.channel;
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

deribitAPI.addEventListener("error", e => {
	console.error("websocket error");
});

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

function subscribeInstrument(instrumentName){
	let subscribeReq =
    {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "public/subscribe",
        "params": {
            "channels": [
                "book." + instrumentName + ".raw",
                "trades." + instrumentName + ".raw"
            ]
        }
	};

	deribitAPI.send(JSON.stringify(subscribeReq));
	console.warn(`send subscrbe request ${mainInstrument.name}`);
    
    let endTime = Date.now() + 60000;
    let msg = lib.getChartData(instrumentName, 0, endTime, mainInstrument.chartData.resolution);
    lib.initChart(mainInstrument, msg, candleSeries);
}

function changeInstrument(instrumentName){
    if(instrumentName == mainInstrument.name){
        console.warn("the request of subscribe is same as current subscription");
        return false;
    }
    unsubscribeAll();
    mainInstrument = getCurrentMainInstrument(instrumentName);
    mainInstrument.tradeHistory.clearHistory();
    mainInstrument.orderBook.clearOrderBook();
    lib.showCurrentHistory(mainInstrument);
    lib.showCurrentInstrumentName(mainInstrument.name);

    subscribeInstrument(instrumentName);
}

window.onunload = function () {
    deribitAPI.close(1000, "window closed");
}

function getCurrentMainInstrument(instrumentName){
    let instrument;
    for(let i = 0; i < allInstrument.length; i++){
		if(allInstrument[i].name === instrumentName){
			instrument = allInstrument[i];
		}
	}
    return instrument;
}

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
});

var candleSeries = chart.addCandlestickSeries({
  upColor: '#87cefa',
  downColor: '#fa8072',
  borderDownColor: '#fa8072',
  borderUpColor: '#87cefa',
  wickDownColor: '#fa8072',
  wickUpColor: '#87cefa',
});

