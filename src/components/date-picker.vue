<template>
	<div class="cc-calendar">
		<calendarHeader :headOptions="headOptions" @handlePrevMonth='handlePrevMonth' @handleNextMonth='handleNextMonth' @handleToday='handleToday' @dateHide='dateHide' />
		<ul class="calendar-week">
			<li v-for="(item, index) in calendarTitleArr" :key="index" class="week-item">{{item}}</li>
		</ul>
		<ul class="calendar-view">
			<li v-for="(item, index) in visibleCalendar" :key="index" class="date-view" :class="[
          {'month-class': !isCurrentMonth(item.date)},
          {todayBg: isCurrentDay(item.date)},
          {handleDay: item.clickDay}]" @click="handleClickDay(item)">
				<span class="date-day" :style="dayStyle" :class="[{'opacity-class': !isCurrentMonth(item.date)}]">
          {{item.day}}
        </span>
				<span class="calendar-num" v-show="item.areaNum">
          {{item.areaNum}}亩
          <!--{{item.calendarNum}}-->
        </span>
			</li>
		</ul>
	</div>
</template>

<script>
	import '../assets/css/reset.min.css'
	import calendarHeader from './canlendar-head.vue';
	import * as utils from '@/assets/js/utils.js';

	export default {
		name: 'cc-calendar',
		componentName: 'cc-calendar',
		props: {
			options: Object,
			areaList: Array
		},
		components: {
			calendarHeader
		},
		data() {
			let {
				year,
				month,
				day
			} = utils.getNewDate(new Date());
			return {
				headOptions: {
					type: this.options.type,
					style: this.options.headStyle,
					date: '',
				},
				calendarTitleArr: [
					'一',
					'二',
					'三',
					'四',
					'五',
					'六',
					'日'
				],
				time: {
					year,
					month,
					day
				},
				calendarList: []
			}
		},
		computed: {
			dayStyle: function() {
				return {
					textAlign: this.options.viewStyle.day,
				}
			},
			visibleCalendar() {
				let calendatArr = [];
				let {
					year,
					month,
					day
				} = utils.getNewDate(utils.getDate(this.time.year, this.time.month, 1));

				let currentFirstDay = utils.getDate(year, month, 1);

				// 获取当前月第一天星期几
				let weekDay = currentFirstDay.getDay();
				if(weekDay == 0) {
					weekDay += 7;
				}
				let startTime = currentFirstDay - (weekDay - 1) * 24 * 60 * 60 * 1000;

				let monthDayNum = 42;
				//				if(weekDay == 5 || weekDay == 6) {
				//					monthDayNum = 42
				//				} else {
				//					monthDayNum = 35
				//				};

				for(let i = 0; i < monthDayNum; i++) {
					calendatArr.push({
						date: new Date(startTime + i * 24 * 60 * 60 * 1000),
						year: year,
						month: new Date(startTime + i * 24 * 60 * 60 * 1000).getMonth(),
						day: new Date(startTime + i * 24 * 60 * 60 * 1000).getDate(),
						clickDay: false,
						areaNum: ''
					})
				};
				for(let i = 0; i < calendatArr.length; i++) {
					for(let j = 0; j < this.areaList.length; j++) {
						if(calendatArr[i].month + 1 == this.areaList[j].month.substring(6, 7) && calendatArr[i].day == this.areaList[j].date) {
							calendatArr[i].areaNum = this.areaList[j].area
						}
					}
				}
				this.headOptions.date = `${year}年${utils.englishMonth(month)}`;
				return calendatArr
			}
		},
		methods: {
			// 是否是当前月
			isCurrentMonth(date) {
				let {
					year: currentYear,
					month: currentMonth
				} = utils.getNewDate(utils.getDate(this.time.year, this.time.month, 1));
				let {
					year,
					month
				} = utils.getNewDate(date);
				return currentYear == year && currentMonth == month
			},
			// 是否是今天 
			isCurrentDay(date) {
				let {
					year: currentYear,
					month: currentMonth,
					day: currentDay
				} = utils.getNewDate(new Date());
				let {
					year,
					month,
					day
				} = utils.getNewDate(date);
				return currentYear == year && currentMonth == month && currentDay == day;
			},
			// 上一个月
			handlePrevMonth() {
				let prevMonth = utils.getDate(this.time.year, this.time.month, 1);
				prevMonth.setMonth(prevMonth.getMonth() - 1);
				this.time = utils.getNewDate(prevMonth);
				this.headOptions.date = `${utils.englishMonth(this.time.month)} ${this.time.year}`;
				this.$emit('handlePrevMonth', this.time);
			},
			// 下一个月
			handleNextMonth() {
				let nextMonth = utils.getDate(this.time.year, this.time.month, 1);
				nextMonth.setMonth(nextMonth.getMonth() + 1);
				this.time = utils.getNewDate(nextMonth);
				this.headOptions.date = `${utils.englishMonth(this.time.month)} ${this.time.year}`;
				this.$emit('handleNextMonth', this.time);
			},
			// 点击回到今天
			handleToday() {
				this.time = utils.getNewDate(new Date());
				// this.returnDate();
				console.log(utils.formatDate(this.time.month))
				this.$emit('handleToday');
			},
			// 点击某一天
			handleClickDay(item) {
				this.$forceUpdate();
				this.$emit('handleClickDay', item);
				this.visibleCalendar.forEach((i, index) => {
					i.clickDay = false
				})
				this.$set(item, 'clickDay', true);

			},
			dateHide() {
				this.$emit('dateHide');
			}
		},
		created() {
			this.calendarList = this.visibleCalendar;
			this.calendarType = this.options.calendarType;
		}
	}
