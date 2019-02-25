# React Fiber简述

## 什么是Fiber?

Fiber是一个异步渲染架构，用来解决原来React在渲染过程中持续占用主线程，阻碍其他操作的问题。

> React实现可以大体分为两部分：**reconciliation**(Diff阶段)和**commit**(操作DOM阶段)。在v16之前，reconciliation是一个自顶向下的递归算法。

## Fiber的实现

Fiber核心是实现了一个**基于优先级和requestIdleCallback的循环任务调度算法**，包含以下特性：

- reconciliation阶段可以把任务拆分为多个小任务
- reconciliation阶段可以随时中止或恢复任务
- 可以根据优先级不同来选择优先执行任务

Fiber核心是更换了reconciliation阶段的运作

### 为什么不对commit阶段拆分

reconciliation阶段主要是进行diff运算，这种对比和遍历是可以中断的。

commit阶段是对上一阶段的变化应用到实际DOM树中，这个过程会更加复杂，并且如果中断后继续也会对用户体验造成影响。

### 如何拆分

我们先看一下React渲染的过程

1. 用户调用render传入组件，React创建Element树
2. 第一次渲染时，创建vdom树来维护组件状态和dom节点的信息。当后续操作如render或setState时需要更新，通过diff算出变化的部分
3. 根据变化的部分更新vdom树，调用组件生命周期函数等，同步应用到真实的DOM节点中

在第二阶段，Fiber将render/update分片，拆解成多个小任务来执行，每次只检查树上的部分节点，做完后若当前帧（16ms）内还有足够的时间就继续做下一个小任务，时间不够就停止操作，等主线程空闲时再恢复。

显然，这种停止/恢复需要记录上下文信息，而普通的vdom树是无法完成的，所以Fiber引入了fiber tree来记录上下文的vdom树，其结构大致是：

```javascript
export type Fiber = {
   tag: TypeOfWork, // 类型
   type: 'div',
   return: Fiber|null, // 父节点
   child: Fiber|null, // 子节点
   sibling: Fiber|null, // 兄弟节点
   alternate: Fiber|null, //diff出的变化记录在这个fiber上
   .....
};
```

所以Fiber是根据一个fiber节点（vdom节点）来拆分，以fiber node为一个任务单元，每个组件实例都是一个任务单元。任务循环中，每处理完一个fiber node可以中断/挂起/恢复。

### 基于优先级和requestIdleCallback的循环任务调度算法

**requestIdleCallback：**

```javascript
window.requestIdleCallback(callback[, options])
```

该函数可以让浏览器在空闲时间执行开发者传入的回调方法，在回调参数中可以获取到当前帧（16ms）剩余的时间，然后利用这个信息来安排需要做的事情。

**不同的任务分配不同的优先级**，Fiber根据任务优先级来动态调整任务调度，先做高优先级的任务

```json
{  
  NoWork: 0, // No work is pending.
  SynchronousPriority: 1, // 文本输入框
  TaskPriority: 2, // 当前调度正执行的任务
  AnimationPriority: 3, // 动画过渡
  HighPriority: 4, // 用户交互反馈
  LowPriority: 5, // 数据的更新
  OffscreenPriority: 6, // 预估未来需要显示的任务
}
```

**任务调度的过程：**

1. 在任务队列中选出高优先级的fiber node执行，调用requestIdleCallback获取剩余时间，若执行时间超过了deathLine，或者突然插入更高优先级的任务，则执行中断，保存当前结果，修改tag标记一下，设置为pending状态，迅速收尾并再调用一个requestIdleCallback，等主线程释放出来后再继续
2. 恢复任务执行时，检查tag是被中断的任务，会接着继续做任务或者重做

一个任务单元执行结束或者挂起，会调用基于requestIdleCallback的调度器，返回一个新的任务队列继续进行上述过程

> 如果高优先级任务一直存在，那么低优先级任务则永远无法进行