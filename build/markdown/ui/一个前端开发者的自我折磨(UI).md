## 背景
偶然看到[一篇UI优化文章](https://www.oschina.net/translate/good-to-great-ui-animation-tips)，发现里面几个UI交互真滴不错，就自己动手撸了一下~

## 上动图

![结果](http://p5sf6v0wz.bkt.clouddn.com/Jietu20180403-204252.gif
)

## 代码

### 按钮

```Html
<div class="load-div">
  <div class="load-progress"></div>
  <div class="wave-btn wave wave-small"></div>
  <input type="button" class="load-btn load-btn-hover" value="Show!">
</div>
```
这里起作用的有3个`div`,`load-progress`模拟进度条,`wave-btn`模拟扩散的波纹,`load-btn`即为按钮

#### 扩散的波纹

```Css
.wave {
  position: absolute;
  width: 160px;
  height: 40px;
  background-color: #b749cd;
  border-radius: 5px;
  z-index: 8;
}

.wave-small {
  animation: wave-small .8s infinite linear;
}

.wave-large {
  animation: wave-large .6s infinite linear;
}

@keyframes wave-small {
  30% {
    opacity: 0.5;
  }
  100% {
    transform: scale(1.1, 1.4);
    opacity: 0;
  }
}

@keyframes wave-large {
  30% {
    opacity: 0.5;
  }
  100% {
    transform: scale(1.3, 1.6);
    opacity: 0;
  }
}
```

使用绝对定位让波纹`div`在`button`下面避免遮盖,添加动画使`div`放大的同时变透明,通过`30%`调整到比较合适的视觉效果

```JavaScript
const button = document.getElementsByClassName('load-btn')[0]

button.onmouseover = () => {
  wave.classList.remove('wave-small')
  wave.classList.add('wave-large')
}

button.onmouseout = () => {
  wave.classList.remove('wave-large')
  wave.classList.add('wave-small')
}
```

因为`hover`时`button`会变大，所以用`js`进行判断添加不同大小的波纹动画

#### 变化的按钮

```Css
.load-btn {
  position: relative;
  width: 160px;
  height: 40px;
  font-size: 16px;
  color: white;
  background-color: #d159ec;
  border-radius: 5px;
  border: none;
  outline: none;
  cursor: pointer;
  z-index: 9;
}

.loading-btn-size {
  animation: size-small, size-back;
  animation-delay: 0s, 1.4s;
  animation-duration: .1s, .5s;
  animation-fill-mode: forwards, forwards;
  animation-timing-function: ease-in, ease;
}

.load-btn-hover:hover {
  animation: color-deep .2s ease-in forwards;
}

@keyframes color-deep {
  70% {
    transform: scale(1.1, 1.1)
  }
  to {
    background-color: #b749cd;
    transform: scale(1.1, 1.1)
  }
}

@keyframes size-small {
  to {
    transform: scale(1, .6);
  }
}

@keyframes size-back {
  50% {
    transform: scale(1.2, 1.2);
  }
  70% {
    transform: scale(1.1, 1.1);
  }
  80% {
    transform: scale(1.2, 1.2);
  }
  to {
    transform: scale(1.1, 1.1);
    background-color: #74e795;
  }
}
```

`hover`时放大且颜色变深,这个就不细讲了,点击后缩小`scale(1, .6)`,延时一段时间后变回原大小(比原来大一点)且更换颜色和文本,在`size-back`中通过调整百分比来模拟弹性

#### 进度条

```Css
.load-progress {
  position: absolute;
  top: 8px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  z-index: 10;
}

.load-progress-x {
  animation: x-change 1.2s ease-in;
  animation-delay: .2s;
}

@keyframes x-change {
  from {
    width: 0;
  }
  to {
    width: 160px;
  }
}
```

设置高度为`button`缩小后的高度，宽度从0到恢复模拟进度条，用透明黑色覆盖`button`来模拟进度条样式

### 展开的列表

```Html
<div class="list">
  <div class="red"></div>
  <div class="orange"></div>
  <div class="yellow"></div>
  <div class="green"></div>
  <div class="qing"></div>
  <div class="blue"></div>
  <div class="purple"></div>
</div>
```
HTML不解释

```Css
.list div{
  width: 250px;
  height: 50px;
  margin-top: 10px;
  visibility: hidden;
}

.fade-show{
  visibility: visible !important;
  animation: fade-show .5s linear;
}

@keyframes fade-show{
  from {
    opacity: 0;
  }
  tp {
    opacity: 1;
  }
}
```
css没什么好讲的，这里使用`visibility: hidden`使元素隐形但是仍占据空间

```JavaScript
const list = document.getElementsByClassName('list')[0]

let i = 0
let n = list.length
let timer = 
setInterval(() => {
  if(i == n)
    clearInterval(timer)
  if(i < n){
    list[i].classList.add('fade-show')
    i++;
  }
},50)
```

定时器遍历NodeList添加动画class即可

## 总结
其实写起来并不难，主要是看你的想法，每个人可能都有不同的实现方式，关键是看哪种效率最高