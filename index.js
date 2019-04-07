/*
*1.options参数挂载到实例中
*2.监听data的属性
*3.编译模板、指令
*4.挂载到页面
*/
class Vue{
    constructor(options={}){
        this.$el=options.el;
        this.$data=options.data;
        this.$methods=options.methods;
        // debugger
        // 将data，method里面的属性挂载到根实例中
        this.proxy(this.$data)
        this.proxy(this.$methods)
        // 监听数据
        // new Observer(this.$data)
        if(this.$el){
            // new Compile(this.$el,this);
        }
    }
    // 挂载属性到实例上
    proxy(data={}){
        Object.keys(data).forEach((key)=>{
            Object.defineProperty(this,key,{
                enumerable:true,
                configurable:true,
                get(){
                    return data[key]
                },
                set(val){
                    if(data[key]==val) return;
                    return val
                }
            })
        })
    }
}