/**
 * @file トレード, 履歴に関するクラス定義とindex.jsの使用するための関数定義
 */

/**
 * @classdesc 各取引に関するクラス
 */
export class Trade {
    /**
     * フィールドを生成, 初期化する
     * @constructor
     */
    constructor() {
        /** @member {number} - 取引価格 */
        this.tradedPrice = 0;

        /** @member {number} - 取引量 */
        this.tradedAmount = 0;

        /** @member {string} -  取引時間(mm/dd hh:mm:ss) */
        this.tradedDateTime = 0;

        /** @member {string} - 取引時間(hh:mm:ss) */
        this.tradedTime = 0;

        /** @member {string} - 取引の方向(成行) */
        this.direction = 'none';
    }

    /**
     * トレードされた価格をセットする
     * @function
     * @param {number} tradedPrice 
     */
    setPrice = function (tradedPrice) {
        this.tradedPrice = tradedPrice;
    }

    /**
     * トレードされた量をセットする
     * @function
     * @param {number} tradedAmount 
     */
    setAmount = function (tradedAmount) {
        this.tradedAmount = tradedAmount;
    }

    /**
     * トレードされた時間をセットする(hh/mm/ss形式)
     * @function
     * @param {timestamp} timeStamp - タイムスタンプ(トレードされた時間)
     */
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

    /**
     * 全てのフィールドを初期値に設定する
     * @function
     */
    initAllValue = function(){
        this.tradedPrice = 0;
        this.tradedAmount = 0;
        this.tradedDateTime = 0;
        this.tradedTime = 0;
        this.direction = "none";
    }
}

/**
 * @classdesc クラスTradeをまとめたトレード履歴の配列
 */
export class HistoryList {
    /**
     * クラスTradeを生成し, 配列形式にして履歴を作成する
     * @constructor
     * @param {number} size - 生成するクラスTradeの数
     */
    constructor(size) {
        /** @member {number} - 履歴の数 */
        this.size = size;

        /** @member {Trade[]} - クラスTradeのオブジェクトの配列*/
        this.history = Array(this.size);
        for (let i = 0; i < this.history.length; i++) {
            this.history[i] = new Trade();
        }
    }
    /**
     * Tradeの配列を1つ後退させ, 先頭に引数のデータを挿入する
     * @function
     * @param {number} price - トレードされた価格
     * @param {number} amount - トレードされた量
     * @param {timestamp} timestamp - トレードされた時間(タイムスタンプ)
     * @param {string} direction - トレードの方向(成行注文の方向, "buy" or "sell")
     */
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

    /**
     * 全てのトレード履歴を削除する
     * @function
     */
    clearHistory = function(){
        for(let i = 0; i < this.size; i++){
            this.history[i].initAllValue();
        }
    }
}

/**
 * 各板の注文状況のクラス
 */
export class Order {
    /**
     * フィールドを生成し, 初期化する
     * @constructor
     * @param {number} price - 注文価格
     * @param {number} qty - 注文数量
     */
    constructor(price, qty) {
        /** @member {number} - 注文価格 */
        this.price = price;

        /** @member {number} - 注文数量 */
        this.qty = qty;
    }
}

/**
 * 全板のクラス
 * @class
 */
export class OrderBook {
    /**
     * クラスOrderをbid, ask毎に配列形式で生成する
     * @constructor
     */
    constructor() {
        /** @member {number} - 片方(bid, ask)の板の数*/
        this.initSize = 2000;   //number of orders per side

        //bid, ask = asec order
        /** @member {Order[]} - bidの板(クラスTradeのオブジェクトの配列) */
        this.bids = Array(this.initSize);
        
        /** @member {Order[]} - askの板(クラスTradeのオブジェクトの配列) */
        this.asks = Array(this.initSize);
        
        for(let i = 0; i < this.initSize; i++){
            this.bids[i] = new Order(0, 0);
            this.asks[i] = new Order(0, 0);
        }
    }
    
    /**
     * 板のスナップショットをフィールドへ代入する
     * クラスOrderBookを生成した時最初に呼び出す
     * @function
     * @param {number[]} asks - askの配列, asks[1] = 注文価格, asks[2] = 注文数量
     * @param {number[]} bids - bidの配列, bids[1] = 注文価格, bids[2] = 注文数量
     */
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

