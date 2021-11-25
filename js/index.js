import * as lib from './lib.js';

var deribitAPI = new WebSocket('wss://www.deribit.com/ws/api/v2');
let CURRENCY = "BTC";
let instrumentName = "BTC-PERPETUAL";
let historySize = 50;
let allInstrument = lib.getAllInstrument(CURRENCY, false, deribitAPI)
lib.showInstruments(allInstrument);

deribitAPI.addEventListener("open", e => {
	subscribeInstrument(instrumentName);
	requestHeartBeat(300);
});

deribitAPI.addEventListener("message", e => {
	msg = JSON.parse(e.data);
	console.log(msg);

	let channel = msg.params.channel;
	let method = msg.method;

	if(method == "subscription"){
		if(channel.indexOf("trades") != -1){
			if(channel.indexOf(mainInstrument.name) != -1){
				tradeEvent(mainInstrument, msg);
			}
		}else if(channel.indexOf("book") != -1){
			if(channel.indexOf(mainInstrument.name) != -1){
				orderEvent(mainInstrument, msg);
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

//duration = second
requestHeartBeat = function(duration){
	let heartBeatReq =
	{
        "method": "public/set_heartbeat",
        "params": {
            "interval": duration
        },
        "jsonrpc": "2.0",
        "id": 2
    };
	
	deribitAPI.send(JSON.stringify(subscribeReq));
	console.warn(`send heatbeat request`);
}

subscribeInstrument = function(instrumentName){
	let mainInstrument;
	for(let i = 0; i < allInstrument.length; i++){
		if(allInstrument[i].name == instrumentName){
			mainInstrument = allInstrument[i];
		}
	}

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
}

function closeConnection() {
    deribitAPI.close(3000, "close button pushed");
}

window.onunload = function () {
    deribitAPI.close(1000, "window closed");
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
