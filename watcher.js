// 订阅者（观察者）
class Watcher{
    constructor(vm,expr,callback){
        this.vm=vm
        this.expr=expr
        this.callback=callback
        Dep.target=this
        // 获取原始数据
        this.oldValue=this.getVMData(vm,expr)
        Dep.target=null
    }
    // 更新页面的方法
    update(){
        // 对比expr的值是否发生改变
        let oldValue=this.oldValue
        let newValue=this.getVMData(this.vm,this.expr)
        if(oldValue!=newValue){
            // 执行回调，更新页面
            this.callback(newValue,oldValue)
        }
    }
    // 数据是复杂数据的情形
    getVMData(vm,expr){
        let data=vm.$data
        expr.split(".").forEach(key=>{
            data=data[key]
        })
        return data
    }
}
// 订阅者容器，依赖收集
class Dep {
    constructor(){
        // 初始化一个空数组，用来存储订阅者
        this.subs = []
    }

    // 添加订阅者
    addSub(watcher){
        this.subs.push(watcher)
    }
 
    // 通知
    notify() {
        // 通知所有的订阅者更改页面
        this.subs.forEach(sub => {
            sub.update()
        })
    }
}