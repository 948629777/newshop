<template>
    <div>
        <!-- 逐级导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }"
				>首页</el-breadcrumb-item
			>
			<el-breadcrumb-item>数据统计</el-breadcrumb-item>
			<el-breadcrumb-item>数据报表</el-breadcrumb-item>
		</el-breadcrumb>
        <div id="chartBox" style="width: 500px;height: 400px;"></div>
        <!--  -->
    </div>
</template>

<script>
import echarts from 'echarts'
    export default {
        data(){
            return {

            }
        },
        methods:{
            fn(){

            }
        },
        mounted(){     
            console.log(echarts);
            var box = document.querySelector('#chartBox')
            var chartBox = echarts.init(box)   
            this.$axios({
                method:'get',
                url:'reports/type/1'
            }).then(res=>{
                chartBox.setOption(res.data)
            })
        },
    }
</script>

<style scoped>

</style>