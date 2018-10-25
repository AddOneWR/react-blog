## 背景

如题....遇到过无数次，所以今天终于决定解决一下

## 问题

先放一个**问题图**

![](http://p5sf6v0wz.bkt.clouddn.com/unicode-show.png)

这是我的一篇`GitHub`上的`README`文件，能看到有好几个莫名的特殊字符

在网上搜了一下，在`vscode`设置中开启

```
//控制编辑器是否应呈现控制字符
"editor.renderControlCharacters": true
```

然后就能看到这个鬼畜的东西

![](http://p5sf6v0wz.bkt.clouddn.com/unicode-code.png)

能看到那个小小的`BS`，搜了一下发现它是**ASCII码中的退格符的Unicode表示法(所有ASCII控制字符都有一个图形外观)**，其实这个`Bug`是`chromium`的，但是因为`vscode`底层是`electron`，`electron`底层又用的`chromium`，就导致`vscode`也有了这个Bug

> 至于什么情况会发生呢？

你需要满足以下几条条件:

+ 使用`Mac`
+ 在`Mac`上使用`vscode`(其他编辑器不知道有没有这个`Bug`)
+ 在上面两种条件满足的情况下写`markdown`文件
+ 在上面三种条件满足的情况下开启`preview`，就像这样

![](http://p5sf6v0wz.bkt.clouddn.com/unicode-write.png)

> 凑齐这几个条件真是难为我了

## 解决方案

+ 去掉上文四个条件中的至少一条
+ 开启`"editor.renderControlCharacters": true`，看到这玩意就删掉



> 本文资料来源于知乎[Mac 上的 VSCode 编写 Markdown 总是出现隐藏字符？](https://www.zhihu.com/question/61638859)