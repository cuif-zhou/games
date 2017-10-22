(function() {
	
	document.oncontextmenu = function(){ return false; }//阻止右键菜单事件
	
	var mineTableArray = [];
	var level = null;

	function mineTableItem(ismine) {
		this.index = 0; //编号
		this.isMine = ismine;
		this.status = 0; //status 1.标记, 2.疑问, 0.未知, -1.已经探索
		this.mineNumber = 0; //周围雷数量
	}

	/**
	 * 初始化随机雷阵
	 * @param {Object} level. 游戏等级
	 */
	function resetMinetTable(l) {
		level = l;
		mineTableArray = new Array();
		var mineArrayLenght = level.colCnt * level.rowCnt;
		for(var i = 0; i < mineArrayLenght; i++) { //生成雷阵
			if(i < level.mineCnt) {
				mineTableArray[i] = new mineTableItem(true);
			} else {
				mineTableArray[i] = new mineTableItem(false);
			}
		}

		for(var i = 0; i < mineArrayLenght; i++) { //打乱
			var num1 = Math.floor(Math.random() * mineArrayLenght);
			var temp = mineTableArray[i];
			mineTableArray[i] = mineTableArray[num1];
			mineTableArray[num1] = temp;
		}

		for(var i = 0; i < mineArrayLenght; i++) { //计算周边雷数量
			mineTableArray[i].index = i;
			if(!mineTableArray[i].isMine) {
				mineTableArray[i].mineNumber = computeAroundMineNumber(i);
			}
		}
		return mineTableArray;
	}

	/**
	 * 计算某结点周围雷数量
	 * @param {Object} mineTableArray
	 * @param {Object} index
	 */
	function computeAroundMineNumber(index) {
		var num = 0;
		var indexArray = computeAroundIndex(index);
		for(var i = 0; i < indexArray.length; i++){
			if(mineTableIndexIsmine(indexArray[i])){
				num ++;
			}
		}

		return num;
	}
	
	/**
	 * 获取周边8个格子的下标
	 * @param {Object} i
	 */
	function computeAroundIndex(i){
		var a = new Array();
		var b = level.colCnt;
		var c = mineTableArray.length;
		var d = i - 1;
		var e = i + 1;
		return (i % b != 0) && ((d >= 0 && d < c && a.push(d)) | (d - b >= 0 && d - b < c && a.push(d - b)) | (d + b >= 0  && d + b < c && a.push(d + b))),
		(e % b != 0) && ((e >= 0 && e < c && a.push(e)) | (e - b >= 0 && e - b < c && a.push(e - b)) | (e + b >= 0  && e + b < c && a.push(e + b))),
		i - b >=0 && a.push(i - b),
		i + b < c && a.push(i + b),
		//console.log(i, a),
		a;
	}

	/**
	 * 判断某点是不是雷
	 * @param {Object} index
	 */
	function mineTableIndexIsmine(index) {
		return mineTableArray[index] && mineTableArray[index].isMine;
	}
	
	function exploreItem(item, mineArray){
		var tempSetMore = new Set();
		var tempSetLess = new Set();
		tempSetMore.add(item.index);
		
		var i = 0;
		while(tempSetMore.size != tempSetLess.size && i < 100){
			
			if(tempSetLess.size > tempSetMore.size ){
				var temp = tempSetMore;
				tempSetMore = tempSetLess;
				tempSetLess = temp;
			}
			
			tempSetMore.forEach(function(setItem){
				tempSetLess.add(setItem);
				if(setItem < 0 || setItem >= mineArray.length || mineArray[setItem].isMine || mineArray[setItem].mineNumber != 0){
					return;
				}
				
				var indexArray = computeAroundIndex(setItem);
				for(var i = 0 ; i < indexArray.length; i++){
					tempSetLess.add(indexArray[i]);
				}
			});
			
			//console.log(tempSetMore.size, tempSetMore);
			//console.log(tempSetLess.size, tempSetLess);
			i++;
		}
		
		tempSetMore.forEach(function(setItem){
			mineArray[setItem].status = mineArray[setItem].status == 1 ? 1: -1;
		});
		
		
	}
	
	function checkVictory(app){
		var liveItem = 0;//现存的格子
		for(var i in app.mineArray){
			if(app.mineArray[i].status != -1){
				liveItem ++;
			}
		}
		if (app.level.mineCnt == liveItem){
			doVictory(app);
		}
	}
	
	function doVictory(app){
		app.islost = false;
		app.showModal = true;
		app.gameOver = true;
		endTiming();
		for(var i in app.mineArray){
			if(app.mineArray[i].isMine){
				app.mineArray[i].status = 1;
			}
		}
		app.level.bestTime = app.time;
		app.level_type[app.level.index].bestTime = app.time;
		app.level.index == 1? (localStorage.bestTime1 = app.time):
		app.level.index == 2? localStorage.bestTime2 = app.time:
		localStorage.bestTime3 = app.time;
	}
	
	function doDefeated(app){
		app.islost = true;
		app.showModal = true;
		app.gameOver = true;
		endTiming();
		for(var i in app.mineArray){
			if(app.mineArray[i].isMine){
				app.mineArray[i].status = app.mineArray[i].status == 1? 1: -1;
			}
		}
	}
	
	function doFlag(a){
		(a.status == 0 && vueApp.flagCnt > 0) ? (a.status++) & (vueApp.flagCnt --) :
		(a.status == 1) ? (a.status++) & (vueApp.flagCnt ++) :
		(a.status = 0)
	}
	
	//setInterval()对应的是 clearInterval(funName);
	var timerId = 0;
	function startTiming(){
		timerId = setInterval(function(){
			vueApp.time ++;
		},1000);
	}
	
	function endTiming(){
		clearInterval(timerId);
		timerId = 0;
	}
	
	var vueApp = new Vue({
		el: '#app',
		data: {
			level_type:[
				{index: 0, title: 'N级', colCnt: 1, rowCnt: 0, mineCnt: 0 , bestTime:0},
				{index: 1, title: '初级', colCnt: 10,rowCnt: 10,mineCnt: 10, bestTime:localStorage.bestTime1?localStorage.bestTime1:'9999'},
				{index: 2, title: '中级', colCnt: 16,rowCnt: 16,mineCnt: 40, bestTime:localStorage.bestTime2?localStorage.bestTime2:'9999'},
				{index: 3, title: '大师', colCnt: 30,rowCnt: 16,mineCnt: 99, bestTime:localStorage.bestTime3?localStorage.bestTime3:'9999'}
			],
			level: {},
			mineArray: {},
			gameOver: false,
			showModal: false,
			flagCnt:0,
			time:0,
			islost:false
		},
		methods: {
			beginGame: function() {
				this.level = this.level_type[0];
				this.level = this.level_type[document.getElementById('level_sl').value];
				this.mineArray = resetMinetTable(this.level);
				this.gameOver = false;
				this.showModal = false;
				this.time = 0;
				this.flagCnt = this.level.mineCnt;
			},
			getRowData: function(rownum) {
				var rowArray = [];
				for(var i = 0; i < this.level.colCnt; i++) {
					rowArray[i] = 　this.mineArray[this.level.colCnt * rownum + i];
				}
				return rowArray;
			},
			getClass: function(item) {
				if(item.status != -1 ) {
					return {
						'unknown': item.status === 0,
						'flag': (!this.gameOver && item.status === 1) || (this.gameOver && item.isMine && item.status === 1),
						'doubt': item.status === 2,
						'err':this.gameOver  && !item.isMine && item.status == 1
					}
				}
				if(item.isMine) {
					return {
						'mine': true
					}
				}
				return {
					'm0': item.mineNumber === 0,
					'm1': item.mineNumber === 1,
					'm2': item.mineNumber === 2,
					'm3': item.mineNumber === 3,
					'm4': item.mineNumber === 4,
					'm5': item.mineNumber === 5,
					'm6': item.mineNumber === 6,
					'm7': item.mineNumber === 7,
					'm8': item.mineNumber === 8
				}
			},
			clickItemEvent:function(event, item){
				if(!timerId){//开始计时
					startTiming();
				}
				if(this.gameOver){
					return
				}
				if(item.status === -1){
					return;
				}
				if(event.button == 0){ //左键
					if(item.status == 1){
						return;
					}
					if(item.mineNumber != 0){
						item.status = item.status == 1? 1: -1;
						checkVictory(this);
						return;
					}
					
					if(item.isMine){
						doDefeated(this);
						return;
					}
					
					exploreItem(item, this.mineArray);
					checkVictory(this);
				}
				if(event.button == 2){ //右键
					doFlag(item);
				}
			}
		}
	});
})();