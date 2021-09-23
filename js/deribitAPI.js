let instrumentName = "BTC-PERPETUAL";
class Trade {
    constructor() {
        this.tradedPrice = 0;
        this.tradedAmount = 0;
        this.tradedDateTime = 0;
        this.tradedTime = 0;
        this.direction = 'none';
    }

    setPrice = function (tradedPrice) {
        this.tradedPrice = tradedPrice;
    }

    setAmount = function (tradedAmount) {
        this.tradedAmount = tradedAmount;
    }

    setTime = function (timeStamp) {
        let data = new Date(timeStamp);
        let month = data.getMonth() + 1;
        let date = data.getDate();
        let hour = data.getHours();
        let minute = data.getMinutes();
        let second = data.getSeconds();
        this.tradedDateTime = `${month}/${date} ${hour}:${minute}:${second}`;
        this.tradedTime  = `${hour}:${minute}:${second}`;
    }
}

class HistoryList {
    constructor(size) {
        this.size = size;
        this.history = Array(this.size);
        for (let i = 0; i < this.history.length; i++) {
            this.history[i] = new Trade();
        }
    }

    addHistory = function (price, amount, timestamp, direction) {
        for (let i = this.size - 1; i > 0; i--) {
            this.history[i].setPrice(this.history[i - 1].tradedPrice);
            this.history[i].setAmount(this.history[i - 1].tradedAmount);
            this.history[i].tradedTime = this.history[i-1].tradedTime;
            this.history[i].direction = this.history[i-1].direction;
        }
        this.history[0].setPrice(price);
        this.history[0].setAmount(amount);
        this.history[0].setTime(timestamp);
        this.history[0].direction = direction;
    }
}

class Order {
    constructor(price, qty) {
        this.price = price;
        this.qty = qty;
    }
}

class OrderBook {
    constructor() {
        this.initSize = 2000;   //number of orders per side
        //bid, ask = asec order
        this.bids = Array(this.initSize);
        this.asks = Array(this.initSize);
        for(let i = 0; i < this.initSize; i++){
            this.bids[i] = new Order(0, 0);
            this.asks[i] = new Order(0, 0);
        }
    }
    
    /* setSnapShot should be called first time 
    of receive the message about orderbook. */
    //initialize status of current orderbook
    setSnapshot = function(asks, bids){
        for(let i = 0; i < this.initSize; i++){
            if(i < asks.length){
                this.asks[i].price = asks[i][1];
                this.asks[i].qty = asks[i][2];    
            }
            if(i < bids.length){
                this.bids[i].price = bids[i][1];
                this.bids[i].qty = bids[i][2];
            }
        }
    }

    deleteBid = function(price){
        for(let i = 0; i < this.bids.length; i++){
            if(price == this.bids[i].price){
                this.bids.splice(i, 1);
            }
        }
    }
    deleteAsk = function(price){
        for(let i = 0; i < this.asks.length; i++){
            if(price == this.asks[i].price){
                this.asks.splice(i, 1);
            }
        }
    }

    changeBidQty = function(price, qty){
        for(let i = 0; i < this.bids.length; i++){
            if(price == this.bids[i].price){
                this.bids[i].qty = qty;
            }
        }
    }
    changeAskQty = function(price, qty){
        for(let i = 0; i < this.asks.length; i++){
            if(price == this.asks[i].price){
                this.asks[i].qty = qty;
            }
        }
    }

    insertNewBid = function(price, qty){
        for(let i = 0; i < this.bids.length; i++){
            if(price > this.bids[i].price){
                let temp = new Order(price, qty);
                this.bids.splice(i, 0, temp);
                break;
            }        
        }
    }
    insertNewAsk = function(price, qty){
        for(let i = 0; i < this.asks.length; i++){
            if(price < this.asks[i].price){
                let temp = new Order(price, qty);
                this.asks.splice(i, 0, temp);
                break;
            }        
        }
    }
}

class Greeks {
    constructor() {
        this.vega = 'nan';
        this.theta = 'nan';
        this.rho = 'nan';
        this.gamma = 'nan';
        this.delta = 'nan';
    }

    setGreeks = function (vega, theta, rho, gamma, delta) {
        this, vega = vega;
        this.theta = theta;
        this.rho = rho;
        this.gamma = gamma;
        this.delta = delta;
    }
}

class Instrument {
    constructor(historySize) {
        this.orderBook = new OrderBook();
        this.tradeHistory = new HistoryList(historySize);
        //this.lastPrice = this.tradeHistory.list[0];
        this.kind = '';
        this.strike = '';
        this.name = '';         //name should like "BTC-21JUL30" when kind = futures, or "BTC-21JUL30-40000-C" when kind = options
        this.bestAsk = this.orderBook.asks[0].price;
        this.bestBid = this.orderBook.bids[0].price;
        this.openInterest = 0;
        this.greeks = new Greeks();
    }

