## 介绍
很多时候，我们会有一些奇怪的骚想法，比如让网页中的一些特定文本像敲代码一样一个一个显示出来，有一种命令行的感觉，增加设计感，很多人觉得这个效果要用很长一段JS来实现.... 正好手头有个例子，我决定用CSS实验一下

<!--more-->
## 开始操作

原图
![](https://user-gold-cdn.xitu.io/2018/3/14/16223fc3d61816de?w=2880&h=1480&f=png&s=4704018)
> emmmmmm...请忽略我的字体
+ **想法1**: 让这段文字从宽度0变成实际宽度

```Css
.title{
  ...
  animation: typing 6s;
}
@keyframes typing{
  from {
    width: 0;
  }
}
```

![](https://user-gold-cdn.xitu.io/2018/3/14/16223fd2d0f4bd64?w=2294&h=710&f=gif&s=2901649)
> emmmm, 忘记禁止折行和剪切超出部分文本了

修改
```Css
.title{
  ...
  white-space: nowrap;
  overflow: hidden;
  animation: typing 6s;
}
@keyframes typing{
  from {
    width: 0;
  }
}
```

![](https://user-gold-cdn.xitu.io/2018/3/14/16223fe17b0b19f3?w=2356&h=592&f=gif&s=2808899)

看起来还不错，但是还不够，我们希望字符能一个一个出来，想了想，Animation里面有个叫steps的东西，各位可以简单的理解(具体的这里就不介绍啦)为: 里面放多大的数字就是分多少帧执行，比如steps(5)就是将动画分成5帧执行。

> 就算我们能让动画一帧一帧执行，但是怎么让字符一个一个出现呢?

答案是.... 无人问津的ch单位，这是CSS3的新单位，表示"0"的宽度，到这我想真正的解决方案就出现啦！

> 在等宽字体中，"0"字形的宽度和其他所有字形的宽度是一样的

修改
```Css
.title{
  ...
  width: 17ch; //别忘了把空格算上!
  white-space: nowrap;
  overflow: hidden;
  animation: typing 6s steps(17);  //steps里为你的字符数
}
@keyframes typing{
  from {
    width: 0;
  }
}
```

![](https://user-gold-cdn.xitu.io/2018/3/14/16223feb2d6a0f98?w=480&h=152&f=gif&s=273996)
> 或许我们还需要一个闪烁的光标？那就留着下次讲好了(如果我没忘的话)

> 文章翻译改编于CSS揭秘
