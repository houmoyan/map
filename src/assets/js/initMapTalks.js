	import * as maptalks from 'maptalks'
	let vm = null

	function TalksMap(mapid) {
		this.mapDom = ''
		this.dialogMapDom = ''
		//	卫星图层
		this.arcGisUrl = "http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer"
		this.url = "http://t0.tianditu.gov.cn/img_w/wmts?" +
			"SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
			"&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}" +
			"&tk=154ec0f1c3e31efd7806545e0aa9a047"
		this.wordUrl = "http://t0.tianditu.gov.cn/cia_w/wmts?" +
			"SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
			"&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}" +
			"&tk=154ec0f1c3e31efd7806545e0aa9a047"
		//矢量图层
		this.vectorUrl = 'http://t{s}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=2635b736fcd04978596f1e7b0a2ad8d6'
		this.vectorWordUrl = 'http://t{s}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=2635b736fcd04978596f1e7b0a2ad8d6'
		
		//底层
		this.baseLayer = new maptalks.TileLayer('base', {
			urlTemplate: this.url,
		})
		//卫星路网层
		this.layer =
			new maptalks.TileLayer('boudaries', {
				'urlTemplate': this.wordUrl,
				'subdomains': ['1', '2', '3', '4'],
				'opacity': 1
			})
		//矢量路网层
		this.vectorWordLayer =
			new maptalks.TileLayer('vectorWord', {
				'urlTemplate': this.vectorWordUrl,
				'subdomains': ['1', '2', '3', '4'],
				'opacity': 0
			})
	}

	TalksMap.prototype.sendThis = function(_this) {
		vm = _this
	}

	TalksMap.prototype.init = function(container) {
		let this_ = this;
		this.map = ''
		this.isSateList = true;
		this.isTd = true;

		if(this.i > 0) {
			clearInterval(this._timer)
		}
		this.len = 0;
		this.allYellowLine = [];
		this.pointList = []
		this.Area = 0
		this.MathArea = 0
		this.drawArr = []
		this.lineArr = [] //轨迹或标记点数组
		// this._timer = '',//定时器明称
		this.i = 0,
			this.lineLog = [], //回放路线
			this.speed = 600 //轨迹回放速度
		this.fist = true,
			this.TimeOut = 0
		this.lastLinePoints = [],
			this.flag = true
		this.btnName = ''
		this.markerLngLat = '',
			this.lastLine = '',
			this.mapDom = new maptalks.Map(container, {
				center: [108.928439, 34.539281],
				crossOrigin: 'Anonymous',
				zoom: 5,
				//				maxZoom: 18,
				minZoom: 1,
				baseLayer: this.baseLayer,
				layers: [this.layer, this.vectorWordLayer]
			})
		
		

		let noZoomLevel = new maptalks.control.Zoom({
			position: {
				'top': 60,
				'left': 20
			},
			slider: true,
			zoomLevel: true
		})
		this.mapDom.addControl(noZoomLevel)
		//		测距
		this.distanceTool = new maptalks.DistanceTool({
			'symbol': {
				'lineColor': '#34495e',
				'lineWidth': 2
			},
			'vertexSymbol': {
				'markerType': 'ellipse',
				'markerFill': '#1bbc9b',
				'markerLineColor': '#000',
				'markerLineWidth': 3,
				'markerWidth': 10,
				'markerHeight': 10
			},

			'labelOptions': {
				'textSymbol': {
					'textFaceName': 'monospace',
					'textFill': '#fff',
					'textLineSpacing': 1,
					'textHorizontalAlignment': 'right',
					'textDx': 15,
					'markerLineColor': '#b4b3b3',
					'markerFill': '#000'
				},
				'boxStyle': {
					'padding': [6, 2],
					'symbol': {
						'markerType': 'square',
						'markerFill': '#000',
						'markerFillOpacity': 0.9,
						'markerLineColor': '#b4b3b3'
					}
				}
			},
			'clearButtonSymbol': [{
				'markerType': 'square',
				'markerFill': '#000',
				'markerLineColor': '#b4b3b3',
				'markerLineWidth': 2,
				'markerWidth': 15,
				'markerHeight': 15,
				'markerDx': 20
			}, {
				'markerType': 'x',
				'markerWidth': 10,
				'markerHeight': 10,
				'markerLineColor': '#fff',
				'markerDx': 20
			}],
			language: 'zh-CN'
		}).addTo(this.mapDom).disable();
		//		测绘
		class CustomAreaTool extends maptalks.AreaTool {
			_measure(toMeasure) {
				const map = this.getMap();
				let area;
				if(toMeasure instanceof maptalks.Geometry) {
					area = map.computeGeometryArea(toMeasure);
				} else if(Array.isArray(toMeasure)) {
					area = map.getProjection().measureArea(toMeasure);
				}
				this._lastMeasure = area;
				let units;
				if(this.options['language'] === 'zh-CN') {
					units = ['亩'];
				} else {
					units = [' sq.m', ' sq.km', ' sq.ft', ' sq.mi'];
				}
				let content = '';
				if(this.options['metric']) {
					area = area * 0.0015;
					content = area.toFixed(2) + units[0];
				}

				return content;
			}

		}
		this.areaTool = new CustomAreaTool({
			'symbol': {
				'lineColor': '#1bbc9b',
				'lineWidth': 2,
				'polygonFill': '#fff',
				'polygonOpacity': 0.3
			},
			'vertexSymbol': {
				'markerType': 'ellipse',
				'markerFill': '#34495e',
				'markerLineColor': '#1bbc9b',
				'markerLineWidth': 3,
				'markerWidth': 10,
				'markerHeight': 10
			},
			'labelOptions': {
				'textSymbol': {
					'textFaceName': 'monospace',
					'textFill': '#fff',
					'textLineSpacing': 1,
					'textHorizontalAlignment': 'right',
					'textDx': 15
				},
				'boxStyle': {
					'padding': [6, 2],
					'symbol': {
						'markerType': 'square',
						'markerFill': '#000',
						'markerFillOpacity': 0.9,
						'markerLineColor': '#b4b3b3'
					}
				},
				'metric': true,
				'imperial': false
			},
			'clearButtonSymbol': [{
				'markerType': 'square',
				'markerFill': '#000',
				'markerLineColor': '#b4b3b3',
				'markerLineWidth': 2,
				'markerWidth': 15,
				'markerHeight': 15,
				'markerDx': 22
			}, {
				'markerType': 'x',
				'markerWidth': 10,
				'markerHeight': 10,
				'markerLineColor': '#fff',
				'markerDx': 22
			}],
			language: 'zh-CN'
		}).addTo(this.mapDom).disable();
//		this.areaTool = new maptalks.AreaTool().addTo(this.mapDom).disable();

		this.plotLayer = new maptalks.VectorLayer('vector').addTo(this.mapDom)
		this.allLineLayer = new maptalks.VectorLayer('lineVector').addTo(this.mapDom)

		this.allPointLayer = new maptalks.VectorLayer('point').addTo(this.mapDom)
		this.lastLineLayer = new maptalks.VectorLayer('greenLine').addTo(this.mapDom)
		this.allYellowLineLayer = new maptalks.VectorLayer('yellowLine').addTo(this.mapDom)

		this.carPoint = new maptalks.VectorLayer("carPoint").addTo(this.mapDom);
		this.muLayer = new maptalks.VectorLayer('muLayer').addTo(this.mapDom)
		this.allLayer = new maptalks.VectorLayer('vector').addTo(this.mapDom)
	}

	//	显示/隐藏路网层
	TalksMap.prototype.hideRoadLayer = function(flag) {
		flag ? this.layer.show() : this.layer.hide()
		flag ? this.vectorWordLayer.show() : this.vectorWordLayer.hide()
	}
	//	卫星矢量图层
	TalksMap.prototype.changeSate = function(type) {
		let this_ = this;
		//		this.layer.clear()
		this.baseLayer.clear()

		if(this.isTd) { //当前是天地图
			vm.roadShow = true
			if(type == 0) { //天地图矢量图
				this.layer.setOpacity(0)
				this.vectorWordLayer.setOpacity(1)

				this.baseLayer.setOptions({
					'urlTemplate': this.vectorUrl,
					'subdomains': ['1', '2', '3', '4']
				})
			} else { //天地图卫星图
				this.layer.setOpacity(1)
				this.vectorWordLayer.setOpacity(0)

				this.baseLayer.setOptions({
					'urlTemplate': this.url,
					'subdomains': ['1', '2', '3', '4']
				})
			}
		} else {
			if(type == 0) { //arcGis矢量图
				var arcUrl = 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer';
				maptalks.SpatialReference.loadArcgis(arcUrl + '?f=pjson', function(err, conf) {
					if(err) {
						throw new Error(err);
					}
					var ref = conf.spatialReference;
					//ref.projection = 'EPSG:4326';
					this_.mapDom.setSpatialReference(ref)
					this_.baseLayer.setOptions({
						'tileSystem': conf.tileSystem,
						'tileSize': conf.tileSize, // [512, 512]
						'urlTemplate': arcUrl + '/tile/{z}/{y}/{x}',
					})

				})
				this.layer.setOpacity(0)
				this.vectorWordLayer.setOpacity(0)
				vm.roadShow = false
			} else { //arcGis卫星图
				var arcUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';
				maptalks.SpatialReference.loadArcgis(arcUrl + '?f=pjson', function(err, conf) {
					if(err) {
						throw new Error(err);
					}
					var ref = conf.spatialReference;
					//ref.projection = 'EPSG:4326';
					this_.mapDom.setSpatialReference(ref)
					this_.baseLayer.setOptions({
						'tileSystem': conf.tileSystem,
						'tileSize': conf.tileSize, // [512, 512]
						'urlTemplate': arcUrl + '/tile/{z}/{y}/{x}',
					})

				})
				this.layer.setOpacity(1)
				this.vectorWordLayer.setOpacity(0)
				vm.roadShow = true
			}
		}

		this.mapDom._loadAllLayers()
	}
	//切换arcGis和天地图
	TalksMap.prototype.changeMap = function(type) {
		let this_ = this;

		if(this.isSateList) { //当前是卫星图
			vm.roadShow = true
			if(type == 1) { //arcgis
				var arcUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';
				maptalks.SpatialReference.loadArcgis(arcUrl + '?f=pjson', function(err, conf) {
					if(err) {
						throw new Error(err);
					}
					var ref = conf.spatialReference;
					//ref.projection = 'EPSG:4326';
					this_.mapDom.setSpatialReference(ref)
					this_.baseLayer.setOptions({
						'tileSystem': conf.tileSystem,
						'tileSize': conf.tileSize, // [512, 512]
						'urlTemplate': arcUrl + '/tile/{z}/{y}/{x}',
					})

				})
			} else { //天地图
				this.baseLayer.setOptions({
					urlTemplate: this.url,
				})
				this.layer.setOpacity(1)
				this.vectorWordLayer.setOpacity(0)
				this_.mapDom.setSpatialReference(null)
			}
		} else { //当前是矢量图
			if(type == 1) { //arcgis
				var arcUrl = 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer';
				maptalks.SpatialReference.loadArcgis(arcUrl + '?f=pjson', function(err, conf) {
					if(err) {
						throw new Error(err);
					}
					var ref = conf.spatialReference;
					//ref.projection = 'EPSG:4326';
					this_.mapDom.setSpatialReference(ref)
					this_.baseLayer.setOptions({
						'tileSystem': conf.tileSystem,
						'tileSize': conf.tileSize, // [512, 512]
						'urlTemplate': arcUrl + '/tile/{z}/{y}/{x}',
					})

				})
				this.layer.setOpacity(0)
				this.vectorWordLayer.setOpacity(0)
				vm.roadShow = false

			} else { //天地图
				this.baseLayer.setOptions({
					urlTemplate: this.vectorUrl,
				})
				this.layer.setOpacity(0)
				this.vectorWordLayer.setOpacity(1)

				this_.mapDom.setSpatialReference(null)
				vm.roadShow = true
			}
		}

	}
	//	添加轨迹点
	TalksMap.prototype.addPoints = function(lineArr) {
		let this_ = this;
		lineArr.forEach(function(i, j) {
			i.forEach(function(item, index) {
				let lngLat = [item[0], item[1]];
				var point = new maptalks.Marker(
					item, {
						visible: true,
						editable: true,
						cursor: 'pointer',
						shadowBlur: 0,
						shadowColor: 'black',
						draggable: false,
						dragShadow: false, // display a shadow during dragging
						drawOnAxis: null, // force dragging stick on a axis, can be: x, y
						'symbol': [{
							'markerType': 'ellipse',
							'markerFill': '#fff',
							'markerFillOpacity': 1,
							'markerWidth': 9,
							'markerHeight': 9,
							'markerLineWidth': 2,
							'markerLineColor': '#f00'
						}],

					}
				);
				point.setProperties(item[2])
				point.addTo(this_.allPointLayer)
				point.on('click', function(e) {
					vm.getNumData(e)
				})
			})
		})
		let Coordinate = {
			x: Number(lineArr[0][0][0]),
			y: Number(lineArr[0][0][1])
		}
		this.mapDom.setCenter(Coordinate)
		if(this.mapDom.getZoom() < 16) {
			this.mapDom.setZoom(16)
		}
	}
	//	添加轨迹
	TalksMap.prototype.drawLine = function(lineArr) {
		for(var i = 0; i < lineArr.length; i++) {
			var pointData = lineArr[i].map(function(data) {
				let arr = [Number(data[0]), Number(data[1])]
				return arr
			});
			var line = new maptalks.LineString(pointData, {
				arrowStyle: null, // arrow-style : now we only have classic
				arrowPlacement: 'vertex-last', // arrow's placement: vertex-first, vertex-last, vertex-firstlast, point
				visible: true,
				editable: true,
				cursor: null,
				shadowBlur: 0,
				shadowColor: 'black',
				draggable: false,
				dragShadow: false, // display a shadow during dragging
				drawOnAxis: null, // force dragging stick on a axis, can be: x, y
				symbol: {
					'lineColor': '#f00',
					'lineWidth': 2,
					'smoothness': 0.5,
				}
			}).on('mouseenter click', function(e) {
				//update markerFill to highlight
				e.target.updateSymbol({
					lineColor: 'blue'
				})
			}).on('mouseout', function(e) {
				e.target.updateSymbol({
					lineColor: '#f00'
				})
			});
			line.addTo(this.allLineLayer);
		}
		let Coordinate = {
			x: Number(lineArr[0][0][0]),
			y: Number(lineArr[0][0][1])
		}
		this.mapDom.setCenter(Coordinate)
		if(this.mapDom.getZoom() < 16) {
			this.mapDom.setZoom(16)
		}
	}
	//添加地块
	TalksMap.prototype.drawPlot = function(plotArr) {
		for(var i = 0; i < plotArr.length; i++) {

			let plot = plotArr[i].blockEdgePointList.map(item => {
				return item.map(i => {
					return [parseFloat(i[0]), parseFloat(i[1])]
				})
			})
			let multiPolygon = new maptalks.Polygon(plot, {
					visible: true,
					editable: true,
					cursor: null,
					shadowBlur: 0,
					shadowColor: 'black',
					draggable: false,
					dragShadow: false, // display a shadow during dragging
					drawOnAxis: null, // force dragging stick on a axis, can be: x, y
					symbol: {
						lineColor: '#c4c710',
						lineWidth: 2,
						polygonFill: '#c4c710',
						polygonOpacity: 0.6
					},
					//				properties: {
					//					blockInfo: blockInfo,
					//					altitude: 50
					//				},

				}).on('mouseenter click', function(e) {
					//update markerFill to highlight
					e.target.updateSymbol({
						polygonFill: 'purple'
					})
				})
				.on('mouseout', function(e) {
					e.target.updateSymbol({
						polygonFill: '#c4c710'
					})
				})
			// multiPolygon.on('mousedown mouseup click dbclick contextmenu touchstart touchend', this.displayInfoWindow)
			//					multiPolygon.on('click', this.displayInfoWindow)
			multiPolygon.addTo(this.plotLayer)
		}
		let Coordinate = {
			x: Number(plotArr[0].blockEdgePointList[0][0][0]),
			y: Number(plotArr[0].blockEdgePointList[0][0][1])
		}
		this.mapDom.setCenter(Coordinate)
		if(this.mapDom.getZoom() < 16) {
			this.mapDom.setZoom(16)
		}

	}

	//	点击轨迹操作按钮
	TalksMap.prototype.playBack = function(pointArray, operationName, markerLastRunPosition, stopFlag, workName, speedNum) {
		this.workName = workName;
		if(operationName === 'start') {
			this.lineLog = pointArray;
			let markerPosition = markerLastRunPosition && markerLastRunPosition > 0 ? markerLastRunPosition : 0
			if(this.fist) {
				var points = []

				if(markerPosition === this.i && stopFlag) {
					var imgUrl = require('../img/bofang/nongji1.png')
					var point = new maptalks.Marker([this.lineLog[markerPosition][0], this.lineLog[markerPosition][1]], {
						symbol: [{
							markerFile: imgUrl,
							markerWidth: 20,
							markerHeight: 25,
							markerDx: 0,
							markerDy: 0,
							markerOpacity: 1
						}]
					});
					point.addTo(this.carPoint);

				}
			}
		}
		this.arrLen = this.lineLog.length;
		this.count = 0;

		for(var i = 0; i < this.lineLog.length; i++) {
			this.count = this.count + this.lineLog[i].length;
		}
		if(operationName == 'start') { //开始 
			clearInterval(this._timer);
			//					this._CarTrack.start()
			this.lastLinePoints = [];
			this.btnName = '';
			this.i = 0
			this.fist = false
			this._timer = setInterval(this.onlyAddmarker.bind(this), speedNum)

		} else if(operationName == 'accelerate') { // 加速
			this.fist = false
			clearInterval(this._timer)
			this._timer = setInterval(this.onlyAddmarker.bind(this), speedNum)
		} else if(operationName == 'slowdown') { //减速
			this.fist = false
			clearInterval(this._timer)
			this._timer = setInterval(this.onlyAddmarker.bind(this), speedNum)
		} else if(operationName == 'stop') { //停止
			this.fist = true
			this.lineLog = []
			this.i = 0
			clearInterval(this._timer)
		} else if(operationName == 'pause') { //暂停
			this.fist = false
			this.i = markerLastRunPosition
			clearInterval(this._timer)
		} else if(operationName == 'continue') { //继续
			this.fist = false
			this.i = markerLastRunPosition
			this._timer = setInterval(this.onlyAddmarker.bind(this), speedNum)
		}
	}
	var point;
	TalksMap.prototype.onlyAddmarker = function(i) {
		var icon = require('../img/bofang/nongji1.png')
		this.currentLen = 1;

		if(this.lineLog.length > 0) {
			this.allLayer.clear();
		let extent = this.map.getExtent()
		let extentArr = [
			[extent.xmin, extent.ymin],
			[extent.xmax, extent.ymin],
			[extent.xmax, extent.ymax],
			[extent.xmin, extent.ymax]
		]

		if(this.carPoint.getCount()) {
			this.carPoint.clear()
		}
		let multiPolygon = new maptalks.Polygon(extentArr, {
			visible: true,
			editable: true,
			cursor: null,
			shadowBlur: 0,
			shadowColor: 'black',
			draggable: false,
			dragShadow: false, // display a shadow during dragging
			drawOnAxis: null, // force dragging stick on a axis, can be: x, y
			symbol: {
				lineColor: '#c4c710',
				lineWidth: 0,
				polygonFill: '#c4c710',
				polygonOpacity: 0
			},

		})
		multiPolygon.addTo(this.allLayer)
			
			if(this.len <= this.arrLen - 1) {

				let markPosition = this.i > 0 ? this.i - 1 : 0
				if(this.i > 0 && this.lineLog[this.len][markPosition - 1]) {
					let currentLngLat;
					if(markPosition < this.lineLog[this.len].length) {
						currentLngLat = [this.lineLog[this.len][markPosition][0], this.lineLog[this.len][markPosition][1]]
						vm.currentJobLngLat = currentLngLat.join(',')
						vm.currentJobTime = this.lineLog[this.len][markPosition][2]

					} else {
						currentLngLat = [this.lineLog[this.len][markPosition - 1][0], this.lineLog[this.len][markPosition - 1][1]]
					}
			let inExtent = multiPolygon.containsPoint(new maptalks.Coordinate(currentLngLat))
		if(!inExtent) {
			this.map.panTo(currentLngLat)
		}
					this.markerLngLat = [this.lineLog[0][0][0], this.lineLog[0][0][1]]

					//		this.marker = new T.Marker(currentLngLat, {
					//			icon: icon
					//		})

					//		let currentPoint = this.map.lngLatToContainerPoint(currentLngLat)
					//
					//		if(currentPoint.x < 100 || currentPoint.y < 100 || currentPoint.x > 1024 || currentPoint.y > 1024) {
					//			this.map.setViewport(new Array(currentLngLat))
					//		}

					//	设置角度偏转以及行驶过的路线变为绿色
					if(markPosition > 0) {
						let lastLngLat = [this.lineLog[this.len][markPosition - 1][0], this.lineLog[this.len][markPosition - 1][1]]
						this.angle = getAngle(lastLngLat, currentLngLat);
						this.lastLinePoints.push([Number(this.lineLog[this.len][markPosition - 1][0]), Number(this.lineLog[this.len][markPosition - 1][1])]);
					}

					point = new maptalks.Marker(currentLngLat, {
						symbol: [{
							markerFile: icon,
							markerWidth: 20,
							markerHeight: 25,
						}]
					});
					point.addTo(this.carPoint);
					point.updateSymbol({
						markerRotation: 360 - this.angle
					})

					this.currentLen = this.len;

				}
				if(markPosition + 1 > this.lineLog[this.len].length) {
					this.i = 0
					this.allYellowLine.push(this.lastLinePoints);
					this.lastLine = new maptalks.LineString(this.allYellowLine[this.len], {
						symbol: {
							'lineColor': '#00ff00',
							'lineWidth': 2,
							'smoothness': 0.5,
						}
					});
					this.lastLine.addTo(this.allYellowLineLayer);
					this.lastLinePoints = []
					this.len++
				} else {
					this.i++;

					if(this.lastLineLayer.getCount() > 0) {
						this.lastLineLayer.clear()
					}
					this.lastLine = new maptalks.LineString(this.lastLinePoints, {
						symbol: {
							'lineColor': '#00ff00',
							'lineWidth': 2,
							'smoothness': 0.5,
						}
					});
					this.lastLine.addTo(this.lastLineLayer);

					//		lineDatas.push(currentLngLat);
				}

			} else {
				clearInterval(this._timer)
				this.lineLog = []
				this.i = 0
				this.len = 0
				this.btnName = "开始"
				vm.$store.state.kName = '';
				vm.$store.state.kName = "end";
				if(vm.$refs.trackLayer) {
					vm.$refs.trackLayer.$store.state.kName = '';
					vm.$refs.trackLayer.$store.state.kName = 'end';
				}

				this.fist = true;
				this.lastLinePoints = []
				this.allYellowLine = []
				this.lastLineLayer.clear()
				this.allYellowLineLayer.clear()
				point.setCoordinates(this.markerLngLat)

			}
		}

	}
	//传入两个经纬度点得到车辆角度 设置车辆Marker角度
	const getAngle = (startPoint, endPoint) => {
		if(!(startPoint && endPoint)) {
			return 0;
		}

		let dRotateAngle = Math.atan2(
			Math.abs(startPoint[0] - endPoint[0]),
			Math.abs(startPoint[1] - endPoint[1])
		);
		if(endPoint[0] >= startPoint[0]) {
			if(endPoint[1] >= startPoint[1]) {} else {
				dRotateAngle = Math.PI - dRotateAngle;
			}
		} else {
			if(endPoint[1] >= startPoint[1]) {
				dRotateAngle = 2 * Math.PI - dRotateAngle;
			} else {
				dRotateAngle = Math.PI + dRotateAngle;
			}
		}
		dRotateAngle = (dRotateAngle * 180) / Math.PI;
		return dRotateAngle;
	}

	export default TalksMap