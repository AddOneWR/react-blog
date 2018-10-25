## MVC

MVC是模型(Model)－视图(View)－控制器(Controller)的缩写，是设计模式中最常用的软件架构

> Model：模型，承载数据，并对用户提交请求进行计算的模块。其分为两类，一类称为数据承载Bean，一类称为业务处理Bean。所谓数据承载Bean是指实体类，专门承载业务数据的，如Student、User等。而业务处理Bean则是指Service或Dao对象，专门用于处理用户提交请求的

> View：视图，为用户提供使用界面，与用户直接进行交互。

> Controller：控制器，用于将用户请求转发给相应的Model进行处理，并处理Model的计算结果向用户提供相应响应

MVC中只有单向通信

+ 用户通过`View`页面向服务端提出请求，可以是表单请求、超链接请求、`AJAX`请求等
+ 服务端`Controller`控制器接收到请求后对请求进行解析，找到相应 的`Model`对用户请求进行处理
+ `Model`处理后，将处理结果再交给`Controller`
+ `Controller`在接到处理结果后，根据处理结果找到要作为向客户端发回的响应`View`页面。页面经渲染（数据填充）后，再发送给客户端

![MVC](http://p5sf6v0wz.bkt.clouddn.com/mvc.png
)

## MVP

MVP是Model-View-Presenter，即将MVC中的控制器Controller换成了Presenter负责逻辑的处理

> Presenter: 中介者，连接Model和View层

MVC和MVP的区别是：在MVP中View并不直接使用Model，它们之间的通信是通过Presenter (MVC中的Controller)来进行的，所有的交互都发生在Presenter内部，而在MVC中View会直接从Model中读取数据而不是通过 Controller

各部分之间都是双向通信

+ View 接收用户交互请求
+ View 将请求转交给 Presenter
+ Presenter 操作Model进行数据更新
+ Model 通知Presenter数据发生变化
+ Presenter 更新View数据

![MVP](http://p5sf6v0wz.bkt.clouddn.com/MVP.png
)

## MVVM

MVVM是Model-View-ViewModel，和MVP的区别在于Presenter换成了ViewModel负责逻辑处理

> Model 层，对应数据层的域模型，它主要做域模型的同步。通过 Ajax/fetch 等 API 完成客户端和服务端业务 Model 的同步。在层间关系里，它主要用于抽象出 ViewModel 中视图的 Model

> View 层，作为视图模板存在，在 MVVM 里，整个 View 是一个动态模板。除了定义结构、布局外，它展示的是 ViewModel 层的数据和状态。View 层不负责处理状态，View 层做的是 数据绑定的声明、 指令的声明、 事件绑定的声明

> ViewModel 层把 View 需要的层数据暴露，并对 View 层的 数据绑定声明、 指令声明、 事件绑定声明 负责，也就是处理 View 层的具体业务逻辑。ViewModel 底层会做好绑定属性的监听。当 ViewModel 中数据变化，View 层会得到更新；而当 View 中声明了数据的双向绑定（通常是表单元素），框架也会监听 View 层（表单）值的变化。一旦值变化，View 层绑定的 ViewModel 中的数据也会得到自动更新

MVVM的优点是低耦合、可重用性、独立开发

双线数据绑定

+ View 接收用户交互请求
+ View 将请求转交给ViewModel
+ ViewModel 操作Model数据更新
+ Model 更新完数据，通知ViewModel数据发生变化
+ ViewModel 更新View数据

![MVVM](http://p5sf6v0wz.bkt.clouddn.com/mvvm.png
)

![MVVMMORE](http://p5sf6v0wz.bkt.clouddn.com/mvvmMore.png
)