    /**
     * 引数で指定された価格のbidを削除する
     * @function
     * @param {number} price - 削除するbidの板の価格
     */
    deleteBid = function(price){
        for(let i = 0; i < this.bids.length; i++){
            if(price == this.bids[i].price){
                this.bids.splice(i, 1);
            }
        }
    }
    /**
     * 引数で指定された価格のaskを削除する
     * @function
     * @param {number} price - 削除するaskの板の価格
     */
    deleteAsk = function(price){
        for(let i = 0; i < this.asks.length; i++){
            if(price == this.asks[i].price){
                this.asks.splice(i, 1);
            }
        }
    }

    /**
     * 引数で指定された価格のbidの数量を変更する
     * @function
     * @param {number} price - 変更するbidの板の価格
     * @param {number} qty - 変更後の注文数量
     */
    changeBidQty = function(price, qty){
        for(let i = 0; i < this.bids.length; i++){
            if(price == this.bids[i].price){
                this.bids[i].qty = qty;
            }
        }
    }   
    /**
    * 引数で指定された価格のaskの数量を変更する
    * @function
    * @param {number} price - 変更するaskの板の価格
    * @param {number} qty - 変更後の数量
    */
    changeAskQty = function(price, qty){
        for(let i = 0; i < this.asks.length; i++){
            if(price == this.asks[i].price){
                this.asks[i].qty = qty;
            }
        }
    }

    /**
     * 引数で指定された価格に新しいbidを挿入する
     * @function
     * @param {number} price - 新しいbidの価格
     * @param {number} qty - 新しいbidの数量
     */
    insertNewBid = function(price, qty){
        for(let i = 0; i < this.bids.length; i++){
            if(price > this.bids[i].price){
                let temp = new Order(price, qty);
                this.bids.splice(i, 0, temp);
                break;
            }        
        }
    }
    /**
     * 引数で指定された価格に新しいaskを挿入する
     * @function
     * @param {number} price - 新しいaskの価格
     * @param {number} qty - 新しいaskの数量
     */
    insertNewAsk = function(price, qty){
        for(let i = 0; i < this.asks.length; i++){
            if(price < this.asks[i].price){
                let temp = new Order(price, qty);
                this.asks.splice(i, 0, temp);
                break;
            }        
        }
    }
    
    /**
     * 全板を0で初期化する
     * @function
     */
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

/**
 * @classdesc オプションのgreeksのクラス
 */
export class Greeks {
    /**
     * greeksを生成して各値を0で初期化する
     * @constructor
     */
    constructor() {
        /** @member {number} - ベガ */
        this.vega = 0;
        
        /** @member {number} - シータ */
        this.theta = 0;
        
        /** @member {number} - ロー */
        this.rho = 0;
        
        /** @member {number} - ガンマ */
        this.gamma = 0;
        
        /** @member {number} - デルタ */
        this.delta = 0;
    }

    /**
     * 引数で指定されたgreeksをフィールドへ代入する
     * @function
     * @param {number} vega 
     * @param {number} theta 
     * @param {number} rho 
     * @param {number} gamma 
     * @param {number} delta 
     */
    setGreeks = function (vega, theta, rho, gamma, delta) {
        this.vega = vega;
        this.theta = theta;
        this.rho = rho;
        this.gamma = gamma;
        this.delta = delta;
    }
}

/**
 * @class
 * @classdesc ある銘柄のクラス
 */
export class Instrument {
    /**
     * @constructor
     * @param {number} historySize - クラスHistoryに含まれる履歴の数
     */
    constructor(historySize) {
        /** @member {OrderBook} - 銘柄の全板 */
        this.orderBook = new OrderBook();

        /** @member {HistoryList} - 銘柄の取引履歴 */
        this.tradeHistory = new HistoryList(historySize);

        /** @member {ChartData} - 銘柄のチャートデータ */
        this.chartData = new ChartData(5);

        /** @member {number} - 銘柄の最良ask */
        this.bestAsk = this.orderBook.asks[0].price;

        /** @member {number} - 銘柄の最良bid */
        this.bestBid = this.orderBook.bids[0].price;
        
        
        /** @member {string} - 銘柄の種類("futures" or "options") */
        this.kind = '';

        /** @member {string} - 銘柄の名前, 形式(先物): (BTC | ETH)-(YYMMMDD | PERPETUAL), e.g. BTC-25MAR22,<br> 形式(オプション): (BTC | ETH)-(YYMMMDD)-(STRIKE)-("C" | "P") e.g. ETH-31DEC21-10000-C*/
        this.name = '';

        /** @member {number} - 銘柄の取組高 */
        this.openInterest = 0;

        /** @member {number} - 銘柄の最小変動幅 */
        this.mininumTick = 0.05;
        
        //for options
        /** @member {number} - オプションのストライク */
        this.strike = 0;

        /** @member {Greeks} - オプションのGreeksのオブジェクト */
        this.greeks = new Greeks();

        /** @member {string} - オプションがコールかプットか, "call" or "put"*/
        this.optionType = '';   //call or put
        
    }

