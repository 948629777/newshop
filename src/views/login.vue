<template id="temp">
	<!-- vue实例外创建 -->
	<div class="main">
		<div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
		<el-form
			:model="ruleForm"
			status-icon
			:rules="rules"
			ref="ruleForm"
			label-width="100px"
			class="demo-ruleForm"
			@keydown.enter.native="submitForm('ruleForm')"
		>
			<el-form-item label="用户名" prop="username">
				<el-input v-model="ruleForm.username" prefix-icon="el-icon-user-solid"></el-input>
			</el-form-item>
			<el-form-item label="密码" prop="password">
				<el-input
					type="password"
					v-model="ruleForm.password"
					autocomplete="off"
					show-password
                    prefix-icon="el-icon-lock"     
				></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="submitForm('ruleForm')" class="sunbtn"
					>提交</el-button
				>
				<el-button @click="resetForm('ruleForm')">重置</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
export default {
	name: 'login',
    /* mounted(){
        this.$axios.get('users',{pagenum:4,pagesize:5}).then((res)=>{
            console.log(res);
        })
    }
    , */
	data() {
		var checkAge = (rule, value, callback) => {
			if (!value) {
				return callback(new Error('用户名不能为空'))
			}
			setTimeout(() => {
				if (value.length < 3) {
					callback(new Error('用户名需不小于3位'))
				} else {
					callback()
				}
			}, 1000)
		}
		var validatePass = (rule, value, callback) => {
			if (value === '') {
				callback(new Error('请输入密码'))
			} else {
				if (this.ruleForm.checkPass !== '') {
					this.$refs.ruleForm.validateField('checkPass')
				}
				callback()
			}
		}
		return {
			ruleForm: {
				password: '',
				username: '',
			},
			rules: {
				password: [{ validator: validatePass, trigger: 'blur' }],
				username: [{ validator: checkAge, trigger: 'blur' }],
			},
		}
	},
	methods: {
		submitForm(formName) {
			this.$refs[formName].validate((valid) => {
                    if(valid){
                        this.$axios.post('login',this.ruleForm).then((res)=>{
                            if(res.meta.msg=='登录成功'&&res.meta.status==200){
                                this.open2(res.meta.msg,'success')
                                sessionStorage.setItem('shopToken',res.data.token)
                                    this.$router.push('/home?name='+this.ruleForm.username+'')
                            }else{
                                this.open3(res.meta.msg)
                            }
                        })
                    }
                    return false
			})
		},
        open2(a,b) {// a=消息，b=弹框类型
        this.$message({
          message: a,
          type: b,
          duration:2000
        });
      },
      open3(a){//a=消息
        this.$message.error(a);
      },
		resetForm(formName) {
			this.$refs[formName].resetFields()
		},
	},
}
</script>

<style lang="less" scoped>
.main {
	text-align: center;
	width: 400px;
	background-color: rgb(97, 241, 241);
	padding: 20px;
	padding-right: 80px;
    padding-top: 160px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    .avatar_box {
    height: 100px;
    width: 100px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -115%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

</style>