    updateOrderLv1 = function(){
        this.bestAsk = this.orderBook.asks[0].price;
        this.bestBid = this.orderBook.bids[0].price;
    }

    setLastPrice = function (lastPrice) {
        this.lastPrice = lastPrice;
    }

    setGreeks = function (vega, theta, rho, gamma, delta) {
        if (this.kind == 'futures') {
            console.warn(`the instrument(${this.name}) kind is futures, futures does not have greeks`);
        } else {
            this.greeks.setGreeks(vega, theta, rho, gamma, delta);
        }
    }

    setOpenInterest = function (openInterest) {
        this.openInterest = openInterest;
    }

    setName = function (name) {
        this.name = name;
        let splitNames = this.name.split('-');
        if (splitNames.length == 2) {
            this.kind = 'futures';
        } else if (splitNames.length == 4) {
            this.kind = 'options';
            this.strike = splitNames[2];
        } else {
            console.warn('invalid values in function Instrument.setName');
        }

        if (this.kind == 'options') {
            this.strike = string[2];
        }
    }

    updateOrderBook = function (price, size, side) {
        if (side == 'bid') {
            this.orderBook.updateBids(price, size);
        } else if (side == 'ask') {
            this.orderBook.updateAsks(price, size);
        } else {
            console.warn('invalid value in Instrument.updateOrderBook(), error: size');
        }

    }

}

class OptionBoard {
    constructor(size, name) {
        this.calls = Array(size);
        this.puts = Array(size);
        this.BoardName = name;
    }
}

/*-------------------------------------------------------------*/
/*-------------------------------------------------------------*/
/*-------------------------------------------------------------*/
/*-------------------------------------------------------------*/

var deribitAPI = new WebSocket('wss://www.deribit.com/ws/api/v2');

deribitAPI.addEventListener('open', function (e) {
    let request =
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

    //heartbeat interval is represented in second
    let heartBeat =
    {
        "method": "public/set_heartbeat",
        "params": {
            "interval": 300
        },
        "jsonrpc": "2.0",
        "id": 2
    };

    let historySize = 50;
    BTC_PERPETUAL = new Instrument(historySize);

    console.log('request:' + request);
    deribitAPI.send(JSON.stringify(request));
    console.log('socket connection with deribit opened');
    deribitAPI.send(JSON.stringify(heartBeat));
    console.log('set heartbeat, interval = 300sec = 5min');
    
    let currentTime = new Date();
    console.warn(`opened on: ${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}`);
});

deribitAPI.addEventListener('message', function (e) {
    msg = JSON.parse(e.data);
    //console.log(msg);
    //drawLayout();
    let channel = msg.params.channel;
    let method = msg.method;

    if(method == 'subscription'){
        if (channel.indexOf('trades') !== -1){
            if (channel.indexOf(instrumentName) !== -1) {
                addHistory(BTC_PERPETUAL, msg);
            }
        }else if (channel.indexOf('book') !== -1){
            if(channel.indexOf(instrumentName) !== -1){
                orderEvent(BTC_PERPETUAL, msg);
            }
        }
    }else if(method == 'heartbeat'){
        responseHeartbeat();
    }

});

deribitAPI.addEventListener('error', function (e) {
    console.warn('websocket error, connection with deribit: ', e);
});

deribitAPI.addEventListener('close', function (e) {
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


    /*
    while(deribitAPI.readyState != 1){
        let waitMilSec = 10000;
        console.warn('waiting ' + waitMilSec);
        sleep(waitMilSec);
        openConnection();
    }
    */
});


function addHistory(instrument, msg) {
    let data = msg.params.data;
    for (let i = 0; i < data.length; i++) {
        let price = data[i].price;
        let amount = data[i].amount;
        let timeStamp = data[i].timestamp;
        let direction = data[i].direction;
        instrument.tradeHistory.addHistory(price, amount, timeStamp, direction);
    }
    
    let tradedPriceCells = document.getElementsByClassName("tradedPrice");
    let tradedAmountCells = document.getElementsByClassName("tradedAmount");
    let tradedTimeCells = document.getElementsByClassName("tradedTime");
    let parentNodes = document.getElementsByClassName("ltps");
    for(let i = 0; i < tradedPriceCells.length; i++){
        let history = instrument.tradeHistory.history[i];
        let tradedPrice = history.tradedPrice;
        let tradedAmount = history.tradedAmount;
        let tradedTime = history.tradedTime;
        tradedPriceCells[i].innerHTML = tradedPrice;
        tradedAmountCells[i].innerHTML = tradedAmount;
        tradedTimeCells[i].innerHTML = tradedTime;
        if(history.direction == 'buy'){
            parentNodes[i].style.color = "lightskyblue";
        }else if(history.direction == "sell"){
            parentNodes[i].style.color = "salmon";
        }
    }

    /*
    for (let i = 0; i < instrument.tradeHistory.size; i++) {
        let history = instrument.tradeHistory.history[i];
        let tradedPrice = history.tradedPrice;
        let tradedAmount = history.tradedAmount;
        let tradedTime = history.tradedTime;
        console.log(`${tradedPrice} x ${tradedAmount}, ${tradedTime}`);
    }
    */
}