    /**
     * 最良気配を更新する
     * @function
     */
    updateOrderLv1 = function(){
        this.bestAsk = this.orderBook.asks[0].price;
        this.bestBid = this.orderBook.bids[0].price;
    }

    /**
     * 引数で指定された価格で最終取引価格を設定する
     * @function
     * @param {number} lastPrice - 最終取引価格
     */
    setLastPrice = function (lastPrice) {
        this.lastPrice = lastPrice;
    }

    /**
     * 引数で指定されたgreeksでフィールドのクラスgreeksを更新する
     * @function
     * @param {number} vega - ベガ
     * @param {number} theta - シータ
     * @param {number} rho - ロー
     * @param {number} gamma - ガンマ
     * @param {number} delta - デルタ
     */
    setGreeks = function (vega, theta, rho, gamma, delta) {
        if (this.kind == 'futures') {
            console.warn(`the instrument(${this.name}) kind is futures, futures does not have greeks`);
        } else {
            this.greeks.setGreeks(vega, theta, rho, gamma, delta);
        }
    }

    /**
     * 引数で指定された値で取組高を設定する
     * @function
     * @param {number} openInterest - 取組高
     */
    setOpenInterest = function (openInterest) {
        this.openInterest = openInterest;
    }

    /**
     * 引数で指定された銘柄の名前でフィールドを更新する<br>
     * 更新されるフィールド: this.name, this.kind, this.strike, this.optionType
     * @function
     * @param {string} name - 引数の形式(先物): (BTC | ETH)-(YYMMMDD | PERPETUAL), e.g. BTC-25MAR22,<br> 引数の形式(オプション): (BTC | ETH)-(YYMMMDD)-(STRIKE)-("C" | "P") e.g. ETH-31DEC21-10000-C
     */
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
}

/**
 * ローソク足チャートのためのクラス
 * @class
 */
export class ChartData{
    /**
     * チャートのデータ(ohlc+t)の配列を生成する
     * @constructor
     * @param {number | string} resolution - 1つの足の時間, 分単位で表す. ただし, 日足は"1D"
     */
    //data[0] is oldest, data[data.length-1] is latest
    constructor(resolution){
        /** @member {number[]} - 始値の配列 */
        this.opens = new Array();
        
        /** @member {number[]} - 高値の配列 */
        this.highs = new Array();
        
        /** @member {number[]} - 安値の配列 */
        this.lows = new Array();
        
        /** @member {number[]} - 終値の配列 */
        this.closes = new Array();
        
        /** @member {timestamp[]} - 各足の時間を表すタイムスタンプ(秒単位)の配列 */
        this.ticks = new Array();    

        //timeScale of each candle, represented in min, exeption: 1day = "1D"   
        /** @member {number} - 足の時間幅. 分単位で表す. ただし日足は"1D" */
        this.resolution = resolution;

    }

    /**
     * チャートのデータを破棄し、新しいデータを生成して初期化する
     * @function
     */
    clearData = function(){        
        this.opens = new Array();
        this.highs = new Array();
        this.lows = new Array();
        this.closes = new Array();
        this.ticks = new Array();    
    }

    /**
     * フィールドから現在のlightweight-chartで指定される形式のローソク足データを生成(連想配列の配列)し返却する
     * @function
     * @returns {object[]} - lightweight-chartで使用可能なohlc+tの連想配列の配列
     */
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

