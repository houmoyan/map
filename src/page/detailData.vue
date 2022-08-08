<template>
	<div class="wrap">
		<div class="detailData">
			<h1>农机信息</h1>
			<table border="1">
				<tr>
					<th>农机品目</th>
					<td>{{machineInfo.catThreeName}}</td>
					<th>农机型号</th>
					<td>{{machineInfo.njModel}}</td>
					<th>生产企业</th>
					<td>{{machineInfo.njFactoryName}}</td>
				</tr>
				<tr>
					<th>出厂编号</th>
					<td>{{machineInfo.njFactoryCode}}</td>
					<th>监控编号</th>
					<td colspan="3">{{machineInfo.imei}}</td>
						
				</tr>
			</table>
		</div>
		<div class="detailData">
			<h1>机主信息</h1>
			<table border="1">
				<tr>
					<th>机主姓名</th>
					<td>{{machineInfo.owner}}</td>
				</tr>
			</table>
		</div>
		<div class="detailData">
			<h1>作业信息</h1>
			<table border="1">
				<tr>
					<th>运行总里程</th>
					<td>{{jobDataInfo.totalMileageDay}}千米</td>
					<th>运行总面积</th>
					<td>{{jobDataInfo.totalRectifyArea}}亩</td>
					<th>运行总时长</th>
					<td>{{jobDataInfo.totalRunTimeDay}}小时</td>
				</tr>
			</table>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'detailData',
		data() {
			return {
				jobDataInfo: {},
				machineInfo: {},
				addIndex: 1,
				tableData: [],
				currentPage: 1, //当前页
				recordTotal: 0, //总条数
				pageSize: 10, //每页条数
			}
		},

		mounted() {
			this.imei = this.$route.query.imei;
			this.getDetail()
		},
		methods: {
			handleSearch() {
				this.getData()
			},
			//列表数据
			getDetail() {
				this.$http({
						url: this.api.api_map + '/queryMachineInfo',
						method: 'post',
						params: {
							imei: this.imei,
							//imei: '352522101957188',
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
			handleDetail(imei) {
				this.$router.push({
					path: "/map",
					query: {
						imei: imei
					}
				});
			},
			// 每页显示数量变动
			handleSizeChange(val) {
				this.pageSize = val;
				this.currentPage = 1;
				this.addIndex = 1;
				this.getData();
			},
			// 页码变更
			handleCurrentChange(val) {
				this.currentPage = val;
				this.addIndex = (this.currentPage - 1) * this.pageSize + 1;
				this.getData();
			},
		}
	}
</script>

<style scoped>

</style>