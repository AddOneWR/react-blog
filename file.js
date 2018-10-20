const fs = require('fs');
const program = require('commander');
const inquirer = require('inquirer');

const categoryMap = ['c', 'javascript', 'package', 'react', 'read', 'review', 'ui', 'wx'];
const notePath = 'markdown';
const mdList = require(`./src/constant/${notePath}`);

program
    .command('add')
    .action(() => {
      inquirer.prompt([
        {
          name: 'title',
          message: '文章标题: '
        },
        {
          name: 'desc',
          message: '文章简述: '
        },
        {
          type: 'list',
          name: 'category',
          message: '选择文章分类: ',
          choices: categoryMap
        }
      ])
      .then(answer => {
        let { title, desc, category } = answer;
        let filePath = `./src/markdown/${category}/${title}.md`;

        mdList[category].list.push({
          title: title,
          desc: desc,
          time: (new Date()).Format("yyyy-MM-dd hh:mm:ss")
        })

        fs.writeFile(filePath, `# ${title}`, 'utf8', function(error){
          if(error){
              console.log(error);
              return false;
          }
          console.log(`文章(${title})创建成功~`);
        })

        let str = `const mdList = ${JSON.stringify(mdList, null, 2)}\nmodule.exports = mdList;`;

        fs.writeFile(`./src/constant/${notePath}.js`,str,'utf8',function(error){
          if(error){
              console.log(error);
              return false;
          }
          console.log('目录更新成功~');
        })
      })
    })

  program
    .command('remove')
    .action(() => {
      inquirer.prompt([
        {
          name: 'title',
          message: '文章标题: '
        },
        {
          type: 'list',
          name: 'category',
          message: '选择文章分类: ',
          choices: categoryMap
        }
      ])
      .then(answer => {
        let { title, category } = answer;
        let filePath = `./src/markdown/${category}/${title}.md`;
        let removeIndex = -1;

        mdList[category].list.forEach((item, index) => {
          if (item.title === title) {
            removeIndex = index;
            return;
          }
        })

        if (removeIndex === -1) {
          console.log(`没有找到文章: ${title}`);
          return;
        }
        
        mdList[category].list.splice(removeIndex, 1);

        fs.unlink(filePath, function(error){
          if(error){
              console.log(error);
              return false;
          }
          console.log(`文章(${title})删除成功~`);
        })

        let str = `const mdList = ${JSON.stringify(mdList, null, 2)}\nmodule.exports = mdList;`;

        fs.writeFile(`./src/constant/${notePath}.js`,str,'utf8',function(error){
          if(error){
              console.log(error);
              return false;
          }
          console.log('目录更新成功~');
        })
      })
    })
program.parse(process.argv);

// 日期格式化
Date.prototype.Format = function (fmt) { //author: meizz 
  let o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (let k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  
  return fmt;
}