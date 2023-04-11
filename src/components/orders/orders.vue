<template>
    <div class="main">
        <!-- 逐级导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }"
				>首页</el-breadcrumb-item
			>
			<el-breadcrumb-item>订单管理</el-breadcrumb-item>
			<el-breadcrumb-item>订单列表</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图区域 -->
		<el-card>
			<!-- 搜索与添加区域 -->
			<el-row :gutter="20">
				<el-col :span="8">
					<el-input
						placeholder="请输入内容"
						v-model="queryInfo.query"
						clearable
						@clear="getOrdersList"
					>
						<el-button
							slot="append"
							icon="el-icon-search"
							@click="queryInId"
						></el-button>
					</el-input>
				</el-col>
			</el-row>

			<!-- 用户列表区域 -->
			<el-table :data="ordersList" border stripe>
				<el-table-column label="#" type="index"></el-table-column>
				<el-table-column label="订单号" prop="order_number"></el-table-column>
				<el-table-column label="订单价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款">
                    <template slot-scope="props">
                        <el-tag effect="dark" :type="props.row.pay_status|tagType()">{{ props.row.pay_status|payStatus() }}</el-tag>
                    </template>
                </el-table-column>
				<el-table-column
					label="是否发货"
					prop="is_send"
				></el-table-column>
				<el-table-column label="下单时间">
                    <template slot-scope="props">
                        {{ props.row.create_time|time('yyyy-MM-dd hh:mm:ss') }}
                    </template>
                </el-table-column>
				<el-table-column label="操作" width="220px">
					<template slot-scope="sp">
						<!-- 修改按钮 -->
						<el-button
							type="primary"
							icon="el-icon-edit"
							size="mini"
							@click="editOrders(sp.row)"
						></el-button>
						<!-- 地址按钮 -->
						<el-button
							type="success"
							icon="el-icon-location"
							size="mini"
							@click="editLocation(sp.row)"
						></el-button>
						<!-- 物流 -->
						<el-button
							type="success"
							icon="el-icon-location"
							size="mini"
							@click="getTimeVisible = true"
						>物流</el-button>
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

        <!-- 修改订单状态 -->
        <el-dialog
			title="修改订单"
			:visible.sync="editDialogVisible"
			width="50%"
			@close="editDialogClosed"
		>
			<el-form
				:model="editForm"
				ref="editFormRef"
				label-width="70px"
			>
				<el-form-item label="订单号">
					<el-input v-model="editForm.order_number" disabled></el-input>
				</el-form-item>
				<el-form-item label="订单价格">
					<el-input v-model="editForm.order_price"></el-input>
				</el-form-item>
				<el-form-item label="订单数量">
					<el-input v-model="editForm.order_number"></el-input>
				</el-form-item>		
                <el-form-item label="支付状态">
					<el-switch
							v-model="editForm.pay_status"
                            active-value="1"
                            inactive-value="0"
                            inactive-color="#ff4949"
                            active-color="#13ce66"
						>
						</el-switch>
				</el-form-item>
                <el-form-item label="是否发货">
					<el-switch
							v-model="editForm.is_send"
                            active-value="是"
                            inactive-value="否"
                            inactive-color="#ff4949"
                            active-color="#13ce66"
						>
						</el-switch>
				</el-form-item>
                <el-form-item label="支付方式">
					<el-select v-model="editForm.order_pay" placeholder="请选择">
						<el-option
							v-for="item in payList"
							:key="item.id"
							:label="item.name"
							:value="item.value"
						>
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editUserInfo"
					>确 定</el-button
				>
			</span>
		</el-dialog>

		<!-- 改地址 -->
		<el-dialog
			title="修改用户"
			:visible.sync="editLocationVisible"
			width="50%"
			@close="editLocationClosed"
		>
		<div class="block">
  <span class="demonstration">选择地址：</span>
  <el-cascader
    :options="cityOptions"
    :value="city"
	:props="props"
    @change="changeProvince"
    change-on-select
  >
  </el-cascader>
			</div>
			<el-form :model="editForm" ref="editForm"  label="详细地址">
      <el-input v-model="editForm.name"></el-input>
  </el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editLocationVisible = false">取 消</el-button>
				<el-button type="primary" @click="editLocation"
					>确 定</el-button
				>
			</span>
		</el-dialog>

		<!-- 查物流 -->
		<el-dialog
			title="修改用户"
			:visible.sync="getTimeVisible"
			width="50%"
			@close="getTimeClose"
		>
		<div class="block">
  <span class="demonstration">物流</span>
			</div>
			<el-timeline-item v-for="item in timeList" :key="item.time" :timestamp="item.ftime">
				{{ item.context }}
			</el-timeline-item>
			<!-- <span slot="footer" class="dialog-footer">
				<el-button @click="editLocationVisible = false">取 消</el-button>
				<el-button type="primary" @click="editLocation"
					>确 定</el-button
				>
			</span> -->
		</el-dialog>
    </div>
