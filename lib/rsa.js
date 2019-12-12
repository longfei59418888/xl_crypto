const path = require('path')
const chalk = require('chalk')
var CryptoJS = require("crypto-js");
const fs = require('fs')
const inquirer = require('inquirer')
const NodeRSA = require('node-rsa')
const cwd = process.cwd()


module.exports = (list, arg, type) => {
    let {pub, pri, f, output} = arg
    if (pub) pri = null
    if (!pub && !pri) {
        console.log(chalk.red('请输入pub / pri确定公私钥！'))
        process.exit(1)
    }
    const option = []
    if (!f) option.push({
        type: 'list',
        name: 'file',
        message: '请选择需要操作的文件',
        choices: list,
    })
    if (pub && pub === true) option.push({
        type: 'list',
        name: 'pubFile',
        message: '请选择需要加密的公钥',
        choices: list,
    })
    if (pri && pri === true) option.push({
        type: 'list',
        name: 'priFile',
        message: '请选择需要加密的私钥',
        choices: list,
    })
    inquirer.prompt(option).then(answers => {
        let {file = f, priFile = pri, pubFile = pub} = answers
        const filePath = path.join(cwd, file)
        fs.readFile(filePath, "utf8", function (err, input) {
            if (err) {
                console.log(chalk.red(err))
                process.exit(1)
                return
            }
            let rsaFile = pubFile
            if (!pub) rsaFile = priFile
            fs.readFile(path.join(cwd, rsaFile), "utf8", function (err, data) {
                if (err) {
                    console.log(chalk.red(err))
                    process.exit(1)
                    return
                }
                if (type) {
                    const publicKey = new NodeRSA(data);
                    publicKey.setOptions({encryptionScheme: 'pkcs1'})
                    let cipherText = publicKey.decrypt(input, 'utf8');
                    console.log(chalk.green(cipherText))
                    return
                }
                const publicKey = new NodeRSA(data);
                publicKey.setOptions({encryptionScheme: 'pkcs1'})
                let cipherText = publicKey.encrypt(input, 'base64');
                console.log(chalk.green(cipherText))
                if (output) {
                    fs.writeFile(output !== true ? path.join(cwd, output) : path.join(path.dirname(filePath), `encrypt.${path.basename(filePath)}`), cipherText, 'utf8', (err) => {
                        if (err) {
                            console.log(chalk.red(err))
                            process.exit(1)
                            return
                        }
                    });
                }

            });
        });
    })
}
