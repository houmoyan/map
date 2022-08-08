<template>
	<div class="hello" :style="{height:winHeight}">
		<button class="chooseDate my-btn button--primary" @click="dateShow=true" size="small">选择日期</button>
		<!--日历-->
		<datePicker v-show="dateShow" :options="calendarArr" :areaList="areaList" class="calendar" @handleClickDay="handleClickDay" @handlePrevMonth="handlePrevMonth" @handleNextMonth="handleNextMonth" @handleToday="handleToday" @dateHide="dateHide" />
		<!--地图工具-->
		<div class="actionBtns" :style="{right:rightWh}">
			<label v-show="roadShow" for="roadLine" @click="showRoadFn"><input type="checkbox" id="roadLine" checked="checked" value="0"/><i>路网</i></label>
			<!--<b @click="dialogFormVisible = true">切换影像图</b>-->
			<b class="activeClass" @click="changeMap(1)" v-if="tianditu">天地图</b>
			<b @click="changeMap(0)" v-else>天地图</b>

			<b class="activeClass" @click="changeSateLLite(0)" v-if="sateLLiteTrue">卫星</b>
			<b @click="changeSateLLite(1)" v-else>卫星</b>
			<b :class="active==1?'activeClass':''" @click="measureDistance">
				<i class="iconfont icon-ceju"></i>测距</b>
			<b :class="active==2?'activeClass':''" @click="measureArea">
				<i class="iconfont icon-a-shitucemianji"></i>计面</b>
			<b :class="active==3?'activeClass':''" @click="clearMapAll"><i class="iconfont icon-qingkong"></i>清空</b>
	
		</div>
		<div class="currentData" :style="{right:rightWh}" v-show="currentJobLngLat">
			<p><i class="iconfont icon-a-weizhi1"></i>{{currentJobLngLat}}</p>
			<p><i class="iconfont icon-shijian"></i>{{currentJobTime}}</p>
		</div>
		<!--地图-->
		<div class="mapMain" id="mapMain"></div>
		<!--地图左下角切换-->
		<ul class="showRole">
			<li>
				<label for="showMarker"><input type="checkbox" id="showMarker" value="0" @change="changedFn"/><i>坐标点</i>
				</label>
			</li>
			<li>
				<label for="showLine"><input type="checkbox" id="showLine" value="1" checked="checked" @change="changedFn"/><i>轨迹</i></label>
			</li>
			<li>
				<label for="showblocks"><input type="checkbox" id="showblocks" value="2" @change="changedFn"/><i>地块</i></label>
			</li>
		</ul>
		<!--轨迹行驶-->
		<div id="tools" v-show="statusStatic && trackList.length>0" :style="{right:rightWh2}">
			<div class="btns">
				<ul class="speedUp" v-show="popVisible">
					<li v-for="(item,index) in speedList" :class="{'speedActive':index==speedIsActive}" @click.stop="handlePlay('accelerate',index)">{{item.speedTimes}}</li>
				</ul>
				<dl :class="calendarFlag == true?'img-onlyRead':''" @click.stop="speedChange('slowdown')">
					<dt id="moderatingBtn">
												<img src="@/assets/img/bofang/jiansu.png" />
											</dt>
					<dd>减速</dd>
				</dl>
				<dl>
					<dt id="pauseBtn" @click='handlePlay(operationForPauseAndContinue)'>
									<img :src="continueOrStopUrl" />
									
								</dt>
					<dd id="pauseBtns">开始</dd>
				</dl>
				<dl :class="calendarFlag == true?'img-onlyRead':''" @click.stop="speedChange('accelerate')">
					<dt id="acceleratedBtn">
												<img src="@/assets/img/bofang/jiasu.png" />
											</dt>
					<dd>加速</dd>
				</dl>

			</div>
		</div>
		<!--详情-->
		<div class="mapDetail" v-show="mapDetail">
			<div class="openNewBox">
				<span @click="openNew" class="openNew">查看详细信息>></span>
				<!--<button type="button" class="my-btn button--default" size="small"></button>-->
				<i class="closeRight iconfont icon-a-guanbi" @click="closeDetail"></i>
			</div>
			<div class="detailList">
				<h1>农机信息
				<i @click="handleDrowDown" :data-flag='true' class="drowDown iconfont icon-a-xiala"></i>
				</h1>
				<ul>
					<li>农机品目：{{machineInfo.catThreeName}}</li>
					<li>农机型号 ：{{machineInfo.njModel}}</li>
					<li>生产企业 ：{{machineInfo.njFactoryName}}</li>
					<li>出厂编号 ：{{machineInfo.njFactoryCode}}</li>
					<li>监控编号 ：{{machineInfo.imei}}</li>
				</ul>
			</div>
			<div class="detailList">
				<h1>机主信息
				<i @click="handleDrowDown" :data-flag='true' class="drowDown iconfont icon-a-xiala"></i>
				</h1>
				<ul>
					<li>机主 ：{{machineInfo.owner}}</li>
				</ul>
			</div>
			<div class="detailList">
				<h1>作业信息
				<i @click="handleDrowDown" :data-flag='true' class="drowDown iconfont icon-a-xiala"></i>
				</h1>
				<ul>
					<li>运行总里程：{{jobDataInfo.totalMileageDay}}千米</li>
					<li>运行总面积：{{jobDataInfo.totalRectifyArea}}亩</li>
					<li>运行总时长：{{jobDataInfo.totalRunTimeDay}}小时</li>
				</ul>
			</div>

			<div class="detailList">
				<h1>{{jobDate}} 作业信息
				<i @click="handleDrowDown" :data-flag='true' class="drowDown iconfont icon-a-xiala"></i>
				</h1>
				<ul>
					<li>运行里程：{{currentDayData.mileageDay}}千米</li>
					<li>运行面积：{{currentDayData.rectifyArea}}亩</li>
					<li>运行时长：{{currentDayData.runTimeDay}}小时</li>
					<li>作业地区：{{currentDayData.jobArea}}</li>
					<li>轨迹点数：{{currentDayData.pointCount}}</li>
				</ul>
			</div>
		</div>
		<!--切换底图弹框-->
		<div class="dialog_wrapper" v-show="dialogFormVisible">
			<div class="dialog">
				<div class="dialog_header">
					<span class="dialog_title">切换影像底图</span>
					<i class="dialog_close iconfont icon-a-guanbi" @click="dialogFormVisible = false"></i></div>
				<div class="dialog_body">
					<select class="mapChange" v-model="mapType">
						<option v-for="item in mapOptions" :value="item.value">{{item.label}}</option>
					</select>
				</div>
				<div class="dialog_fotter">
					<button type="button" class="my-btn button--default" @click="dialogFormVisible = false">取 消</button>
					<button type="button" class="my-btn button--primary" @click="changeMap">确 定</button>

				</div>
			</div>
		</div>
		<div class="dataList" v-show="singleDataShow" :style="{width:widthLen}">
			<div class="closeBox">
				<span @click="viewMore" class="viewMoreData">查看更多数据>></span>
				<!--<button type="button" class="my-btn button--primary" @click="viewMore" size="mini">查看更多</button>-->
				<i class="singleData_close iconfont icon-a-guanbi" @click="singleDataShow = false"></i>
			</div>
			<table border="1">
				<thead>
					<tr>
						<th>包序号</th>
						<th>设备序列号</th>
						<th>农机厂家</th>
						<th style="width: 21vw;">可用卫星数量</th>
						<th>机器状态</th>
						<th style="width: 22vw;">采集时间</th>
						<th>定位状态</th>
						<th>经度</th>
						<th>纬度</th>
						<th>E/W</th>
						<th>S/N</th>
						<th>速度(km/h)</th>
						<th>外部电压</th>
						<th>海拔</th>
						<th>方向</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="singleData && singleData.imei">
						<td>{{singleData.serialno}}</td>
						<td>{{singleData.imei}}</td>
						<td>{{singleData.factory_code}}</td>
						<td>{{singleData.satellite}}</td>
						<td v-if="singleData.work_status == 1">打火工作</td>
						<td v-else-if="singleData.work_status == 2">熄火静止</td>
						<td v-else-if="singleData.work_status == 1">熄火移动</td>
						<td v-else>打火静止</td>
						<td>{{singleData.send_time}}</td>
						<td>{{singleData.location_status ==1?'有效定位':'无效定位'}}</td>
						<td>{{singleData.lng}}</td>
						<td>{{singleData.lat}}</td>
						<td>{{singleData.lng_flag}}</td>
						<td>{{singleData.lat_flag}}</td>
						<td>{{singleData.speed}}</td>
						<td>{{singleData.voltage}}</td>
						<td>{{singleData.altitude}}</td>
						<td>{{singleData.azimuth}}</td>
					</tr>
					<tr v-else>
						<td colspan="15">暂无数据</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>
	import 'maptalks/dist/maptalks.css'
	import * as maptalks from 'maptalks'
	import TalksMap from '@/assets/js/initMapTalks.js'
	import datePicker from '../components/date-picker'
	import { mapState, mapActions, mapMutations } from "vuex";
	import * as utils from '@/assets/js/utils.js';
	export default {
		name: 'Map',
		components: {
			datePicker
		},
		data() {
			return {
				TalksMap: new TalksMap(),
				showRoad: true,
				dialogFormVisible: false,
				mapOptions: [{
					value: 0,
					label: '天地图'
				}, {
					value: 1,
					label: 'arcgis'
				}],
				mapType: 0,
				sateLLiteTrue: true,
				winHeight: `${document.documentElement.clientHeight}` + 'px',
				mapDetail: true,
				rightWh: '23vw',
				rightWh2: '22vw',
				widthLen: '78vw',
				active: '',
				calendarArr: {
					type: 'combination',
					headStyle: {
						todayBtn: 'right',
						combination: 'center',
						checkBtn: 'right',
					},
					viewStyle: {
						day: 'right'
					},
					calendarData: []
				},
				jobDate: this.getNowFormatDates(),
				jobDataInfo: {},
				machineInfo: {},
				statusStatic: true,
				calendarFlag: true,
				startContinue: "start",
				operationForPauseAndContinue: "start",
				map: "",
				stopedIndex: 0,
				trackList: [],
				zanting: require('@/assets/img/bofang/zanting.png'),
				kaishi: require('@/assets/img/bofang/start.png'),
				continueOrStopUrl: require('@/assets/img/bofang/start.png'),
				tingzhi: require('@/assets/img/bofang/tingzhi.png'),
				speedList: [{
					'speedTimes': '0.5X',
					'speed': 800,
				}, {
					'speedTimes': '1X',
					'speed': 400,
				}, {
					'speedTimes': '2X',
					'speed': 200,
				}, {
					'speedTimes': '3X',
					'speed': 133,
				}],
				speedIsActive: 1,
				popVisible: false,
				areaList: [],
				dateShow: false,
				tianditu: true,
				singleData: {},
				singleDataShow: false,
				roadShow: true,
				currentDayData: {
					mileageDay: 0,
					rectifyArea: 0,
					runTimeDay: 0,
					jobArea: '-',
					pointCount: 0
				},
				currentJobLngLat:'',
				currentJobTime:''

			}
		},
		beforeDestroy() {
			//清除小车跑定时器
			if(this.TalksMap._timer || this.TalksMap.i > 0) {
				clearInterval(this.TalksMap._timer);
				this.TalksMap._timer = ''
			}

		},
		computed: {
			...mapState({
				handleName: state => state.kName,
			}),
		},
		watch: {

			handleName(newVal, oldVal) {
				if(newVal == 'end') {
					this.operationForPauseAndContinue = 'start'
					document.getElementById("pauseBtns").innerHTML = "开始";
					this.continueOrStopUrl = this.kaishi;
					this.calendarFlag = true;
				}
			},
			mapDetail(val) {
				this.rightWh = val ? '23vw' : '0'
				this.rightWh2 = val ? '22vw' : '0'
				this.widthLen = val ? '78vw' : '100%'
			}
		},

		mounted() {
			const that = this;
			window.onresize = () => {
				return(() => {
					that.winHeight = window.innerHeight + 'px';
				})();
			};
			this.imei = this.$route.query.imei;
			this.getDetail();
			this.getPlotData();
			this.getLineData();
			this.getArea();
			this.getJobData();
			//			初始化地图
			this.initMapTalk()
			this.TalksMap.sendThis(this);

			document.addEventListener('click', function(e) {
				if(that.popVisible === true) {
					that.popVisible = false
				}
			})

		},
		methods: {
			getJobData() {
				this.$http({
						url: this.api.api_map + '/queryJobDataByDay',
						method: 'post',
						params: {
							imei: this.imei,
							jobDate: this.jobDate
						}
					})
					.then((responese) => {
						if(responese.data.code == 0) {
							if(responese.data.data) {
								this.currentDayData = responese.data.data;
							} else {
								this.currentDayData = {
									mileageDay: 0,
									rectifyArea: 0,
									jobArea: '-',
									runTimeDay: 0,
									pointCount: 0
								}
							}

						} else {
							console.log(responese.data.message);
						}
					})
					.catch((error) => {
						console.log(error);
					});
			},
			//			点击轨迹点更新数据表格
			getNumData(e) {
				this.singleDataShow = true;
				this.$http({
						url: this.api.api_map + '/queryOneTraceData',
						method: 'post',
						params: {
							imei: this.imei,
							dateTime: e.target.getProperties()
						}
					})
					.then((responese) => {
						if(responese.data.code == 0) {

							this.singleData = responese.data.data;
						} else {
							console.log(responese.data.message);
						}
					})
					.catch((error) => {
						console.log(error);
					});
			},
			viewMore() {
				let routeUrl = this.$router.resolve({
					path: "/dataList",
					query: {
						imei: this.imei,
						jobDate: this.jobDate
					}
				});
				window.open(routeUrl.href, '_blank');
			},
			openNew() {
				let routeUrl = this.$router.resolve({
					path: "/detailData",
					query: {
						imei: this.imei,
					}
				});
				window.open(routeUrl.href, '_blank');
			},
			//			右侧详情收起折叠
			handleDrowDown(e) {
				let flag = JSON.parse(e.currentTarget.dataset.flag)
				e.currentTarget.dataset.flag = !flag;
				if(flag) {
					e.target.classList.add('drowUp')
					e.target.parentElement.nextElementSibling.style.display = 'none'
				} else {
					e.target.classList.remove('drowUp')
					e.target.parentElement.nextElementSibling.style.display = 'block';
				}
			},
			//			获取日历面积
			getArea() {
				this.$http({
						url: this.api.api_map + '/queryJobArea',
						method: 'post',
						params: {
							imei: this.imei,
							jobDate: this.monthVal
						}
					})
					.then((responese) => {
						if(responese.data.code == 0) {
							if(responese.data.data.length > 0) {
								responese.data.data.forEach((item, index) => {
									item.month = this.monthVal
									this.areaList.push(item)
								})
							}

						} else {
							console.log(responese.data.message);
						}
					})
					.catch((error) => {
						console.log(error);
					});
			},
			//			隐藏日历
			dateHide() {
				this.dateShow = false
			},
			//			日历回到今天
			handleToday() {
				this.TalksMap.allLineLayer.clear();
				this.TalksMap.plotLayer.clear();
				this.TalksMap.allPointLayer.clear();
				this.jobDate = this.getNowFormatDates()
				if(this.monthVal >= 1 && this.monthVal <= 9) {
					this.monthVal = '0' + this.monthVal
				}
				this.singleDataShow = false
				this.getArea();
				this.getPlotData();
				this.getLineData();
				this.getJobData();
				document.getElementById('showMarker').checked = false
				document.getElementById('showLine').checked = true
				document.getElementById('showblocks').checked = false
				this.clearTimes();

			},
			//			点击日历上的某一天,加载地块与轨迹
			handleClickDay(val) {
				let mon = val.month + 1;
				if(mon >= 1 && mon <= 9) {
					mon = '0' + mon
				}
				let day = val.day;
				if(day >= 1 && day <= 9) {
					day = '0' + day
				}
				this.TalksMap.allLineLayer.clear();
				this.TalksMap.plotLayer.clear();
				this.TalksMap.allPointLayer.clear();
				this.jobDate = val.year + '-' + mon + '-' + day
				this.getPlotData();
				this.getLineData();
				this.getJobData();
				this.mapDetail = true;
				document.getElementById('showMarker').checked = false
				document.getElementById('showLine').checked = true
				document.getElementById('showblocks').checked = false
				this.clearTimes();
				this.currentJobLngLat='';
				this.currentJobTime='';
				this.singleDataShow = false
				

			},
			//			清除轨迹定时器
			clearTimes() {
				if(this.TalksMap._timer || this.TalksMap.i > 0) {
					clearInterval(this.TalksMap._timer);
					this.TalksMap._timer = '';
					this.TalksMap.i == 0;
				}
				this.lastLinePoints = []
				this.TalksMap.lastLineLayer.clear()
				this.TalksMap.allYellowLineLayer.clear();

				this.TalksMap.allYellowLine = [];

				this.TalksMap.carPoint.clear()

				this.TalksMap.fist = true
				this.TalksMap.lineLog = []
				this.TalksMap.lastLinePoints = []
				this.TalksMap.btnName = ''

				this.operationForPauseAndContinue = 'start'
				document.getElementById("pauseBtns").innerHTML = "开始";
				this.continueOrStopUrl = this.kaishi;
				this.calendarFlag = true;
			},
			//			日历上一个月
			handlePrevMonth(val) {
				let mon = val.month + 1;
				if(mon >= 1 && mon <= 9) {
					mon = '0' + mon
				}
				this.monthVal = val.year + '-' + mon;
				this.getArea();
			},
			//			日历下一个月
			handleNextMonth(val) {
				let mon = val.month + 1;
				if(mon >= 1 && mon <= 9) {
					mon = '0' + mon
				}
				this.monthVal = val.year + '-' + mon;
				this.getArea();
			},

			//			轨迹速度切换
			speedChange(typeName) {
				if(this.popVisible) {
					if(typeName == 'slowdown') {
						this.speedIsActive = this.speedIsActive == 0 ? 0 : this.speedIsActive - 1
					} else {
						let len = this.speedList.length - 1;
						this.speedIsActive = this.speedIsActive == len ? len : this.speedIsActive + 1
					}
					this.speedNum = this.speedList[this.speedIsActive].speed;
					if(this.trackList.length > 0) {
						this.TalksMap.playBack(
							this.trackList[0],
							typeName,
							this.stopedIndex,
							this.stopedIndex > 0,
							undefined, this.speedNum
						);
					}
				} else {
					this.popVisible = true
				}

			},
			//			开始轨迹
			handlePlay(typeName, index) {
				if(index || index === 0) {
					this.speedNum = this.speedList[index].speed
				}
				if(typeName === "start") { //开始
					let name_ = this.$store.state.kName
					this.$store.state.kName = name_ ? '' : 'start'
					this.stopedIndex = 0;
					this.calendarFlag = false;
					this.operationForPauseAndContinue = 'pause'
					document.getElementById("pauseBtns").innerHTML = "停止";
					this.continueOrStopUrl = this.tingzhi;
					this.speedNum = 400
					this.speedIsActive = 1
				} else if(typeName === "pause") { //停止
					this.stopedIndex = this.TalksMap.i;
					this.operationForPauseAndContinue = 'continue'
					document.getElementById("pauseBtns").innerHTML = "继续";
					this.continueOrStopUrl = this.kaishi;
					this.calendarFlag = true;
					this.popVisible = false;

				} else if(typeName === "continue") { //继续
					this.operationForPauseAndContinue = 'pause'
					document.getElementById("pauseBtns").innerHTML = "停止";
					this.continueOrStopUrl = this.tingzhi;
					this.calendarFlag = false;

				} else if(typeName === "stop") {
					this.TalksMap.lastLinePoints = []
					this.calendarFlag = true;
					this.popVisible = false;
				} else if(typeName === "accelerate") { //加速减速
					this.speedIsActive = index
					this.speedNum = this.speedList[index].speed;
				}
				if(this.trackList.length > 0) {
					this.TalksMap.playBack(
						this.trackList,
						typeName,
						this.stopedIndex,
						this.stopedIndex > 0,
						undefined, this.speedNum
					);
				}
			},
			//			切换轨迹/地块/坐标点
			changedFn(e) {
				let inp = e.currentTarget;
				if(inp.checked) {
					if(inp.value == 0) {
						this.TalksMap.addPoints(this.trackList)
					} else if(inp.value == 1) {
						this.TalksMap.drawLine(this.trackList)
						this.statusStatic = true;
					} else if(inp.value == 2) {
						this.TalksMap.drawPlot(this.plotList)
					}
				} else {

					if(inp.value == 0) {
						this.TalksMap.allPointLayer.clear();
					} else if(inp.value == 1) {
						this.TalksMap.allLineLayer.clear();
						this.statusStatic = false;
					} else if(inp.value == 2) {
						this.TalksMap.plotLayer.clear();
					}
				}
			},
			//			详情数据
			getDetail() {
				this.$http({
						url: this.api.api_map + '/queryMachineInfo',
						method: 'post',
						params: {
							imei: this.imei,
						}
					})
					.then((responese) => {
						if(responese.data.code == 0) {
							this.jobDataInfo = responese.data.data.jobDataInfo ? responese.data.data.jobDataInfo : {};
							this.machineInfo = responese.data.data.machineInfo ? responese.data.data.machineInfo : {};
						} else {
							this.$message({
								message: responese.data.errMsg,
								type: 'error',
								customClass: 'customClass'
							});
						}
					})
					.catch((error) => {
						console.log(error);
					});
			},
			//			地块数据
			getPlotData() {
				this.$http({
						url: this.api.api_map + '/queryJobPlotInfo',
						method: 'post',
						params: {
							imei: this.imei,
							jobDate: this.jobDate,
						}
					})
					.then((responese) => {
						if(responese.data.code == 0) {
							this.plotList = responese.data.data;
						} else {
							this.$message({
								message: responese.data.errMsg,
								type: 'error',
								customClass: 'customClass'
							});
						}
					})
					.catch((error) => {
						console.log(error);
					});
			},
			//			轨迹数据
			getLineData() {
				if(this.TalksMap.lastLineLayer) {
					this.TalksMap.lastLineLayer.clear();
					this.TalksMap.carPoint.clear();
				}

				if(this.TalksMap._timer || this.TalksMap.i > 0) {
					clearInterval(this.TalksMap._timer);
					this.TalksMap._timer = ''
				}
				this.$http({
						url: this.api.api_map + '/queryJobTraceInfo',
						method: 'post',
						params: {
							imei: this.imei,
							jobDate: this.jobDate,
						}
					})
					.then((responese) => {
						if(responese.data.code == 0) {
							if(responese.data.data && responese.data.data.trackLinestring.length > 0) {
								this.trackList = responese.data.data.trackLinestring;
								let pointCount = 0;
								responese.data.data.trackLinestring.forEach((item, index) => {
									pointCount += item.length
								})
								this.currentDayData.pointCount = pointCount
								this.TalksMap.drawLine(this.trackList)
								this.statusStatic = true;

							} else {
								this.statusStatic = false;
							}

						} else {
							this.$message({
								message: responese.data.errMsg,
								type: 'error',
								customClass: 'customClass'
							});
						}
					})
					.catch((error) => {
						console.log(error);
					});
			},

			// 获取当前月
			getNowFormatDates() {
				var date = new Date()
				var seperator1 = '-'
				var year = date.getFullYear()
				var month = date.getMonth() + 1
				var strDate = date.getDate()
				if(month >= 1 && month <= 9) {
					month = '0' + month
				}
				if(strDate >= 1 && strDate <= 9) {
					strDate = '0' + strDate
				}
				this.monthVal = year + seperator1 + month;
				var currentdate = year + seperator1 + month + seperator1 + strDate
				return currentdate
			},

			//  关闭右侧详情
			closeDetail() {
				this.mapDetail = false
			},
			//			路网层显示
			showRoadFn(e) {
				this.TalksMap.hideRoadLayer(e.target.checked)
			},
			//测距
			measureDistance() {
				this.active = 1;
				this.TalksMap.distanceTool.enable();
				this.TalksMap.areaTool.disable();

			},
			//测绘
			measureArea() {
				this.active = 2;
				this.TalksMap.areaTool.enable();
				this.TalksMap.distanceTool.disable();

			},
			//清空
			clearMapAll() {
				this.active = 3;
				this.TalksMap.areaTool.clear();
				this.TalksMap.distanceTool.clear();
				this.TalksMap.areaTool.disable();
				this.TalksMap.distanceTool.disable();

			},
			//			切换卫星图层/矢量图层
			changeSateLLite(type) {
				this.active = 0;
				this.sateLLiteTrue = !this.sateLLiteTrue;
				this.TalksMap.isSateList = this.sateLLiteTrue;
				this.TalksMap.changeSate(type);
			},
			//切换影像底图
			changeMap(mapType) {
				this.tianditu = !this.tianditu;
				this.TalksMap.isTd = this.tianditu;
				this.TalksMap.changeMap(mapType);
				this.dialogFormVisible = false
			},

			//初始化地图
			initMapTalk() {
				let this_ = this
				this.TalksMap.init("mapMain")
			}

		}
	}
</script>

<style scoped>

</style>