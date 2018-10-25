# 直接上问题

今天没事在写3D粒子动画的时候，设置了一个延时器让粒子变换不同的样子..就像这样

![](http://p5sf6v0wz.bkt.clouddn.com/lz.gif)

本以为完美完成..然后切换页面后再回来 就会发现`setInterval`出现了延时.. 动画会一瞬间变的很快

```Javascript
function enableTrigger(idx) {
  if(window.interval) return;
  let interval = setInterval(() => {
    morphTo(texts[idx].particles, '#da2f20');
    idx = (idx + 1) % 3;
  },3000)
}
```

上网搜了一下如何判断页面切换。。找到了

```Javascript
let hiddenProperty = 'hidden' in document ? 'hidden' :
      'webkitHidden' in document ? 'webkitHidden' :
              null;
```

整理一下思路，修改一下原函数完美解决

```Javascript
function enableTrigger(trigger, idx) {
  if(window.interval) return;
  let interval = setInterval(() => {
    let hiddenProperty = 'hidden' in document ? 'hidden' :
      'webkitHidden' in document ? 'webkitHidden' :
              null;

    if(document[hiddenProperty]){
      return;
    }

    morphTo(texts[idx].particles, '#da2f20');
    idx = (idx + 1) % 3;

  },3000)
}
```

> 在前公司留下的习惯 尽量减少`if`里的缩进 这里就直接`return`了