</script>

<style lang="less">
	.areaMark {
		position: absolute;
	}
	
	.cc-calendar {
		padding: 2vh 1.5vw;
		width: 30vw;
		height: 30vw;
		background: #F9FAFC;
		box-sizing: border-box;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 9;
		.calendar-week {
			display: flex;
			width: 100%;
			height: 2vw;
			line-height: 2vw;
			border: 1px solid #E4E7EA;
			border-right: none;
			background: #f1f2f4;
			.week-item {
				width: 14.285%;
				text-align: center;
				font-size: 0.8vw;
				color: #424953;
				border-right: 1px solid #E4E7EA;
				font-weight: 600;
			}
		}
		.calendar-view {
			display: flex;
			flex-wrap: wrap;
			width: 100%;
			border-left: 1px solid #E4E7EA;
			/*text-align: center;*/
			.date-view {
				width: 14.285%;
				height: 3.5vw;
				border-right: 1px solid #E4E7EA;
				border-bottom: 1px solid #E4E7EA;
				box-sizing: border-box;
				cursor: pointer;
				position: relative;
				.date-day {
					font-size: 0.8vw;
					color: #7F8794;
					position: absolute;
					left: 0;
					z-index: 9;
					top: 0;
				}
				.calendar-num {
					display: block;
					text-align: center;
					font-size: 0.7vw;
					color: #2061ff;
					width: 100%;
					/* border: 1px solid #f00; */
					background: #e4f1ff;
					height: 100%;
					line-height: 3.5vw;
				}
			}
			.opacity-class {
				opacity: .5;
			}
			.month-class {
				background-image: linear-gradient(45deg, rgba(000, 000, 000, .03) 25%, transparent 25%, transparent 50%, rgba(000, 000, 000, .03) 50%, rgba(000, 000, 000, .03) 75%, transparent 75%, transparent);
				background-size: 20px 20px;
			}
			.todayBg {
				background: #FFFDEF;
			}
			.handleDay {
				background: #409eff !important;
				.date-day {
					color: #fff !important;
				}
				.calendar-num {
					color: #fff !important;
					background: none !important;
				}
			}
		}
	}
</style>