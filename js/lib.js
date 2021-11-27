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

    initAllValue = function(){
        this.tradedPrice = 0;
        this.tradedAmount = 0;
        this.tradedDateTime = 0;
        this.tradedTime = 0;
        this.direction = "none";
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
            this.history[i].initAllValue();
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
    
    clearOrderBook = function(){
        for(let i = 0; i < this.bids.length; i++){
            this.bids[i].price = 0;
            this.bids[i].qty = 0;
        }        
        for(let i = 0; i < this.asks.length; i++){
            this.asks[i].price = 0;
            this.asks[i].qty = 0;
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
        this.chartData = new ChartData(1);  //time resolution in the chart
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

    clearData = function(){        
        this.opens = new Array();
        this.highs = new Array();
        this.lows = new Array();
        this.closes = new Array();
        this.ticks = new Array();    
    }

    getTradingViewData = function(){
        let candles = new Array(this.opens.length);
        for(let i = 0; i < this.opens.length; i++){
            let candle ={
                time: this.ticks[i],
                open: this.opens[i],
                high: this.highs[i],
                low: this.lows[i],
                close: this.closes[i]
            };
            candles[i] = candle;
        }
        return candles;
    }

    setNewChartData = function(opens, highs, lows, closes, ticks){
        for(let i = 0; i < opens.length; i++){
            this.opens.push(opens[i]);
            this.highs.push(highs[i]);
            this.lows.push(lows[i]);
            this.closes.push(closes[i]);
            this.ticks.push(ticks[i]);
        }
    }

    showCurrentChart = function(candleSeries){
        let data = this.getTradingViewData();
        candleSeries.setData(data);
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

export function initChart(instrument, msg, candleSeries){
    console.warn("chart event");
    console.warn(msg);
    let opens = msg.result.open;
    let highs = msg.result.high;
    let lows = msg.result.low;
    let closes = msg.result.close;
    let ticks = msg.result.ticks;

    //adjust, milsec -> sec
    for(let i = 0; i < ticks.length; i++){
        ticks[i] = ticks[i]/1000;
    }

    instrument.chartData.setNewChartData(opens, highs, lows, closes, ticks);
    instrument.chartData.showCurrentChart(candleSeries);
}

export function getChartData(instrumentName, start, end, resolution){
    let response = throwRestApiReq(`https://www.deribit.com/api/v2/public/get_tradingview_chart_data?end_timestamp=${end}&instrument_name=${instrumentName}&resolution=${resolution}&start_timestamp=${start}`, 0);
    response = JSON.parse(response);
    console.warn(response);
    return response;
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
        futuresDivs[i].setAttribute("class", "instrument");
        futuresDivs[i].innerHTML = instrumentsFutures[i].name;
        //futuresDivs[i].setAttribute("onclick", `lib.changeInstrument("${instrumentsFutures[i].name}")`);

        let optionsDivs = Array();
        for(let j = 0; j < instrumentsOptions.length; j++){
            if(instrumentsOptions[j].name.indexOf(futuresDivs[i].id) != -1){
                optionsDivs.push("");
                optionsDivs[optionsDivs.length-1] = document.createElement("div");
                optionsDivs[optionsDivs.length-1].id = instrumentsOptions[j].name;
                optionsDivs[optionsDivs.length-1].setAttribute("class", "instrument");
                optionsDivs[optionsDivs.length-1].innerHTML = instrumentsOptions[j].name;
                //optionsDivs[optionsDivs.length-1].setAttribute("onclick", `changeInstrument("${instrumentsOptions[j].name}")`);
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


export function tradeEvent(mainInstrument, msg, candleSeries){
	addHistory(mainInstrument, msg);
    addTradeData(mainInstrument, msg, candleSeries);
}

function addTradeData(instrument, msg, candleSeries){
    let lastTrade = msg.params.data[msg.params.data.length-1];
    let tradedPrice = lastTrade.price;

    let li = instrument.chartData.ticks.length-1;   //last index
    let nextTime;
    if(instrument.chartData.resolution == "1D"){
        nextTime = instrument.chartData.ticks[li] + 86400;
    }else{
        nextTime = instrument.chartData.ticks[li] + instrument.chartData.resolution*60;
    }

    //if the current time > nextTick time, add candlestick, else update data
    if(Date.now()/1000 > nextTime){
        instrument.chartData.opens.push(tradedPrice);
        instrument.chartData.highs.push(tradedPrice);
        instrument.chartData.lows.push(tradedPrice);
        instrument.chartData.closes.push(tradedPrice);
        instrument.chartData.ticks.push(nextTime);
    }else{
        instrument.chartData.closes[li] = tradedPrice;
        if(tradedPrice > instrument.chartData.highs[li]){
            instrument.chartData.highs[li] = tradedPrice;
        }else if(tradedPrice < instrument.chartData.lows[li]){
            instrument.chartData.lows[li] = tradedPrice;
        }
    }
    instrument.chartData.showCurrentChart(candleSeries);
}


function addHistory(instrument, msg) {
    let data = msg.params.data;
    for (let i = 0; i < data.length; i++) {
        let price = data[i].price;
        let amount = data[i].amount;
        let timeStamp = data[i].timestamp;
        let direction = data[i].direction;
        instrument.tradeHistory.addHistory(price, amount, timeStamp, direction);
    }
    showCurrentHistory(instrument);
}

export function showCurrentHistory(instrument){
    let tradedPriceCells = document.getElementsByClassName("tradedPrice");
    let tradedAmountCells = document.getElementsByClassName("tradedAmount");
    let tradedTimeCells = document.getElementsByClassName("tradedTime");
    let parentNodes = document.getElementsByClassName("ltps");
    for(let i = 0; i < tradedPriceCells.length; i++){
        let history = instrument.tradeHistory.history[i];
        let tradedPrice = history.tradedPrice;
        let tradedAmount = history.tradedAmount;
        let tradedTime = history.tradedTime;
        tradedPriceCells[i].innerHTML = fixFloatDigitByKind(tradedPrice, 2, instrument.kind);
        tradedAmountCells[i].innerHTML = tradedAmount;
        tradedTimeCells[i].innerHTML = tradedTime;

        if(history.direction == 'buy'){
            parentNodes[i].style.color = "lightskyblue";
        }else if(history.direction == "sell"){
            parentNodes[i].style.color = "salmon";
        }else{
            parentNodes[i].style.color = "#aaaaaa";
        }
    }
}

export function orderEvent(instrument, msg){
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
        askPrices[j].innerHTML = fixFloatDigitByKind(instrument.orderBook.asks[i].price, 2, instrument.kind);
        askQtys[j].innerHTML = instrument.orderBook.asks[i].qty;
    }

    for(let i = 0; i < bidPrices.length; i++){
        bidPrices[i].innerHTML = fixFloatDigitByKind(instrument.orderBook.bids[i].price, 2, instrument.kind);
        bidQtys[i].innerHTML = instrument.orderBook.bids[i].qty;    
    }

    let spread;
    if(instrument.bestAsk == 0 && instrument.bestBid == 0){
        spread = "no order";
    }else if(instrument.bestAsk == 0){
        spread = "no ask";
    }else if(instrument.bestBid == 0){
        spread = "no bid";
    }else{
        spread = fixFloatDigit(instrument.bestAsk - instrument.bestBid, 4);
    }

    spreadCell.innerHTML = spread;
 
}

export function showCurrentInstrumentName(instrumentName){
    let nameArea = document.getElementById("instrumentNameArea");
    nameArea.innerHTML = instrumentName;
}

export function updateChartPrecision(instrument, candleSeries){
    let minFlac;
    if(instrument.kind == "futures"){
        minFlac = 2;
    }else if(instrument.kind == "options"){
        minFlac = 4;
    }

    candleSeries.applyOptions({
        priceFormat: {
            type: 'price',
            precision: minFlac,
        },
    });

}

function fixFloatDigitByKind(price, digit, kind){
    if(kind == "futures"){
        return Number.parseFloat(price).toFixed(digit);
    }else{
        return price;
    }
}

function fixFloatDigit(price, digit){
    return Number.parseFloat(price).toFixed(digit);
}
