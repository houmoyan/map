<template>
  <div class="calendar-header clear">
    <div class="calendar-box" v-if="this.headOptions.type == 'combination'">
      <span class="calendar-today" @click="handleToday()"> 今天 </span>
    	
      <div class="calendar-content" :style="{'text-align': this.headStyle.combination}">
        <span class="calendar-prev" @click="handlePrevMonth"></span>
        <span class="calendar-headDate"> {{this.headOptions.date}} </span>
        <span class="calendar-next" @click="handleNextMonth"></span>
      </div>

      <i class="iconfont icon-a-guanbi dateHide" @click="dateHide()"></i>
    </div>
    <div class="calendar-box" v-else>
      <span class="calendar-headDate"> {{this.headOptions.date}} </span>
      <span class="calendar-today dispersion-today" :style="{float: this.headStyle.todayBtn}" @click="handleToday()"> 今天 </span>
      <div class="calendar-content dispersion" :style="{float: this.headStyle.checkBtn}">
        <span class="calendar-prev" @click="handlePrevMonth"></span>
        <span class="calendar-next" @click="handleNextMonth"></span>
      </div>
     
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      headOptions: Object
    },
    data () {
      return {
        headStyle: ''
      }
    },
    mounted() {
      this.headStyle = this.headOptions.style;

    },
    methods: {
      // 上一个月
      handlePrevMonth () {
        this.$emit('handlePrevMonth');
      },
      // 下一个月
      handleNextMonth () {
        this.$emit('handleNextMonth');
      },
      // 回到今天
      handleToday () {
        this.$emit('handleToday');
      },
//    关闭日历
      dateHide () {
        this.$emit('dateHide');
      }
    }
  }
</script>

<style lang="less">
  .calendar-header {
    margin-bottom: 2vh;
    width: 100%;
    .calendar-box {
      position: relative;
          height: 3vh;
    line-height: 3vh;
      .calendar-content {
        width: 100%;
        .calendar-prev,
        .calendar-next {
          display: inline-block;
          vertical-align: middle;
          width: 8px;
          height: 11px;
          background: url('../assets/img/left.png') no-repeat;
          background-size: contain;
          cursor: pointer;
        }
        .calendar-next {
          background: url('../assets/img/right.png') no-repeat;
          background-size: contain;
        }
      }
      .dispersion{
        width: initial;
        display: inline;
      }
      .calendar-headDate {
        vertical-align: middle;
        margin: 0 12px;
        font-size: 18px;
        color: #424953;
        -webkit-user-select: none;
        -webkit-touch-callout: none; 
        -moz-user-select: none;
        -ms-user-select: none; 
        user-select: none;
      }
      .calendar-today {
       position: absolute;
    left: 0;
    top: 0;
    width: 4vw;
    line-height: 3.6vh;
    height: 3.6vh;
    text-align: center;
    border: 1px solid #409EFF;
    border-radius: 4px;
    font-size: 0.8vw;
    color: #409EFF;
    cursor: pointer;
      }
      .dispersion-today{
        position: inherit;
      }
      .calendar-center {
        margin: 0 auto;
      }
      .calendar-left {
        float: left;
      }
      .calendar-right {
        float: right;
      }
      .dateHide{
      	position: absolute;
      	color: #999;
      	    top: 0vh;
    right: 0vw;
    cursor: pointer;
      }
       .dateHide:hover{
       	color: #409EFF;
       }
    }
  }
</style>