</template>

<script>
import dateFormat from '../../assets/my.js'
import cityOptions from '../../assets/city_data2017_element'
    export default {
        data(){
            return {
				getTimeVisible:false,
				timeList:[],
				city:[],
				cityOptions: cityOptions,//城市数据
                total:1,
				props:{
					checkStrictly:false,
				},
                payList:[
                    {id:0,name:'未支付',value:'0'},
                    {id:1,name:'支付宝',value:'1'},
                    {id:2,name:'微信',value:'2'},
                    {id:3,name:'银行卡',value:'3'},
                ],
                selectedRoleId:0,
                editForm:{

                },
				locationForm:{},
                ordersList: [
				//用户角色列表
			],
            addDialogVisible:false,//添加商品
            editDialogVisible:false,//修改订单状态
			editLocationVisible:false,//修改地址
			queryInfo: {
				//记录查询内容，每页条数，当前页码，用于请求数据
				query: '',
				pagesize: 10,
				pagenum: 1,
			},
            }
        },  
        mounted(){
            this.getOrdersList()
			this.$axios({
				method:'get',
				url:'http://localhost:8080/timeline.json'
			}).then(res=>{
				console.log(res.data);
				this.timeList = res.data
			})
        },
        methods:{
            // 请求列表
            getOrdersList(){
                this.$axios({
                method:'get',
                url:'orders',
                params:{
                    pagenum:1,
                    pagesize:10
                }
            }).then((res)=>{
                this.ordersList=res.data.goods
                this.total = res.data.total
            })
            },
		handleSizeChange(e) {
			//每页显示条数发生变化时请求数据
			this.queryInfo.pagesize = e
			this.getOrdersList()
		},
		handleCurrentChange(e) {
			//页码发生变化时请求数据
			this.queryInfo.pagenum = e
			this.getOrdersList()
		},
		editLocationClosed(){

		},
		editLocation(obj){
			// 打开修改框
			this.editLocationVisible = true

		}
		,
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
        editOrders(curRow){//列表内的修改按钮，打开修改框
            this.editForm = curRow
            this.editDialogVisible = true
        },
        editUserInfo(){//确定修改
            this.$confirm('您即将修改订单, 是否继续?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
                    var {is_send:a,order_pay:b,order_price:c,order_number:d,pay_status:e}=this.editForm
                    a=a=='否'?'0':'1'
					this.$axios({
						method: 'put',
						url: `orders/${this.editForm.order_id}`,
                        data:{
                            is_send:a,
                            order_pay:b,
                            order_price:c,
                            order_number:d,
                            pay_status:e
                        }
					}).then((res) => {//确定进入分支
						this.$message({
							type: 'success',
							message: '修改成功!',
						})
						this.getOrdersList()
                        this.editDialogVisible = false
					})
				}).catch(() => {
					this.$message({//取消进入分支
						type: 'info',
						message: '已取消修改',
					})
				})
        },
		changeProvince(e){
			// 城市选中
			console.log(e);
		},
		queryInId(){
			this.$message({
				type:'success',
				message:'不准查'
			})
		},
		getTimeClose(){
			// 物流关闭
		}
        },
        filters:{
            time(val,args){
                return dateFormat.dateFormat(val,args)
            },
            payStatus(val){
                return val==0?'未支付':'已支付'
            },
            tagType(val){
                return val==0?'danger':'success'
            }
        }
    }
</script>

<style scoped>
    .el-tag{
        border-radius: 15px;
    }
</style>