    /**
     * 外部APIなどから過去のチャートデータを取得した際に使用する. 
     * OHLC+Tを元にフィールドを初期化する
     * @function
     * @param {number[]} opens - 始値の配列
     * @param {number[]} highs - 高値の配列
     * @param {number[]} lows - 安値の配列
     * @param {number[]} closes - 終値の配列
     * @param {timestamp[]} ticks - 足が始まった時間の配列(秒単位のtimestamp)
     */
    setNewChartData = function(opens, highs, lows, closes, ticks){
        for(let i = 0; i < opens.length; i++){
            this.opens.push(opens[i]);
            this.highs.push(highs[i]);
            this.lows.push(lows[i]);
            this.closes.push(closes[i]);
            this.ticks.push(ticks[i]);
        }
    }

    /**
     * 次の足を生成する
     * @function
     * @param {number} price - 次の足で取引された最初の価格
     * @param {timestamp} tick - 次の足の時間
     */
    setNewCandle = function(price, tick){
        this.opens.push(price);
        this.highs.push(price);
        this.lows.push(price);
        this.closes.push(price);
        this.ticks.push(tick);
    }

    /**
     * 引数で指定される取引価格を基に現在の足を更新する
     * @function
     * @param {number} tradedPrice - 取引価格
     */
    updateCurrentCandle = function(tradedPrice){
        let li = this.ticks.length-1;   //last index
        this.closes[li] = tradedPrice;
        if(tradedPrice > this.highs[li]){
            this.highs[li] = tradedPrice;
        }else if(tradedPrice < this.lows[li]){
            this.lows[li] = tradedPrice;
        }
    }   

