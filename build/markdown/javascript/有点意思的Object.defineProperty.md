## 有点意思的Object.defineProperty

这个东西很有意思，它会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性， 并返回这个对象

这里简单列一下它的语法

> Object.defineProperty(obj, prop, descriptor)

## 参数

**obj**

要在其上定义属性的对象

**prop**

要定义或修改的属性的名称

**descriptor**

将被定义或修改的属性描述符

**返回值**

被传递给函数的对象

> 其实这些东西在[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)上都有

## 例子

大多数基础的例子在MDN上都有，所以这里举一个简单实现MVVM双向绑定的例子

```javascript
const data = {};
const input = document.getElementById('input');
Object.defineProperty(data, 'text', {
    set(value) {
        input.value = value;
        this.value = value;
    }
});
input.onchange = function(e) {
    data.text = e.target.value;
}
```

data是被绑定的变量，我们用`defineProperty`给`data`加了个叫`text`的变量，其为一个`set`函数，在这个函数内触发当data的值改变时，同时修改input的值

在外部，对input的onchange事件监听，当input值变化时同时修改data的text值，从而实现数据双向绑定
