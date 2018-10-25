## 简介
在掘金上看了一篇文章，作者使用的是导出的svg，然鹅我不会，所以我就想着用canvas撸出来...顺便当复习了

## 代码
> 这里只挑一些我认为有价值的地方讲..

想了想...canvas好像确实没啥值得讲的，主要是撸代码的时候注意绘画的坐标，要考虑健壮性...不然你会发现后期很难维护

### animation-fill-mode: both
这是个好东西，让最后放大的三个圆在执行动画前不显示样式以及动画结束后保持样式

## 代码
Js太长 这里就只贴Html了
```Html
<div class="main">
  <canvas id="left-dot" height="500" width="700"></canvas>
  <canvas id="left-scroll" height="600" width="700"></canvas>
  <canvas id="right-scroll" height="600" width="700"></canvas>
  <canvas id="circle-out"   height="500" width="700"></canvas>
  <canvas id="circle-inner"  height="500" width="700"></canvas>
  <canvas id="circle1"  height="500" width="700"></canvas>
  <canvas id="circle2"  height="500" width="700"></canvas>
  <canvas id="circle3"  height="500" width="700"></canvas>
</div>
```
## 成品
![图片](http://p5sf6v0wz.bkt.clouddn.com/Jietu20180326-194622.gif)

