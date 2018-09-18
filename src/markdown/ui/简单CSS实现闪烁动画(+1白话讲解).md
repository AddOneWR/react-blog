## 背景

本文承接自上文[《CSS实现文字打字动画（+1白话讲解）》](https://juejin.im/post/5aa8dcc26fb9a028cd44cbb3)

<!--more-->
## 介绍

提到闪烁动画，很多人可能会想起 `<blink>` 这个标签，亦或者是`text-decoration: blink`这个东西，但是这两者都有很大的局限性，身为"专业"前端开发者的我们怎么能满足于此呢？所以我们不得不去寻找一些其他的方法。

## 开始操作

原图
![](https://user-gold-cdn.xitu.io/2018/3/15/162297b25baca2f3?w=2436&h=596&f=png&s=1623397)
> 字体调回正常啦~

+ **想法1:**让元素变成透明再变回原样

```Css
.title{
  animation: blink 1s 3;
}
@keyframes blink{
  to {
    color: transparent;
  }
}
```

![](https://user-gold-cdn.xitu.io/2018/3/15/16229a3f2843ed07?w=480&h=120&f=gif&s=308912)
我们用Chrome开发者工具中的Animation看一看这个动画

![](https://user-gold-cdn.xitu.io/2018/3/15/162298539fc8eda3?w=2552&h=132&f=png&s=32439)
可以发现..这个元素在变成透明之后会瞬间显现到原来的样子，很江硬，我想把他变成平滑的显现出来，于是想到了一个办法：通过修改关键帧，让其在循环周期中进行状态切换
```Css
.title{
  animation: blink 1s 3;
}
@keyframes blink{
  50% {
    color: transparent;
  }
}
```

![](https://user-gold-cdn.xitu.io/2018/3/15/162299dd347a845a?w=480&h=120&f=gif&s=242980)
舒服了一点
![](https://user-gold-cdn.xitu.io/2018/3/15/162298864538a964?w=2550&h=138&f=png&s=36162)

> 但是长了眼睛的读者一定能从图中发现这个动画的过程是加速的，导致这个动画看起来不是很自然

读了我上一篇文章的童鞋们一定会想到steps这个东西~ 让我们来试一哈
```Css
.title{
  animation: blink 1s 3 steps(1);
}
@keyframes blink{
  50% {
    color: transparent;
  }
}
```
![](https://user-gold-cdn.xitu.io/2018/3/15/162299e7f7444bf7?w=480&h=140&f=gif&s=177596)

完美
![](https://user-gold-cdn.xitu.io/2018/3/15/162299130416d9e7?w=2550&h=136&f=png&s=29063)

> 在这里用to的童鞋注意了，steps(1)表示颜色值的切换只发生在动画周期的末尾，所以效果会变成这样

![](https://user-gold-cdn.xitu.io/2018/3/15/16229927c7645859?w=2540&h=130&f=png&s=26700)
傻了吧，你的动画是一下都不会闪的

## 回顾
上一篇文章末尾提到了添加一个闪烁的光标，那么我们就用上面学到的知识来实现一下吧~
```Css
.title{
  ...
  width: 17ch;
  white-space: nowrap;
  overflow: hidden;
  border-right: 2px solid; //不指定颜色，使光标和文字颜色一致
  animation: typing 10s steps(17),
             blink 1s steps(1) infinite; //infinite用来使动画无限循环
}
@keyframes typing{
  from {
    width: 0;
  }
}
@keyframes blink{
  50% {
    border-color: transparent;
  }
}
```

![](https://user-gold-cdn.xitu.io/2018/3/15/16229a07a6f6e7c0?w=480&h=152&f=gif&s=269210)
肥肠完美


> 因为字体等原因效果展示不是肥肠好，但是应该是最优解啦，还可以通过JS进行维护，这里就不讲啦

> 文章翻译改编于CSS揭秘
