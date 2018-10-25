### What is Git ?

Super popular Version Conntrol System

#### Reasons to Love Git

+ **History**
Manage history
+ **Collaboration**
No waiting,Continue working
+ **Feature branches**
Branches Tree

### Why should we learn Git?

No Why

### Where do we begin

```Bash
mkdir coding-net

cd coding-net

touch index.html

git init

git add .

git commit -m 'init'
```

History Back

```Cmd
git status //查看一下状态 

git checkout -- .
```

> 如果此时你电脑坏了还能找回么?

不能，因为现在还只是本地状态，一切都只现存在你电脑里

**Solution: `Push`**

#### 插曲

**Svn 和 Git**

拥有权限管理的功能，每个人只能看到管理员允许自己看到的代码，但是当`Svn`服务器挂掉后，每个人只有部分的代码，但是`Git`中每个人都有全部的代码

### Master杂项

+ `Master`指向可以规定
+ `Master`与`Branch`平级
+ `Clone`后`Head`指向`Master`

### Branch杂项

```Cmd
git branch -b feature //创建并切换到feature分支

git checkout master //切换到Master

git branch -D xxx //删除xxx分支
```

> 如果删除`feature`分支，那么这个节点还存在么?

存在，`feature`只是一个指向该节点的指针，删除后节点依然存在，只不过没有指针指向它，最后会被`Git`垃圾回收机制清理

**分支提交**

```Cmd
git push origin // 将当前分支推送到origin主机的对应分支

git push origin aaa:bbb //远程创建bbb分支并将aaa推入

git push -u origin master // 将本地的master分支推送到origin主机，同时指定origin为默认主机，后面就可以不加任何参数使用git push了
```

> 因为是入门的Git Camp，虽然自己都会了，但还是收获颇多

还混了一个洋葱猴..

![洋葱猴](http://p5sf6v0wz.bkt.clouddn.com/codeMonkey.jpg
)
