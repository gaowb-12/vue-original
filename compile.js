/**
 * 我们要递归遍历fragment里面的所有子节点，根据节点类型进行判断，如果是文本节点则按插值表达式进行解析，
 * 如果是属性节点则按指令进行解析。
 * 在解析属性节点的时候，我们还要进一步判断：是不是由v-开头的指令，或者是特殊字符，如@、:开头的指令
 */
class Compile{
    constructor(el,vm){
        this.el=typeof el==="string"?document.querySelector(el):el
        this.vm=vm;
        // 解析模板内容
        if(this.el){
            // 为了避免直接在页面中操作dom，引起重绘跟回流，所以直接在内存中操作文档片段
            const fragment=this.node2fragment(this.el);
            // 编译文档片段中的
            this.compile(fragment)
            // 将编译完的插入到页面中
            this.el.appendChild(fragment)
        }
    }
    // 解析fragment里面的节点
    compile(fragment){
        let childNodes=fragment.childNodes
        this.toArray(childNodes).forEach(node=>{
            /* 判断节点类型 */
            // 如果是元素节点
            if(this.isElementNode(node)){
                this.compileElementNode(node)
            }
            if(this.isTextNode(node)){
                this.compileTextNode(node)
            }
            // 递归解析
            if(node.childNodes&&node.childNodes.length>0){
                this.compile(node)
            }
        })
    }
    compileElementNode(node){
        let text=this.getBindAttribute(node,"v-text")||this.getBindAttribute(node,":text")
        if(text){
            CompileUtils.text(node,this.vm,text)
        }
        let html=this.getBindAttribute(node,"v-html")||this.getBindAttribute(node,":html")
        if(html){
            CompileUtils.html(node,this.vm,html)
        }
        let model=this.getBindAttribute(node,"v-model")||this.getBindAttribute(node,":model")
        if(model){
            CompileUtils.model(node,this.vm,model)
        }
        // 解析事件
        // let eventHandler=this.getBindAttribute(node,"v-on")||this.getBindAttribute(node,":html")
        // if(eventHandler){
        //     CompileUtils.eventHandler(node,this.vm,eventHandler)
        // }
    }
    compileTextNode(node){
        CompileUtils.mustache(node,this.vm)
    }
    getBindAttribute(node,attr){
        return node.getAttribute(attr)
    }
    // 获取文档片段
    node2fragment(node){
        let fragment=document.createDocumentFragment();
        // 把el中的所有子节点添加到文档片段
        let childNodes=node.childNodes;
        // 由于childNodes是一个类数组，转化成数组，然后遍历
        this.toArray(childNodes).forEach(node => {
            // 将所有的子节点添加到文档片段中
            fragment.appendChild(node)
        });
        return fragment
    }
    // 类数组转数组
    toArray(likeArray){
        return [].slice.call(likeArray)
    }
    // 判断是否是元素节点
    isElementNode(node){
        return node.nodeType==1?true:false
    }
    // 判断是否是文本节点
    isTextNode(node){
        return node.nodeType==3?true:false
    }
}

let CompileUtils={
    // 数据是复杂数据的情形
    getVMData(vm,expr){
        let data=vm.$data
        expr.split(".").forEach(key=>{
            data=data[key]
        })
        return data
    },
    setVMData(vm,expr,value){
        let data=vm.$data
        let arr=expr.split(".")
        arr.forEach((key,index)=>{
            if(index < arr.length -1) {
                data = data[key]
            } else {
                data[key] = value
            }
        })
    },
    // 解析插值表达式
    mustache(node,vm){
        let txt=node.textContent
        let reg=/\{\{(.+)\}\}/
        if(reg.test(txt)){
            let expr=RegExp.$1
            node.textContent=txt.replace(reg,this.getVMData(vm,expr))
            new Watcher(vm,expr,newValue=>{
                node.textContent=txt.replace(reg,newValue)
            })
        }
    },
    // 解析v-text
    text(node,vm,expr){
        node.textContent=this.getVMData(vm,expr)
        new Watcher(vm,expr,newValue=>{
            node.textContent=newValue
        })
    },
    // 解析v-html
    html(node,vm,expr){
        node.innerHTML=this.getVMData(vm,expr)
        new Watcher(vm,expr,newValue=>{
            node.innerHTML=newValue
        })
    },
    // 解析v-model
    model(node,vm,expr){
        node.value=this.getVMData(vm,expr)
        node.addEventListener("input",()=>{
            this.setVMData(vm,expr,node.value)
        })
        new Watcher(vm,expr,newValue=>{
            node.value=newValue
        })
    },
    // 解析v-on
    eventHandler(node,vm,eventType,expr){
        // 处理methods里面函数不存在的情况
        // 即使函数不存在也不会影响程序
        let fn =vm.methods&&vm.methods[expr]
        try {
            node.addEventListener(eventType,fn.bind(vm))
        } catch (error) {
            console.error('方法不存在\n', error)
        }
    }
}