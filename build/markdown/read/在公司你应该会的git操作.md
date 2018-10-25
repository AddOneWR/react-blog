# 基础

+ git clone
+ git pull
+ git push
1. git push -u origin master , 这里就是把 master （默认 git 分支）推送到 origin， -u也就是--set-upstream, 代表的是更新 默认推送的地方，这里就是默认以后git pull和git push时，都是推送和拉自 origin
2. --force 强推
+ git status
+ git add
+ git commit
+ git checkout
1. 如果当前分支有未commit代码，且checkout -b到其他分支，修改的代码会带过去
+ git merge
1. git merge aaa  -- master // 合并aaa到master分支
+ git log
+ git diff

> 这些不会的就退出公司吧

# 进阶

## git reset

![](http://p5sf6v0wz.bkt.clouddn.com/reset.png)

> git __ reset __ [--soft | --mixed [-N] | --hard | --merge | --keep] [-q] ___ [ commit版本号 ] || HEAD^n

分支被合并后，使用reset不留痕迹的回退，但是会修改历史版本


```
--soft 回退后a分支修改的代码被保留并标记为add的状态（git status 是绿色的状态）
--mixed 重置索引，但不重置工作树，更改后的文件标记为未提交（add）的状态。默认操作。
--hard 重置索引和工作树，并且a分支修改的所有文件和中间的提交，没提交的代码都被丢弃了。
--merge 和--hard类似，只不过如果在执行reset命令之前你有改动一些文件并且未提交，merge会保留你的这些修改，hard则不会。【注：如果你的这些修改add过或commit过，merge和hard都将删除你的提交】
--keep 和--hard类似，执行reset之前改动文件如果是a分支修改了的，会提示你修改了相同的文件，不能合并。如果不是a分支修改的文件，会移除缓存区。git status还是可以看到保持了这些修改。
```

![](http://p5sf6v0wz.bkt.clouddn.com/reset-b.png)

如果没有给出提交点的版本号，那么默认用HEAD。这样，分支指向不变，但是索引会回滚到最后一次提交

![](http://p5sf6v0wz.bkt.clouddn.com/reset-c.png)

> reset会清除commit，如果代码已经被push到远程，如果进行reset会使基于这个commit的所有commit消失，所以这种情况不允许reset

## git revert

![](http://p5sf6v0wz.bkt.clouddn.com/revert.png)

> git __ revert __ [ commit版本号 ] || HEAD^n

1. git revert是用一次新的commit来回滚之前的commit，git reset是直接删除指定的commit
2. git reset 是把HEAD向后移动了一下，而git revert是HEAD继续前进，只是新的commit的内容和要revert的内容正好相反，能够抵消要被revert的内容

> 如果回退分支的代码以后还需要的话用git revert，如果分支彻底没用了就用git reset

## git stash

真对你有未commit代码却要切换分支时，用 git stash保存当前工作进度，会把暂存区和工作区的改动保存起来。执行完这个命令后，在运行git status命令，就会发现当前是一个干净的工作区

1. git stash list 显示保存进度的列表
2. git stash drop [stash_id] 删除一个存储的进度。如果不指定stash_id，则默认删除最新的存储进度
3. git stash clear 删除所有存储的进度
4. git stash pop [–index] [stash_id]
 + git stash pop 恢复最新的进度到工作区。git默认会把工作区和暂存区的改动都恢复到工作区
 + git stash pop --index 恢复最新的进度到工作区和暂存区。（尝试将原来暂存区的改动还恢复到暂存区）
 + git stash pop stash@{1}恢复指定的进度到工作区。stash_id是通过git stash list命令得到的 通过git stash pop命令恢复进度后，会删除当前进度

## git rebase

```
git rebase A B

Reapply commits from one branch on top of another branch.
Commonly used to "move" an entire branch to another base, creating copies of the commits in the new location.
```

> 把 A 分支 rebase 到 B 分支，也就是把 A 的 commit 与 B 的合并，并且保留 B 独有的 commit

比如git pull addone master(将addone仓库的master分支与本地分支合并)相当于

```
git fetch origin          //把 origin 仓库的东西都拉下来本地
git rebase addone/master //把 addone 的 master 分支 rebase 到当前分支
```

> pull 的时候， 当出现冲突而你解决掉后，会有多余的merge信息（ commit message ），推荐在自己的分支开发时，永远使用 fetch，rebase 

> git rebase -i HEAD^n

将最近3次提交合并，进入交互式界面：
```
pick 0194373 skill-third-party: Change PKG_CONFIG_PATH and LD_LIBRARY_PATH.
pick 4eb9b97 skill-third-party: Add default include library.
pick 37f37e4 mind: Add comments for understanding.
pick 84c413a install skill: Fix skill pkg relative path.

# Rebase 986e234..84c413a onto 986e234 (4 commands)
#
# Commands:
# p, pick = use commit
# r, reword = use commit, but edit the commit message
# e, edit = use commit, but stop for amending
# s, squash = use commit, but meld into previous commit
# f, fixup = like "squash", but discard this commit's log message
# x, exec = run command (the rest of the line) using shell
# d, drop = remove commit
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
#
# Note that empty commits are commented out
```

+ pick：保留该commit（缩写:p）
+ reword：保留该commit，但我需要修改该commit的注释（缩写:r）
+ edit：保留该commit, 但我要停下来修改该提交(不仅仅修改注释)（缩写:e）
+ squash：将该commit和前一个commit合并（缩写:s）
+ fixup：将该commit和前一个commit合并，但我不要保留该提交的注释信息（缩写:f）
+ exec：执行shell命令（缩写:x）
+ drop：我要丢弃该commit（缩写:d)

需要修改时，把上面四个补丁最前面的 pick 改成对应操作（如 reword，fixup ），然后保存退出即可
