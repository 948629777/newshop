<template>
    <div>
        <!-- 逐级导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }"
				>首页</el-breadcrumb-item
			>
			<el-breadcrumb-item>权限管理</el-breadcrumb-item>
			<el-breadcrumb-item>权限列表</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图区域 -->
		<el-card>
			<!-- 搜索与添加区域 -->
			<!-- <el-row :gutter="20">
				<el-col :span="8">
					<el-input
						placeholder="请输入内容"
						v-model="queryInfo.query"
						clearable
						@clear="getUserList"
					>
						<el-button
							slot="append"
							icon="el-icon-search"
							@click="getUserList"
						></el-button>
					</el-input>
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="addDialogVisible = true"
						>添加用户</el-button
					>
				</el-col>
			</el-row>
 -->
			<!-- 用户列表区域 -->
			<el-table :data="rightslist" border stripe>
				<el-table-column type="index" label="#"></el-table-column>
				<el-table-column label="ID" prop="id"></el-table-column>
				<el-table-column label="权限" prop="authName"></el-table-column>
				<el-table-column label="路径" prop="path"></el-table-column>
				<el-table-column
					label="等级">
                    <template slot-scope="scope">
                        <el-tag :type="item[scope.row.level]">{{ scope.row.level|levelTo }}</el-tag>
                    </template>
            </el-table-column>
			</el-table>

			<!-- 分页区域 -->
			<el-pagination
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="queryInfo.pagenum"
				:page-sizes="[1, 2, 5, 10]"
				:page-size="queryInfo.pagesize"
				layout="total, sizes, prev, pager, next, jumper"
				:total="total"
			>
			</el-pagination>
		</el-card>
    </div>
</template>

<script>
    export default {
        data:function(){
            return {
                total:1,
                rightslist:[],
                queryInfo: {
				//每页条数，当前页码，用于请求数据
				pagesize: 10,
				pagenum: 1,
			},
            item:['','success','info','danger','warning']
            }
        },
        mounted(){
            this.curCardData()
			this.$axios({
				method:''
			})
        },
        methods:{
            handleSizeChange(e){//每页条数改变
                this.queryInfo.pagesize=e
                this.curCardData()
            },
            handleCurrentChange(e){//页码改变
                this.queryInfo.pagenum=e
                this.curCardData()
            },
            curCardData(){
                this.$axios({
                method:'get',
                url:'rights/list'
            }).then((res)=>{
                this.total=res.data.length
                res.data.sort((a,b)=>{
                    return a.level-b.level
                })
                var index = this.queryInfo.pagesize*(this.queryInfo.pagenum-1)
                var curdata=[]
                for(var i=0;i<this.queryInfo.pagesize;i++){
                    if(index+i==res.data.length) break
                    curdata.push(res.data[index+i])
                }
                this.rightslist=curdata
                this.open2()
            })
            },
            open2() {
			// a=消息，b=弹框类型
			this.$message({
				message: '数据更新成功',
				type: 'success',
				duration: 2000,
			})
		},
        },
        filters:{
            levelTo(val){
                var str = val==0?'一级':(val==1?'二级':'三级')
                return str
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>