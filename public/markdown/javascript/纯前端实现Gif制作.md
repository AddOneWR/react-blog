## 背景

受[在线Sorry动图制作](https://sorry.xuty.tk/sorry/)启发，想自己用纯前端撸一个类似的东西出来，这里[地址](http://04ke.cn:8888/index.html)

## 开始操作

### Begin
开始没有任何头绪，想着去别人源码那copy一下，发现根本用不上...

### Next
+ **想法1**: 用绝对定位将文字定位到gif上,然后根据gif特定时间点显示特定文字
+ **想法2**: 在特定的时间点上用canvas在gif上绘制特定的文字

### Next Result
想了想，上面两种想法很好实现，但是都只是把动图展示出来，不能把修改后的文字保存到gif里

### 再Next
对gif的每一帧进行处理然后再拼成gif

### 再Next Result
想了想，没什么大问题，那就开干吧

### 真正开始操作~

怎么把处理后的图片拼接成gif是个问题，去google了一波发现gif.js这个玩意，api也很简单，把图片或者canvas传进去然后render一下就ojbk了,来个官方demo

```JavaScript
var gif = new GIF({
  workers: 2,
  quality: 10
});

// add a image element
gif.addFrame(imageElement);

// or a canvas element
gif.addFrame(canvasElement, {delay: 200});

// or copy the pixels from a canvas context
gif.addFrame(ctx, {copy: true});

gif.on('finished', function(blob) {
  window.open(URL.createObjectURL(blob));
});

gif.render();
```

> 至于如何获得gif的每一帧，我用的mac下的Gif preview

用户点击生成后用类似懒加载的方式加载图片

```JavaScript
for(let i = 0 ; i < num ; i++){
  image = new Image()
  image.src = `xxxx${i}/xx.jpg`
  arr[i] = image
}
```
> 请求数据量比较大，我先用mac下的Compress All对图片进行压缩，然后再用gzip进一步压缩所有文件(这都是后话了)

接下来调用canvas的drawImage，绘制arr图片数组中的图片，然后用canvas在上面绘制文字，注意绘制的过程使用函数**requestAnimationFrame**(这坑爬了好久)，关于此函数这里就不讲解了

```JavaScript
function render(){
  ctx.drawImage(arr[i],0,0)
  ......
  requestAnimationFrame(render)
}
render()
```
然后一个循环把canvas都add进去

```JavaScript
for(let j = 0 ; j < num ; j++){     
  gif.addFrame(ctx,{delay: 167})
}
```

这里注意这两块代码执行的顺序，按照正常理解是draw一个add一个但是我发现不行(woc为什么?)，改了半天破罐破摔都draw完后再一股脑add进去发现竟然可以(???)...
+ 我打印了一下执行顺序发现add竟然是在draw之前完成的
> 因为draw是递归调用，并且draw和add都是同步任务，按照Js单线程来看draw了一次后就轮到add的for循环执行，执行完毕后才会执行递归调用的draw

那么问题来了... 递归调用的draw还没执行，为什么for循环里就能把没绘制的元素状态"add"进去... 于是我看了一波源码

```JavaScript
GIF.prototype.addFrame = function(image, options) {
  var frame, key;
  if (options == null) {
      options = {}
  }
  frame = {};
  frame.transparent = this.options.transparent;
  for (key in frameDefaults) {
      frame[key] = options[key] || frameDefaults[key]
  }
  if (this.options.width == null) {
      this.setOption("width", image.width)
  }
  if (this.options.height == null) {
      this.setOption("height", image.height)
  }
  if (typeof ImageData !== "undefined" && ImageData !== null && image instanceof ImageData) {
      frame.data = image.data
  } else if (typeof CanvasRenderingContext2D !== "undefined" && CanvasRenderingContext2D !== null && image instanceof CanvasRenderingContext2D || typeof WebGLRenderingContext !== "undefined" && WebGLRenderingContext !== null && image instanceof WebGLRenderingContext) {
      if (options.copy) {
          frame.data = this.getContextData(image)
      } else {
          frame.context = image
      }
  } else if (image.childNodes != null) {
      if (options.copy) {
          frame.data = this.getImageData(image)
      } else {
          frame.image = image
      }
  } else {
      throw new Error("Invalid image")
  }
  return this.frames.push(frame)
}
```
> instanceof 运算符用来测试一个对象在其原型链中是否存在一个构造函数的 prototype 属性

很明显, 因为add时候参数没有传`copy`所以进入`frame.context = image`，看到context第一感觉是和执行上下文有关系，再打印一遍执行顺序发现`gif.on('finish')`是全部draw完后执行的，结合worker不难推出frame和canvas之间是类似引用的关系并且在子线程中不断执行...

最后就很简单了...render一下就ojbk

> 考虑到我服务器性能和网速... 我在这整个大函数外面套了个延时器...保证用户加载完图片后才开始drawImage，不然会报错

### 启动
服务器使用node.js的express搭建

## 总结

光是最后这个想法介绍起来都能看出来我踩了很多坑....之前的想法踩了多少坑就不提了23333，并且发现不对后整个代码都要重写emmm，不过收获还是很多，同样的问题不会犯第二次了






