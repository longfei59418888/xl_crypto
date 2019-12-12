const path = require('path')
const chalk = require('chalk')
var CryptoJS = require("crypto-js");
const fs = require('fs')
const inquirer = require('inquirer')
const cwd = process.cwd()


module.exports = (list, arg, type) => {
    let {  o = 'hex', f} = arg
    if (o === true || f === true) {
        console.log(chalk.red('请输入正确的输入项！'))
        process.exit(1)
    }
    const option = []
    if (!f) option.push({
        type: 'list',
        name: 'file',
        message: '请选择需要加密的文件',
        choices: list,
    })

    inquirer.prompt(option).then(answers => {
        let {file = f} = answers
        const filePath = path.join(cwd, file)
        fs.readFile(filePath, "utf8", function (err, data) {
            if (err) {
                console.log(chalk.red(err))
                process.exit(1)
                return
            }
            console.log(chalk.green(CryptoJS.MD5(data).toString()))
        });
    })
}
