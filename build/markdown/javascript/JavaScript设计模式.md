### 单例模式

> 保证一个类仅有一个实例，并提供一个访问它的全局访问点。实现的方法为先判断实例存在与否，如果存在则直接返回，如果不存在就创建了再返回，这就确保了一个类只有一个实例对象。

#### 应用场景

+ 某些管理类，保证资源的一致访问性。
+ 创建对象时耗时过多或耗费资源过多，但又经常用到的对象；
+ 工具类对象
+ 频繁访问数据库或文件的对象。

```Javascript
class CreateUser {
    constructor(name) {
        this.name = name;
        this.getName();
    }
    getName() {
         return this.name;
    }
}
// 代理实现单例模式
var ProxyMode = (function() {
    var instance = null;
    return function(name) {
        if(!instance) {
            instance = new CreateUser(name);
        }
        return instance;
    }
})();
// 测试单体模式的实例
var a = new ProxyMode("aaa");
var b = new ProxyMode("bbb");
// 因为单体模式是只实例化一次，所以下面的实例是相等的
console.log(a === b);    //true
```

### 策略模式

> 策略模式的定义：定义一系列的算法，把他们一个个封装起来，并且使他们可以相互替换。

策略模式的目的就是将算法的使用算法的实现分离开来。
一个基于策略模式的程序至少由两部分组成。第一个部分是一组策略类（可变），策略类封装了具体的算法，并负责具体的计算过程。第二个部分是环境类`Context`（不变），`Context`接受客户的请求，随后将请求委托给某一个策略类。要做到这一点，说明`Context`中要维持对某个策略对象的引用。

#### 应用场景

+ 多个类只区别在表现行为不同，可以使用策略模式，在运行时动态选择具体要执行的行为
+ 需要在不同情况下使用不同的策略(算法)，或者策略还可能在未来用其它方式来实现。
+ 对客户隐藏具体策略(算法)的实现细节，彼此完全独立。

```Javascript
/*策略类*/
var levelOBJ = {
    "A": function(money) {
        return money * 4;
    },
    "B" : function(money) {
        return money * 3;
    },
    "C" : function(money) {
        return money * 2;
    } 
};
/*环境类*/
var calculateBouns =function(level,money) {
    return levelOBJ[level](money);
};
console.log(calculateBouns('A',10000)); // 40000
```

### 代理模式

> 代理模式的定义：为一个对象提供一个代用品或占位符，以便控制对它的访问。

常用的虚拟代理形式：某一个花销很大的操作，可以通过虚拟代理的方式延迟到这种需要它的时候才去创建（例：使用虚拟代理实现图片懒加载）
图片懒加载的方式：先通过一张loading图占位，然后通过异步的方式加载图片，等图片加载好了再把完成的图片加载到img标签里面。

#### 应用场景

+ 当我们想要隐藏某个类时，可以为其提供代理类
+ 当一个类需要对不同的调用者提供不同的调用权限时，可以使用代理类来实现（代理类不一定只有一个，我们可以建立多个代理类来实现，也可以在一个代理类中进行权限判断来进行不同权限的功能调用）
+ 当我们要扩展某个类的某个功能时，可以使用代理模式，在代理类中进行简单扩展（只针对简单扩展，可在引用委托类的语句之前与之后进行）

```Javascript
var imgFunc = (function() {
    var imgNode = document.createElement('img');
    document.body.appendChild(imgNode);
    return {
        setSrc: function(src) {
            imgNode.src = src;
        }
    }
})();
var proxyImage = (function() {
    var img = new Image();
    img.onload = function() {
        imgFunc.setSrc(this.src);
    }
    return {
        setSrc: function(src) {
            imgFunc.setSrc('./loading,gif');
            img.src = src;
        }
    }
})();
proxyImage.setSrc('./pic.png');
```

### 中介者模式

> 中介者模式的定义：通过一个中介者对象，其他所有的相关对象都通过该中介者对象来通信，而不是相互引用，当其中的一个对象发生改变时，只需要通知中介者对象即可。通过中介者模式可以解除对象与对象之间的紧耦合关系。

#### 应用场景

+ 当一组对象要进行沟通或者业务上的交互，但是其关系却又很复杂混乱时，可以采用此模式
+ 当一个对象与其他的对象要进行紧密的交互，但又想服用该对象而不依赖其他的对象时
+ 想创造一个运行于多个类之间的对象，又不想生成新的子类时

```Javascript
var goods = {   //手机库存
    'red|32G': 3,
    'red|64G': 1,
    'blue|32G': 7,
    'blue|32G': 6,
};
//中介者
var mediator = (function() {
    var colorSelect = document.getElementById('colorSelect');
    var memorySelect = document.getElementById('memorySelect');
    var numSelect = document.getElementById('numSelect');
    return {
        changed: function(obj) {
            switch(obj){
                case colorSelect:
                    //TODO
                    break;
                case memorySelect:
                    //TODO
                    break;
                case numSelect:
                    //TODO
                    break;
            }
        }
    }
})();
colorSelect.onchange = function() {
    mediator.changed(this);
};
memorySelect.onchange = function() {
    mediator.changed(this);
};
numSelect.onchange = function() {
    mediator.changed(this);
};
```

### 装饰者模式

> 装饰者模式的定义：在不改变对象自身的基础上，在程序运行期间给对象动态地添加方法。

例如：现有4种型号的自行车分别被定义成一个单独的类，如果给每辆自行车都加上前灯、尾灯、铃铛这3个配件，如果用类继承的方式，需要创建4*3=12个子类。但如果通过装饰者模式，只需要创建3个类。

#### 应用场景
+ 原有方法维持不变，在原有方法上再挂载其他方法来满足现有需求
+ 函数的解耦，将函数拆分成多个可复用的函数，再将拆分出来的函数挂载到某个函数上，实现相同的效果但增强了复用性

```Javascript
Function.prototype.before = function(beforefn) {
    var self = this;    //保存原函数引用
    return function(){  //返回包含了原函数和新函数的 '代理函数'
        beforefn.apply(this, arguments);    //执行新函数，修正this
        return self.apply(this,arguments);  //执行原函数
    }
}
Function.prototype.after = function(afterfn) {
    var self = this;
    return function(){
        var ret = self.apply(this,arguments);
        afterfn.apply(this, arguments);
        return ret;
    }
}
var func = function() {
    console.log('2');
}
//func1和func3为挂载函数
var func1 = function() {
    console.log('1');
}
var func3 = function() {
    console.log('3');
}
func = func.before(func1).after(func3);
func();
```

> 以上来源于[JavaScript设计模式](https://juejin.im/post/59df4f74f265da430f311909)

未完待续...