class HistoryList {
    constructor(size) {
        this.size = size;
        this.list = Array(size);
        for(var i = 0; i < this.list.length; i++){
            this.list[i] = "";
        }
    }

    addHistory = function (price) {
        if (price != this.list[0]) {
            for (var i = this.size - 1; i > 0; i--) {
                this.list[i] = this.list[i - 1];
            }
            this.list[0] = price;
        }
    }
}

var socket = new WebSocket('wss://ws.lightstream.bitflyer.com/json-rpc');
var numLtps = 100;
const history = new HistoryList(numLtps);

socket.addEventListener('open', function (e) {
    console.log('Socket connection opened.');
    socket.send('{"method": "subscribe","params": {"channel": "lightning_ticker_FX_BTC_JPY" }}');
    drawLayout();
});

function drawLayout() {
    // adjust ltps size
    var strHeight = document.getElementById("bestAskPrice").clientHeight;
    var thHeight = document.getElementById("historyTitle").clientHeight;

    var sideWrapperHeight = document.getElementById("side-wrapper").clientHeight;
    var orderBookHeight = document.getElementById("orderBooks").clientHeight;
    var historyHeight = sideWrapperHeight - orderBookHeight;
    var targetHeight = historyHeight - thHeight;
    var numHistories = targetHeight / strHeight;

    var ltpCols = document.createElement("tr");
    var ltpElem = document.createElement("td");
    ltpElem.setAttribute("class", "ltps");
    ltpCols.appendChild(ltpElem);

    var parentElem = document.getElementById("historyTable");
    var after = document.getElementById("historyTitle");

    var instanceLtps = document.getElementsByClassName("ltps").length;
    if (instanceLtps < numHistories && strHeight >= 10) {
        parentElem.appendChild(ltpCols);
    }
    
}

socket.addEventListener('message', function (e) {
    var wholeData = JSON.parse(e.data).params.message;
    console.log(JSON.parse(e.data));
    console.log(wholeData);

    draw(wholeData);
});

function draw(wholeData) {
    canvas.width = window.innerWidth * 0.8;        //whole canvas width
    canvas.height = window.innerHeight * 0.6;      //whole canvas height

    drawLayout();
    drawOrderBook(wholeData);
    drawLtps(wholeData);
    //getMarketData();
    //drawHistricalChart();
    //drawCurrentCandle();
}

function drawOrderBook(wholeData) {
    var bestAskPrice = wholeData.best_ask;
    var bestAskSize = wholeData.best_ask_size;
    var bestBidPrice = wholeData.best_bid;
    var bestBidSize = wholeData.best_bid_size;
    var spread = bestAskPrice - bestBidPrice;

    var target = document.getElementById('bestAskPrice');
    target.innerText = bestAskPrice;

    target = document.getElementById('bestAskSize');
    target.innerText = bestAskSize;

    target = document.getElementById('bestBidPrice');
    target.innerText = bestBidPrice;

    target = document.getElementById('bestBidSize');
    target.innerText = bestBidSize;

    target = document.getElementById('spread');
    target.innerText = "spr: " + spread;
}

function drawLtps(wholeData) {
    history.addHistory(wholeData.ltp);      // add history
    var target = document.getElementsByClassName("ltps");
    for (i = 0; i < history.size; i++) {
        if(target[i] != undefined){
            target[i].innerHTML = history.list[i];
        }
    }
    for(i = 0; i < history.size-1; i++){
        if(target[i] != undefined){
            if(history.list[i] > history.list[i+1]){
                target[i].setAttribute('style', 'color:#00afcc;');
            }else{
                target[i].setAttribute('style', 'color:#ea5550;');
            }
        }
    }
}

/* close, error*/ 
socket.addEventListener('error', function (event) {
    console.log('WebSocket error: ', event);
});

function closeConnection() {
    socket.send('{"method": "unsubscribe","params": {"channel": "lightning_ticker_FX_BTC_JPY" }}');
    socket.close(1000);
}

window.onunload = function () {
    closeConnection();
}