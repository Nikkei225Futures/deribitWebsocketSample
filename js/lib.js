export class Trade {
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

export class HistoryList {
    constructor(size) {
        this.size = size;
        this.history = Array(this.size);
        for (let i = 0; i < this.history.length; i++) {
            this.history[i] = new Trade();
        }
    }

    addHistory = function (price, amount, timestamp, direction) {
        for (let i = this.size - 1; i > 0; i--) {
            this.history[i].setPrice(this.history[i-1].tradedPrice);
            this.history[i].setAmount(this.history[i-1].tradedAmount);
            this.history[i].tradedTime = this.history[i-1].tradedTime;
            this.history[i].direction = this.history[i-1].direction;
        }
        this.history[0].setPrice(price);
        this.history[0].setAmount(amount);
        this.history[0].setTime(timestamp);
        this.history[0].direction = direction;
    }

    clearHistory = function(){
        for(let i = 0; i < this.size; i++){
            this.history[i].tradedPrice = 0;
            this.history[i].tradedAmount = 0;
            this.history[i].tradedTime = 0;
            this.history[i].tradedDateTime = 0;
            this.history[i].direction = 0;
        }
    }
}

export class Order {
    constructor(price, qty) {
        this.price = price;
        this.qty = qty;
    }
}

export class OrderBook {
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

export class Greeks {
    constructor() {
        this.vega = 'nan';
        this.theta = 'nan';
        this.rho = 'nan';
        this.gamma = 'nan';
        this.delta = 'nan';
    }

    setGreeks = function (vega, theta, rho, gamma, delta) {
        this.vega = vega;
        this.theta = theta;
        this.rho = rho;
        this.gamma = gamma;
        this.delta = delta;
    }
}
export class Instrument {
    constructor(historySize) {
        this.orderBook = new OrderBook();
        this.tradeHistory = new HistoryList(historySize);
        this.bestAsk = this.orderBook.asks[0].price;
        this.bestBid = this.orderBook.bids[0].price;
        
        this.kind = '';
        this.name = '';         //name should like "BTC-21JUL30" when kind = futures, or "BTC-21JUL30-40000-C" when kind = options

        this.openInterest = 0;
        this.mininumTick = 0.05;
        
        //for options
        this.strike = 0;
        this.greeks = new Greeks();
        this.optionType = '';   //call or put
        
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

    //this func determine this.name, this.kind, this.strike, this.optionType;
    setName = function (name) {
        this.name = name;
        let splitNames = this.name.split('-');
        if (splitNames.length == 2) {
            this.kind = 'futures';
        } else if (splitNames.length == 4) {
            this.kind = 'options';
            this.strike = splitNames[2];
            
            //call or put
            if(splitNames[3] == "C"){
                this.optionType = "call";
            }else if(splitNames[3] == "P"){
                this.optionType = "put";
            }else{
                console.warn("invalid value in function Instrument.setName, optionType?");
            }

        } else {
            console.warn('invalid values in function Instrument.setName');
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

export class OptionBoard {
    constructor(size, name) {
        this.calls = Array(size);
        this.puts = Array(size);
        this.BoardName = name;
    }
}

export class ChartData{
    //data[0] is oldest, data[data.length-1] is latest
    constructor(resolution){
        this.opens = new Array();
        this.highs = new Array();
        this.lows = new Array();
        this.closes = new Array();
        
        //represented in timestamp-UNIX epoch, minimum flactation is 1sec
        this.ticks = new Array();    

        //timeScale of each candle, represented in min, exeption: 1day = "1D"   
        this.resolution = resolution;

    }

    getTradingViewData = function(){
        let candles = new Array(this.opens.length);
        let concatStr = "";
        for(let i = 0; i < this.opens.length; i++){
            candles[i] = `{ time: ${this.ticks[i]}, open: ${this.opens[i]}, high: ${this.highs[i]}, low: ${this.lows[i]}, close: ${this.closes[i]} },`;
            concatStr += candles[i];
        }
        return concatStr;
    }

    updateLatestOHLC = function(open, high, low, close){
        this.opens[this.opens.length-1] = open;
        this.highs[this.highs.length-1] = high;
        this.lows[this.lows.length-1] = low;
        this.closes[this.closes.length-1] = close;
    }

    addNextCandle = function(open, high, low, close){
        this.opens.push(open);
        this.highs.push(high);
        this.lows.push(low);
        this.closes.push(close);
        
        let nextTime;
        if(this.resolution == "1D"){
            nextTime = this.times[this.times.length-1] + 86400;
        }else{
            nextTime = this.times[this.times.length-1] + this.resolution * 60;
        }
        this.times.push(nextTime);
    }

    showCurrentChart = function(candleseries){
        candleSeries.setData(this.getTradingViewData());
    }

}

export function getAllInstrument(currency, expired){
    let response = throwRestApiReq(`https://www.deribit.com/api/v2/public/get_instruments?currency=${currency}&expired=${expired}`, 1500);
    response = JSON.parse(response);
    console.log(response);
    let data = response.result;
    let allInstruments = Array(data.length);
    
    let initHistorySize = 3000;

    for(let i = 0; i < data.length; i++){
        allInstruments[i] = new Instrument(initHistorySize);
        allInstruments[i].setName(data[i].instrument_name);
        allInstruments[i].mininumTick = data[i].tick_size;
    }

    return allInstruments;

}

export function throwRestApiReq(uri, waitMilSec){
    var request = new XMLHttpRequest();
    request.open('GET', uri, false);    //wait until api server response, synchronous 
    request.send(null);

    let data;
    if(request.status == 200){
        data = request.response;
    }else{
        console.log("error HTTP status");
    }

    busySleep(waitMilSec);
    return data;
}

export function busySleep(milSec){
    const start = new Date();
    while(new Date() - start < milSec);
}

export function showInstruments(allInstrument){
    let instrumentsFutures = Array();
    let instrumentsOptions = Array();
    
    for(let i = 0; i < allInstrument.length; i++){
        if(allInstrument[i].kind == "options"){
            console.log(allInstrument[i]);
            instrumentsOptions.push(allInstrument[i]);
        }else{
            console.warn(allInstrument[i]);
            instrumentsFutures.push(allInstrument[i]);
        }
    }

    let instrumentsArea = document.getElementById("instruments-wrapper");
    let futuresDivs = Array(instrumentsFutures.length);

    for(let i = 0; i < instrumentsFutures.length; i++){
        futuresDivs[i] = document.createElement("div");
        futuresDivs[i].id = instrumentsFutures[i].name;
        futuresDivs[i].innerHTML = instrumentsFutures[i].name;

        let optionsDivs = Array();
        for(let j = 0; j < instrumentsOptions.length; j++){
            if(instrumentsOptions[j].name.indexOf(futuresDivs[i].id) != -1){
                optionsDivs.push("");
                optionsDivs[optionsDivs.length-1] = document.createElement("div");
                optionsDivs[optionsDivs.length-1].id = instrumentsOptions[j].name;
                optionsDivs[optionsDivs.length-1].innerHTML = instrumentsOptions[j].name;
            }
        }

        let strikes = Array(optionsDivs.length);
        for(let j = 0; j < optionsDivs.length; j++){
            let splitedName = optionsDivs[j].id.split("-");
            strikes[j] = Number(splitedName[2]);
        }

        console.time();
        //sort by strike price
        let swapCounter = 0;
        do{
            swapCounter = 0;
            for(let j = 0; j < optionsDivs.length-1; j++){
                if(strikes[j] > strikes[j+1]){
                    let tmp = strikes[j];
                    strikes[j] = strikes[j+1];
                    strikes[j+1] = tmp;
                    tmp = optionsDivs[j]
                    optionsDivs[j] = optionsDivs[j+1];
                    optionsDivs[j+1] = tmp;
                    swapCounter++;
                }
            }
        }while(swapCounter != 0);
        console.timeEnd();

        for(let j = 0; j < optionsDivs.length; j++){
            futuresDivs[i].appendChild(optionsDivs[j]);
        }
        

    }
    for(let i = 0; i < instrumentsFutures.length; i++){
        instrumentsArea.appendChild(futuresDivs[i]);
    }
}