function orderEvent(instrument, msg){
    //console.log(msg);
    let data = msg.params.data;
    let bids = data.bids;
    let asks = data.asks;
    let type = data.type;

    if(type == 'snapshot'){
        instrument.orderBook.setSnapshot(asks, bids);
    }else if(type == 'change'){
        for(let i = 0; i < bids.length; i++){
            let orderType = bids[i][0];
            let price = bids[i][1];
            let qty = bids[i][2];
            if(orderType == 'new'){
                instrument.orderBook.insertNewBid(price, qty);
            }else if(orderType == 'delete'){
                instrument.orderBook.deleteBid(price);
            }else if(orderType == 'change'){
                instrument.orderBook.changeBidQty(price, qty)
            }
        }
    
        for(let i = 0; i < asks.length; i++){
            let orderType = asks[i][0];
            let price = asks[i][1];
            let qty = asks[i][2];
            if(orderType == 'new'){
                instrument.orderBook.insertNewAsk(price, qty);
            }else if(orderType == 'delete'){
                instrument.orderBook.deleteAsk(price);
            }else if(orderType == 'change'){
                instrument.orderBook.changeAskQty(price, qty)
            }    
        }
    }

    instrument.updateOrderLv1();

    let askPrices = document.getElementsByClassName('askPrice');
    let askQtys = document.getElementsByClassName('askQty');
    let bidPrices = document.getElementsByClassName('bidPrice');
    let bidQtys = document.getElementsByClassName('bidQty');
    let spreadCell = document.getElementById('spread');

    for(let i = askPrices.length-1, j = 0; i >= 0; i--, j++){
        askPrices[j].innerHTML = instrument.orderBook.asks[i].price;
        askQtys[j].innerHTML = instrument.orderBook.asks[i].qty;
    }

    for(let i = 0; i < bidPrices.length; i++){
        bidPrices[i].innerHTML = instrument.orderBook.bids[i].price;
        bidQtys[i].innerHTML = instrument.orderBook.bids[i].qty;    
    }

    spreadCell.innerHTML = instrument.bestAsk - instrument.bestBid;
    
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

/*
function drawLayout(){
    //adjust number of rows of ltps
    let sideWrapperHeight = document.getElementById("side-wrapper").clientHeight;
    let orderBookHeight = document.getElementById("orderBook-wrapper").clientHeight;
    orderBookHeight += 20;  //height of "Trade History"
    let historyHeight = sideWrapperHeight - orderBookHeight;
    let refStrHeight = document.getElementsByClassName("tradedPrice")[0].clientHeight;
    let numDisplayRows = historyHeight/refStrHeight;
    let ltpRow = document.getElementsByClassName("ltps")[0];
    let parentNode = document.getElementById("history-wrapper");
    let instanceLtps = document.getElementsByClassName("ltps").length;
    console.log(ltpRow);
    console.log('historyHeight = ' + historyHeight);
    console.log('refStrHeight = ' + refStrHeight);
    console.log('numDisplayRows = ' + numDisplayRows);
    console.log('instanceLtps = ' + instanceLtps);

    if(instanceLtps < numDisplayRows-1){

        let wholeTr = document.createElement("tr");
        wholeTr.setAttribute("class", "ltps");
        let priceTd = document.createElement("td");
        priceTd.setAttribute("class", "tradedPrice");
        let amountTd = document.createElement("td");
        amountTd.setAttribute("class", "tradedAmount");
        let timeTd = document.createElement("td");
        timeTd.setAttribute("class", "tradedTime");

        wholeTr.appendChild(priceTd);
        wholeTr.appendChild(amountTd);
        wholeTr.appendChild(timeTd);

        parentNode.appendChild(wholeTr);
    }
}*/

function closeConnection() {
    deribitAPI.close(3000);
}

window.onunload = function () {
    deribitAPI.close(1000);
}

function sleep(waitMilSec) {
    let start = new Date();
    while (new Date() - start < waitMilSec);
}