    /**
     * 引数で指定されるローソク足チャートに現在のデータを反映する
     * @function
     * @param {object} candleSeries - ローソク足チャート(lightweight-chart)のオブジェクト
     */
    showCurrentChart = function(candleSeries){
        let data = this.getTradingViewData();
        candleSeries.setData(data);
    }

}
/**
 * 引数で指定された通貨の銘柄一覧を取得し返却する
 * @function
 * @param {string} currency - "BTC" or "ETH"
 * @param {boolean} expired - true: 決済期日が既に到来している銘柄を取得する, false: 決済期日が到来していない銘柄のみを取得する
 * @returns {Instrument[]} - クラスInstrumentの配列
 */
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

/**
 * deribitのAPIから来るmsgを基にinstrumentのチャートを初期化する
 * @function
 * @param {object} instrument - 表示するチャートの銘柄
 * @param {object} msg - JSON形式のデータ
 * @param {object} candleSeries - lightweight-chartのローソク足チャートのオブジェクト
 */
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

/**
 * deribitのREST APIから引数で指定された銘柄名のチャートデータを取得する
 * @function
 * @param {string} instrumentName - 取得したい銘柄名
 * @param {timestamp} start - 取得したいチャートの始まりの時間
 * @param {timestamp} end - 取得したいチャートの終わりの時間
 * @param {number | string} resolution - 取得したいチャートの時間足, 分単位で表す. ただし日足は"1D"
 * @returns {object} - JSON形式のデータ, 過去チャートのデータ
 */
export function getChartData(instrumentName, start, end, resolution){
    let response = throwRestApiReq(`https://www.deribit.com/api/v2/public/get_tradingview_chart_data?end_timestamp=${end}&instrument_name=${instrumentName}&resolution=${resolution}&start_timestamp=${start}`, 0);
    response = JSON.parse(response);
    console.warn(response);
    return response;
}

/**
 * 指定したURIのREST APIから同期的にデータを得る
 * @function
 * @param {string} uri 
 * @param {number} waitMilSec - レート制限のために待つ時間, ミリ秒単位
 * @returns {object} - JSON形式のデータ
 */
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

/**
 * レート制限等のためにビジースリープを行う
 * @function
 * @param {number} milSec - 待つミリ秒
 */
export function busySleep(milSec){
    const start = new Date();
    while(new Date() - start < milSec);
}

/**
 * index.htmlの左側にderibitに上場する全ての銘柄名を掲載する
 * @function
 * @param {object[]} allInstrument - クラスInstrumentの配列
 */
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

/**
 * apiからトレード情報を受け取った時に発火させる, msgを基に現在表示されている銘柄の情報を更新する
 * @function
 * @param {object} mainInstrument - 現在表示している銘柄Instrumentのオブジェクト
 * @param {object} msg - JSON形式のデータ
 * @param {object} candleSeries - lightweight-chartのオブジェクト
 */
export function tradeEvent(mainInstrument, msg, candleSeries){
	addHistory(mainInstrument, msg);
    addTradeData(mainInstrument, msg, candleSeries);
}

/**
 * トレード情報を基にチャートを更新する
 * @function
 * @param {object} instrument - 更新したいチャートのクラスInstrument
 * @param {object} msg - トレード情報に関するJSON形式のデータ
 * @param {object} candleSeries - lightweight-chartのローソク足チャートのオブジェクト
 */
function addTradeData(instrument, msg, candleSeries){
    let trades = msg.params.data;
    let tradedTime = trades[0].timestamp;
    let li = instrument.chartData.ticks.length-1;   //last index
    let tradedPrices = new Array(trades.length);

    for(let i = 0; i < trades.length; i++){
        tradedPrices[i] = trades[i].price;
    }

    let nextTime;
    if(instrument.chartData.resolution == "1D"){
        nextTime = instrument.chartData.ticks[li] + 86400;
    }else{
        nextTime = instrument.chartData.ticks[li] + instrument.chartData.resolution*60;
    }

    if(tradedTime > nextTime*1000){
        instrument.chartData.setNewCandle(tradedPrices[0], nextTime);
    }

    for(let i = 0; i < tradedPrices.length; i++){
        instrument.chartData.updateCurrentCandle(tradedPrices[i]);
        instrument.chartData.showCurrentChart(candleSeries);
    }

}

/**
 * トレード情報を基にトレード履歴を更新する
 * @function
 * @param {object} instrument - 現在表示している銘柄のオブジェクト 
 * @param {object} msg - JSON形式のデータ
 */
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

/**
 * 現在のトレード履歴を画面右下に表示する
 * @function
 * @param {object} instrument - 現在表示している銘柄のオブジェクト
 */
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

/**
 * deribitのAPIからorder情報を受け取った時に発火させる, msgをもとに板情報を更新する
 * @function
 * @param {object} instrument - 現在表示している銘柄のオブジェクト
 * @param {object} msg - JSON形式のデータ
 */
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

/**
 * 現在表示している銘柄名を画面右上に表示する
 * @function
 * @param {string} instrumentName - 銘柄名
 */
export function showCurrentInstrumentName(instrumentName){
    let nameArea = document.getElementById("instrumentNameArea");
    nameArea.innerHTML = instrumentName;
}

/**
 * 表示する銘柄が先物かオプションかによってチャートの精度(最小振れ幅)を変更する
 * @function
 * @param {object} instrument - 表示する銘柄のオブジェクト
 * @param {object} candleSeries - lightweight-chartのオブジェクト
 */
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

/**
 * チャートにウォーターマークを入れる
 * @param {string} instrumentName - 銘柄名
 * @param {number} chartResolution - チャートの解像度
 * @param {object} chart - lightweight-chartのChartオブジェクト
 */
export function changeChartWatermark(instrumentName, chartResolution, chart){
    let shownResolution;
    if(chartResolution == "1D"){
        shownResolution = chartResolution;
    }else if(chartResolution >= 60){
        shownResolution = chartResolution / 60;
        shownResolution += "h";
    }else if(chartResolution < 60){
        shownResolution = chartResolution + "m";
    }

    chart.applyOptions({
        watermark: {
            text: `${instrumentName}, ${shownResolution}`,
        }
    });
}

/**
 * 先物かオプションかによって表示する価格の小数点以下を切り捨てる
 * @function
 * @param {number} price - 価格
 * @param {number} digit - 小数点以下digit桁まで表示させる
 * @param {string} kind - "futures" or "options"
 * @returns {number} - 切り捨てられた価格
 */
function fixFloatDigitByKind(price, digit, kind){
    if(kind == "futures"){
        return Number.parseFloat(price).toFixed(digit);
    }else{
        return price;
    }
}

/**
 * 表示する価格の小数点以下を切り捨てる
 * @function
 * @param {number} price - 価格
 * @param {number} digit - 小数点以下digit桁まで表示させる
 * @returns {number} - 切り捨てられた価格
 */
function fixFloatDigit(price, digit){
    return Number.parseFloat(price).toFixed(digit);
}
