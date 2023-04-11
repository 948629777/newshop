<template>
    <div>
        <!-- 逐级导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }"
				>首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品分类</el-breadcrumb-item>
		</el-breadcrumb>
        <!-- 卡片视图区域 -->
		<el-card>
			<!-- 搜索与添加区域 -->
			<el-row :gutter="20">
				<el-col :span="16">
					<el-button type="primary" @click="openAddDio">添加分类</el-button
					>
				</el-col>
			</el-row>

			<!-- 商品列表区域 -->
            <tree-table 
            :data="categroiesList"
            :columns="columns"
            :selection-type="false"
            :expand-type="false"
            :show-index="true"
            index-text="#">
                <template slot="isOK" scope="sp">
                    <i class="el-icon-success" style="color: green;font-size: 18px;" v-if="!sp.row.cat_deleted"></i>
                    <i class="el-icon-error" style="color: red;font-size: 18px;" v-else></i>
                </template>
                <template slot="isSort" scope="sp">
                   <el-tag type="success" effect="dark" v-if="sp.row.cat_level==0">一级</el-tag>
                   <el-tag type="primary" effect="dark" v-else-if="sp.row.cat_level==1">二级</el-tag>
                   <el-tag type="danger" effect="dark" v-else>三级</el-tag>
                </template>
                <template slot="isCZ" scope="sp">
                   <el-button type="primary" size="mini" @click="editBtn(sp.row)">修改</el-button>
                   <el-button type="danger" size="mini" @click="removeRow(sp.row.cat_id)">删除</el-button>
                </template>
            </tree-table>

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

        <el-dialog
  title="提示"
  :visible.sync="addVisible"
  width="50%">
  <el-form :model="addForm" :rules="addFormRules" ref="addForm">
    <el-form-item label="分类名称" prop="cat_name" :label-width="formLabelWidth">
      <el-input v-model="addForm.cat_name"></el-input>
    </el-form-item>
    <el-form-item label="分类级别" :label-width="formLabelWidth">   
        <el-cascader :options="parentCates"
        clearable :props="props" @change="handleChange"></el-cascader>
    </el-form-item>
  <el-form-item>
    <el-button @click="addVisible = false">取 消</el-button>
    <el-button type="primary" @click="addFormSub('addForm')">确 定</el-button>
  </el-form-item>
  </el-form>
</el-dialog>
<!-- 改 -->
<el-dialog title="修改分类" :visible.sync="editVisible" @close="editClose">
  <el-form :model="editForm" ref="editForm">
    <el-form-item label="分类名称" label-width="120px">
      <el-input v-model="editForm.name"></el-input>
    </el-form-item>
  </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button @click="editVisible = false">取 消</el-button>
    <el-button type="primary" @click="editSub">确 定</el-button>
  </div>
</el-dialog>
    </div>
</template>

<script>
    export default {
        data(){//
            return {
                editForm:{
                    name:'',
                    id:''
                },
                editVisible:false,
                formLabelWidth:'120px',
                addForm:{
                    cat_name:'',
                    cat_pid:0,
                    cat_level:0
                },
                addFormRules: {
				//添加用户时表单的验证规则
				cat_name: [
					{
						required: true,
						message: '分类名称不能为空',
						trigger: 'blur',
					},
					// {pattern:/^[\u4E00-\u9FA5A-Za-z0-9_]+$/,message:'用户名不合法',trigger:'blur'}
				],
			},
                categroiesList:[],
                total:0,
                columns:[
                    // {label:'分类ID',prop:'cat_id'},
                    {label:'分类名称',prop:'cat_name'},
                    {label:'是否有效',type:'template',template:'isOK'},
                    {label:'排序',type:'template',template:'isSort'},
                    {label:'操作',type:'template',template:'isCZ'},
                ],
            queryInfo: {
				//记录查询内容，每页条数，当前页码，用于请求数据
				query: '',
				pagesize: 10,
				pagenum: 1,
			},
            addVisible:false,
            
            parentCates:[],
            props:{
                label:'cat_name',
                value:'cat_id',
                children:'children',
                checkStrictly:true,
            }
            }
        },
        methods:{
            getCategroiesList(){
                this.$axios({
                    method:'get',
                    url:'categories',
                    params:{
                        type:3,
                        pagenum:this.queryInfo.pagenum,
                        pagesize:this.queryInfo.pagesize
                    }
                }).then((res)=>{
                    console.log(res);
                    this.categroiesList=res.data.result
                    this.total = res.data.total
                })
            },
            handleSizeChange(e){
                this.queryInfo.pagesize=e
                this.getCategroiesList()
            },
            handleCurrentChange(e){
                this.queryInfo.pagenum=e
                this.getCategroiesList()
            },
            editBtn(curRow){
                this.editForm.name = curRow.cat_name
                this.editForm.id = curRow.cat_id
                this.editVisible = true
            },
            removeRow(id){
                // 二次确认
			this.$confirm('此操作将永久删除该用户, 是否继续?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
					this.$axios({
						method: 'delete',
						url: `categories/${id}`,
					}).then(() => {//确定进入分支
						this.$message({
							type: 'success',
							message: '删除成功!',
						})
						this.getCategroiesList()
					})
				}).catch(() => {
					this.$message({//取消进入分支
						type: 'info',
						message: '已取消删除',
					})
				})
            },
            queryInId(){
                this.$axios({
                    method:'get',
                    url:'categories/'+this.queryInfo.query,
                }).then((res)=>{
                    this.categroiesList=res.data
                    this.total = 1
                })
            },
            handleChange(e){//级联选择器chang事件
                if(e.length===0){
                    this.addForm.cat_level=0
                    this.addForm.cat_pid=0
                }else{
                    this.addForm.cat_level=e.length
                    this.addForm.cat_pid = e[e.length-1]
                }
            },
            openAddDio(){
                this.addVisible=true
                this.getParent()
            },
            getParent(){
                this.$axios({
                    method:'get',
                    url:'categories',
                    params:{type:2}
                }).then((res)=>{
                    this.parentCates = res.data
                })
            },
            addFormSub(name){
                // 点我提交
                this.$refs[name].validate((valid) => {
                    if(valid){
                        this.$axios.post('categories',this.addForm).then((res)=>{
                            this.$message.success(res.meta.msg)
                            this.addVisible=false
                            this.getCategroiesList()
                            this.$refs[name].resetFilelds()
                        })
                    }
                    return false
			})
                return false
            },
            editClose(){
                this.$refs.editForm.resetField()
            },
            editSub(){
                this.$axios({
                    method:'put',
                    url:`categories/${this.editForm.id}`,
                    data:{
                        cat_name:this.editForm.name
                    }
                }).then((res)=>{
                    this.$message.success(res.meta.msg)
                    this.editVisible = false
                    this.getCategroiesList()
                })
            }
        },
        mounted() {
            this.getCategroiesList()
        },
    }
</script>

<style scoped>
    .el-col{
        text-align: left;
    }    
</style>