// 劫持监听所有的data的数据，并且是发布订阅中的发布者，发布通知
class Observer{
    constructor(data){
        this.data=data
        this.walk(this.data)
    }
    // 遍历walk中的所有数据，劫持set跟get方法
    walk(data){
        if(!data||typeof data !=='object') return
        Object.keys(data).forEach(key => {
            // 给data的属性添加getter跟setter方法
            this.defineReactive(data,key,data[key])
            // 如果data[key]是对象，深度劫持
            this.walk(data[key])
        });
    }
    defineReactive(data,key,value){
        let dep = new Dep()
        Object.defineProperty(data,key,{
            enumerable:true,
            configurable: true,
            get(){
                // 如果订阅者（监听者），就添加监听者的实例到调度中心
                Dep.target&&dep.addSub(Dep.target)
                return value
            },
            set(val){
                if(val==value) return 
                value=val
                // 如果是对象
                this.walk(value)
                // 发布通知，让所有订阅者更新数据
                dep.notify()
            }
        })
    }
}