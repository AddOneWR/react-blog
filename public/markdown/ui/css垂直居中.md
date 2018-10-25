## 目的

写前端的时候总是忘记垂直居中...每次都要去搜代码

既然有了博客，就干脆整理一下写在这里吧
<!--more-->
# 基于绝对定位

``` Css
main{
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -3em;
    margin-left: -9em;
    width: 18em;
    height: 6em;
}
```

如果借助calc()函数的话....

```Css
main{
    position: absolute;
    top: calc(50% - 3em);
    left: calc(50% - 9em);
    width: 18em;
    height: 6em;
}
```

> PS: 然而这种方法只局限于固定宽高的元素... 所以我们还可以选择translate()变形函数

```Css
main{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
```

..缺陷自寻..

# 基于视口单位

```Css
main{
    width: 18em;
    padding: 1em 1.5em;
    margin: 50vh auto 0;
    transform: translateY(-50%);
}
```
..vw,vh这里不再赘述..

> PS: 只适用于在视口中居中的场景

# 基于Flexbox

```Css
body{
    display: flex;
    min-height: 100vh;
    margin: 0;
}
main{
    margin: auto;
}
```

或者...

```Css
main{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18em;
    height: 10em;
}
```

> PS: 要求你的浏览器支持Flexbox....

或许你可以尝试一下...
```Css
align-self: center;
```


> 参考: 《CSS揭秘》




