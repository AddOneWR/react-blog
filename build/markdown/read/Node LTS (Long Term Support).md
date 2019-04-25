# Node LTS (Long Term Support)

开局一张图

[![EerE6I.md.jpg](https://s2.ax1x.com/2019/04/25/EerE6I.md.jpg)](https://imgchr.com/i/EerE6I)

图中可以看出，Node维护两条发布流程线：

- 偶数版本：每年四月发布
- 奇数版本：每年十月发布

## LTS current: 第一年 4月 - 10月

Node.js每年四月会从Master截取分支出来，收集足够稳定的特性，发布一个major的偶数版本，作为下一个LTS的候选，在这段时间内这个版本称为`current`。

接受社区反馈后，这个版本会修复bug，增加新特性，删除兼容性较大的改进等。这个版本的minor版本会不断增加，开发者利用这段时间用这个候选LTS版本测试自己的应用，并将兼容性和bug反馈给Node.js开发者

## LTS active: 第一年 10月 - 第三年 4月

到了10月，这个 curren t版本就会变成 LTS 版本 (即 active LTS) ，在此后 18 个月的 active 时间内，这个版本几乎不会有任何不兼容的变更，除了安全相关的 OpenSSL 以外其他的依赖 (比如 v8) 也不会进行大更新。这段时间内用户可以将线上 Node.js 升级到这个稳定的 LTS 版本。

## LTS maintenance: 第三年 4 月 - 第四年 4 月

18 个月的 active 时期后，在第三年的四月，会迎来最后 12 个月的 maintenance 时期，这个时候它的更新只有安全更新和 bug 修复。

由上图可以看出，针对每年的 LTS active：

- 1/3 节点时：发布新的 current
- 2/3 节点时：发布新的 LTS active

所以在 maintenance 时期， 已经有新的 LTS active 使用了，所以用户可以在这 12 个月内对自己的 Node 版本进行升级， 12 个月后，这个版本的 LTS 将结束自己的寿命，停止更新。

**所以每个偶数版本都有 3 年的寿命**

## 关于奇数版本

可以看到，奇数版本的生命周期很短，如果只是单纯的想体验 Node 的新特性的话，可以使用奇数版本。如果想稳定一点，减少版本的更新频率，请使用 LTS 。

## Release schedule

从 [nodejs/Release](<https://github.com/nodejs/Release>)偷过来的图

| Release  |       Status        | Codename | Initial Release | Active LTS Start | Maintenance LTS Start |        End-of-life        |
| :------: | :-----------------: | :------: | :-------------: | :--------------: | :-------------------: | :-----------------------: |
| [6.x][]  | **Maintenance LTS** |  Boron   |   2016-04-26    |    2016-10-18    |      2018-04-30       |        2019-04-30         |
| [8.x][]  | **Maintenance LTS** |  Carbon  |   2017-05-30    |    2017-10-31    |      2019-01-01       | December 2019<sup>1</sup> |
| [10.x][] |   **Active LTS**    | Dubnium  |   2018-04-24    |    2018-10-30    |      April 2020       |        April 2021         |
| [11.x][] | **Current Release** |          |   2018-10-23    |                  |                       |        2019-06-01         |
|   12.x   |     **Pending**     |          |   2019-04-23    |    2019-10-22    |      April 2021       |        April 2022         |
|   13.x   |     **Pending**     |          |   2019-10-22    |                  |                       |         June 2020         |
|   14.x   |     **Pending**     |          |   April 2020    |   October 2020   |      April 2022       |        April 2023         |

[![EecVPS.md.jpg](https://s2.ax1x.com/2019/04/25/EecVPS.md.jpg)](https://imgchr.com/i/EecVPS)
