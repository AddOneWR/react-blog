## 背景
那一刻...无数前端开发者想起了自己曾经被Checkbox支配的恐惧...这种在绝大多数浏览器中**几乎或完全不能**进行样式替代的玩意让开发者们被迫选择默认样式，或者是找一些访问性极差的hack方案...

## 开始操作

+ 先把基本结构搞出来
```Html
<input type="checkbox" id="awesome" />
<label for="awesome">Awesome!</label>
```
可能有部分人不知道label有啥用: **当label与checkbox关联后，就可以起到触发开关的作用，并且我们可以通过对其添加一些内容(下面会讲解)来模拟checkbox的样式，再把真正的checkbox隐藏，最终达到我们的目的**

+ 添加样式
```Css
input[type="checkbox"] + label::before{
    content: '\a0'; /* 不换行空格 */
    display: inline-block; /* 让元素和label处于同一行 */
    vertical-align: .1em; /* 设置元素向上偏移.1em */
    width: .8em;
    height: .8em;
    margin-right: .2em; /* 和label保持一定距离 */
    border-radius: .2em;  /* 加个圆角 */
    background-color: lightcoral;
    text-indent: .15em; /* 设置元素内content(下文模拟的✓)的缩进 */
    line-height: .65; /* 设置行高 */
}
```

>  '+' 选择器指相邻同胞选择器，例子中指选择紧挨在checkbox后面的label~

对于content这个属性，这里有篇[博客](https://www.cnblogs.com/wujindong/p/5630656.html)大家可以看一下编码

关于em这里就不再讲解啦~ 不过还是推荐大家出门拐拐拐去学习一下emmmmm.

+ 展示

![](https://user-gold-cdn.xitu.io/2018/3/23/16251edd30d2cc17?w=562&h=92&f=png&s=9789)

这个淡珊瑚色的框框就是我们设置的label::before

+ 加个选中状态
```Css
input[type="checkbox"]:checked + label::before{
    content: '\2713';
    background: lightblue;
}
```
+ 展示
![](https://user-gold-cdn.xitu.io/2018/3/23/16251f04e31f83b0?w=508&h=100&f=png&s=11177)

这个对勾的位置受到了上面样式`text-indent: .15em`的影响
> 这里用到了CSS3的checked伪对象选择器

+ 隐藏默认的checkbox
```Css
input[type="checkbox"]{
    position: absolute;
    clip: rect(0,0,0,0); /* 剪裁绝对定位元素 */
}
```
+ 展示

![](https://user-gold-cdn.xitu.io/2018/3/23/16251f29fd2dcb72?w=430&h=96&f=png&s=8772)

注意, 这里使用`display:none`虽然也能隐藏,但是会将checkbox从tab切换焦点的队列中删除(比如你输入完账号密码后使用tab不会使checkbox获得焦点)

## 结果
+ Html
```Html
<input type="checkbox" id="awesome" />
<label for="awesome">Awesome!</label>
```
+ Css
```Css
input[type="checkbox"] + label::before{
    content: '\a0';
    display: inline-block;
    vertical-align: .1em;
    width: .8em;
    height: .8em;
    margin-right: .2em;
    border-radius: .2em;
    background-color: lightcoral;
    text-indent: .15em;
    line-height: .65;
}
input[type="checkbox"]:checked + label::before{
    content: '\2713';
    background: lightblue;
}
input[type="checkbox"]{
    position: absolute;
    clip: rect(0,0,0,0);
}
```
![](https://user-gold-cdn.xitu.io/2018/3/23/16251f9bb8ce9e9f?w=480&h=112&f=gif&s=29755)

> 了解了基础操作后，相信各位能自己独立写一个自定义checkbox啦，各位也可以自由修改content或者添加动画做出酷炫的效果~
